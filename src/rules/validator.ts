/**
 * Rule Validation Utilities
 *
 * Validates JSON Logic rules for correctness, complexity,
 * and best practices.
 */

import { z } from 'zod';
import type {
  JsonLogicRule,
  RuleValidationResult,
  RuleValidationError,
  RuleValidationWarning,
  RuleValidationOptions,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Standard JSON Logic operators
 */
export const STANDARD_OPERATORS = [
  // Logic
  'if', 'and', 'or', '!', '!!',
  // Comparison
  '==', '===', '!=', '!==', '>', '>=', '<', '<=',
  // Arithmetic
  '+', '-', '*', '/', '%', 'min', 'max',
  // Array
  'map', 'filter', 'reduce', 'all', 'some', 'none', 'merge', 'in',
  // String
  'cat', 'substr',
  // Misc
  'var', 'missing', 'missing_some', 'log',
] as const;

/**
 * Validation error codes
 */
export const VALIDATION_ERROR_CODES = {
  INVALID_STRUCTURE: 'VAL_INVALID_STRUCTURE',
  UNKNOWN_OPERATOR: 'VAL_UNKNOWN_OPERATOR',
  DISALLOWED_OPERATOR: 'VAL_DISALLOWED_OPERATOR',
  MAX_DEPTH_EXCEEDED: 'VAL_MAX_DEPTH',
  MAX_COMPLEXITY_EXCEEDED: 'VAL_MAX_COMPLEXITY',
  INVALID_OPERANDS: 'VAL_INVALID_OPERANDS',
  CIRCULAR_REFERENCE: 'VAL_CIRCULAR_REFERENCE',
  MISSING_REQUIRED_VARIABLE: 'VAL_MISSING_VARIABLE',
} as const;

/**
 * Default validation options
 */
export const DEFAULT_VALIDATION_OPTIONS: Required<RuleValidationOptions> = {
  allowedOperators: [...STANDARD_OPERATORS],
  disallowedOperators: [],
  maxComplexity: 100,
  maxDepth: 20,
  requiredVariables: [],
  checkUnusedVariables: false,
  strict: false,
};

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

/**
 * Zod schema for JSON Logic rule validation
 * Using z.any() in array and explicit type assertion for recursive type.
 * Justification: Zod's z.lazy() doesn't properly type recursive schemas,
 * so we use explicit type assertion to maintain type safety at usage sites.
 */
export const JsonLogicRuleSchema: z.ZodType<JsonLogicRule> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(z.any()),
    z.record(z.unknown()),
  ])
) as z.ZodType<JsonLogicRule>;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate rule structure
 */
function validateRuleStructure(
  rule: unknown,
  errors: RuleValidationError[]
): JsonLogicRule | null {
  if (rule === undefined) {
    errors.push({
      message: 'Rule is undefined',
      code: VALIDATION_ERROR_CODES.INVALID_STRUCTURE,
      severity: 'critical',
    });
    return null;
  }

  const structureResult = JsonLogicRuleSchema.safeParse(rule);
  if (!structureResult.success) {
    errors.push({
      message: 'Invalid rule structure',
      code: VALIDATION_ERROR_CODES.INVALID_STRUCTURE,
      severity: 'critical',
    });
    return null;
  }

  return structureResult.data;
}

/**
 * Validate rule depth and complexity
 */
function validateRuleMetrics(
  rule: JsonLogicRule,
  opts: Required<RuleValidationOptions>,
  errors: RuleValidationError[],
  warnings: RuleValidationWarning[]
): number {
  const depth = calculateDepth(rule);
  if (depth > opts.maxDepth) {
    errors.push({
      message: `Rule depth (${depth}) exceeds maximum (${opts.maxDepth})`,
      code: VALIDATION_ERROR_CODES.MAX_DEPTH_EXCEEDED,
      severity: 'error',
    });
  }

  const complexity = calculateComplexity(rule);
  if (complexity > opts.maxComplexity) {
    errors.push({
      message: `Rule complexity (${complexity}) exceeds maximum (${opts.maxComplexity})`,
      code: VALIDATION_ERROR_CODES.MAX_COMPLEXITY_EXCEEDED,
      severity: 'error',
    });
  }

  if (complexity > opts.maxComplexity * 0.8) {
    warnings.push({
      message: `Rule complexity (${complexity}) is approaching maximum`,
      code: 'COMPLEXITY_WARNING',
      severity: 'warning',
    });
  }

  return complexity;
}

/**
 * Validate operators
 */
function validateRuleOperators(
  operators: string[],
  opts: Required<RuleValidationOptions>,
  errors: RuleValidationError[],
  warnings: RuleValidationWarning[]
): void {
  for (const operator of operators) {
    if (opts.disallowedOperators.includes(operator)) {
      errors.push({
        message: `Operator "${operator}" is disallowed`,
        code: VALIDATION_ERROR_CODES.DISALLOWED_OPERATOR,
        severity: 'error',
      });
    }

    if (!opts.allowedOperators.includes(operator)) {
      if (opts.strict) {
        errors.push({
          message: `Unknown operator "${operator}"`,
          code: VALIDATION_ERROR_CODES.UNKNOWN_OPERATOR,
          severity: 'error',
        });
      } else {
        warnings.push({
          message: `Unknown operator "${operator}" - may be custom`,
          code: VALIDATION_ERROR_CODES.UNKNOWN_OPERATOR,
          severity: 'warning',
        });
      }
    }
  }
}

/**
 * Validate required variables
 */
function validateRequiredVariables(
  variables: string[],
  opts: Required<RuleValidationOptions>,
  errors: RuleValidationError[]
): void {
  for (const required of opts.requiredVariables) {
    if (!variables.includes(required)) {
      errors.push({
        message: `Required variable "${required}" not found in rule`,
        code: VALIDATION_ERROR_CODES.MISSING_REQUIRED_VARIABLE,
        severity: 'error',
      });
    }
  }
}

/**
 * Validate a JSON Logic rule
 *
 * @param rule Rule to validate
 * @param options Validation options
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const rule = { '>': [{ var: 'age' }, 18] };
 * const result = validateRule(rule);
 *
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export function validateRule(
  rule: unknown,
  options: Partial<RuleValidationOptions> = {}
): RuleValidationResult {
  const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };
  const errors: RuleValidationError[] = [];
  const warnings: RuleValidationWarning[] = [];

  try {
    const validatedRule = validateRuleStructure(rule, errors);
    if (!validatedRule) {
      return { valid: false, errors, warnings };
    }

    const complexity = validateRuleMetrics(validatedRule, opts, errors, warnings);

    const operators = extractOperators(validatedRule);
    const variables = extractVariables(validatedRule);

    validateRuleOperators(operators, opts, errors, warnings);
    validateRequiredVariables(variables, opts, errors);

    if (hasCircularReference(validatedRule)) {
      errors.push({
        message: 'Rule contains circular reference',
        code: VALIDATION_ERROR_CODES.CIRCULAR_REFERENCE,
        severity: 'critical',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      complexity,
      operators: [...new Set(operators)],
      variables: [...new Set(variables)],
    };

  } catch (error) {
    errors.push({
      message: error instanceof Error ? error.message : 'Unknown validation error',
      code: VALIDATION_ERROR_CODES.INVALID_STRUCTURE,
      severity: 'critical',
    });

    return { valid: false, errors, warnings };
  }
}

/**
 * Validate multiple rules
 *
 * @param rules Array of rules to validate
 * @param options Validation options
 * @returns Array of validation results
 */
export function validateRules(
  rules: unknown[],
  options: Partial<RuleValidationOptions> = {}
): RuleValidationResult[] {
  return rules.map((rule) => validateRule(rule, options));
}

/**
 * Check if a rule is valid (returns boolean)
 *
 * @param rule Rule to check
 * @param options Validation options
 * @returns True if valid
 */
export function isValidRule(
  rule: unknown,
  options: Partial<RuleValidationOptions> = {}
): boolean {
  const result = validateRule(rule, options);
  return result.valid;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate rule depth
 */
function calculateDepth(rule: JsonLogicRule, currentDepth = 0): number {
  if (rule === null || typeof rule !== 'object') {
    return currentDepth;
  }

  if (Array.isArray(rule)) {
    return Math.max(
      currentDepth,
      ...rule.map((item) => calculateDepth(item, currentDepth + 1))
    );
  }

  const depths = Object.values(rule).map((value) =>
    calculateDepth(value as JsonLogicRule, currentDepth + 1)
  );

  return Math.max(currentDepth, ...depths);
}

/**
 * Calculate rule complexity score
 *
 * Complexity is based on:
 * - Number of operators (1 point each)
 * - Nesting depth (2 points per level)
 * - Array operations (3 points each)
 * - Variables (0.5 points each)
 */
function calculateComplexity(rule: JsonLogicRule): number {
  let complexity = 0;

  const visit = (node: JsonLogicRule, depth: number): void => {
    if (node === null || typeof node !== 'object') {
      return;
    }

    // Add depth penalty
    complexity += depth * 2;

    if (Array.isArray(node)) {
      node.forEach((item) => visit(item, depth + 1));
      return;
    }

    // Check if it's an operator
    const keys = Object.keys(node);
    const nodeAsRecord = node as Record<string, unknown>;
    for (const key of keys) {
      // Safely access the key - it comes from Object.keys so it's safe
      if (!Object.prototype.hasOwnProperty.call(nodeAsRecord, key)) {
        continue;
      }

      if (key === 'var') {
        complexity += 0.5;
      } else if (['map', 'filter', 'reduce', 'all', 'some', 'none'].includes(key)) {
        complexity += 3; // Array operations are more complex
      } else {
        complexity += 1; // Standard operator
      }

      // eslint-disable-next-line security/detect-object-injection -- key comes from Object.keys(), safe to use as property accessor
      const value = nodeAsRecord[key];
      if (value !== undefined) {
        visit(value as JsonLogicRule, depth + 1);
      }
    }
  };

  visit(rule, 0);
  return Math.round(complexity);
}

/**
 * Extract all operators from a rule
 */
function extractOperators(rule: JsonLogicRule): string[] {
  const operators: string[] = [];

  const visit = (node: JsonLogicRule): void => {
    if (node === null || typeof node !== 'object') {
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    const keys = Object.keys(node);
    const nodeAsRecord = node as Record<string, unknown>;
    for (const key of keys) {
      // Safely access the key - it comes from Object.keys so it's safe
      if (!Object.prototype.hasOwnProperty.call(nodeAsRecord, key)) {
        continue;
      }

      if (key !== 'var') {
        operators.push(key);
      }

      // eslint-disable-next-line security/detect-object-injection -- key comes from Object.keys(), safe to use as property accessor
      const value = nodeAsRecord[key];
      if (value !== undefined) {
        visit(value as JsonLogicRule);
      }
    }
  };

  visit(rule);
  return operators;
}

/**
 * Extract all variable references from a rule
 */
function extractVariables(rule: JsonLogicRule): string[] {
  const variables: string[] = [];

  const visit = (node: JsonLogicRule): void => {
    if (node === null || typeof node !== 'object') {
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    const keys = Object.keys(node);
    const nodeAsRecord = node as Record<string, unknown>;
    for (const key of keys) {
      // Safely access the key - it comes from Object.keys so it's safe
      if (!Object.prototype.hasOwnProperty.call(nodeAsRecord, key)) {
        continue;
      }

      // eslint-disable-next-line security/detect-object-injection -- key comes from Object.keys(), safe to use as property accessor
      const keyValue = nodeAsRecord[key];

      if (key === 'var') {
        extractVariableFromVarOperator(keyValue, variables);
      }

      if (keyValue !== undefined) {
        visit(keyValue as JsonLogicRule);
      }
    }
  };

  visit(rule);
  return variables;
}

/**
 * Extract variable name from a var operator value
 */
function extractVariableFromVarOperator(
  varPath: unknown,
  variables: string[]
): void {
  if (typeof varPath === 'string') {
    variables.push(varPath);
  } else if (Array.isArray(varPath)) {
    const firstElement = varPath[0];
    if (typeof firstElement === 'string') {
      variables.push(firstElement);
    }
  }
}

/**
 * Check for circular references
 *
 * This is a simplified check - in practice, JSON Logic doesn't
 * typically have circular references, but we check for deeply
 * nested structures that might indicate a problem
 */
function hasCircularReference(rule: JsonLogicRule, visited = new WeakSet()): boolean {
  if (rule === null || typeof rule !== 'object') {
    return false;
  }

  // Check if we've seen this object before
  if (visited.has(rule as object)) {
    return true;
  }

  visited.add(rule as object);

  if (Array.isArray(rule)) {
    return rule.some((item) => hasCircularReference(item, visited));
  }

  return Object.values(rule).some((value) =>
    hasCircularReference(value as JsonLogicRule, visited)
  );
}

// ============================================================================
// RULE SANITIZATION
// ============================================================================

/**
 * Sanitize a rule by removing invalid or dangerous operations
 *
 * @param rule Rule to sanitize
 * @param options Validation options
 * @returns Sanitized rule or null if rule is invalid
 */
export function sanitizeRule(
  rule: JsonLogicRule,
  options: Partial<RuleValidationOptions> = {}
): JsonLogicRule | null {
  const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };

  const sanitize = (node: JsonLogicRule): JsonLogicRule | null => {
    if (node === null || typeof node !== 'object') {
      return node;
    }

    if (Array.isArray(node)) {
      const sanitized = node
        .map(sanitize)
        .filter((item): item is JsonLogicRule => item !== null);
      return sanitized.length > 0 ? sanitized : null;
    }

    const sanitized: Record<string, unknown> = {};
    const keys = Object.keys(node);
    const nodeAsRecord = node as Record<string, unknown>;

    for (const key of keys) {
      // Safely access the key - it comes from Object.keys so it's safe
      if (!Object.prototype.hasOwnProperty.call(nodeAsRecord, key)) {
        continue;
      }

      // Check if operator is allowed
      if (opts.disallowedOperators.includes(key)) {
        continue; // Skip disallowed operators
      }

      // eslint-disable-next-line security/detect-object-injection -- key comes from Object.keys(), safe to use as property accessor
      const value = nodeAsRecord[key];
      const sanitizedValue = sanitize(value as JsonLogicRule);

      if (sanitizedValue !== null) {
        // eslint-disable-next-line security/detect-object-injection -- key comes from Object.keys(), safe to use as property accessor
        sanitized[key] = sanitizedValue;
      }
    }

    return Object.keys(sanitized).length > 0 ? (sanitized as JsonLogicRule) : null;
  };

  return sanitize(rule);
}

