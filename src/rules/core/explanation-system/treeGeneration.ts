/**
 * Explanation Tree Generation
 */

import type { JsonLogicRule, RuleExplanationNode } from '../types';
import { OPERATOR_DESCRIPTIONS } from './operators';
import { formatValue, formatFieldName } from './formatting';

/**
 * Generate explanation tree for a rule
 */
export function generateExplanationTree(
  rule: JsonLogicRule,
  level: number
): RuleExplanationNode[] {
  // Handle primitive values
  if (rule === null || typeof rule !== 'object') {
    return generateConstantNode(rule, level);
  }

  // Handle arrays
  if (Array.isArray(rule)) {
    return generateArrayNode(rule, level);
  }

  // Handle object rules (operators and variables)
  return generateOperatorNodes(rule, level);
}

/**
 * Generate constant value node
 */
function generateConstantNode(rule: JsonLogicRule, level: number): RuleExplanationNode[] {
  // Type assertion: this function is only called when rule is a primitive
  const primitiveValue = rule as string | number | boolean | null;

  return [{
    type: 'constant',
    value: primitiveValue,
    description: `Constant value: ${formatValue(rule)}`,
    level,
  }];
}

/**
 * Generate array node
 */
function generateArrayNode(rule: JsonLogicRule[], level: number): RuleExplanationNode[] {
  return [{
    type: 'expression',
    description: `Array of ${rule.length} items`,
    level,
    children: rule.flatMap((item) => generateExplanationTree(item, level + 1)),
  }];
}

/**
 * Generate operator nodes
 */
function generateOperatorNodes(rule: JsonLogicRule, level: number): RuleExplanationNode[] {
  const nodes: RuleExplanationNode[] = [];

  // Handle null or non-object rules
  if (rule === null || typeof rule !== 'object') {
    return nodes;
  }

  for (const operator of Object.keys(rule)) {
    const ruleAsRecord = rule as Record<string, unknown>;
    if (!Object.prototype.hasOwnProperty.call(ruleAsRecord, operator)) {continue;}

    const operandValue = ruleAsRecord[operator];
    if (operandValue === undefined) {continue;}

    const operands = Array.isArray(operandValue) ? operandValue : [operandValue];
    const descriptionFn = Object.prototype.hasOwnProperty.call(OPERATOR_DESCRIPTIONS, operator)
      ? OPERATOR_DESCRIPTIONS[operator]
      : undefined;
    const description = descriptionFn
      ? descriptionFn(operands as unknown[])
      : `Operation: ${operator}`;

    if (operator === 'var') {
      nodes.push(generateVariableNode(operandValue as string, operator, level));
    } else {
      nodes.push(generateOperatorNode(operator, description, operands as JsonLogicRule[], level));
    }
  }

  return nodes;
}

/**
 * Generate variable node
 */
function generateVariableNode(varName: string, operator: string, level: number): RuleExplanationNode {
  return {
    type: 'variable',
    operator,
    variable: varName,
    description: `Get ${formatFieldName(varName)}`,
    level,
  };
}

/**
 * Generate operator node with children
 */
function generateOperatorNode(
  operator: string,
  description: string,
  operands: JsonLogicRule[],
  level: number
): RuleExplanationNode {
  const children = operands.flatMap((operand) => generateExplanationTree(operand, level + 1));

  return {
    type: 'operator',
    operator,
    description,
    level,
    children: children.length > 0 ? children : undefined,
  };
}
