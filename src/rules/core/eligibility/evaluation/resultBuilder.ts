/**
 * Result building and formatting functions
 */

import type { DetailedEvaluationResult } from '../../detailedEvaluator';
import type { EligibilityRuleDocument } from '../../../../db/schemas';
import type { RuleEvaluationResult } from '../../types';
import type { ResultRuleSelection, EligibilityEvaluationResult, RuleEvaluationWithDetails } from '../types';
import { debugLog } from './utils';

/**
 * Calculate confidence score
 */
function calculateConfidence(
  evalResult: RuleEvaluationResult,
  incomplete: boolean
): number {
  debugLog('Calculating confidence score', { evalResult, incomplete });
  if (!evalResult.success) {return 0;}
  if (incomplete) {return 50;}
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
  if (!evalResult.success) {return 'Unable to evaluate eligibility due to an error';}
  if (incomplete) {return 'Cannot fully determine eligibility - missing required information';}
  if (evalResult.result) {return rule.explanation ?? 'You meet the eligibility criteria for this program';}
  return 'You do not meet the eligibility criteria for this program';
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
