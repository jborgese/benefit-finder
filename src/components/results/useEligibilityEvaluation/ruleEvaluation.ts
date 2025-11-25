/**
 * Rule evaluation logic
 */

import type { RuleDefinition } from '../../../rules/core/schema';
import { evaluateRuleSync } from '../../../rules/core/evaluator';
import type { JsonLogicRule } from '../../../rules/core/types';
import type { UserProfile, EvaluationData, EvaluationState } from './types';
import { formatFieldName } from './fieldMappings';
import { generateRuleCalculation } from './calculations';
import { logEvaluationStart, logEvaluationSummary, logRuleDebug, debugSnapIncomeRule } from './debug';

/**
 * Helper to process required fields for rule result
 */
function processRequiredFields(rule: RuleDefinition, profile: UserProfile, details: string[]): void {
  if (!rule.requiredFields?.length) return;

  for (const field of rule.requiredFields) {
    const fieldValue = profile[field];
    const fieldDescription = formatFieldName(field);
    const hasValue = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';

    // Debug logging to verify the mapping is working
    if (import.meta.env.DEV) {
      console.warn(`🔍 [DEBUG] Field mapping: "${field}" → "${fieldDescription}"`);
    }

    details.push(`${fieldDescription}: ${hasValue ? 'Met' : 'Not provided'}`);
  }
}

/**
 * Helper to add rule explanation to details
 */
function addRuleExplanation(rule: RuleDefinition, passed: boolean, details: string[]): void {
  if (rule.explanation) {
    details.push(`${passed ? '✓' : '✗'} ${rule.explanation}`);
  }
}

/**
 * Process a single rule evaluation result
 */
function processRuleResult(
  rule: RuleDefinition,
  evaluationResult: { result: boolean },
  details: string[],
  profile: UserProfile
): boolean {
  const passed = evaluationResult.result === true;

  if (import.meta.env.DEV) {
    console.warn(`${passed ? '✅' : '❌'} [DEBUG] Rule ${rule.id} ${passed ? 'PASSED' : 'FAILED'}`);
  }

  // Add user-friendly explanation if available
  addRuleExplanation(rule, passed, details);

  // Add user-friendly field status descriptions for required fields
  processRequiredFields(rule, profile, details);

  return passed;
}

/**
 * Determines if a rule is an income-based rule
 */
function isIncomeRule(rule: RuleDefinition): boolean {
  const incomeKeywords = [
    'income',
    'snap_income_eligible',
    'householdIncome',
    'income-limit',
    'income-limit',
    'income_eligible',
    'fpl',
    'poverty'
  ];
  const ruleId = rule.id.toLowerCase();
  const ruleName = rule.name.toLowerCase();

  return incomeKeywords.some(keyword =>
    ruleId.includes(keyword) || ruleName.includes(keyword)
  );
}

/**
 * Processes a single rule evaluation
 */
function processSingleRule(
  rule: RuleDefinition,
  profile: UserProfile,
  state: {
    rulesCited: string[];
    details: string[];
    calculations: Array<{ label: string; value: string | number; comparison?: string }>;
  }
): { passed: boolean } {
  try {
    const evaluationResult = evaluateRuleSync(rule.ruleLogic as JsonLogicRule, profile);
    logRuleDebug(rule, evaluationResult);
    debugSnapIncomeRule(rule, profile, evaluationResult);

    const ruleCalculation = generateRuleCalculation(rule, profile);
    if (ruleCalculation) {
      state.calculations.push(ruleCalculation);
    }

    const passed = processRuleResult(rule, evaluationResult, state.details, profile);
    state.rulesCited.push(rule.id);

    return { passed };
  } catch (err) {
    console.error(`🚨 [ERROR] Error evaluating rule ${rule.id}:`, err);
    return { passed: false };
  }
}

/**
 * Evaluates income rules and returns early if any fail
 */
function evaluateIncomeRules(
  rules: RuleDefinition[],
  profile: UserProfile,
  state: EvaluationState
): EvaluationData {
  for (const rule of rules) {
    if (rule.ruleType !== 'eligibility') continue;
    if (!isIncomeRule(rule)) continue;

    state.totalRules++;
    const ruleResult = processSingleRule(rule, profile, state);

    if (!ruleResult.passed) {
      state.hasIncomeFailure = true;
      if (import.meta.env.DEV) {
        console.warn(`🚨 [INCOME HARD STOP] Rule ${rule.id} failed - user disqualified due to income`);
      }
    } else {
      state.passedRules++;
    }
  }

  return {
    passedRules: state.passedRules,
    totalRules: state.totalRules,
    rulesCited: state.rulesCited,
    details: state.details,
    calculations: state.calculations,
    hasIncomeFailure: state.hasIncomeFailure
  };
}

/**
 * Evaluates non-income rules
 */
function evaluateNonIncomeRules(
  rules: RuleDefinition[],
  profile: UserProfile,
  state: EvaluationState
): EvaluationData {
  for (const rule of rules) {
    if (rule.ruleType !== 'eligibility') continue;
    if (isIncomeRule(rule)) continue; // Skip income rules (already evaluated)

    state.totalRules++;
    const ruleResult = processSingleRule(rule, profile, state);

    if (ruleResult.passed) {
      state.passedRules++;
    }
  }

  return {
    passedRules: state.passedRules,
    totalRules: state.totalRules,
    rulesCited: state.rulesCited,
    details: state.details,
    calculations: state.calculations,
    hasIncomeFailure: state.hasIncomeFailure
  };
}

/**
 * Evaluates all rules and returns evaluation data
 */
export function evaluateRules(rules: RuleDefinition[], profile: UserProfile): EvaluationData {
  const evaluationState: EvaluationState = {
    passedRules: 0,
    totalRules: 0,
    hasIncomeFailure: false,
    rulesCited: [],
    details: [],
    calculations: []
  };

  logEvaluationStart(profile);

  // First pass: Check for income rule failures (hard stops)
  const incomeRulesResult = evaluateIncomeRules(rules, profile, evaluationState);

  // If income rules failed, skip other rules and return early
  if (incomeRulesResult.hasIncomeFailure) {
    logEvaluationSummary(evaluationState.passedRules, evaluationState.totalRules, evaluationState.rulesCited);
    return incomeRulesResult;
  }

  // Second pass: Evaluate non-income rules only if income rules passed
  const finalResult = evaluateNonIncomeRules(rules, profile, evaluationState);

  logEvaluationSummary(evaluationState.passedRules, evaluationState.totalRules, evaluationState.rulesCited);
  return finalResult;
}
