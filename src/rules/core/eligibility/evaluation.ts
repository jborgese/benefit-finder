/**
 * Eligibility Evaluation Helpers
 *
 * Core evaluation logic and helper functions for eligibility determination.
 */

import { getDatabase } from '../../../db/database';
import { registerBenefitOperators } from '../evaluator';
import { evaluateRuleWithDetails, type DetailedEvaluationResult } from '../detailedEvaluator';
import { hasOwnProperty } from '../../../utils/safePropertyAccess';
import type { EligibilityRuleDocument, UserProfileDocument } from '../../../db/schemas';
import type { JsonLogicData, JsonLogicRule, RuleEvaluationResult } from '../types';
import type {
  EvaluationEntities,
  RuleEvaluationWithDetails,
  AllRulesEvaluationResult,
  ResultRuleSelection,
  EligibilityEvaluationResult
} from './types';
import type { ProcessedAMIData } from '../../../data/types/ami';

// Global debug log utility
function debugLog(...args: unknown[]): void {
  if (import.meta.env.DEV) {
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
 * Log detailed entities information for debugging
 */
function logEntitiesDebugInfo(
  profileId: string,
  programId: string,
  programName: string,
  profile: UserProfileDocument,
  sortedRules: EligibilityRuleDocument[]
): void {
  if (import.meta.env.DEV) {
    console.warn('🔍 [DEBUG] getEvaluationEntities: Retrieved entities:', {
      profileId,
      programId,
      programName,
      profileData: {
        householdIncome: profile.householdIncome,
        householdSize: profile.householdSize,
        citizenship: profile.citizenship
      },
      rulesFound: sortedRules.length,
      allRules: sortedRules.map(r => ({
        id: r.id,
        name: r.name,
        priority: r.priority,
        active: r.active,
        ruleLogic: `${JSON.stringify(r.ruleLogic, null, 2).substring(0, 100)}...`
      }))
    });
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
  console.log('🔍 [PROGRAM LOOKUP DEBUG] Looking up program', { programId });
  const program = await db.benefit_programs.findOne(programId).exec();
  if (!program) {
    console.log('🔍 [PROGRAM LOOKUP DEBUG] Program not found, checking all programs', { programId });

    // Debug: Check what programs exist
    const allPrograms = await db.benefit_programs.find({}).exec();
    console.log('🔍 [PROGRAM LOOKUP DEBUG] All programs in database', {
      totalPrograms: allPrograms.length,
      programIds: allPrograms.map(p => p.id),
      programNames: allPrograms.map(p => p.name),
      activePrograms: allPrograms.filter(p => p.active).length
    });

    // Re-check all programs to see if they exist
    console.log('🔍 [PROGRAM LOOKUP DEBUG] Re-checking all programs', { programId });
    const allProgramsRecheck = await db.benefit_programs.find({}).exec();
    console.log('🔍 [PROGRAM LOOKUP DEBUG] Programs on re-check', {
      totalPrograms: allProgramsRecheck.length,
      programIds: allProgramsRecheck.map(p => p.id),
      activePrograms: allProgramsRecheck.filter(p => p.active).length
    });

    debugLog('Benefit program not found', { programId });
    throw new Error(`Program ${programId} not found`);
  }

  console.log('🔍 [PROGRAM LOOKUP DEBUG] Program found', {
    programId: program.id,
    programName: program.name,
    isActive: program.active,
    category: program.category
  });

  // Get active rules for program
  const rules: EligibilityRuleDocument[] = await db.eligibility_rules.findRulesByProgram(programId);
  debugLog('🔍 [DEBUG] Rules found for program', {
    programId,
    ruleCount: rules.length,
    ruleIds: rules.map(r => r.id),
    ruleNames: rules.map(r => r.name)
  });

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

  logEntitiesDebugInfo(profileId, programId, program.name, profile, sortedRules);

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
 * Determines if a rule is an income-based rule
 */
function isIncomeRule(rule: EligibilityRuleDocument): boolean {
  // Use word boundaries for short keywords to avoid false matches
  // e.g., "ami" should not match "family"
  const incomeKeywords = [
    'income',
    'snap_income_eligible',
    'householdIncome',
    'income-limit',
    'income-limits',
    'income_eligible',
    'gross-income',
    'net-income',
    'fpl',
    'poverty',
    'threshold'
  ];

  // Short keywords that need word boundary checks
  const shortKeywords = ['ami'];

  const ruleId = rule.id.toLowerCase();
  const ruleName = rule.name.toLowerCase();

  // Check regular keywords with substring matching
  const matchesKeyword = incomeKeywords.some(keyword =>
    ruleId.includes(keyword) || ruleName.includes(keyword)
  );

  // Check for word boundaries manually
  const hasWordBoundary = (text: string, keyword: string): boolean => {
    const index = text.indexOf(keyword);
    if (index === -1) return false;

    // Check if it's at the beginning or after a non-word character
    const beforeChar = index === 0 ? '' : text[index - 1];
    const afterChar = index + keyword.length >= text.length ? '' : text[index + keyword.length];

    const isWordChar = (char: string): boolean => /[a-zA-Z0-9_]/.test(char);

    return (!isWordChar(beforeChar) && !isWordChar(afterChar));
  };

  // Check short keywords with word boundaries
  const matchesShortKeyword = shortKeywords.some(keyword => {
    // Use string methods instead of regex for security
    const lowerRuleId = ruleId.toLowerCase();
    const lowerRuleName = ruleName.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();

    return hasWordBoundary(lowerRuleId, lowerKeyword) || hasWordBoundary(lowerRuleName, lowerKeyword);
  });

  const isIncome = matchesKeyword || matchesShortKeyword;

  if (import.meta.env.DEV) {
    console.log('🔍 [INCOME RULE CHECK]', {
      ruleId: rule.id,
      ruleName: rule.name,
      isIncome,
      matchedKeyword: incomeKeywords.find(keyword =>
        ruleId.includes(keyword) || ruleName.includes(keyword)
      ) ?? shortKeywords.find(keyword => {
        // Use string methods instead of regex for security
        const lowerRuleId = ruleId.toLowerCase();
        const lowerRuleName = ruleName.toLowerCase();
        const lowerKeyword = keyword.toLowerCase();

        return hasWordBoundary(lowerRuleId, lowerKeyword) || hasWordBoundary(lowerRuleName, lowerKeyword);
      })
    });
  }

  return isIncome;
}

/**
 * Evaluate a single rule and return the result
 */
function evaluateSingleRule(
  rule: EligibilityRuleDocument,
  data: JsonLogicData,
  profileId: string,
  programId: string,
  allMissingFields: Set<string>
): RuleEvaluationWithDetails {
  // Check for missing fields for this rule
  const missingFields = checkMissingFields(data, rule.requiredFields ?? []);
  debugLog('🔍 [DEBUG] Missing fields for rule', {
    ruleId: rule.id,
    missingFields,
    requiredFields: rule.requiredFields,
    dataKeys: Object.keys(data)
  });
  missingFields.forEach(field => allMissingFields.add(field));

  // Add debugging for rule evaluation
  logRuleEvaluation(profileId, programId, rule.id, rule.ruleLogic, data);

  // Use detailed evaluator to capture comparison values
  const detailedResult = evaluateRuleWithDetails(
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

  return { rule, evalResult, missingFields, detailedResult };
}

/**
 * Create placeholder results for skipped rules
 */
function createSkippedRuleResults(
  rules: EligibilityRuleDocument[],
  reason: string
): RuleEvaluationWithDetails[] {
  return rules.map(rule => ({
    rule,
    evalResult: {
      result: false,
      success: true,
      executionTime: 0,
      error: undefined,
      context: { skipped: true, reason }
    },
    missingFields: [],
    detailedResult: {
      result: false,
      success: true,
      executionTime: 0,
      error: undefined,
      context: { skipped: true, reason },
      comparisons: []
    }
  }));
}

/**
 * Evaluate income rules and handle hard stops
 */
function evaluateIncomeRules(
  incomeRules: EligibilityRuleDocument[],
  data: JsonLogicData,
  profileId: string,
  programId: string,
  allMissingFields: Set<string>,
  ruleResults: RuleEvaluationWithDetails[]
): { overallEligible: boolean; firstFailedRule: EligibilityRuleDocument | null; firstFailedResult: RuleEvaluationResult | null } {
  let overallEligible = true;
  let firstFailedRule: EligibilityRuleDocument | null = null;
  let firstFailedResult: RuleEvaluationResult | null = null;

  for (const rule of incomeRules) {
    debugLog('🔍 [DEBUG] Evaluating income rule', {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      priority: rule.priority,
      requiredFields: rule.requiredFields
    });

    const ruleResult = evaluateSingleRule(rule, data, profileId, programId, allMissingFields);
    ruleResults.push(ruleResult);

    // Check if this income rule passed
    const rulePassedResult = ruleResult.evalResult.success ? Boolean(ruleResult.evalResult.result) : false;
    debugLog('🔍 [DEBUG] Income rule evaluation outcome', {
      ruleId: rule.id,
      ruleName: rule.name,
      rulePassedResult,
      success: ruleResult.evalResult.success,
      result: ruleResult.evalResult.result,
      error: ruleResult.evalResult.error,
      executionTime: ruleResult.evalResult.executionTime
    });

    if (!rulePassedResult) {
      // Income rule failed - this is a hard stop
      overallEligible = false;
      firstFailedRule = rule;
      firstFailedResult = ruleResult.evalResult;
      debugLog('🚨 [INCOME HARD STOP] Income rule failed - user disqualified due to income', {
        ruleId: rule.id,
        ruleName: rule.name,
        reason: 'Income rule evaluation failed - hard stop'
      });
      break; // Exit the income rules loop
    }
  }

  return { overallEligible, firstFailedRule, firstFailedResult };
}

/**
 * Evaluate non-income rules
 */
function evaluateNonIncomeRules(
  nonIncomeRules: EligibilityRuleDocument[],
  data: JsonLogicData,
  profileId: string,
  programId: string,
  allMissingFields: Set<string>,
  ruleResults: RuleEvaluationWithDetails[]
): { overallEligible: boolean; firstFailedRule: EligibilityRuleDocument | null; firstFailedResult: RuleEvaluationResult | null } {
  let overallEligible = true;
  let firstFailedRule: EligibilityRuleDocument | null = null;
  let firstFailedResult: RuleEvaluationResult | null = null;

  for (const rule of nonIncomeRules) {
    debugLog('🔍 [DEBUG] Evaluating non-income rule', {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      priority: rule.priority,
      requiredFields: rule.requiredFields
    });

    const ruleResult = evaluateSingleRule(rule, data, profileId, programId, allMissingFields);
    ruleResults.push(ruleResult);

    // Check if this rule passed
    const rulePassedResult = ruleResult.evalResult.success ? Boolean(ruleResult.evalResult.result) : false;
    debugLog('🔍 [DEBUG] Non-income rule evaluation outcome', {
      ruleId: rule.id,
      ruleName: rule.name,
      rulePassedResult,
      success: ruleResult.evalResult.success,
      result: ruleResult.evalResult.result,
      error: ruleResult.evalResult.error,
      executionTime: ruleResult.evalResult.executionTime
    });

    if (!rulePassedResult && overallEligible) {
      overallEligible = false;
      firstFailedRule = rule;
      firstFailedResult = ruleResult.evalResult;
      debugLog('🔍 [DEBUG] First failed non-income rule', {
        ruleId: rule.id,
        ruleName: rule.name,
        reason: 'Non-income rule evaluation failed'
      });
    }
  }

  return { overallEligible, firstFailedRule, firstFailedResult };
}

/**
 * Evaluate all rules for eligibility
 */
export function evaluateAllRules(
  rules: EligibilityRuleDocument[],
  data: JsonLogicData,
  profileId: string,
  programId: string
): AllRulesEvaluationResult {
  debugLog('Beginning evaluation of all rules', { profileId, programId, ruleCount: rules.length });
  const ruleResults: RuleEvaluationWithDetails[] = [];
  const allMissingFields = new Set<string>();

  // First pass: Check for income rule failures (hard stops)
  const incomeRules = rules.filter(rule => isIncomeRule(rule));
  const nonIncomeRules = rules.filter(rule => !isIncomeRule(rule));

  debugLog('🔍 [DEBUG] Income hard stops: Evaluating income rules first', {
    incomeRulesCount: incomeRules.length,
    nonIncomeRulesCount: nonIncomeRules.length,
    incomeRuleIds: incomeRules.map(r => r.id)
  });

  // Evaluate income rules first
  const incomeResult = evaluateIncomeRules(incomeRules, data, profileId, programId, allMissingFields, ruleResults);

  let { overallEligible, firstFailedRule, firstFailedResult } = incomeResult;

  // If income rules failed, add placeholder results for skipped non-income rules
  if (!overallEligible) {
    debugLog('🔍 [DEBUG] Skipping non-income rules due to income failure', {
      skippedRulesCount: nonIncomeRules.length,
      skippedRuleIds: nonIncomeRules.map(r => r.id)
    });

    const skippedResults = createSkippedRuleResults(nonIncomeRules, 'Income rule failed - hard stop');
    ruleResults.push(...skippedResults);
  } else {
    // Second pass: Evaluate non-income rules only if income rules passed
    debugLog('🔍 [DEBUG] Income rules passed - evaluating non-income rules', {
      nonIncomeRulesCount: nonIncomeRules.length,
      nonIncomeRuleIds: nonIncomeRules.map(r => r.id)
    });

    const nonIncomeResult = evaluateNonIncomeRules(nonIncomeRules, data, profileId, programId, allMissingFields, ruleResults);

    if (!nonIncomeResult.overallEligible) {
      ({ overallEligible, firstFailedRule, firstFailedResult } = nonIncomeResult);
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
  executionTime: number,
  estimatedBenefit?: { amount: number; frequency: 'one_time' | 'monthly' | 'quarterly' | 'annual'; description?: string }
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
      // eslint-disable-next-line security/detect-object-injection
      const outputResult = criteriaResults && i < criteriaResults.length ? criteriaResults[i] : undefined;
      debugLog(`buildEvaluationResult [${i}]`, { input: cr, output: outputResult });
      console.log(`evaluation.ts - buildEvaluationResult -  [${i}] Input:`, {
        criterion: cr.criterion,
        comparison: cr.comparison,
        threshold: cr.threshold,
        value: cr.value,
        met: cr.met
      });
      console.log(`evaluation.ts - buildEvaluationResult -  [${i}] Output:`, {
        criterion: outputResult?.criterion,
        comparison: outputResult?.comparison,
        threshold: outputResult?.threshold,
        value: outputResult?.value,
        met: outputResult?.met
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
    estimatedBenefit,
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
    // Safely check for field existence
    // eslint-disable-next-line security/detect-object-injection
    const fieldValue = hasOwnProperty(data, field) ? data[field] : undefined;
    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
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
 * Medicaid expansion status by state code (as of 2024)
 * Source: https://www.kff.org/medicaid/issue-brief/status-of-state-medicaid-expansion-decisions-interactive-map/
 */
const MEDICAID_EXPANSION_STATE_CODES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MO', 'MT', 'NV', 'NH', 'NJ', 'NM', 'NY',
  'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SD', 'UT', 'VT', 'VA', 'WA', 'WV'
]);

/**
 * Determine if a state has expanded Medicaid under the ACA
 */
function isMedicaidExpansionState(stateCode: string): boolean {
  return MEDICAID_EXPANSION_STATE_CODES.has(stateCode);
}

/**
 * Add AMI data to processed data context
 * Returns an object with the AMI data fields to merge into the main data
 */
async function getAMIDataForContext(
  stateCode: string,
  county: string,
  householdSize: number
): Promise<Record<string, unknown>> {
  try {
    const { AMIDataService } = await import('../../../data/services/AMIDataService');
    const amiService = AMIDataService.getInstance();
    const amiData: ProcessedAMIData = await amiService.getAMIForHousehold(
      stateCode,
      county,
      householdSize
    );

    debugLog('Added AMI data for housing programs', {
      state: stateCode,
      county,
      householdSize,
      ami50: amiData.incomeLimit50,
      ami60: amiData.incomeLimit60,
      ami80: amiData.incomeLimit80
    });

    // Convert annual AMI data to monthly for comparison with monthly user income
    return {
      areaMedianIncome: Math.floor(amiData.incomeLimit50 / 12),
      ami50: Math.floor(amiData.incomeLimit50 / 12),
      ami60: Math.floor(amiData.incomeLimit60 / 12),
      ami80: Math.floor(amiData.incomeLimit80 / 12)
    };
  } catch (error) {
    debugLog('Failed to load AMI data', { error, state: stateCode, county });
    return {
      areaMedianIncome: 2000,   // Monthly fallback - much lower to trigger income hard stops
      ami50: 1000,              // Monthly fallback - $8,333 > $1,000 fails
      ami60: 1200,
      ami80: 1600
    };
  }
}

/**
 * Normalize state name or code to 2-character state code
 */
function normalizeStateToCode(stateValue: string): string {
  // State name to code mapping
  const stateNameToCode: Record<string, string> = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC'
  };

  // If it's already a 2-character code, return it
  if (stateValue.length === 2) {
    return stateValue.toUpperCase();
  }

  // If it's a full state name, convert to code
  const normalizedName = stateValue.trim();
  // Safely access the mapping
  let code: string | undefined;
  if (hasOwnProperty(stateNameToCode, normalizedName)) {
    // eslint-disable-next-line security/detect-object-injection
    code = stateNameToCode[normalizedName];
  }

  if (code) {
    return code;
  }

  // Fallback: return the original value (shouldn't happen in normal usage)
  console.warn(`[prepareDataContext] Unknown state value: ${stateValue}`);
  return stateValue;
}

/**
 * Calculate age from date of birth
 */
function calculateAgeFromDateOfBirth(dateOfBirth: string): number {
  // Parse the ISO date string and create a date object in local timezone
  // This prevents timezone shift issues when calculating age
  const [year, month, day] = dateOfBirth.split('-').map(Number);
  const birthDate = new Date(year, month - 1, day); // month is 0-indexed
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Convert annual income to monthly
 */
function convertAnnualIncomeToMonthly(processedData: Record<string, unknown>): Record<string, unknown> {
  if (processedData.householdIncome && typeof processedData.householdIncome === 'number') {
    const incomePeriod = processedData.incomePeriod as string;

    console.warn(`🔍 [SNAP DEBUG] Income Conversion Check:`);
    console.warn(`  - Original Income: $${processedData.householdIncome.toLocaleString()}`);
    console.warn(`  - Income Period: ${incomePeriod || 'unknown'}`);
    console.warn(`  - Household Size: ${processedData.householdSize}`);

    // Only convert if income was entered as annual
    if (incomePeriod === 'annual') {
      const originalAnnualIncome = processedData.householdIncome;
      const monthlyIncome = Math.round(processedData.householdIncome / 12);
      const updatedData = { ...processedData, householdIncome: monthlyIncome };

      console.warn(`🔍 [SNAP DEBUG] Converting annual to monthly:`);
      console.warn(`  - Annual Income: $${originalAnnualIncome.toLocaleString()}/year`);
      console.warn(`  - Monthly Income: $${monthlyIncome.toLocaleString()}/month`);
      console.warn(`  - Conversion Factor: 12 (annual ÷ 12 = monthly)`);

      debugLog('Converted annual income to monthly', {
        originalAnnualIncome: `$${originalAnnualIncome.toLocaleString()}`,
        convertedMonthlyIncome: `$${monthlyIncome.toLocaleString()}`,
        householdSize: processedData.householdSize,
        citizenship: processedData.citizenship
      });

      if (import.meta.env.DEV) {
        console.warn('🔍 [DEBUG] prepareDataContext: Income conversion:', {
          originalAnnualIncome: `$${originalAnnualIncome.toLocaleString()}`,
          convertedMonthlyIncome: `$${monthlyIncome.toLocaleString()}`,
          householdSize: processedData.householdSize,
          citizenship: processedData.citizenship
        });
      }

      return updatedData;
    } else {
      // Income is already monthly, no conversion needed
      console.warn(`🔍 [SNAP DEBUG] Income already in monthly format:`);
      console.warn(`  - Monthly Income: $${processedData.householdIncome.toLocaleString()}/month`);
      console.warn(`  - No conversion needed`);

      debugLog('Income already in monthly format', {
        monthlyIncome: `$${processedData.householdIncome.toLocaleString()}`,
        incomePeriod: incomePeriod || 'unknown',
        householdSize: processedData.householdSize,
        citizenship: processedData.citizenship
      });
    }
  } else {
    console.warn(`🔍 [SNAP DEBUG] No income data to convert:`);
    console.warn(`  - householdIncome: ${processedData.householdIncome}`);
    console.warn(`  - Type: ${typeof processedData.householdIncome}`);
  }
  return processedData;
}

/**
 * Add state-specific variables to processed data
 */
async function addStateSpecificVariables(
  processedData: Record<string, unknown>,
  stateValue: string
): Promise<Record<string, unknown>> {
  // Normalize state value to 2-character code
  const stateCode = normalizeStateToCode(stateValue);

  // Create new object with state-specific variables
  const stateVariables = {
    stateHasExpanded: isMedicaidExpansionState(stateCode),
    livesInState: true,
    livesInGeorgia: stateCode === 'GA',
    livesInCalifornia: stateCode === 'CA',
    livesInTexas: stateCode === 'TX',
    livesInFlorida: stateCode === 'FL'
  };

  // Add Area Median Income (AMI) data for housing programs
  let amiData = {};
  if (processedData.householdSize) {
    // Use default county if not provided
    const county = processedData.county as string || 'default';
    amiData = await getAMIDataForContext(
      stateCode,
      county,
      processedData.householdSize as number
    );
  }

  const updatedData = { ...processedData, ...stateVariables, ...amiData };

  debugLog('Added state-specific variables', {
    originalState: stateValue,
    normalizedStateCode: stateCode,
    stateHasExpanded: stateVariables.stateHasExpanded,
    livesInState: stateVariables.livesInState,
    livesInGeorgia: stateVariables.livesInGeorgia
  });

  if (import.meta.env.DEV) {
    console.warn('🔍 [DEBUG] prepareDataContext: State-specific variables:', {
      originalState: stateValue,
      normalizedStateCode: stateCode,
      stateHasExpanded: stateVariables.stateHasExpanded,
      livesInState: stateVariables.livesInState,
      livesInGeorgia: stateVariables.livesInGeorgia,
      isExpansionState: isMedicaidExpansionState(stateCode)
    });
  }

  return updatedData;
}

/**
 * Log final processed data for debugging
 */
function logFinalProcessedData(processedData: Record<string, unknown>): void {
  debugLog('🔍 [DEBUG] Final processed data context', {
    householdIncome: processedData.householdIncome,
    householdSize: processedData.householdSize,
    citizenship: processedData.citizenship,
    state: processedData.state,
    county: processedData.county,
    age: processedData.age,
    hasChildren: processedData.hasChildren,
    hasDisability: processedData.hasDisability,
    isPregnant: processedData.isPregnant,
    employmentStatus: processedData.employmentStatus,
    areaMedianIncome: processedData.areaMedianIncome,
    ami50: processedData.ami50,
    ami60: processedData.ami60,
    ami80: processedData.ami80,
    allKeys: Object.keys(processedData)
  });

  if (import.meta.env.DEV) {
    const timestampValue = processedData._timestamp;
    const timestampStr = timestampValue !== undefined && (typeof timestampValue === 'string' || typeof timestampValue === 'number')
      ? new Date(timestampValue).toISOString()
      : 'N/A';

    console.warn('🔍 [DEBUG] prepareDataContext: Final processed data:', {
      householdIncome: processedData.householdIncome,
      householdSize: processedData.householdSize,
      citizenship: processedData.citizenship,
      dateOfBirth: processedData.dateOfBirth,
      state: processedData.state,
      county: processedData.county,
      age: processedData.age,
      hasChildren: processedData.hasChildren,
      hasDisability: processedData.hasDisability,
      isPregnant: processedData.isPregnant,
      employmentStatus: processedData.employmentStatus,
      areaMedianIncome: processedData.areaMedianIncome,
      ami50: processedData.ami50,
      ami60: processedData.ami60,
      ami80: processedData.ami80,
      stateHasExpanded: processedData.stateHasExpanded,
      livesInState: processedData.livesInState,
      livesInGeorgia: processedData.livesInGeorgia,
      timestamp: timestampStr,
      allKeys: Object.keys(processedData)
    });
  }
}

/**
 * Prepare data context from user profile
 */
export async function prepareDataContext(profile: UserProfileDocument): Promise<JsonLogicData> {
  debugLog('Preparing data context from user profile', profile.id);
  const data = profile.toJSON();

  // Add computed fields
  const processedData: Record<string, unknown> = {
    ...data,
    // Add any derived fields here
    _timestamp: Date.now(),
  };

  // Calculate age from dateOfBirth
  if (processedData.dateOfBirth && typeof processedData.dateOfBirth === 'string') {
    const age = calculateAgeFromDateOfBirth(processedData.dateOfBirth);
    processedData.age = age;

    debugLog('Calculated age from dateOfBirth', {
      dateOfBirth: processedData.dateOfBirth,
      calculatedAge: age
    });
  }

  // Convert annual income to monthly
  const dataWithIncome = convertAnnualIncomeToMonthly(processedData);

  // Add state-specific variables for benefit eligibility
  const stateValue = dataWithIncome.state as string;
  if (stateValue) {
    const finalData = await addStateSpecificVariables(dataWithIncome, stateValue);
    logFinalProcessedData(finalData);
    return finalData;
  }

  // Log final processed data for debugging (no state case)
  logFinalProcessedData(dataWithIncome);
  return dataWithIncome;
}

/**
 * Ensure operators are registered (exported for external use)
 */
export { ensureOperatorsRegistered };
