/**
 * Rule classification and identification functions
 */

import type { EligibilityRuleDocument } from '../../../../db/schemas';
import { INCOME_KEYWORDS, SHORT_INCOME_KEYWORDS } from './constants';
import { hasWordBoundary } from './utils';

/**
 * Determines if a rule is an income-based rule
 */
export function isIncomeRule(rule: EligibilityRuleDocument): boolean {
  const ruleId = rule.id.toLowerCase();
  const ruleName = rule.name.toLowerCase();

  // Check regular keywords with substring matching
  const matchesKeyword = INCOME_KEYWORDS.some(keyword =>
    ruleId.includes(keyword) || ruleName.includes(keyword)
  );

  // Check short keywords with word boundaries
  const matchesShortKeyword = SHORT_INCOME_KEYWORDS.some(keyword => {
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
      matchedKeyword: INCOME_KEYWORDS.find(keyword =>
        ruleId.includes(keyword) || ruleName.includes(keyword)
      ) ?? SHORT_INCOME_KEYWORDS.find(keyword => {
        const lowerRuleId = ruleId.toLowerCase();
        const lowerRuleName = ruleName.toLowerCase();
        const lowerKeyword = keyword.toLowerCase();

        return hasWordBoundary(lowerRuleId, lowerKeyword) || hasWordBoundary(lowerRuleName, lowerKeyword);
      })
    });
  }

  return isIncome;
}
