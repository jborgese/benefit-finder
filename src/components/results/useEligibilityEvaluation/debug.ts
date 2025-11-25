/**
 * Debug utilities for eligibility evaluation
 */

import type { RuleDefinition } from '../../../rules/core/schema';
import type { UserProfile } from './types';

/**
 * Log rule evaluation start debug info
 */
export function logEvaluationStart(profile: UserProfile): void {
  if (!import.meta.env.DEV) return;
  console.warn('🔍 [DEBUG] Starting rule evaluation with profile:', {
    householdIncome: profile.householdIncome,
    householdSize: profile.householdSize,
    citizenship: profile.citizenship,
    age: profile.age,
  });
}

/**
 * Log rule evaluation summary debug info
 */
export function logEvaluationSummary(passedRules: number, totalRules: number, rulesCited: string[]): void {
  if (!import.meta.env.DEV) return;
  console.warn(`🔍 [DEBUG] Rule evaluation summary:`, {
    passedRules,
    totalRules,
    passRate: totalRules > 0 ? (passedRules / totalRules).toFixed(2) : '0',
    rulesCited,
  });
}

/**
 * Log individual rule debug info
 */
export function logRuleDebug(
  rule: RuleDefinition,
  evaluationResult: { success: boolean; result: boolean; error?: string; executionTime?: number }
): void {
  if (!import.meta.env.DEV) return;
  console.warn(`🔍 [DEBUG] Evaluating rule: ${rule.id}`);
  console.warn(`🔍 [DEBUG] Rule logic:`, JSON.stringify(rule.ruleLogic, null, 2));
  console.warn(`🔍 [DEBUG] Rule ${rule.id} evaluation result:`, {
    success: evaluationResult.success,
    result: evaluationResult.result,
    error: evaluationResult.error,
    executionTime: evaluationResult.executionTime,
  });
}

/**
 * Debug SNAP income rule calculations
 */
export function debugSnapIncomeRule(
  rule: RuleDefinition,
  profile: UserProfile,
  evaluationResult: { result: boolean }
): void {
  if (!import.meta.env.DEV) return;
  if (!rule.id.includes('snap') || !rule.id.includes('income')) return;

  const { householdIncome, householdSize, incomePeriod } = profile;

  console.warn(`🔍 [SNAP DEBUG] Income Rule Analysis:`);
  console.warn(`  - Rule ID: ${rule.id}`);
  console.warn(`  - Rule Name: ${rule.name}`);
  console.warn(`  - Household Income: $${householdIncome?.toLocaleString()}/month`);
  console.warn(`  - Household Size: ${householdSize}`);
  console.warn(`  - Income Period: ${incomePeriod ?? 'unknown'}`);
  console.warn(`  - Evaluation Result: ${evaluationResult.result}`);

  if (householdIncome === undefined || householdSize === undefined) {
    console.warn(`  - ⚠️ Missing required data: householdIncome=${householdIncome}, householdSize=${householdSize}`);
    return;
  }

  // Calculate correct SNAP thresholds (130% FPL for 2024)
  const correctThresholds: Record<number, number> = {
    1: 1696, 2: 2292, 3: 2888, 4: 3483,
    5: 4079, 6: 4675, 7: 5271, 8: 5867
  };

  const correctThreshold = householdSize <= 8
    ? correctThresholds[householdSize]
    : correctThresholds[8] + (596 * (householdSize - 8));

  console.warn(`  - Correct SNAP Threshold (130% FPL): $${correctThreshold.toLocaleString()}/month`);
  console.warn(`  - Correct Result: ${householdIncome} <= ${correctThreshold} = ${householdIncome <= correctThreshold}`);

  // Check if the rule is working correctly
  const isCorrectlyEvaluated = (householdIncome <= correctThreshold) === evaluationResult.result;
  console.warn(`  - Rule Evaluation Correct: ${isCorrectlyEvaluated ? '✅' : '❌'}`);

  if (!isCorrectlyEvaluated) {
    console.error(`🚨 [SNAP ERROR] Rule evaluation mismatch!`);
    console.error(`  - Expected: ${householdIncome <= correctThreshold} (income $${householdIncome} <= threshold $${correctThreshold})`);
    console.error(`  - Actual: ${evaluationResult.result}`);
  }

  // Log income conversion details if applicable
  if (incomePeriod === 'annual') {
    const annualIncome = householdIncome * 12;
    console.warn(`  - Annual Income Equivalent: $${annualIncome.toLocaleString()}/year`);
  }
}
