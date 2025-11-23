/**
 * JSON Logic Types
 *
 * TypeScript type definitions for JSON Logic rules and operations.
 * Based on json-logic-js specification: http://jsonlogic.com/
 */

import type { RulesLogic } from 'json-logic-js';

// ============================================================================
// CORE JSON LOGIC TYPES
// ============================================================================

/**
 * JSON Logic rule structure
 *
 * A rule is either a primitive value or an operation object
 */
export type JsonLogicRule =
  | JsonLogicPrimitive
  | JsonLogicOperation
  | JsonLogicVar
  | JsonLogicRule[];

/**
 * Primitive values in JSON Logic
 */
export type JsonLogicPrimitive = string | number | boolean | null;

/**
 * JSON Logic operation
 *
 * An operation is an object with a single key (the operator)
 * and a value (the operands)
 */
export type JsonLogicOperation = {
  [operator: string]: JsonLogicRule | JsonLogicRule[];
};

/**
 * Variable reference
 */
export interface JsonLogicVar {
  var: string | number | (string | number)[];
}

/**
 * Data context for rule evaluation
 *
 * The data passed to the rule evaluator
 */
export type JsonLogicData = Record<string, unknown>;

// ============================================================================
// SPECIFIC OPERATORS
// ============================================================================

/**
 * Comparison operators
 */
export interface ComparisonOperators {
  '==': [JsonLogicRule, JsonLogicRule];
  '===': [JsonLogicRule, JsonLogicRule];
  '!=': [JsonLogicRule, JsonLogicRule];
  '!==': [JsonLogicRule, JsonLogicRule];
  '>': [JsonLogicRule, JsonLogicRule];
  '>=': [JsonLogicRule, JsonLogicRule];
  '<': [JsonLogicRule, JsonLogicRule];
  '<=': [JsonLogicRule, JsonLogicRule];
}

/**
 * Logical operators
 */
export interface LogicalOperators {
  '!': JsonLogicRule;
  '!!': JsonLogicRule;
  'and': JsonLogicRule[];
  'or': JsonLogicRule[];
  'if': [JsonLogicRule, JsonLogicRule, JsonLogicRule?];
}

/**
 * Arithmetic operators
 */
export interface ArithmeticOperators {
  '+': JsonLogicRule[];
  '-': JsonLogicRule | [JsonLogicRule, JsonLogicRule];
  '*': JsonLogicRule[];
  '/': [JsonLogicRule, JsonLogicRule];
  '%': [JsonLogicRule, JsonLogicRule];
  'min': JsonLogicRule[];
  'max': JsonLogicRule[];
}

/**
 * Array operators
 */
export interface ArrayOperators {
  'in': [JsonLogicRule, JsonLogicRule];
  'map': [JsonLogicRule, JsonLogicRule];
  'filter': [JsonLogicRule, JsonLogicRule];
  'reduce': [JsonLogicRule, JsonLogicRule, JsonLogicRule];
  'all': [JsonLogicRule, JsonLogicRule];
  'none': [JsonLogicRule, JsonLogicRule];
  'some': [JsonLogicRule, JsonLogicRule];
  'merge': JsonLogicRule[];
}

/**
 * String operators
 */
export interface StringOperators {
  'cat': JsonLogicRule[];
  'substr': [JsonLogicRule, JsonLogicRule, JsonLogicRule?];
}

// ============================================================================
// RULE EVALUATION TYPES
// ============================================================================

/**
 * Rule evaluation result
 */
export interface RuleEvaluationResult<T = boolean> {
  /** Evaluation result */
  result: T;
  /** Whether evaluation was successful */
  success: boolean;
  /** Error if evaluation failed */
  error?: string;
  /** Detailed error information */
  errorDetails?: RuleEvaluationError;
  /** Execution time in milliseconds */
  executionTime?: number;
  /** Evaluation context snapshot */
  context?: JsonLogicData;
}

/**
 * Rule evaluation error details
 */
export interface RuleEvaluationError {
  /** Error message */
  message: string;
  /** Error code */
  code: string;
  /** Rule that caused the error */
  rule?: JsonLogicRule;
  /** Data context when error occurred */
  data?: JsonLogicData;
  /** Stack trace */
  stack?: string;
}

/**
 * Rule evaluation options
 */
export interface RuleEvaluationOptions {
  /** Timeout in milliseconds */
  timeout?: number;
  /** Whether to capture execution time */
  measureTime?: boolean;
  /** Whether to capture context snapshot */
  captureContext?: boolean;
  /** Custom operators */
  customOperators?: Record<string, (...args: unknown[]) => unknown>;
  /** Strict mode (throw errors instead of returning defaults) */
  strict?: boolean;
  /** Maximum recursion depth */
  maxDepth?: number;
}

// ============================================================================
// RULE VALIDATION TYPES
// ============================================================================

/**
 * Rule validation result
 */
export interface RuleValidationResult {
  /** Whether rule is valid */
  valid: boolean;
  /** Validation errors */
  errors: RuleValidationError[];
  /** Validation warnings */
  warnings: RuleValidationWarning[];
  /** Rule complexity score */
  complexity?: number;
  /** Detected operators */
  operators?: string[];
  /** Referenced variables */
  variables?: string[];
}

/**
 * Rule validation error
 */
export interface RuleValidationError {
  /** Error message */
  message: string;
  /** Error code */
  code: string;
  /** Path to error in rule structure */
  path?: string[];
  /** Severity level */
  severity: 'error' | 'critical';
}

/**
 * Rule validation warning
 */
export interface RuleValidationWarning {
  /** Warning message */
  message: string;
  /** Warning code */
  code: string;
  /** Path to warning in rule structure */
  path?: string[];
  /** Severity level */
  severity: 'warning' | 'info';
}

/**
 * Rule validation options
 */
export interface RuleValidationOptions {
  /** Allowed operators */
  allowedOperators?: string[];
  /** Disallowed operators */
  disallowedOperators?: string[];
  /** Maximum complexity score */
  maxComplexity?: number;
  /** Maximum nesting depth */
  maxDepth?: number;
  /** Require specific variables */
  requiredVariables?: string[];
  /** Check for unused variables */
  checkUnusedVariables?: boolean;
  /** Strict mode */
  strict?: boolean;
}

// ============================================================================
// RULE TESTING TYPES
// ============================================================================

/**
 * Rule test case
 */
export interface RuleTestCase {
  /** Test case name/description */
  description: string;
  /** Input data */
  input: JsonLogicData;
  /** Expected result */
  expected: unknown;
  /** Whether this test should pass */
  shouldPass?: boolean;
  /** Tags for organizing tests */
  tags?: string[];
}

/**
 * Rule test result
 */
export interface RuleTestResult {
  /** Test case description */
  description: string;
  /** Whether test passed */
  passed: boolean;
  /** Expected value */
  expected: unknown;
  /** Actual result */
  actual: unknown;
  /** Error if test failed */
  error?: string;
  /** Execution time */
  executionTime?: number;
}

/**
 * Rule test suite
 */
export interface RuleTestSuite {
  /** Suite name */
  name: string;
  /** Suite description */
  description?: string;
  /** Rule to test */
  rule: JsonLogicRule;
  /** Test cases */
  testCases: RuleTestCase[];
  /** Setup function */
  setup?: () => void | Promise<void>;
  /** Teardown function */
  teardown?: () => void | Promise<void>;
}

/**
 * Rule test suite result
 */
export interface RuleTestSuiteResult {
  /** Suite name */
  name: string;
  /** Total tests */
  total: number;
  /** Passed tests */
  passed: number;
  /** Failed tests */
  failed: number;
  /** Test results */
  results: RuleTestResult[];
  /** Total execution time */
  totalTime?: number;
  /** Success rate */
  successRate: number;
}

// ============================================================================
// RULE EXPLANATION TYPES
// ============================================================================

/**
 * Rule explanation
 *
 * Human-readable explanation of what a rule does
 */
export interface RuleExplanation {
  /** Plain language description */
  description: string;
  /** Detailed breakdown */
  breakdown: RuleExplanationNode[];
  /** Referenced variables */
  variables: string[];
  /** Used operators */
  operators: string[];
  /** Complexity level */
  complexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
  /** What criteria were checked */
  criteriaChecked?: string[];
}

/**
 * Rule explanation node
 *
 * A node in the rule explanation tree
 */
export interface RuleExplanationNode {
  /** Node type */
  type: 'operator' | 'variable' | 'constant' | 'expression';
  /** Operator name */
  operator?: string;
  /** Variable name */
  variable?: string;
  /** Constant value */
  value?: JsonLogicPrimitive;
  /** Human-readable description */
  description: string;
  /** Child nodes */
  children?: RuleExplanationNode[];
  /** Nesting level */
  level: number;
}

// ============================================================================
// RULE BUILDER TYPES
// ============================================================================

/**
 * Rule builder interface
 *
 * Fluent API for building JSON Logic rules
 */
export interface RuleBuilder {
  /** Build the rule */
  build(): JsonLogicRule;

  /** Reset the builder */
  reset(): RuleBuilder;

  // Comparison methods
  equals(left: JsonLogicRule, right: JsonLogicRule): RuleBuilder;
  notEquals(left: JsonLogicRule, right: JsonLogicRule): RuleBuilder;
  greaterThan(left: JsonLogicRule, right: JsonLogicRule): RuleBuilder;
  greaterThanOrEqual(left: JsonLogicRule, right: JsonLogicRule): RuleBuilder;
  lessThan(left: JsonLogicRule, right: JsonLogicRule): RuleBuilder;
  lessThanOrEqual(left: JsonLogicRule, right: JsonLogicRule): RuleBuilder;

  // Logical methods
  and(...rules: JsonLogicRule[]): RuleBuilder;
  or(...rules: JsonLogicRule[]): RuleBuilder;
  not(rule: JsonLogicRule): RuleBuilder;
  if(condition: JsonLogicRule, then: JsonLogicRule, otherwise?: JsonLogicRule): RuleBuilder;

  // Variable reference
  var(path: string | string[]): JsonLogicRule;

  // Constants
  constant(value: JsonLogicPrimitive): JsonLogicRule;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Rule metadata
 */
export interface RuleMetadata {
    /** Source or reference for rule */
    source?: string;
  /** Rule ID */
  id?: string;
  /** Rule name */
  name?: string;
  /** Rule description */
  description?: string;
  /** Rule type (eligibility, benefit_amount, etc.) */
  ruleType?: string;
  /** Explanation for the rule */
  explanation?: string;
  /** Required fields for evaluation */
  requiredFields?: string[];
  /** Required documents for verification */
  requiredDocuments?: string[];
  /** Rule version */
  version?: string;
  /** Author */
  author?: string;
  /** Creation date */
  createdAt?: number;
  /** Last modified date */
  updatedAt?: number;
  /** Effective date for rule */
  effectiveDate?: number;
  /** Whether rule is active */
  active?: boolean;
  /** Tags */
  tags?: string[];
  /** Custom metadata */
  custom?: Record<string, unknown>;
}

/**
 * Complete rule definition with metadata
 */
export interface RuleDefinition {
  /** Legacy identifier (optional) retained for imports and older rule files */
  id?: string;
  /** Program identifier (legacy placement on rule objects) */
  programId?: string;
  /** Priority for rule ordering (optional, legacy) */
  priority?: number;
  /** Rule logic */
  logic: JsonLogicRule;
  /** Metadata */
  metadata?: RuleMetadata;
  /** Test cases */
  testCases?: RuleTestCase[];
}

// Re-export json-logic-js types
export type { RulesLogic };

