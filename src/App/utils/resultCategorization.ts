/**
 * Result categorization utilities
 * Categorizes evaluation results into qualified/maybe/not-qualified buckets
 */

import type { EligibilityEvaluationResult } from '../../rules';

function isIncomeHardStop(result: EligibilityEvaluationResult): boolean {
  return result.reason.includes('income') ||
    result.reason.includes('Income') ||
    result.reason.includes('hard stop') ||
    result.reason.includes('disqualified due to income') ||
    result.ruleId.includes('income') ||
    result.ruleId.includes('Income') ||
    result.ruleId.includes('income-limits') ||
    result.ruleId.includes('income-limit') ||
    result.ruleId === 'lihtc-federal-income-limits' ||
    result.ruleId === 'section8-federal-income-limits' ||
    result.ruleId === 'tanf-federal-income-test' ||
    result.ruleId === 'medicaid-federal-expansion-income' ||
    result.ruleId === 'wic-federal-income-limit' ||
    (result.confidence >= 90 && result.ruleId.includes('income'));
}

export function categorizeResults(evaluationResults: EligibilityEvaluationResult[]): {
  qualified: EligibilityEvaluationResult[];
  maybe: EligibilityEvaluationResult[];
  incomeHardStops: EligibilityEvaluationResult[];
  notQualified: EligibilityEvaluationResult[];
} {
  const qualified = evaluationResults.filter((result) => result.eligible);

  const incomeHardStops = evaluationResults
    .filter((result) => !result.eligible && isIncomeHardStop(result));

  const maybe = evaluationResults
    .filter((result) => {
      if (!result.eligible) {
        if (isIncomeHardStop(result)) { return false; }
        return (result.incomplete ?? false) || result.confidence < 70;
      }
      return false;
    });

  const notQualified = evaluationResults
    .filter((result) => {
      if (!result.eligible) {
        if (isIncomeHardStop(result)) { return false; }
        return !result.incomplete && result.confidence >= 70;
      }
      return false;
    });

  // Add logging
  if (import.meta.env.DEV) {
    console.log('🔍 [UI CATEGORIZATION] Results categorized:', {
      qualified: qualified.length,
      maybe: maybe.length,
      incomeHardStops: incomeHardStops.length,
      notQualified: notQualified.length,
      total: evaluationResults.length
    });
  }

  return { qualified, maybe, incomeHardStops, notQualified };
}
