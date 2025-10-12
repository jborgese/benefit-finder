/**
 * Rule Tester Tests
 */

import { describe, it, expect } from 'vitest';
import {
  testRule,
  runTestSuite,
  generateBoundaryTests,
  formatTestSuiteResult,
  createTestSuite,
} from '../tester';
import type {
  JsonLogicRule,
  RuleTestCase,
  RuleTestSuite,
} from '../types';

describe('Rule Tester', () => {
  describe('testRule', () => {
    it('should pass when rule matches expected result', async () => {
      const rule: JsonLogicRule = { '>': [{ var: 'age' }, 18] };
      const testCase: RuleTestCase = {
        description: 'Adult check',
        input: { age: 25 },
        expected: true,
      };

      const result = await testRule(rule, testCase);

      expect(result.passed).toBe(true);
      expect(result.actual).toBe(true);
      expect(result.executionTime).toBeDefined();
    });

    it('should fail when rule does not match expected result', async () => {
      const rule: JsonLogicRule = { '>': [{ var: 'age' }, 18] };
      const testCase: RuleTestCase = {
        description: 'Minor check',
        input: { age: 15 },
        expected: true, // Wrong expected value
      };

      const result = await testRule(rule, testCase);

      expect(result.passed).toBe(false);
      expect(result.actual).toBe(false);
    });

    it('should handle test case that should fail', async () => {
      const rule: JsonLogicRule = { invalid_op: [] };
      const testCase: RuleTestCase = {
        description: 'Error test',
        input: {},
        expected: false,
        shouldPass: false,
      };

      const result = await testRule(rule, testCase);

      // Test passes because we expect it to fail
      expect(result.passed).toBe(true);
    });
  });

  describe('runTestSuite', () => {
    it('should run all tests in suite', async () => {
      const suite: RuleTestSuite = {
        name: 'Age Validation',
        rule: { '>': [{ var: 'age' }, 18] },
        testCases: [
          {
            description: 'Adult',
            input: { age: 25 },
            expected: true,
          },
          {
            description: 'Minor',
            input: { age: 15 },
            expected: false,
          },
          {
            description: 'Exactly 18',
            input: { age: 18 },
            expected: false,
          },
        ],
      };

      const result = await runTestSuite(suite);

      expect(result.name).toBe('Age Validation');
      expect(result.total).toBe(3);
      expect(result.passed).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.successRate).toBe(100);
      expect(result.totalTime).toBeDefined();
    });

    it('should report failures correctly', async () => {
      const suite: RuleTestSuite = {
        name: 'Income Validation',
        rule: { '<': [{ var: 'income' }, 50000] },
        testCases: [
          {
            description: 'Low income',
            input: { income: 30000 },
            expected: true,
          },
          {
            description: 'High income',
            input: { income: 60000 },
            expected: true, // Wrong expectation
          },
        ],
      };

      const result = await runTestSuite(suite);

      expect(result.passed).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.successRate).toBe(50);
    });

    it('should run setup and teardown', async () => {
      let setupRan = false;
      let teardownRan = false;

      const suite: RuleTestSuite = {
        name: 'Setup/Teardown Test',
        rule: { '>': [{ var: 'value' }, 0] },
        testCases: [
          {
            description: 'Test',
            input: { value: 1 },
            expected: true,
          },
        ],
        setup: () => {
          setupRan = true;
        },
        teardown: () => {
          teardownRan = true;
        },
      };

      await runTestSuite(suite);

      expect(setupRan).toBe(true);
      expect(teardownRan).toBe(true);
    });
  });

  describe('generateBoundaryTests', () => {
    it('should generate boundary test cases', () => {
      const rule: JsonLogicRule = { '>': [{ var: 'age' }, 18] };
      const tests = generateBoundaryTests(rule, {
        age: { min: 0, max: 100, boundary: 18 },
      });

      expect(tests.length).toBeGreaterThan(0);
      expect(tests.some((t) => t.input.age === 0)).toBe(true);
      expect(tests.some((t) => t.input.age === 17)).toBe(true);
      expect(tests.some((t) => t.input.age === 18)).toBe(true);
      expect(tests.some((t) => t.input.age === 19)).toBe(true);
      expect(tests.some((t) => t.input.age === 100)).toBe(true);
    });
  });

  describe('formatTestSuiteResult', () => {
    it('should format test suite result', () => {
      const result = {
        name: 'Test Suite',
        total: 5,
        passed: 4,
        failed: 1,
        results: [],
        totalTime: 123.45,
        successRate: 80,
      };

      const formatted = formatTestSuiteResult(result);

      expect(formatted).toContain('Test Suite');
      expect(formatted).toContain('Total: 5');
      expect(formatted).toContain('Passed: 4');
      expect(formatted).toContain('Failed: 1');
      expect(formatted).toContain('80.0%');
    });

    it('should include details in verbose mode', () => {
      const result = {
        name: 'Test Suite',
        total: 1,
        passed: 0,
        failed: 1,
        results: [
          {
            description: 'Test 1',
            passed: false,
            expected: true,
            actual: false,
            error: 'Test error',
          },
        ],
        totalTime: 10,
        successRate: 0,
      };

      const formatted = formatTestSuiteResult(result, true);

      expect(formatted).toContain('Test 1');
      expect(formatted).toContain('Expected:');
      expect(formatted).toContain('Actual:');
      expect(formatted).toContain('Error:');
    });
  });

  describe('createTestSuite', () => {
    it('should build test suite with fluent API', () => {
      const suite = createTestSuite()
        .name('Fluent Test')
        .description('Test suite built with fluent API')
        .rule({ '>': [{ var: 'value' }, 0] })
        .test({
          description: 'Positive value',
          input: { value: 1 },
          expected: true,
        })
        .test({
          description: 'Negative value',
          input: { value: -1 },
          expected: false,
        })
        .build();

      expect(suite.name).toBe('Fluent Test');
      expect(suite.description).toBe('Test suite built with fluent API');
      expect(suite.testCases).toHaveLength(2);
    });

    it('should throw error if name not provided', () => {
      expect(() => {
        createTestSuite()
          .rule({ '>': [{ var: 'value' }, 0] })
          .build();
      }).toThrow('name is required');
    });

    it('should throw error if rule not provided', () => {
      expect(() => {
        createTestSuite()
          .name('Test')
          .build();
      }).toThrow('rule is required');
    });
  });

  describe('Complex Test Scenarios', () => {
    it('should test benefit eligibility rules', async () => {
      const rule: JsonLogicRule = {
        and: [
          { '>': [{ var: 'age' }, 18] },
          { '<': [{ var: 'income' }, 50000] },
          { in: [{ var: 'state' }, ['GA', 'FL', 'AL']] },
        ],
      };

      const suite: RuleTestSuite = {
        name: 'SNAP Eligibility',
        rule,
        testCases: [
          {
            description: 'Eligible adult in GA',
            input: { age: 25, income: 30000, state: 'GA' },
            expected: true,
          },
          {
            description: 'Minor in GA',
            input: { age: 16, income: 30000, state: 'GA' },
            expected: false,
          },
          {
            description: 'High income in GA',
            input: { age: 25, income: 60000, state: 'GA' },
            expected: false,
          },
          {
            description: 'Eligible adult in NY',
            input: { age: 25, income: 30000, state: 'NY' },
            expected: false,
          },
        ],
      };

      const result = await runTestSuite(suite);

      expect(result.passed).toBe(4);
      expect(result.failed).toBe(0);
      expect(result.successRate).toBe(100);
    });
  });
});

