/**
 * Eligibility Evaluation
 *
 * High-level functions for evaluating benefit program eligibility.
 * Integrates rule evaluation, result caching, and result generation.
 */

import { nanoid } from 'nanoid';
import { getDatabase } from '../db/database';
import { evaluateRule, registerBenefitOperators } from './evaluator';
import type { EligibilityResult, EligibilityResultDocument, EligibilityRuleDocument, UserProfileDocument } from '../db/schemas';
import type { JsonLogicData, JsonLogicRule, RuleEvaluationOptions, RuleEvaluationResult } from './types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Eligibility evaluation result (extended)
 */
export interface EligibilityEvaluationResult {
  /** Profile ID */
  profileId: string;
  /** Program ID */
  programId: string;
  /** Rule ID used */
  ruleId: string;
  /** Is user eligible */
  eligible: boolean;
  /** Confidence score (0-100) */
  confidence: number;
  /** Human-readable reason */
  reason: string;
  /** Detailed criteria breakdown */
  criteriaResults?: Array<{
    criterion: string;
    met: boolean;
    value?: unknown;
    threshold?: unknown;
    description?: string;
  }>;
  /** Missing information */
  missingFields?: string[];
  /** Required documents */
  requiredDocuments?: Array<{
    document: string;
    description?: string;
    where?: string;
  }>;
  /** Next steps */
  nextSteps?: Array<{
    step: string;
    url?: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
  /** Benefit estimate */
  estimatedBenefit?: {
    amount?: number;
    frequency?: 'one_time' | 'monthly' | 'quarterly' | 'annual';
    description?: string;
  };
  /** Evaluation metadata */
  evaluatedAt: number;
  executionTime?: number;
  ruleVersion?: string;
  /** Needs manual review */
  needsReview?: boolean;
  /** Incomplete data */
  incomplete?: boolean;
}

/**
 * Eligibility evaluation options
 */
export interface EligibilityEvaluationOptions {
  /** Cache result in database */
  cacheResult?: boolean;
  /** Include detailed breakdown */
  includeBreakdown?: boolean;
  /** Force re-evaluation (ignore cache) */
  forceReEvaluation?: boolean;
  /** Result expiration time (milliseconds) */
  expiresIn?: number;
  /** Custom evaluation options */
  evaluationOptions?: Partial<RuleEvaluationOptions>;
}

/**
 * Batch eligibility result
 */
export interface BatchEligibilityResult {
  /** Profile ID */
  profileId: string;
  /** Results by program */
  programResults: Map<string, EligibilityEvaluationResult>;
  /** Summary statistics */
  summary: {
    total: number;
    eligible: number;
    ineligible: number;
    incomplete: number;
    needsReview: number;
  };
  /** Total execution time */
  totalTime: number;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

let operatorsRegistered = false;

/**
 * Ensure custom operators are registered
 */
function ensureOperatorsRegistered(): void {
  if (!operatorsRegistered) {
    registerBenefitOperators();
    operatorsRegistered = true;
  }
}

// ============================================================================
// ELIGIBILITY EVALUATION
// ============================================================================

/**
 * Check cache and return valid cached result if available
 */
async function checkCache(
  profileId: string,
  programId: string,
  startTime: number,
  forceReEvaluation: boolean
): Promise<EligibilityEvaluationResult | null> {
  if (forceReEvaluation) {
    return null;
  }

  const cached = await getCachedResult(profileId, programId);
  if (!cached) {
    return null;
  }

  const isExpired = cached.expiresAt ? Date.now() > cached.expiresAt : false;
  if (isExpired) {
    return null;
  }

  const endTime = performance.now();
  const cachedData = cached.toJSON();
  return {
    ...cachedData,
    profileId: cachedData.userProfileId,
    missingFields: cachedData.missingFields ? Array.from(cachedData.missingFields) : [],
    executionTime: endTime - startTime,
  } as EligibilityEvaluationResult;
}

/**
 * Retrieve and validate required entities from database
 */
async function getEvaluationEntities(
  profileId: string,
  programId: string
): Promise<{
  profile: UserProfileDocument;
  rule: EligibilityRuleDocument;
}> {
  const db = getDatabase();

  // Get user profile
  const profile = await db.user_profiles.findOne(profileId).exec();
  if (!profile) {
    throw new Error(`Profile ${profileId} not found`);
  }

  // Get program
  const program = await db.benefit_programs.findOne(programId).exec();
  if (!program) {
    throw new Error(`Program ${programId} not found`);
  }

  // Get active rules for program
  const rules: EligibilityRuleDocument[] = await db.eligibility_rules.findRulesByProgram(programId);
  if (rules.length === 0) {
    throw new Error(`No active rules found for program ${programId}`);
  }

  // Use the highest priority rule
  const sortedRules = rules.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  const rule: EligibilityRuleDocument = sortedRules[0];

  return { profile, rule };
}

/**
 * Build eligibility evaluation result from rule evaluation
 */
function buildEvaluationResult(
  profileId: string,
  programId: string,
  rule: EligibilityRuleDocument,
  evalResult: RuleEvaluationResult,
  missingFields: string[],
  executionTime: number
): EligibilityEvaluationResult {
  const incomplete = missingFields.length > 0;

  return {
    profileId,
    programId,
    ruleId: rule.id,
    eligible: evalResult.success ? Boolean(evalResult.result) : false,
    confidence: calculateConfidence(evalResult, incomplete),
    reason: generateReason(evalResult, rule, incomplete),
    missingFields: incomplete ? missingFields : undefined,
    requiredDocuments: rule.requiredDocuments?.map((doc: string) => ({
      document: doc,
      description: undefined,
      where: undefined,
      required: true,
    })),
    evaluatedAt: Date.now(),
    executionTime,
    ruleVersion: rule.version,
    needsReview: !evalResult.success || incomplete,
    incomplete,
  };
}

/**
 * Create error result
 */
function buildErrorResult(
  profileId: string,
  programId: string,
  error: unknown,
  executionTime: number
): EligibilityEvaluationResult {
  return {
    profileId,
    programId,
    ruleId: 'error',
    eligible: false,
    confidence: 0,
    reason: error instanceof Error ? error.message : 'Unknown error occurred',
    evaluatedAt: Date.now(),
    executionTime,
    needsReview: true,
    incomplete: true,
  };
}

/**
 * Evaluate eligibility for a single program
 *
 * High-level function that handles:
 * - Rule retrieval from database
 * - Data preparation
 * - Rule evaluation
 * - Result caching
 * - Result formatting
 *
 * @param profileId User profile ID
 * @param programId Benefit program ID
 * @param options Evaluation options
 * @returns Eligibility evaluation result
 *
 * @example
 * ```typescript
 * const result = await evaluateEligibility('user-123', 'snap-federal');
 *
 * if (result.eligible) {
 *   console.log('Eligible! Next steps:', result.nextSteps);
 * }
 * ```
 */
export async function evaluateEligibility(
  profileId: string,
  programId: string,
  options: EligibilityEvaluationOptions = {}
): Promise<EligibilityEvaluationResult> {
  ensureOperatorsRegistered();

  const startTime = performance.now();

  // Default options
  const opts = {
    cacheResult: options.cacheResult !== false,
    includeBreakdown: options.includeBreakdown !== false,
    forceReEvaluation: options.forceReEvaluation ?? false,
    expiresIn: options.expiresIn ?? 1000 * 60 * 60 * 24 * 30, // 30 days
    evaluationOptions: options.evaluationOptions ?? {},
  };

  try {
    // Check cache first
    const cachedResult = await checkCache(profileId, programId, startTime, opts.forceReEvaluation);
    if (cachedResult) {
      return cachedResult;
    }

    // Get required entities
    const { profile, rule } = await getEvaluationEntities(profileId, programId);

    // Prepare data and check for missing fields
    const data = prepareDataContext(profile);
    const missingFields = checkMissingFields(data, rule.requiredFields ?? []);

    // Evaluate rule
    const evalResult = await evaluateRule(
      rule.ruleLogic as JsonLogicRule,
      data,
      opts.evaluationOptions
    );

    const executionTime = performance.now() - startTime;

    // Build result
    const result = buildEvaluationResult(
      profileId,
      programId,
      rule,
      evalResult,
      missingFields,
      executionTime
    );

    // Add detailed breakdown if requested
    if (opts.includeBreakdown) {
      result.criteriaResults = generateCriteriaBreakdown(rule, data, evalResult);
    }

    // Cache result if enabled
    if (opts.cacheResult && evalResult.success) {
      await cacheResult(result, opts.expiresIn);
    }

    return result;

  } catch (error) {
    const executionTime = performance.now() - startTime;
    return buildErrorResult(profileId, programId, error, executionTime);
  }
}

/**
 * Evaluate eligibility for multiple programs
 *
 * @param profileId User profile ID
 * @param programIds Array of program IDs
 * @param options Evaluation options
 * @returns Batch eligibility result
 *
 * @example
 * ```typescript
 * const results = await evaluateMultiplePrograms(
 *   'user-123',
 *   ['snap-federal', 'medicaid-ga', 'wic-ga']
 * );
 *
 * console.log(`Eligible for ${results.summary.eligible} programs`);
 * ```
 */
export async function evaluateMultiplePrograms(
  profileId: string,
  programIds: string[],
  options: EligibilityEvaluationOptions = {}
): Promise<BatchEligibilityResult> {
  const startTime = performance.now();
  const programResults = new Map<string, EligibilityEvaluationResult>();

  // Evaluate each program
  for (const programId of programIds) {
    const result = await evaluateEligibility(profileId, programId, options);
    programResults.set(programId, result);
  }

  const endTime = performance.now();

  // Calculate summary
  const results = Array.from(programResults.values());
  const summary = {
    total: results.length,
    eligible: results.filter((r) => r.eligible).length,
    ineligible: results.filter((r) => !r.eligible && !r.incomplete).length,
    incomplete: results.filter((r) => r.incomplete).length,
    needsReview: results.filter((r) => r.needsReview).length,
  };

  return {
    profileId,
    programResults,
    summary,
    totalTime: endTime - startTime,
  };
}

/**
 * Evaluate eligibility for all available programs
 *
 * @param profileId User profile ID
 * @param options Evaluation options
 * @returns Batch eligibility result
 */
export async function evaluateAllPrograms(
  profileId: string,
  options: EligibilityEvaluationOptions = {}
): Promise<BatchEligibilityResult> {
  const db = getDatabase();

  // Get all active programs
  const programs = await db.benefit_programs.findActivePrograms();
  const programIds = programs.map((p) => p.id);

  return evaluateMultiplePrograms(profileId, programIds, options);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Prepare data context from user profile
 */
function prepareDataContext(profile: UserProfileDocument): JsonLogicData {
  const data = profile.toJSON();

  // Add computed fields
  return {
    ...data,
    // Add any derived fields here
    _timestamp: Date.now(),
  };
}

/**
 * Check for missing required fields
 */
function checkMissingFields(data: JsonLogicData, requiredFields: string[]): string[] {
  const missing: string[] = [];

  for (const field of requiredFields) {
    // eslint-disable-next-line security/detect-object-injection
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }

  return missing;
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
  evalResult: RuleEvaluationResult,
  incomplete: boolean
): number {
  if (!evalResult.success) {
    return 0;
  }

  if (incomplete) {
    return 50; // Lower confidence when data is incomplete
  }

  // Full confidence when all data present and evaluation successful
  return 95;
}

/**
 * Generate human-readable reason
 */
function generateReason(
  evalResult: RuleEvaluationResult,
  rule: EligibilityRuleDocument | { explanation?: string },
  incomplete: boolean
): string {
  if (!evalResult.success) {
    return 'Unable to evaluate eligibility due to an error';
  }

  if (incomplete) {
    return 'Cannot fully determine eligibility - missing required information';
  }

  if (evalResult.result) {
    return rule.explanation ?? 'You meet the eligibility criteria for this program';
  }

  return 'You do not meet the eligibility criteria for this program';
}

/**
 * Generate detailed criteria breakdown
 */
function generateCriteriaBreakdown(
  rule: EligibilityRuleDocument | { requiredFields?: string[] },
  data: JsonLogicData,
  _evalResult: RuleEvaluationResult
): Array<{ criterion: string; met: boolean; value?: unknown; threshold?: unknown; description?: string }> {
  // This is a simplified implementation
  // In production, you'd want more sophisticated logic analysis

  const breakdown: Array<{
    criterion: string;
    met: boolean;
    value?: unknown;
    threshold?: unknown;
    description?: string;
  }> = [];

  // Extract criteria from rule logic (simplified)
  if (rule.requiredFields) {
    for (const field of rule.requiredFields) {
      // eslint-disable-next-line security/detect-object-injection
      const fieldValue = data[field];
      breakdown.push({
        criterion: field,
        met: fieldValue !== undefined && fieldValue !== null,
        value: fieldValue,
        description: `${field} is ${fieldValue !== undefined ? 'provided' : 'missing'}`,
      });
    }
  }

  return breakdown;
}

/**
 * Get cached result from database
 */
async function getCachedResult(
  profileId: string,
  programId: string
): Promise<EligibilityResultDocument | null> {
  const db = getDatabase();

  const results = await db.eligibility_results
    .find({
      selector: {
        userProfileId: profileId,
        programId,
      },
      sort: [{ evaluatedAt: 'desc' }],
      limit: 1,
    })
    .exec();

  return results[0] ?? null;
}

/**
 * Cache evaluation result in database
 */
async function cacheResult(
  result: EligibilityEvaluationResult,
  expiresIn: number
): Promise<void> {
  const db = getDatabase();

  const dbResult: Partial<EligibilityResult> = {
    id: nanoid(),
    userProfileId: result.profileId,
    programId: result.programId,
    ruleId: result.ruleId,
    eligible: result.eligible,
    confidence: result.confidence,
    reason: result.reason,
    criteriaResults: result.criteriaResults,
    missingFields: result.missingFields,
    nextSteps: result.nextSteps?.map(step => ({
      ...step,
      priority: step.priority ?? 'medium',
    })),
    requiredDocuments: result.requiredDocuments?.map(doc => ({
      document: doc.document,
      description: doc.description,
      where: doc.where,
      required: true,
    })),
    estimatedBenefit: result.estimatedBenefit ? {
      ...result.estimatedBenefit,
      frequency: result.estimatedBenefit.frequency ?? 'monthly',
      currency: 'USD' as const,
    } : undefined,
    ruleVersion: result.ruleVersion,
    evaluatedAt: result.evaluatedAt,
    expiresAt: Date.now() + expiresIn,
    needsReview: result.needsReview,
    incomplete: result.incomplete,
  };

  await db.eligibility_results.insert(dbResult as EligibilityResult);
}

/**
 * Clear cached results for a profile
 *
 * @param profileId Profile ID
 * @param programId Optional program ID (clears all if not specified)
 */
export async function clearCachedResults(
  profileId: string,
  programId?: string
): Promise<number> {
  const db = getDatabase();

  const selector: { userProfileId: string; programId?: string } = {
    userProfileId: profileId
  };
  if (programId) {
    selector.programId = programId;
  }

  const results = await db.eligibility_results
    .find({ selector })
    .exec();

  for (const result of results) {
    await result.remove();
  }

  return results.length;
}

/**
 * Get cached results for a profile
 *
 * @param profileId Profile ID
 * @returns Array of cached results
 */
export async function getCachedResults(
  profileId: string
): Promise<EligibilityEvaluationResult[]> {
  const db = getDatabase();

  const results = await db.eligibility_results
    .find({
      selector: { userProfileId: profileId },
      sort: [{ evaluatedAt: 'desc' }],
    })
    .exec();

  return results.map((r) => {
    const data = r.toJSON();
    return {
      ...data,
      profileId: data.userProfileId,
      missingFields: data.missingFields ?? [],
    } as unknown as EligibilityEvaluationResult;
  });
}

