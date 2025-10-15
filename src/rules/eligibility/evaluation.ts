/**
 * Eligibility Evaluation Helpers
 *
 * Core evaluation logic and helper functions for eligibility determination.
 */

import { getDatabase } from '../../db/database';
import { registerBenefitOperators } from '../evaluator';
import { evaluateRuleWithDetails, type DetailedEvaluationResult } from '../detailedEvaluator';
import type { EligibilityRuleDocument, UserProfileDocument } from '../../db/schemas';
import type { JsonLogicData, JsonLogicRule, RuleEvaluationResult } from '../types';
import type {
  EvaluationEntities,
  RuleEvaluationWithDetails,
  AllRulesEvaluationResult,
  ResultRuleSelection,
  EligibilityEvaluationResult
} from './types';

// Global debug log utility
function debugLog(...args: unknown[]): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[Eligibility Evaluation Debug]', ...args);
  }
}

let operatorsRegistered = false;

/**
 * Ensure custom operators are registered
 */
function ensureOperatorsRegistered(): void {
  if (!operatorsRegistered) {
    debugLog('Registering benefit operators for rule evaluation.');
    registerBenefitOperators();
    operatorsRegistered = true;
  } else {
    debugLog('Benefit operators already registered.');
  }
}

/**
 * Retrieve and validate required entities from database
 */
export async function getEvaluationEntities(
  profileId: string,
  programId: string
): Promise<EvaluationEntities> {
  debugLog('Retrieving evaluation entities for', { profileId, programId });
  const db = getDatabase();

  // Get user profile
  const profile = await db.user_profiles.findOne(profileId).exec();
  if (!profile) {
    debugLog('User profile not found', { profileId });
    throw new Error(`Profile ${profileId} not found`);
  }

  // Get program
  const program = await db.benefit_programs.findOne(programId).exec();
  if (!program) {
    debugLog('Benefit program not found', { programId });
    throw new Error(`Program ${programId} not found`);
  }

  // Get active rules for program
  const rules: EligibilityRuleDocument[] = await db.eligibility_rules.findRulesByProgram(programId);
  if (rules.length === 0) {
    debugLog('No active rules found for program', { programId });
    throw new Error(`No active rules found for program ${programId}`);
  }

  // Sort rules by priority (highest first) for consistent evaluation order
  const sortedRules = rules.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  debugLog('Entities retrieved and sorted', {
    profileId,
    programId,
    programName: program.name,
    rulesFound: sortedRules.length,
    rulesSummary: sortedRules.map(r => ({
      id: r.id,
      name: r.name,
      priority: r.priority,
      active: r.active,
    }))
  });

  if (import.meta.env.DEV) {
    console.warn('🔍 [DEBUG] getEvaluationEntities: Retrieved entities:', {
      profileId,
      programId,
      programName: program.name,
      profileData: {
        householdIncome: profile.householdIncome,
        householdSize: profile.householdSize,
        citizenship: profile.citizenship
      },
      rulesFound: rules.length,
      allRules: sortedRules.map(r => ({
        id: r.id,
        name: r.name,
        priority: r.priority,
        active: r.active,
        ruleLogic: `${JSON.stringify(r.ruleLogic, null, 2).substring(0, 100)}...`
      }))
    });
  }

  return { profile, rules: sortedRules };
}

/**
 * Get all active rules for a program (for displaying program requirements)
 *
 * @param programId Program ID
 * @returns Array of rule IDs for the program
 */
export async function getAllProgramRuleIds(programId: string): Promise<string[]> {
  debugLog('Retrieving all rule IDs for program', programId);
  try {
    const db = getDatabase();
    const rules: EligibilityRuleDocument[] = await db.eligibility_rules.findRulesByProgram(programId);

    // Sort by priority (highest first) for consistent order
    const sortedRules = rules.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    debugLog('Rule IDs found', sortedRules.map(rule => rule.id));
    return sortedRules.map(rule => rule.id);
  } catch (error) {
    console.warn(`Failed to get program rules for ${programId}:`, error);
    debugLog('Failed to retrieve rules for program', { programId, error });
    return [];
  }
}

/**
 * Debug logger for rule evaluation
 */
function logRuleEvaluation(
  profileId: string,
  programId: string,
  ruleId: string,
  ruleLogic: unknown,
  data: JsonLogicData
): void {
  debugLog('Evaluating rule', { profileId, programId, ruleId, ruleLogic, data });
  if (import.meta.env.DEV) {
    console.warn(`🔍 [DEBUG] Database Rule Evaluation:`, {
      profileId,
      programId,
      ruleId,
      ruleLogic: JSON.stringify(ruleLogic, null, 2),
      data: JSON.stringify(data, null, 2),
    });
  }
}

/**
 * Debug logger for rule evaluation result
 */
function logRuleResult(
  ruleId: string,
  success: boolean,
  result: unknown,
  error?: string
): void {
  debugLog('Rule evaluation result', { ruleId, success, result, error });
  if (import.meta.env.DEV) {
    console.warn(`🔍 [DEBUG] Database Rule Result:`, {
      ruleId,
      success,
      result,
      error,
    });
  }
}

/**
 * Evaluate all rules for eligibility
 */
export async function evaluateAllRules(
  rules: EligibilityRuleDocument[],
  data: JsonLogicData,
  profileId: string,
  programId: string
): Promise<AllRulesEvaluationResult> {
  debugLog('Beginning evaluation of all rules', { profileId, programId, ruleCount: rules.length });
  const ruleResults: RuleEvaluationWithDetails[] = [];

  let overallEligible = true;
  let firstFailedRule: EligibilityRuleDocument | null = null;
  let firstFailedResult: RuleEvaluationResult | null = null;
  const allMissingFields = new Set<string>();

  for (const rule of rules) {
    debugLog('Evaluating rule', rule.id);
    // Check for missing fields for this rule
    const missingFields = checkMissingFields(data, rule.requiredFields ?? []);
    debugLog('Missing fields for rule', rule.id, missingFields);
    missingFields.forEach(field => allMissingFields.add(field));

    // Add debugging for rule evaluation
    logRuleEvaluation(profileId, programId, rule.id, rule.ruleLogic, data);

    // Use detailed evaluator to capture comparison values
    const detailedResult = await evaluateRuleWithDetails(
      rule.ruleLogic as JsonLogicRule,
      data
    );

    // Convert to standard evaluation result format
    const evalResult: RuleEvaluationResult = {
      result: detailedResult.result,
      success: detailedResult.success,
      executionTime: detailedResult.executionTime,
      error: detailedResult.error,
      context: detailedResult.context
    };

    logRuleResult(rule.id, evalResult.success, evalResult.result, evalResult.error);

    ruleResults.push({ rule, evalResult, missingFields, detailedResult });

    // Check if this rule passed
    const rulePassedResult = evalResult.success ? Boolean(evalResult.result) : false;
    debugLog('Rule evaluation outcome', { ruleId: rule.id, rulePassedResult, success: evalResult.success, result: evalResult.result });
    if (!rulePassedResult && overallEligible) {
      overallEligible = false;
      firstFailedRule = rule;
      firstFailedResult = evalResult;
      debugLog('First failed rule', { ruleId: rule.id });
    }
  }

  debugLog('All rule results evaluated', { ruleResults, overallEligible, firstFailedRule, firstFailedResult, allMissingFields: Array.from(allMissingFields) });

  return {
    ruleResults,
    overallEligible,
    firstFailedRule,
    firstFailedResult,
    allMissingFields
  };
}

/**
 * Select the result rule and evaluation result for final output
 */
export function selectResultRule(
  rules: EligibilityRuleDocument[],
  ruleResults: RuleEvaluationWithDetails[],
  overallEligible: boolean,
  firstFailedRule: EligibilityRuleDocument | null,
  firstFailedResult: RuleEvaluationResult | null
): ResultRuleSelection {
  debugLog('Selecting result rule', { overallEligible, firstFailedRule, firstFailedResult });
  const resultRule = overallEligible ? rules[0] : (firstFailedRule ?? rules[0]);
  const resultEvalResult = overallEligible
    ? ruleResults.find(r => r.rule.id === resultRule.id)?.evalResult ?? ruleResults[0].evalResult
    : (firstFailedResult ?? ruleResults[0].evalResult);

  const combinedEvalResult: RuleEvaluationResult = {
    success: resultEvalResult.success,
    result: overallEligible,
    error: resultEvalResult.error,
    executionTime: resultEvalResult.executionTime,
    context: resultEvalResult.context
  };

  debugLog('Final chosen rule', { resultRule: resultRule.id, combinedEvalResult });
  return { resultRule, combinedEvalResult };
}

/**
 * Build eligibility evaluation result from rule evaluation
 */
export function buildEvaluationResult(
  profileId: string,
  programId: string,
  rule: EligibilityRuleDocument,
  evalResult: RuleEvaluationResult,
  detailedResult: DetailedEvaluationResult,
  missingFields: string[],
  executionTime: number
): EligibilityEvaluationResult {
  debugLog('Building eligibility evaluation result', {
    profileId, programId, ruleId: rule.id, evalResult, missingFields, executionTime
  });
  const incomplete = missingFields.length > 0;

  // Convert detailed criteria results to the expected format
  const criteriaResults = detailedResult.criteriaResults?.map(cr => ({
    criterion: cr.criterion,
    met: cr.met,
    value: cr.value,
    threshold: cr.threshold,
    comparison: cr.comparison,
    message: cr.message
  }));

  if (import.meta.env.DEV) {
    detailedResult.criteriaResults?.forEach((cr, i) => {
      debugLog(`buildEvaluationResult [${i}]`, { input: cr, output: criteriaResults?.[i] });
      console.log(`evaluation.ts - buildEvaluationResult -  [${i}] Input:`, {
        criterion: cr.criterion,
        comparison: cr.comparison,
        threshold: cr.threshold,
        value: cr.value,
        met: cr.met
      });
      console.log(`evaluation.ts - buildEvaluationResult -  [${i}] Output:`, {
        criterion: criteriaResults?.[i]?.criterion,
        comparison: criteriaResults?.[i]?.comparison,
        threshold: criteriaResults?.[i]?.threshold,
        value: criteriaResults?.[i]?.value,
        met: criteriaResults?.[i]?.met
      });
    });
  }

  return {
    profileId,
    programId,
    ruleId: rule.id,
    eligible: evalResult.success ? Boolean(evalResult.result) : false,
    confidence: calculateConfidence(evalResult, incomplete),
    reason: generateReason(evalResult, rule, incomplete),
    criteriaResults,
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
export function buildErrorResult(
  profileId: string,
  programId: string,
  error: unknown,
  executionTime: number
): EligibilityEvaluationResult {
  debugLog('Building error EligibilityEvaluationResult', { profileId, programId, error, executionTime });
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
 * Check for missing required fields
 */
function checkMissingFields(data: JsonLogicData, requiredFields: string[]): string[] {
  const missing: string[] = [];
  debugLog('Checking missing fields', { requiredFields, data });
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }
  debugLog('Missing fields found', missing);
  return missing;
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
  evalResult: RuleEvaluationResult,
  incomplete: boolean
): number {
  debugLog('Calculating confidence score', { evalResult, incomplete });
  if (!evalResult.success) return 0;
  if (incomplete) return 50;
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
  debugLog('Generating human-readable reason', { evalResult, rule, incomplete });
  if (!evalResult.success) return 'Unable to evaluate eligibility due to an error';
  if (incomplete) return 'Cannot fully determine eligibility - missing required information';
  if (evalResult.result) return rule.explanation ?? 'You meet the eligibility criteria for this program';
  return 'You do not meet the eligibility criteria for this program';
}

/**
 * Prepare data context from user profile
 */
export function prepareDataContext(profile: UserProfileDocument): JsonLogicData {
  debugLog('Preparing data context from user profile', profile.id);
  const data = profile.toJSON();

  // Add computed fields
  const processedData = {
    ...data,
    // Add any derived fields here
    _timestamp: Date.now(),
  };

  // Convert annual income to monthly
  if (processedData.householdIncome && typeof processedData.householdIncome === 'number') {
    const originalAnnualIncome = processedData.householdIncome;
    processedData.householdIncome = Math.round(processedData.householdIncome / 12);

    debugLog('Converted annual income to monthly', {
      originalAnnualIncome: `$${originalAnnualIncome.toLocaleString()}`,
      convertedMonthlyIncome: `$${processedData.householdIncome.toLocaleString()}`,
      householdSize: processedData.householdSize,
      citizenship: processedData.citizenship
    });

    if (import.meta.env.DEV) {
      console.warn('🔍 [DEBUG] prepareDataContext: Income conversion:', {
        originalAnnualIncome: `$${originalAnnualIncome.toLocaleString()}`,
        convertedMonthlyIncome: `$${processedData.householdIncome.toLocaleString()}`,
        householdSize: processedData.householdSize,
        citizenship: processedData.citizenship
      });
    }
  }

  debugLog('Final processed data context', processedData);

  if (import.meta.env.DEV) {
    console.warn('🔍 [DEBUG] prepareDataContext: Final processed data:', {
      householdIncome: processedData.householdIncome,
      householdSize: processedData.householdSize,
      citizenship: processedData.citizenship,
      dateOfBirth: processedData.dateOfBirth,
      state: processedData.state,
      timestamp: new Date(processedData._timestamp).toISOString()
    });
  }

  return processedData;
}

/**
 * Ensure operators are registered (exported for external use)
 */
export { ensureOperatorsRegistered };
