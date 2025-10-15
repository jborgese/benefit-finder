/**
 * Detailed Rule Evaluator
 *
 * Extends the standard rule evaluator to capture detailed comparison values
 * and thresholds during rule evaluation for user-friendly explanations.
 */

import jsonLogic from 'json-logic-js';
import type { JsonLogicRule, JsonLogicData, RuleEvaluationResult } from './types';

/**
 * Detailed criterion result with actual values
 */
export interface DetailedCriterionResult {
  criterion: string;
  met: boolean;
  value?: unknown;
  threshold?: unknown;
  comparison?: string;
  message?: string;
  operator?: string;
}

/**
 * Enhanced evaluation result with detailed breakdowns
 */
export interface DetailedEvaluationResult extends RuleEvaluationResult {
  criteriaResults?: DetailedCriterionResult[];
  explanation?: string;
}

/**
 * Evaluation context for tracking comparisons
 */
interface EvaluationContext {
  data: JsonLogicData;
  comparisons: DetailedCriterionResult[];
  depth: number;
}

/**
 * Evaluate a rule with detailed comparison tracking
 */
export async function evaluateRuleWithDetails(
  rule: JsonLogicRule,
  data: JsonLogicData
): Promise<DetailedEvaluationResult> {
  const startTime = performance.now();
  const context: EvaluationContext = {
    data,
    comparisons: [],
    depth: 0
  };

  try {
    // Intercept and analyze the rule structure before evaluation
    analyzeRule(rule, context);

    // Perform standard evaluation
    const result = jsonLogic.apply(rule as any, data) as boolean;
    const endTime = performance.now();

    return {
      result,
      success: true,
      executionTime: endTime - startTime,
      criteriaResults: context.comparisons,
      explanation: generateExplanation(context.comparisons, result)
    };

  } catch (error) {
    const endTime = performance.now();
    return {
      result: false,
      success: false,
      executionTime: endTime - startTime,
      error: error instanceof Error ? error.message : String(error),
      criteriaResults: context.comparisons
    };
  }
}

/**
 * Recursively analyze rule structure to extract comparison details
 */
function analyzeRule(rule: JsonLogicRule, context: EvaluationContext): void {
  if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
    return;
  }

  context.depth++;

  for (const [operator, operands] of Object.entries(rule)) {
    if (Array.isArray(operands)) {
      analyzeComparison(operator, operands, context);

      // Recursively analyze nested rules
      for (const operand of operands) {
        if (typeof operand === 'object' && operand !== null) {
          analyzeRule(operand as JsonLogicRule, context);
        }
      }
    }
  }

  context.depth--;
}

/**
 * Analyze comparison operations to extract detailed information
 */
function analyzeComparison(operator: string, operands: unknown[], context: EvaluationContext): void {
  // Handle comparison operators
  if (['<', '>', '<=', '>=', '==', '!=', 'in'].includes(operator) && operands.length >= 2) {
    const leftOperand = operands[0];
    const rightOperand = operands[1];

    // Extract variable name and value
    let criterion = '';
    let actualValue: unknown;
    let threshold: unknown;

    if (isVariableReference(leftOperand)) {
      criterion = (leftOperand as { var: string }).var;
      actualValue = getVariableValue(criterion, context.data);
      threshold = evaluateOperand(rightOperand, context.data);
    } else if (isVariableReference(rightOperand)) {
      criterion = (rightOperand as { var: string }).var;
      actualValue = getVariableValue(criterion, context.data);
      threshold = evaluateOperand(leftOperand, context.data);
    }

    if (criterion && actualValue !== undefined && threshold !== undefined) {
      // Evaluate the comparison to determine if it passed
      const comparisonResult = evaluateComparison(operator, actualValue, threshold);

      // Generate human-readable comparison
      const comparison = formatComparison(operator, actualValue, threshold, comparisonResult);

      context.comparisons.push({
        criterion,
        met: comparisonResult,
        value: actualValue,
        threshold,
        comparison,
        operator
      });
    }
  }

  // Handle special SNAP income eligibility operator
  if (operator === 'snap_income_eligible' && operands.length >= 2) {
    const incomeOperand = operands[0];
    const sizeOperand = operands[1];

    const income = evaluateOperand(incomeOperand, context.data);
    const householdSize = evaluateOperand(sizeOperand, context.data);

    if (typeof income === 'number' && typeof householdSize === 'number') {
      // SNAP income limit calculation: 130% of FPL
      const incomeLimit = householdSize * 1923; // 2024 FPL at 130%
      const isEligible = income <= incomeLimit;

      context.comparisons.push({
        criterion: 'householdIncome',
        met: isEligible,
        value: income,
        threshold: incomeLimit,
        comparison: formatCurrency(income) + (isEligible ? ' is within' : ' exceeds') + ' the limit of ' + formatCurrency(incomeLimit),
        operator: 'snap_income_eligible'
      });

      context.comparisons.push({
        criterion: 'householdSize',
        met: true, // Size itself doesn't fail, it affects the calculation
        value: householdSize,
        threshold: householdSize,
        comparison: `${householdSize} ${householdSize === 1 ? 'person' : 'people'} (determines income limit)`,
        operator: 'household_size'
      });
    }
  }
}

/**
 * Check if an operand is a variable reference
 */
function isVariableReference(operand: unknown): boolean {
  return typeof operand === 'object' && operand !== null && 'var' in operand;
}

/**
 * Get the value of a variable from data
 */
function getVariableValue(varName: string, data: JsonLogicData): unknown {
  return Object.prototype.hasOwnProperty.call(data, varName)
    ? data[varName as keyof JsonLogicData]
    : undefined;
}

/**
 * Evaluate an operand (could be a value, variable, or nested expression)
 */
function evaluateOperand(operand: unknown, data: JsonLogicData): unknown {
  if (isVariableReference(operand)) {
    const varName = (operand as { var: string }).var;
    return getVariableValue(varName, data);
  }

  if (typeof operand === 'object' && operand !== null) {
    // Nested JSON Logic expression
    return jsonLogic.apply(operand, data);
  }

  return operand;
}

/**
 * Evaluate a comparison operation
 */
function evaluateComparison(operator: string, left: unknown, right: unknown): boolean {
  switch (operator) {
    case '<': return Number(left) < Number(right);
    case '>': return Number(left) > Number(right);
    case '<=': return Number(left) <= Number(right);
    case '>=': return Number(left) >= Number(right);
    case '==': return left === right;
    case '!=': return left !== right;
    case 'in': return Array.isArray(right) && right.includes(left);
    default: return false;
  }
}

/**
 * Format a comparison into human-readable text
 */
function formatComparison(operator: string, actualValue: unknown, threshold: unknown, passed: boolean): string {
  const valueStr = typeof actualValue === 'number' ? formatCurrency(actualValue) : String(actualValue);
  const thresholdStr = typeof threshold === 'number' ? formatCurrency(threshold) : String(threshold);

  switch (operator) {
    case '<=':
      return passed
        ? `${valueStr} is within the limit of ${thresholdStr}`
        : `${valueStr} exceeds the limit of ${thresholdStr}`;
    case '<':
      return passed
        ? `${valueStr} is below the threshold of ${thresholdStr}`
        : `${valueStr} is not below the threshold of ${thresholdStr}`;
    case '>=':
      return passed
        ? `${valueStr} meets the minimum of ${thresholdStr}`
        : `${valueStr} is below the minimum of ${thresholdStr}`;
    case '>':
      return passed
        ? `${valueStr} exceeds the minimum of ${thresholdStr}`
        : `${valueStr} does not exceed the minimum of ${thresholdStr}`;
    case '==':
      return passed
        ? `${valueStr} matches the required value of ${thresholdStr}`
        : `${valueStr} does not match the required value of ${thresholdStr}`;
    case '!=':
      return passed
        ? `${valueStr} is different from ${thresholdStr} (as required)`
        : `${valueStr} incorrectly matches ${thresholdStr}`;
    default:
      return `${valueStr} compared to ${thresholdStr}`;
  }
}

/**
 * Format currency values
 */
function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Generate an overall explanation from detailed criteria
 */
function generateExplanation(criteria: DetailedCriterionResult[], overallResult: boolean): string {
  if (criteria.length === 0) {
    return overallResult ? 'Eligibility confirmed' : 'Eligibility requirements not met';
  }

  const failedCriteria = criteria.filter(c => !c.met);

  if (overallResult) {
    return 'All eligibility requirements have been met';
  } else if (failedCriteria.length > 0) {
    const reasons = failedCriteria.map(c => c.comparison || `${c.criterion} requirement not met`);
    return `Eligibility requirements not met: ${reasons.join(', ')}`;
  } else {
    return 'Eligibility requirements not met due to program rules';
  }
}
