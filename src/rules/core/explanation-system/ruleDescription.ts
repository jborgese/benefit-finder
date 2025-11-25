/**
 * Rule Description Generation
 */

import type { JsonLogicRule } from '../types';
import { OPERATOR_DESCRIPTIONS } from './operators';
import { formatValue } from './formatting';

/**
 * Generate plain language rule description
 */
export function generateRuleDescription(
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
  if (!operator) {
    return 'Empty rule';
  }

  const ruleAsRecord = rule as Record<string, unknown>;
  if (!Object.prototype.hasOwnProperty.call(ruleAsRecord, operator)) {
    return 'Invalid rule structure';
  }

  const operandValue = ruleAsRecord[operator];
  const operands = Array.isArray(operandValue) ? operandValue : [operandValue];

  switch (languageLevel) {
    case 'simple':
      return generateSimpleDescription(operator, operands as JsonLogicRule[]);
    case 'technical':
      return `Rule: ${JSON.stringify(rule)}`;
    case 'standard':
    default: {
      const descriptionFn = Object.prototype.hasOwnProperty.call(OPERATOR_DESCRIPTIONS, operator)
        ? OPERATOR_DESCRIPTIONS[operator]
        : undefined;
      return descriptionFn
        ? descriptionFn(operands as unknown[])
        : `Must meet ${operator} condition`;
    }
  }
}

/**
 * Generate simple language description
 */
function generateSimpleDescription(operator: string, _operands: JsonLogicRule[]): string {
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

  return Object.prototype.hasOwnProperty.call(simpleDescriptions, operator)
    ? simpleDescriptions[operator]
    : 'You must meet this requirement';
}
