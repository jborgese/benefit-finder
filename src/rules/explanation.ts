/**
 * Rule Explanation System
 *
 * Generates human-readable explanations of rule evaluation results.
 * Provides transparency into eligibility decisions.
 */

import { validateRule } from './validator';
import type {
  JsonLogicRule,
  JsonLogicData,
  RuleExplanation,
  RuleExplanationNode,
} from './types';
import type { EligibilityEvaluationResult } from './eligibility';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Detailed explanation of evaluation result
 */
export interface ResultExplanation {
  /** Overall summary */
  summary: string;
  /** Why the result is what it is */
  reasoning: string[];
  /** What criteria were checked */
  criteriaChecked: string[];
  /** What criteria passed */
  criteriaPassed: string[];
  /** What criteria failed */
  criteriaFailed: string[];
  /** Missing information */
  missingInformation: string[];
  /** What would change the result */
  whatWouldChange?: string[];
  /** Plain language explanation */
  plainLanguage: string;
}

/**
 * Explanation options
 */
export interface ExplanationOptions {
  /** Include technical details */
  includeTechnical?: boolean;
  /** Language level (simple/standard/technical) */
  languageLevel?: 'simple' | 'standard' | 'technical';
  /** Include suggestions for changing result */
  includeSuggestions?: boolean;
  /** Maximum length of explanation */
  maxLength?: number;
}

// ============================================================================
// OPERATOR DESCRIPTIONS
// ============================================================================

/**
 * Human-readable operator descriptions
 */
const OPERATOR_DESCRIPTIONS: Record<string, (operands: unknown[]) => string> = {
  '>': ([left, right]) => `${formatValue(left)} is greater than ${formatValue(right)}`,
  '>=': ([left, right]) => `${formatValue(left)} is greater than or equal to ${formatValue(right)}`,
  '<': ([left, right]) => `${formatValue(left)} is less than ${formatValue(right)}`,
  '<=': ([left, right]) => `${formatValue(left)} is less than or equal to ${formatValue(right)}`,
  '==': ([left, right]) => `${formatValue(left)} equals ${formatValue(right)}`,
  '===': ([left, right]) => `${formatValue(left)} strictly equals ${formatValue(right)}`,
  '!=': ([left, right]) => `${formatValue(left)} does not equal ${formatValue(right)}`,
  '!==': ([left, right]) => `${formatValue(left)} does not strictly equal ${formatValue(right)}`,
  'and': (operands) => `All of the following are true: ${operands.length} conditions`,
  'or': (operands) => `At least one of the following is true: ${operands.length} conditions`,
  '!': ([operand]) => `NOT ${formatValue(operand)}`,
  'if': ([cond, then, otherwise]) => `If ${formatValue(cond)}, then ${formatValue(then)}, otherwise ${formatValue(otherwise)}`,
  'in': ([needle, haystack]) => `${formatValue(needle)} is in ${formatValue(haystack)}`,
  'var': ([varName]) => `the value of ${varName}`,
  '+': (operands) => `sum of ${operands.length} values`,
  '-': ([left, right]) => right ? `${formatValue(left)} minus ${formatValue(right)}` : `negative ${formatValue(left)}`,
  '*': (operands) => `product of ${operands.length} values`,
  '/': ([left, right]) => `${formatValue(left)} divided by ${formatValue(right)}`,
  '%': ([left, right]) => `${formatValue(left)} modulo ${formatValue(right)}`,
  'between': ([value, min, max]) => `${formatValue(value)} is between ${formatValue(min)} and ${formatValue(max)}`,
  'age_from_dob': ([dob]) => `age calculated from date of birth ${formatValue(dob)}`,
  'matches_any': ([value, array]) => `${formatValue(value)} matches one of the allowed values`,
};

// ============================================================================
// EXPLANATION GENERATION
// ============================================================================

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
  data: JsonLogicData,
  options: ExplanationOptions = {}
): ResultExplanation {
  const opts = {
    includeTechnical: options.includeTechnical || false,
    languageLevel: options.languageLevel || 'standard',
    includeSuggestions: options.includeSuggestions !== false,
    maxLength: options.maxLength || 1000,
  };

  const reasoning: string[] = [];
  const criteriaChecked: string[] = [];
  const criteriaPassed: string[] = [];
  const criteriaFailed: string[] = [];

  // Extract criteria from rule
  const ruleExplanation = explainRule(rule, opts.languageLevel);
  criteriaChecked.push(...ruleExplanation.criteriaChecked);

  // Analyze result
  if (result.eligible) {
    reasoning.push('You meet all the eligibility requirements for this program.');
    criteriaPassed.push(...criteriaChecked);
  } else if (result.incomplete) {
    reasoning.push('We need more information to determine your eligibility.');

    if (result.missingFields) {
      for (const field of result.missingFields) {
        const fieldName = formatFieldName(field);
        reasoning.push(`Missing: ${fieldName}`);
        criteriaFailed.push(`${fieldName} information not provided`);
      }
    }
  } else {
    reasoning.push('Based on the information provided, you do not currently meet the eligibility requirements.');

    // Analyze criteria
    if (result.criteriaResults) {
      for (const criterion of result.criteriaResults) {
        const desc = criterion.description || formatFieldName(criterion.criterion);

        if (criterion.met) {
          criteriaPassed.push(desc);
        } else {
          criteriaFailed.push(desc);
          reasoning.push(`• ${desc}`);
        }
      }
    }
  }

  // Generate "what would change" suggestions
  const whatWouldChange: string[] = [];

  if (opts.includeSuggestions && !result.eligible) {
    if (result.missingFields && result.missingFields.length > 0) {
      whatWouldChange.push('Provide the missing information to get a complete evaluation');
    }

    if (result.criteriaResults) {
      for (const criterion of result.criteriaResults) {
        if (!criterion.met && criterion.threshold !== undefined) {
          const fieldName = formatFieldName(criterion.criterion);
          whatWouldChange.push(
            `${fieldName}: Change from ${formatValue(criterion.value)} to meet threshold of ${formatValue(criterion.threshold)}`
          );
        }
      }
    }
  }

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
    missingInformation: result.missingFields || [],
    whatWouldChange: whatWouldChange.length > 0 ? whatWouldChange : undefined,
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
  const criteriaChecked = validation.variables?.map(formatFieldName) || [];

  const complexity = validation.complexity || 0;
  let complexityLevel: 'simple' | 'moderate' | 'complex' | 'very-complex' = 'simple';

  if (complexity > 80) complexityLevel = 'very-complex';
  else if (complexity > 50) complexityLevel = 'complex';
  else if (complexity > 20) complexityLevel = 'moderate';

  return {
    description,
    breakdown,
    variables: validation.variables || [],
    operators: validation.operators || [],
    complexity: complexityLevel,
    criteriaChecked,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate explanation tree for a rule
 */
function generateExplanationTree(
  rule: JsonLogicRule,
  level: number
): RuleExplanationNode[] {
  const nodes: RuleExplanationNode[] = [];

  if (rule === null || typeof rule !== 'object') {
    nodes.push({
      type: 'constant',
      value: rule,
      description: `Constant value: ${formatValue(rule)}`,
      level,
    });
    return nodes;
  }

  if (Array.isArray(rule)) {
    nodes.push({
      type: 'expression',
      description: `Array of ${rule.length} items`,
      level,
      children: rule.flatMap((item) => generateExplanationTree(item, level + 1)),
    });
    return nodes;
  }

  for (const operator of Object.keys(rule)) {
    const operands = Array.isArray(rule[operator]) ? rule[operator] : [rule[operator]];
    const description = OPERATOR_DESCRIPTIONS[operator]
      ? OPERATOR_DESCRIPTIONS[operator](operands as unknown[])
      : `Operation: ${operator}`;

    if (operator === 'var') {
      nodes.push({
        type: 'variable',
        operator,
        variable: rule[operator] as string,
        description: `Get ${formatFieldName(rule[operator] as string)}`,
        level,
      });
    } else {
      const children = (operands as JsonLogicRule[]).flatMap((operand) =>
        generateExplanationTree(operand, level + 1)
      );

      nodes.push({
        type: 'operator',
        operator,
        description,
        level,
        children: children.length > 0 ? children : undefined,
      });
    }
  }

  return nodes;
}

/**
 * Generate plain language rule description
 */
function generateRuleDescription(
  rule: JsonLogicRule,
  languageLevel: 'simple' | 'standard' | 'technical'
): string {
  if (rule === null || typeof rule !== 'object') {
    return `The value must be ${formatValue(rule)}`;
  }

  if (Array.isArray(rule)) {
    return 'Multiple conditions must be met';
  }

  const operator = Object.keys(rule)[0];
  const operands = Array.isArray(rule[operator]) ? rule[operator] : [rule[operator]];

  switch (languageLevel) {
    case 'simple':
      return generateSimpleDescription(operator, operands as JsonLogicRule[]);
    case 'technical':
      return `Rule: ${JSON.stringify(rule)}`;
    case 'standard':
    default:
      return OPERATOR_DESCRIPTIONS[operator]
        ? OPERATOR_DESCRIPTIONS[operator](operands as unknown[])
        : `Must meet ${operator} condition`;
  }
}

/**
 * Generate simple language description
 */
function generateSimpleDescription(operator: string, operands: JsonLogicRule[]): string {
  const simpleDescriptions: Record<string, string> = {
    '>': 'Your value must be higher',
    '<': 'Your value must be lower',
    '>=': 'Your value must be at least the required amount',
    '<=': 'Your value must be no more than the required amount',
    '==': 'Your value must match exactly',
    'and': 'You must meet all of these requirements',
    'or': 'You must meet at least one of these requirements',
    'in': 'Your value must be one of the allowed options',
    'between': 'Your value must be in the acceptable range',
  };

  return simpleDescriptions[operator] || 'You must meet this requirement';
}

/**
 * Generate plain language explanation of result
 */
function generatePlainLanguageExplanation(
  result: EligibilityEvaluationResult,
  reasoning: string[],
  languageLevel: 'simple' | 'standard' | 'technical'
): string {
  const parts: string[] = [];

  // Main status
  if (result.eligible) {
    parts.push(
      languageLevel === 'simple'
        ? 'Good news! You qualify for this program.'
        : 'Based on the information you provided, you appear to be eligible for this benefit program.'
    );
  } else if (result.incomplete) {
    parts.push(
      languageLevel === 'simple'
        ? 'We need more information to check if you qualify.'
        : 'We need additional information to complete your eligibility evaluation.'
    );
  } else {
    parts.push(
      languageLevel === 'simple'
        ? 'Unfortunately, you do not qualify for this program right now.'
        : 'Based on the information provided, you do not currently meet the eligibility requirements for this program.'
    );
  }

  // Add reasoning
  if (reasoning.length > 0 && languageLevel !== 'simple') {
    parts.push('');
    parts.push(...reasoning);
  }

  // Next steps
  if (result.eligible && result.nextSteps && result.nextSteps.length > 0) {
    parts.push('');
    parts.push(
      languageLevel === 'simple'
        ? 'Here\'s what to do next:'
        : 'Recommended next steps:'
    );

    for (const step of result.nextSteps) {
      parts.push(`• ${step.step}`);
    }
  }

  // Missing information
  if (result.incomplete && result.missingFields && result.missingFields.length > 0) {
    parts.push('');
    parts.push(
      languageLevel === 'simple'
        ? 'We need to know:'
        : 'Please provide the following information:'
    );

    for (const field of result.missingFields) {
      parts.push(`• ${formatFieldName(field)}`);
    }
  }

  return parts.join('\n');
}

// ============================================================================
// COMPARISON & ANALYSIS
// ============================================================================

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
    if (data1[key] !== data2[key]) {
      changedFields.push({
        field: formatFieldName(key),
        before: data1[key],
        after: data2[key],
      });

      differences.push(
        `${formatFieldName(key)} changed from ${formatValue(data1[key])} to ${formatValue(data2[key])}`
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
    const operands = Array.isArray(rule[operator]) ? rule[operator] : [rule[operator]];

    // Handle comparison operators
    if (operator === '>' || operator === '>=') {
      const [left, right] = operands as [JsonLogicRule, JsonLogicRule];
      if (typeof left === 'object' && 'var' in left && typeof right === 'number') {
        const varName = left.var as string;
        const currentValue = data[varName];
        suggestions.push(
          `Increase ${formatFieldName(varName)} from ${formatValue(currentValue)} to at least ${formatValue(right)}`
        );
      }
    }

    if (operator === '<' || operator === '<=') {
      const [left, right] = operands as [JsonLogicRule, JsonLogicRule];
      if (typeof left === 'object' && 'var' in left && typeof right === 'number') {
        const varName = left.var as string;
        const currentValue = data[varName];
        suggestions.push(
          `Reduce ${formatFieldName(varName)} from ${formatValue(currentValue)} to ${formatValue(right)} or below`
        );
      }
    }

    // Recursively check nested rules
    for (const operand of operands as JsonLogicRule[]) {
      suggestions.push(...analyzeRuleForSuggestions(operand, data));
    }
  }

  return suggestions;
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format field name to human-readable
 */
function formatFieldName(fieldName: string): string {
  // Convert camelCase or snake_case to Title Case
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

/**
 * Format value for display
 */
function formatValue(value: unknown): string {
  if (value === null) return 'empty';
  if (value === undefined) return 'not provided';
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  if (typeof value === 'number') {
    // Format as currency if it looks like money
    if (value > 100) {
      return `$${value.toLocaleString()}`;
    }
    return String(value);
  }
  if (typeof value === 'string') return `"${value}"`;
  if (Array.isArray(value)) return `[${value.length} items]`;
  if (typeof value === 'object' && 'var' in value) {
    return formatFieldName((value as any).var);
  }

  return JSON.stringify(value);
}

/**
 * Generate explanation from rule breakdown
 */
export function formatRuleExplanation(explanation: RuleExplanation): string {
  const lines: string[] = [];

  lines.push(explanation.description);
  lines.push('');
  lines.push('This rule checks:');

  for (const criterion of explanation.criteriaChecked) {
    lines.push(`• ${criterion}`);
  }

  if (explanation.complexity !== 'simple') {
    lines.push('');
    lines.push(`Complexity: ${explanation.complexity}`);
  }

  return lines.join('\n');
}

