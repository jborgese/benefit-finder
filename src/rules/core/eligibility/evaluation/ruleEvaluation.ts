/**
 * Rule evaluation logic
 */

import { evaluateRuleWithDetails } from '../../detailedEvaluator';
import type { EligibilityRuleDocument } from '../../../../db/schemas';
import type { JsonLogicData, JsonLogicRule, RuleEvaluationResult } from '../../types';
import type { RuleEvaluationWithDetails } from '../types';
import { debugLog, checkMissingFields } from './utils';

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
 * Evaluate a single rule and return the result
 */
export function evaluateSingleRule(
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
export function createSkippedRuleResults(
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
