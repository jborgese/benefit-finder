/**
 * Rule Evaluation Service
 *
 * Evaluates JSON Logic rules with comprehensive error handling,
 * performance monitoring, and custom operator support.
 */

import jsonLogic from 'json-logic-js';
import type {
  JsonLogicRule,
  JsonLogicData,
  RuleEvaluationResult,
  RuleEvaluationOptions,
  RuleEvaluationError,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default evaluation options
 */
export const DEFAULT_EVALUATION_OPTIONS: Required<RuleEvaluationOptions> = {
  timeout: 5000, // 5 seconds
  measureTime: true,
  captureContext: false,
  customOperators: {},
  strict: false,
  maxDepth: 100,
};

/**
 * Error codes
 */
export const EVALUATION_ERROR_CODES = {
  TIMEOUT: 'EVAL_TIMEOUT',
  INVALID_RULE: 'EVAL_INVALID_RULE',
  INVALID_DATA: 'EVAL_INVALID_DATA',
  MAX_DEPTH_EXCEEDED: 'EVAL_MAX_DEPTH',
  OPERATOR_ERROR: 'EVAL_OPERATOR_ERROR',
  UNKNOWN_ERROR: 'EVAL_UNKNOWN',
} as const;

// ============================================================================
// CUSTOM OPERATORS
// ============================================================================

/**
 * Register custom operators with json-logic-js
 */
function registerCustomOperators(
  operators: Record<string, (...args: unknown[]) => unknown>
): void {
  for (const [name, fn] of Object.entries(operators)) {
    jsonLogic.add_operation(name, fn);
  }
}

/**
 * Remove custom operators
 */
function unregisterCustomOperators(operatorNames: string[]): void {
  for (const name of operatorNames) {
    jsonLogic.rm_operation(name);
  }
}

// ============================================================================
// EVALUATION FUNCTIONS
// ============================================================================

/**
 * Evaluate a JSON Logic rule
 *
 * @param rule JSON Logic rule to evaluate
 * @param data Data context for evaluation
 * @param options Evaluation options
 * @returns Evaluation result
 *
 * @example
 * ```typescript
 * const rule = { '>': [{ var: 'age' }, 18] };
 * const data = { age: 25 };
 * const result = await evaluateRule(rule, data);
 *
 * if (result.success) {
 *   console.log('Result:', result.result); // true
 * }
 * ```
 */
export async function evaluateRule<T = boolean>(
  rule: JsonLogicRule,
  data: JsonLogicData,
  options: Partial<RuleEvaluationOptions> = {}
): Promise<RuleEvaluationResult<T>> {
  const opts = { ...DEFAULT_EVALUATION_OPTIONS, ...options };

  const startTime = opts.measureTime ? performance.now() : 0;
  const registeredOperators: string[] = [];

  try {
    // Validate inputs
    if (!rule) {
      throw createEvaluationError(
        'Rule cannot be null or undefined',
        EVALUATION_ERROR_CODES.INVALID_RULE,
        rule,
        data
      );
    }

    if (!data || typeof data !== 'object') {
      throw createEvaluationError(
        'Data must be an object',
        EVALUATION_ERROR_CODES.INVALID_DATA,
        rule,
        data
      );
    }

    // Register custom operators
    if (Object.keys(opts.customOperators).length > 0) {
      registerCustomOperators(opts.customOperators);
      registeredOperators.push(...Object.keys(opts.customOperators));
    }

    // Check depth
    const depth = calculateRuleDepth(rule);
    if (depth > opts.maxDepth) {
      throw createEvaluationError(
        `Rule depth (${depth}) exceeds maximum (${opts.maxDepth})`,
        EVALUATION_ERROR_CODES.MAX_DEPTH_EXCEEDED,
        rule,
        data
      );
    }

    // Evaluate with timeout
    const result = await evaluateWithTimeout<T>(
      rule,
      data,
      opts.timeout
    );

    const endTime = opts.measureTime ? performance.now() : 0;
    const executionTime = opts.measureTime ? endTime - startTime : undefined;

    return {
      result,
      success: true,
      executionTime,
      context: opts.captureContext ? { ...data } : undefined,
    };

  } catch (error) {
    const endTime = opts.measureTime ? performance.now() : 0;
    const executionTime = opts.measureTime ? endTime - startTime : undefined;

    const errorDetails = error instanceof Error
      ? createEvaluationErrorFromException(error, rule, data)
      : createEvaluationError(
          'Unknown error occurred',
          EVALUATION_ERROR_CODES.UNKNOWN_ERROR,
          rule,
          data
        );

    if (opts.strict) {
      throw errorDetails;
    }

    return {
      result: false as T,
      success: false,
      error: errorDetails.message,
      errorDetails,
      executionTime,
      context: opts.captureContext ? { ...data } : undefined,
    };

  } finally {
    // Clean up custom operators
    if (registeredOperators.length > 0) {
      unregisterCustomOperators(registeredOperators);
    }
  }
}

/**
 * Evaluate a rule with timeout
 */
async function evaluateWithTimeout<T>(
  rule: JsonLogicRule,
  data: JsonLogicData,
  timeout: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        createEvaluationError(
          `Evaluation timed out after ${timeout}ms`,
          EVALUATION_ERROR_CODES.TIMEOUT,
          rule,
          data
        )
      );
    }, timeout);

    try {
      const result = jsonLogic.apply(rule as any, data) as T;
      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

/**
 * Evaluate a rule synchronously (use with caution)
 *
 * @param rule JSON Logic rule
 * @param data Data context
 * @returns Evaluation result
 */
export function evaluateRuleSync<T = boolean>(
  rule: JsonLogicRule,
  data: JsonLogicData
): RuleEvaluationResult<T> {
  try {
    const startTime = performance.now();
    const result = jsonLogic.apply(rule as any, data) as T;
    const endTime = performance.now();

    return {
      result,
      success: true,
      executionTime: endTime - startTime,
    };
  } catch (error) {
    const errorDetails = error instanceof Error
      ? createEvaluationErrorFromException(error, rule, data)
      : createEvaluationError(
          'Unknown error occurred',
          EVALUATION_ERROR_CODES.UNKNOWN_ERROR,
          rule,
          data
        );

    return {
      result: false as T,
      success: false,
      error: errorDetails.message,
      errorDetails,
    };
  }
}

/**
 * Batch evaluate multiple rules
 *
 * @param rules Array of rules to evaluate
 * @param data Data context
 * @param options Evaluation options
 * @returns Array of evaluation results
 *
 * @example
 * ```typescript
 * const rules = [
 *   { '>': [{ var: 'age' }, 18] },
 *   { '<': [{ var: 'income' }, 50000] },
 * ];
 * const data = { age: 25, income: 35000 };
 * const results = await batchEvaluateRules(rules, data);
 * ```
 */
export async function batchEvaluateRules<T = boolean>(
  rules: JsonLogicRule[],
  data: JsonLogicData,
  options: Partial<RuleEvaluationOptions> = {}
): Promise<RuleEvaluationResult<T>[]> {
  return Promise.all(
    rules.map((rule) => evaluateRule<T>(rule, data, options))
  );
}

/**
 * Evaluate multiple rules with different data contexts
 *
 * @param ruleDataPairs Array of [rule, data] tuples
 * @param options Evaluation options
 * @returns Array of evaluation results
 */
export async function evaluateMultiple<T = boolean>(
  ruleDataPairs: Array<[JsonLogicRule, JsonLogicData]>,
  options: Partial<RuleEvaluationOptions> = {}
): Promise<RuleEvaluationResult<T>[]> {
  return Promise.all(
    ruleDataPairs.map(([rule, data]) => evaluateRule<T>(rule, data, options))
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate the depth of a rule
 */
function calculateRuleDepth(rule: JsonLogicRule, currentDepth = 0): number {
  if (rule === null || typeof rule !== 'object') {
    return currentDepth;
  }

  if (Array.isArray(rule)) {
    return Math.max(
      currentDepth,
      ...rule.map((item) => calculateRuleDepth(item, currentDepth + 1))
    );
  }

  const depths = Object.values(rule).map((value) =>
    calculateRuleDepth(value as JsonLogicRule, currentDepth + 1)
  );

  return Math.max(currentDepth, ...depths);
}

/**
 * Create an evaluation error
 */
function createEvaluationError(
  message: string,
  code: string,
  rule?: JsonLogicRule,
  data?: JsonLogicData
): RuleEvaluationError {
  return {
    message,
    code,
    rule,
    data,
    stack: new Error().stack,
  };
}

/**
 * Create evaluation error from exception
 */
function createEvaluationErrorFromException(
  error: Error,
  rule?: JsonLogicRule,
  data?: JsonLogicData
): RuleEvaluationError {
  return {
    message: error.message,
    code: EVALUATION_ERROR_CODES.OPERATOR_ERROR,
    rule,
    data,
    stack: error.stack,
  };
}

// ============================================================================
// PREDEFINED CUSTOM OPERATORS
// ============================================================================

/**
 * Common custom operators for benefit eligibility
 */
export const BENEFIT_OPERATORS = {
  /**
   * Check if value is between min and max (inclusive)
   */
  between: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  /**
   * Check if value is within percentage of target
   */
  within_percent: (value: number, target: number, percent: number): boolean => {
    const diff = Math.abs(value - target);
    const threshold = target * (percent / 100);
    return diff <= threshold;
  },

  /**
   * Calculate age from date of birth
   */
  age_from_dob: (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  },

  /**
   * Check if date is in the past
   */
  date_in_past: (dateString: string): boolean => {
    const date = new Date(dateString);
    return date < new Date();
  },

  /**
   * Check if date is in the future
   */
  date_in_future: (dateString: string): boolean => {
    const date = new Date(dateString);
    return date > new Date();
  },

  /**
   * Check if value matches any in array (case-insensitive)
   */
  matches_any: (value: string, array: string[]): boolean => {
    const lowerValue = value.toLowerCase();
    return array.some((item) => item.toLowerCase() === lowerValue);
  },

  /**
   * Count truthy values in array
   */
  count_true: (array: unknown[]): number => {
    return array.filter(Boolean).length;
  },

  /**
   * Check if all values in array are truthy
   */
  all_true: (array: unknown[]): boolean => {
    return array.every(Boolean);
  },

  /**
   * Check if any value in array is truthy
   */
  any_true: (array: unknown[]): boolean => {
    return array.some(Boolean);
  },
};

/**
 * Register benefit-specific custom operators
 */
export function registerBenefitOperators(): void {
  registerCustomOperators(BENEFIT_OPERATORS as Record<string, (...args: unknown[]) => unknown>);
}

/**
 * Unregister benefit-specific custom operators
 */
export function unregisterBenefitOperators(): void {
  unregisterCustomOperators(Object.keys(BENEFIT_OPERATORS));
}

