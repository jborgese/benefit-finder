/**
 * Comparison and Analysis Functions
 */

import type { JsonLogicRule, JsonLogicData } from '../types';
import type { EligibilityEvaluationResult } from '../eligibility';
import { formatFieldName, formatValue } from './formatting';

/**
 * Explain why two evaluations differ
 *
 * @param result1 First evaluation result
 * @param result2 Second evaluation result
 * @param data1 First data context
 * @param data2 Second data context
 * @returns Explanation of differences
 */
export function explainDifference(
  result1: EligibilityEvaluationResult,
  result2: EligibilityEvaluationResult,
  data1: JsonLogicData,
  data2: JsonLogicData
): {
  summary: string;
  differences: string[];
  changedFields: Array<{ field: string; before: unknown; after: unknown }>;
} {
  const differences: string[] = [];
  const changedFields: Array<{ field: string; before: unknown; after: unknown }> = [];

  // Compare results
  if (result1.eligible !== result2.eligible) {
    const change = result1.eligible ? 'eligible → ineligible' : 'ineligible → eligible';
    differences.push(`Eligibility status changed: ${change}`);
  }

  // Find changed data fields
  const allKeys = new Set([...Object.keys(data1), ...Object.keys(data2)]);

  for (const key of allKeys) {
    if (!Object.prototype.hasOwnProperty.call(data1, key) && !Object.prototype.hasOwnProperty.call(data2, key)) {
      continue;
    }

    const value1 = Object.prototype.hasOwnProperty.call(data1, key) ? data1[key] : undefined;
    const value2 = Object.prototype.hasOwnProperty.call(data2, key) ? data2[key] : undefined;

    if (value1 !== value2) {
      changedFields.push({
        field: formatFieldName(key),
        before: value1,
        after: value2,
      });

      differences.push(
        `${formatFieldName(key)} changed from ${formatValue(value1)} to ${formatValue(value2)}`
      );
    }
  }

  const summary = changedFields.length > 0
    ? `${changedFields.length} field(s) changed between evaluations`
    : 'No data changes detected - results differ due to rule changes';

  return {
    summary,
    differences,
    changedFields,
  };
}

/**
 * Explain why a rule failed (what would make it pass)
 *
 * @param rule Rule that failed
 * @param data Current data
 * @returns Suggestions for passing
 */
export function explainWhatWouldPass(
  rule: JsonLogicRule,
  data: JsonLogicData
): string[] {
  const suggestions: string[] = [];

  // Analyze rule to determine what would change the outcome
  const analysis = analyzeRuleForSuggestions(rule, data);

  for (const suggestion of analysis) {
    suggestions.push(suggestion);
  }

  if (suggestions.length === 0) {
    suggestions.push('Eligibility criteria cannot be easily modified. Please consult program guidelines.');
  }

  return suggestions;
}

/**
 * Analyze rule for suggestions
 */
function analyzeRuleForSuggestions(
  rule: JsonLogicRule,
  data: JsonLogicData
): string[] {
  const suggestions: string[] = [];

  if (rule === null || typeof rule !== 'object' || Array.isArray(rule)) {
    return suggestions;
  }

  for (const operator of Object.keys(rule)) {
    const ruleAsRecord = rule as Record<string, unknown>;
    if (!Object.prototype.hasOwnProperty.call(ruleAsRecord, operator)) {continue;}

    const operandValue = ruleAsRecord[operator];
    if (operandValue === undefined) {continue;}

    const operands = Array.isArray(operandValue) ? operandValue : [operandValue];

    // Handle comparison operators
    const operatorSuggestion = getComparisonSuggestion(operator, operands, data);
    if (operatorSuggestion) {
      suggestions.push(operatorSuggestion);
    }

    // Recursively check nested rules
    for (const operand of operands as JsonLogicRule[]) {
      suggestions.push(...analyzeRuleForSuggestions(operand, data));
    }
  }

  return suggestions;
}

/**
 * Get suggestion for comparison operators
 */
function getComparisonSuggestion(
  operator: string,
  operands: unknown[],
  data: JsonLogicData
): string | null {
  const [left, right] = operands as [JsonLogicRule, JsonLogicRule];

  if (typeof left !== 'object' || left === null || !('var' in left) || typeof right !== 'number') {
    return null;
  }

  const varName = (left as { var: string }).var;
  const currentValue = Object.prototype.hasOwnProperty.call(data, varName) ? data[varName] : undefined;

  if (operator === '>' || operator === '>=') {
    return `Increase ${formatFieldName(varName)} from ${formatValue(currentValue)} to at least ${formatValue(right)}`;
  }

  if (operator === '<' || operator === '<=') {
    return `Reduce ${formatFieldName(varName)} from ${formatValue(currentValue)} to ${formatValue(right)} or below`;
  }

  return null;
}
