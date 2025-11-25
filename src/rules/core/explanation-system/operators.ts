/**
 * Operator Descriptions
 */

import { formatValue } from './formatting';

/**
 * Human-readable operator descriptions
 */
export const OPERATOR_DESCRIPTIONS: Record<string, (operands: unknown[]) => string> = {
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
  'matches_any': ([value, _array]) => `${formatValue(value)} matches one of the allowed values`,
};
