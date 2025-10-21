/**
 * Detailed Rule Evaluator
 *
 * Extends the standard rule evaluator to capture detailed comparison values
 * and thresholds during rule evaluation for user-friendly explanations.
 */

import jsonLogic from 'json-logic-js';
import { getSNAPGrossIncomeLimit } from '../../utils/benefitThresholds';
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
export function evaluateRuleWithDetails(
  rule: JsonLogicRule,
  data: JsonLogicData
): DetailedEvaluationResult {
  const startTime = performance.now();
  const context: EvaluationContext = {
    data,
    comparisons: [],
    depth: 0
  };

  try {
    // Add debugging to see what we're actually getting
    if (import.meta.env.DEV) {
      console.log('🔍 [DEBUG] DetailedEvaluator - Rule:', JSON.stringify(rule, null, 2));
      console.log('🔍 [DEBUG] DetailedEvaluator - Data:', JSON.stringify(data, null, 2));
    }

    // Intercept and analyze the rule structure before evaluation
    analyzeRule(rule, context);

    // Perform standard evaluation
    const result = jsonLogic.apply(rule as JsonLogicRule, data) as boolean;
    const endTime = performance.now();

    if (import.meta.env.DEV) {
      console.log('🔍 [DEBUG] DetailedEvaluator - Result:', result);
      console.log('🔍 [DEBUG] DetailedEvaluator - Comparisons found:', context.comparisons);
    }

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

  const newContext = { ...context, depth: context.depth + 1 };

  for (const [operator, operands] of Object.entries(rule)) {
    if (import.meta.env.DEV) {
      console.log('🔍 [DEBUG] Analyzing operator:', operator, 'operands:', operands);
    }

    if (Array.isArray(operands)) {
      analyzeComparison(operator, operands, newContext);

      // Recursively analyze nested rules
      for (const operand of operands) {
        if (typeof operand === 'object' && operand !== null) {
          analyzeRule(operand as JsonLogicRule, newContext);
        }
      }
    }
  }
}

/**
 * Analyze comparison operations to extract detailed information
 */
function analyzeComparison(operator: string, operands: unknown[], context: EvaluationContext): void {
  if (import.meta.env.DEV) {
    console.log('🔍 [DEBUG] Analyzing comparison:', operator, operands);
  }

  if (isStandardComparison(operator)) {
    handleStandardComparison(operator, operands, context);
  } else if (isSNAPOperator(operator)) {
    handleSNAPComparison(operands, context);
  }
}

/**
 * Check if operator is a standard comparison operator
 */
function isStandardComparison(operator: string): boolean {
  return ['<', '>', '<=', '>=', '==', '!=', 'in'].includes(operator);
}

/**
 * Check if operator is SNAP-specific
 */
function isSNAPOperator(operator: string): boolean {
  return operator === 'snap_income_eligible';
}

/**
 * Handle standard comparison operators
 */
function handleStandardComparison(operator: string, operands: unknown[], context: EvaluationContext): void {
  if (operands.length < 2) return;

  const leftOperand = operands[0];
  const rightOperand = operands[1];

  if (import.meta.env.DEV) {
    console.log('🔍 [DEBUG] Left operand:', leftOperand);
    console.log('🔍 [DEBUG] Right operand:', rightOperand);
  }

  const comparisonData = extractComparisonData(leftOperand, rightOperand, context);
  if (comparisonData) {
    addComparisonResult(operator, comparisonData, context);
  }
}

/**
 * Extract comparison data from operands
 */
function extractComparisonData(leftOperand: unknown, rightOperand: unknown, context: EvaluationContext): { criterion: string; actualValue: unknown; threshold: unknown } | null {
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

  if (import.meta.env.DEV) {
    console.log('🔍 [DEBUG] Extracted - criterion:', criterion, 'actualValue:', actualValue, 'threshold:', threshold);
  }

  if (criterion && actualValue !== undefined && threshold !== undefined) {
    return { criterion, actualValue, threshold };
  }

  return null;
}

/**
 * Add comparison result to context
 */
function addComparisonResult(operator: string, comparisonData: { criterion: string; actualValue: unknown; threshold: unknown }, context: EvaluationContext): void {
  const { criterion, actualValue, threshold } = comparisonData;
  const comparisonResult = evaluateComparison(operator, actualValue, threshold);
  const comparison = formatComparison(operator, actualValue, threshold, comparisonResult);

  if (import.meta.env.DEV) {
    console.log('🔍 [DEBUG] Adding comparison result:', {
      criterion,
      met: comparisonResult,
      value: actualValue,
      threshold,
      comparison,
      operator
    });
  }

  context.comparisons.push({
    criterion,
    met: comparisonResult,
    value: actualValue,
    threshold,
    comparison,
    operator
  });
}

/**
 * Handle SNAP income eligibility comparison
 */
function handleSNAPComparison(operands: unknown[], context: EvaluationContext): void {
  if (operands.length < 2) return;

  if (import.meta.env.DEV) {
    console.log('🔍 [DEBUG] SNAP operator detected! Processing snap_income_eligible...');
  }

  const incomeOperand = operands[0];
  const sizeOperand = operands[1];
  const income = evaluateOperand(incomeOperand, context.data);
  const householdSize = evaluateOperand(sizeOperand, context.data);

  if (import.meta.env.DEV) {
    console.log('🔍 [DEBUG] SNAP operands evaluated:', { income, householdSize });
  }

  if (typeof income === 'number' && typeof householdSize === 'number') {
    processSNAPCalculation(income, householdSize, context);
  } else if (import.meta.env.DEV) {
    console.log('🔍 [DEBUG] SNAP operands not numbers:', { income: typeof income, householdSize: typeof householdSize });
  }
}

/**
 * Process SNAP income calculation and add results
 */
function processSNAPCalculation(income: number, householdSize: number, context: EvaluationContext): void {
  const incomeLimit = getSNAPGrossIncomeLimit(householdSize);
  const isEligible = income <= incomeLimit;

  if (import.meta.env.DEV) {
    console.log('🔍 [DEBUG] SNAP calculation:', { income, householdSize, incomeLimit, isEligible });
  }

  const incomeComparison = `${formatCurrency(income)} ${isEligible ? 'is within' : 'exceeds'} the limit of ${formatCurrency(incomeLimit)}`;
  const sizeComparison = `${householdSize} ${householdSize === 1 ? 'person' : 'people'} (determines income limit)`;

  if (import.meta.env.DEV) {
    console.log('🔍 [DEBUG] SNAP adding comparisons:', { incomeComparison, sizeComparison });
  }

  context.comparisons.push({
    criterion: 'householdIncome',
    met: isEligible,
    value: income,
    threshold: incomeLimit,
    comparison: incomeComparison,
    operator: 'snap_income_eligible'
  });

  context.comparisons.push({
    criterion: 'householdSize',
    met: true, // Size itself doesn't fail, it affects the calculation
    value: householdSize,
    threshold: householdSize,
    comparison: sizeComparison,
    operator: 'household_size'
  });

  if (import.meta.env.DEV) {
    console.log('🔍 [DEBUG] SNAP comparisons added. Total comparisons now:', context.comparisons.length);
    console.log('🔍 [DEBUG] SNAP - All comparisons in context:', context.comparisons.map((c, i) => ({
      index: i,
      criterion: c.criterion,
      met: c.met,
      value: c.value,
      threshold: c.threshold,
      comparison: c.comparison,
      operator: c.operator
    })));
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
    const reasons = failedCriteria.map(c => c.comparison ?? `${c.criterion} requirement not met`);
    return `Eligibility requirements not met: ${reasons.join(', ')}`;
  } else {
    return 'Eligibility requirements not met due to program rules';
  }
}
