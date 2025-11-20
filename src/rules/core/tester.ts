/**
 * Rule Testing Framework
 *
 * Provides utilities for testing JSON Logic rules with test cases,
 * test suites, and comprehensive reporting.
 */

import { evaluateRule, evaluateRuleSync } from './evaluator';
import { validateRule } from './validator';
import type {
  JsonLogicRule,
  RuleTestCase,
  RuleTestResult,
  RuleTestSuite,
  RuleTestSuiteResult,
  RuleEvaluationOptions,
} from './types';

// ============================================================================
// TEST EXECUTION
// ============================================================================

/**
 * Test a rule with a single test case
 *
 * @param rule Rule to test
 * @param testCase Test case
 * @param options Evaluation options
 * @returns Test result
 *
 * @example
 * ```typescript
 * const rule = { '>': [{ var: 'age' }, 18] };
 * const testCase = {
 *   description: 'Adult check',
 *   input: { age: 25 },
 *   expected: true,
 * };
 *
 * const result = await testRule(rule, testCase);
 * console.log(result.passed); // true
 * ```
 */
export async function testRule(
  rule: JsonLogicRule,
  testCase: RuleTestCase,
  options: Partial<RuleEvaluationOptions> = {}
): Promise<RuleTestResult> {
  const startTime = performance.now();

  try {
    const evalResult = await evaluateRule(
      rule,
      testCase.input,
      { ...options, measureTime: true }
    );

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    // Compare result with expected
    const passed = testCase.shouldPass === false
      ? !evalResult.success
      : deepEqual(evalResult.result, testCase.expected);

    return {
      description: testCase.description,
      passed,
      expected: testCase.expected,
      actual: evalResult.result,
      executionTime,
      error: evalResult.error,
    };
  } catch (error) {
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    return {
      description: testCase.description,
      passed: false,
      expected: testCase.expected,
      actual: null,
      executionTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test a rule synchronously
 *
 * @param rule Rule to test
 * @param testCase Test case
 * @returns Test result
 */
export function testRuleSync(
  rule: JsonLogicRule,
  testCase: RuleTestCase
): RuleTestResult {
  const startTime = performance.now();

  try {
    const evalResult = evaluateRuleSync(rule, testCase.input);
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    const passed = testCase.shouldPass === false
      ? !evalResult.success
      : deepEqual(evalResult.result, testCase.expected);

    return {
      description: testCase.description,
      passed,
      expected: testCase.expected,
      actual: evalResult.result,
      executionTime,
      error: evalResult.error,
    };
  } catch (error) {
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    return {
      description: testCase.description,
      passed: false,
      expected: testCase.expected,
      actual: null,
      executionTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Run a test suite
 *
 * @param suite Test suite
 * @param options Evaluation options
 * @returns Test suite result
 *
 * @example
 * ```typescript
 * const suite: RuleTestSuite = {
 *   name: 'Age Validation',
 *   rule: { '>': [{ var: 'age' }, 18] },
 *   testCases: [
 *     { description: 'Adult', input: { age: 25 }, expected: true },
 *     { description: 'Minor', input: { age: 15 }, expected: false },
 *   ],
 * };
 *
 * const result = await runTestSuite(suite);
 * console.log(`Passed: ${result.passed}/${result.total}`);
 * ```
 */
export async function runTestSuite(
  suite: RuleTestSuite,
  options: Partial<RuleEvaluationOptions> = {}
): Promise<RuleTestSuiteResult> {
  const startTime = performance.now();

  // Run setup if provided
  if (suite.setup) {
    await suite.setup();
  }

  try {
    // Run all test cases
    const results = await Promise.all(
      suite.testCases.map((testCase) =>
        testRule(suite.rule, testCase, options)
      )
    );

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;

    return {
      name: suite.name,
      total: suite.testCases.length,
      passed,
      failed,
      results,
      totalTime,
      successRate: (passed / suite.testCases.length) * 100,
    };
  } finally {
    // Run teardown if provided
    if (suite.teardown) {
      await suite.teardown();
    }
  }
}

/**
 * Run multiple test suites
 *
 * @param suites Array of test suites
 * @param options Evaluation options
 * @returns Array of test suite results
 */
export function runTestSuites(
  suites: RuleTestSuite[],
  options: Partial<RuleEvaluationOptions> = {}
): Promise<RuleTestSuiteResult[]> {
  return Promise.all(
    suites.map((suite) => runTestSuite(suite, options))
  );
}

// ============================================================================
// TEST GENERATION
// ============================================================================

/**
 * Generate test cases for boundary conditions
 *
 * @param rule Rule to generate tests for
 * @param variables Variables and their ranges
 * @returns Array of test cases
 *
 * @example
 * ```typescript
 * const rule = { '>': [{ var: 'age' }, 18] };
 * const tests = generateBoundaryTests(rule, {
 *   age: { min: 0, max: 100, boundary: 18 },
 * });
 * ```
 */
export function generateBoundaryTests(
  _rule: JsonLogicRule,
  variables: Record<string, { min: number; max: number; boundary?: number }>
): RuleTestCase[] {
  const testCases: RuleTestCase[] = [];

  for (const [varName, config] of Object.entries(variables)) {
    const boundary = config.boundary ?? (config.min + config.max) / 2;

    // Test minimum
    testCases.push({
      description: `${varName} at minimum (${config.min})`,
      input: { [varName]: config.min },
      expected: undefined, // Let the evaluator determine
    });

    // Test boundary - 1
    if (boundary > config.min) {
      testCases.push({
        description: `${varName} below boundary (${boundary - 1})`,
        input: { [varName]: boundary - 1 },
        expected: undefined,
      });
    }

    // Test boundary
    testCases.push({
      description: `${varName} at boundary (${boundary})`,
      input: { [varName]: boundary },
      expected: undefined,
    });

    // Test boundary + 1
    if (boundary < config.max) {
      testCases.push({
        description: `${varName} above boundary (${boundary + 1})`,
        input: { [varName]: boundary + 1 },
        expected: undefined,
      });
    }

    // Test maximum
    testCases.push({
      description: `${varName} at maximum (${config.max})`,
      input: { [varName]: config.max },
      expected: undefined,
    });
  }

  return testCases;
}

/**
 * Generate test cases with combinations of variables
 *
 * @param variables Variables and their possible values
 * @returns Array of test cases
 */
export function generateCombinationTests(
  variables: Record<string, unknown[]>
): RuleTestCase[] {
  const testCases: RuleTestCase[] = [];
  const varNames = Object.keys(variables);
  const values = Object.values(variables);

  // Generate all combinations
  const combinations = cartesianProduct(values);

  for (const combination of combinations) {
    const input: Record<string, unknown> = {};
    varNames.forEach((varName, i) => {
      // eslint-disable-next-line security/detect-object-injection -- varName comes from Object.keys() and i is a controlled loop index, safe to use as property accessor
      input[varName] = combination[i];
    });

    testCases.push({
      description: `Combination: ${JSON.stringify(input)}`,
      input,
      expected: undefined,
    });
  }

  return testCases;
}

// ============================================================================
// TEST REPORTING
// ============================================================================

/**
 * Format test suite result as a string
 *
 * @param result Test suite result
 * @param verbose Whether to include detailed output
 * @returns Formatted string
 */
export function formatTestSuiteResult(
  result: RuleTestSuiteResult,
  verbose = false
): string {
  const lines: string[] = [];

  lines.push(`Test Suite: ${result.name}`);
  lines.push(`  Total: ${result.total}`);
  lines.push(`  Passed: ${result.passed} (${result.successRate.toFixed(1)}%)`);
  lines.push(`  Failed: ${result.failed}`);
  lines.push(`  Time: ${result.totalTime?.toFixed(2)}ms`);

  if (verbose && result.results.length > 0) {
    lines.push('\n  Results:');
    for (const test of result.results) {
      const status = test.passed ? '✓' : '✗';
      lines.push(`    ${status} ${test.description}`);

      if (!test.passed) {
        lines.push(`      Expected: ${JSON.stringify(test.expected)}`);
        lines.push(`      Actual: ${JSON.stringify(test.actual)}`);
        if (test.error) {
          lines.push(`      Error: ${test.error}`);
        }
      }
    }
  }

  return lines.join('\n');
}

/**
 * Generate test coverage report
 *
 * @param rule Rule to analyze
 * @param testCases Test cases
 * @returns Coverage information
 */
export function generateCoverageReport(
  rule: JsonLogicRule,
  testCases: RuleTestCase[]
): {
  operatorsCovered: string[];
  operatorsNotCovered: string[];
  variablesCovered: string[];
  variablesNotCovered: string[];
  coveragePercent: number;
} {
  const validation = validateRule(rule);
  const allOperators = validation.operators ?? [];
  const allVariables = validation.variables ?? [];

  // Extract covered operators and variables from test cases
  const coveredVariables = new Set<string>();
  for (const testCase of testCases) {
    Object.keys(testCase.input).forEach((key) => coveredVariables.add(key));
  }

  const variablesCovered = allVariables.filter((v) => coveredVariables.has(v));
  const variablesNotCovered = allVariables.filter((v) => !coveredVariables.has(v));

  // For operators, assume all are covered if any test exists
  // (More sophisticated analysis would require execution tracing)
  const operatorsCovered = testCases.length > 0 ? allOperators : [];
  const operatorsNotCovered = testCases.length > 0 ? [] : allOperators;

  const totalItems = allOperators.length + allVariables.length;
  const coveredItems = operatorsCovered.length + variablesCovered.length;
  const coveragePercent = totalItems > 0 ? (coveredItems / totalItems) * 100 : 0;

  return {
    operatorsCovered,
    operatorsNotCovered,
    variablesCovered,
    variablesNotCovered,
    coveragePercent,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Deep equality check
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {return true;}

  if (a === null || b === null) {return a === b;}
  if (typeof a !== 'object' || typeof b !== 'object') {return a === b;}

  const aRecord = a as Record<string, unknown>;
  const bRecord = b as Record<string, unknown>;
  const aKeys = Object.keys(aRecord);
  const bKeys = Object.keys(bRecord);

  if (aKeys.length !== bKeys.length) {return false;}

  return aKeys.every((key) => {
    // eslint-disable-next-line security/detect-object-injection -- key comes from Object.keys(), safe to use as property accessor
    const aValue = aRecord[key];
    // eslint-disable-next-line security/detect-object-injection -- key comes from Object.keys(), safe to use as property accessor
    const bValue = bRecord[key];
    return deepEqual(aValue, bValue);
  });
}

/**
 * Calculate cartesian product of arrays
 */
function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) {return [[]];}
  if (arrays.length === 1) {return arrays[0].map((x) => [x]);}

  const [first, ...rest] = arrays;
  const restProduct = cartesianProduct(rest);

  return first.flatMap((x) => restProduct.map((ys) => [x, ...ys]));
}

// ============================================================================
// TEST SUITE BUILDER
// ============================================================================

/**
 * Builder class for creating test suites
 */
export class TestSuiteBuilder {
  private suite: Partial<RuleTestSuite> = {
    testCases: [],
  };

  /**
   * Set suite name
   */
  name(name: string): TestSuiteBuilder {
    this.suite.name = name;
    return this;
  }

  /**
   * Set suite description
   */
  description(description: string): TestSuiteBuilder {
    this.suite.description = description;
    return this;
  }

  /**
   * Set rule to test
   */
  rule(rule: JsonLogicRule): TestSuiteBuilder {
    this.suite.rule = rule;
    return this;
  }

  /**
   * Add a test case
   */
  test(testCase: RuleTestCase): TestSuiteBuilder {
    if (this.suite.testCases) {
      this.suite.testCases.push(testCase);
    }
    return this;
  }

  /**
   * Add multiple test cases
   */
  tests(testCases: RuleTestCase[]): TestSuiteBuilder {
    if (this.suite.testCases) {
      this.suite.testCases.push(...testCases);
    }
    return this;
  }

  /**
   * Set setup function
   */
  setup(fn: () => void | Promise<void>): TestSuiteBuilder {
    this.suite.setup = fn;
    return this;
  }

  /**
   * Set teardown function
   */
  teardown(fn: () => void | Promise<void>): TestSuiteBuilder {
    this.suite.teardown = fn;
    return this;
  }

  /**
   * Build the test suite
   */
  build(): RuleTestSuite {
    if (!this.suite.name) {
      throw new Error('Test suite name is required');
    }
    if (!this.suite.rule) {
      throw new Error('Test suite rule is required');
    }

    return this.suite as RuleTestSuite;
  }
}

/**
 * Create a test suite builder
 *
 * @returns Test suite builder
 *
 * @example
 * ```typescript
 * const suite = createTestSuite()
 *   .name('Age Validation')
 *   .rule({ '>': [{ var: 'age' }, 18] })
 *   .test({
 *     description: 'Adult',
 *     input: { age: 25 },
 *     expected: true,
 *   })
 *   .build();
 * ```
 */
export function createTestSuite(): TestSuiteBuilder {
  return new TestSuiteBuilder();
}

