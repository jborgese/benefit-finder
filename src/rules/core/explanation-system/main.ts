/**
 * Main Explanation Functions
 */

import { validateRule } from '../validator';
import type { JsonLogicRule, JsonLogicData, RuleExplanation } from '../types';
import type { EligibilityEvaluationResult } from '../eligibility';
import type { ResultExplanation, ExplanationOptions } from './types';
import { analyzeEligibilityResult, generateChangeSuggestions } from './resultAnalysis';
import { generatePlainLanguageExplanation } from './plainLanguage';
import { generateExplanationTree } from './treeGeneration';
import { generateRuleDescription } from './ruleDescription';
import { formatFieldName } from './formatting';

/**
 * Explain a rule evaluation result
 *
 * @param result Eligibility evaluation result
 * @param rule Original rule used
 * @param data Data context used
 * @param options Explanation options
 * @returns Detailed explanation
 *
 * @example
 * ```typescript
 * const result = await evaluateEligibility('user-123', 'snap-federal');
 * const explanation = explainResult(result, rule, userData);
 *
 * console.log(explanation.plainLanguage);
 * ```
 */
export function explainResult(
  result: EligibilityEvaluationResult,
  rule: JsonLogicRule,
  _data: JsonLogicData,
  options: ExplanationOptions = {}
): ResultExplanation {
  const opts = {
    includeTechnical: options.includeTechnical ?? false,
    languageLevel: options.languageLevel ?? 'standard',
    includeSuggestions: options.includeSuggestions !== false,
    maxLength: options.maxLength ?? 1000,
  };

  // Extract criteria from rule
  const ruleExplanation = explainRule(rule, opts.languageLevel);
  const criteriaChecked = [...(ruleExplanation.criteriaChecked ?? [])];

  // Analyze result based on status
  const { reasoning, criteriaPassed, criteriaFailed } = analyzeEligibilityResult(
    result,
    criteriaChecked
  );

  // Generate suggestions if needed
  const whatWouldChange = opts.includeSuggestions && !result.eligible
    ? generateChangeSuggestions(result)
    : undefined;

  // Build plain language explanation
  const plainLanguage = generatePlainLanguageExplanation(
    result,
    reasoning,
    opts.languageLevel
  );

  return {
    summary: result.reason,
    reasoning,
    criteriaChecked,
    criteriaPassed,
    criteriaFailed,
    missingInformation: result.missingFields ?? [],
    whatWouldChange: whatWouldChange && whatWouldChange.length > 0 ? whatWouldChange : undefined,
    plainLanguage,
  };
}

/**
 * Explain a rule (without evaluation result)
 *
 * @param rule Rule to explain
 * @param languageLevel Language complexity level
 * @returns Rule explanation
 */
export function explainRule(
  rule: JsonLogicRule,
  languageLevel: 'simple' | 'standard' | 'technical' = 'standard'
): RuleExplanation {
  const validation = validateRule(rule);
  const breakdown = generateExplanationTree(rule, 0);

  const description = generateRuleDescription(rule, languageLevel);
  const criteriaChecked = validation.variables?.map(formatFieldName) ?? [];

  const complexity = validation.complexity ?? 0;
  let complexityLevel: 'simple' | 'moderate' | 'complex' | 'very-complex' = 'simple';

  if (complexity > 80) {complexityLevel = 'very-complex';}
  else if (complexity > 50) {complexityLevel = 'complex';}
  else if (complexity > 20) {complexityLevel = 'moderate';}

  return {
    description,
    breakdown,
    variables: validation.variables ?? [],
    operators: validation.operators ?? [],
    complexity: complexityLevel,
    criteriaChecked,
  };
}

/**
 * Generate explanation from rule breakdown
 */
export function formatRuleExplanation(explanation: RuleExplanation): string {
  const lines: string[] = [];

  lines.push(explanation.description);
  lines.push('');
  lines.push('This rule checks:');

  if (explanation.criteriaChecked) {
    for (const criterion of explanation.criteriaChecked) {
      lines.push(`• ${criterion}`);
    }
  }

  if (explanation.complexity !== 'simple') {
    lines.push('');
    lines.push(`Complexity: ${explanation.complexity}`);
  }

  return lines.join('\n');
}
