/**
 * Multi-rule evaluation orchestration
 */

import type { EligibilityRuleDocument } from '../../../../db/schemas';
import type { JsonLogicData, RuleEvaluationResult } from '../../types';
import type { AllRulesEvaluationResult, RuleEvaluationWithDetails } from '../types';
import { debugLog } from './utils';
import { isIncomeRule } from './ruleClassification';
import { evaluateSingleRule, createSkippedRuleResults } from './ruleEvaluation';

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
