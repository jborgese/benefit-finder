/**
 * Rule Validator Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateRule,
  isValidRule,
  sanitizeRule,
  STANDARD_OPERATORS,
} from '../core/validator';
import type { JsonLogicRule } from '../core/types';

describe('Rule Validator', () => {
  describe('validateRule', () => {
    it('should validate a simple rule', () => {
      const rule: JsonLogicRule = { '>': [{ var: 'age' }, 18] };

      const result = validateRule(rule);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.operators).toContain('>');
      expect(result.variables).toContain('age');
    });

    it('should detect undefined rule', () => {
      const result = validateRule(undefined);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe('VAL_INVALID_STRUCTURE');
    });

    it('should validate complex nested rule', () => {
      const rule: JsonLogicRule = {
        and: [
          { '>': [{ var: 'age' }, 18] },
          { '<': [{ var: 'income' }, 50000] },
          {
            or: [
              { '==': [{ var: 'state' }, 'GA'] },
              { '==': [{ var: 'state' }, 'FL'] },
            ],
          },
        ],
      };

      const result = validateRule(rule, { maxComplexity: 200 });

      expect(result.valid).toBe(true);
      expect(result.operators).toContain('and');
      expect(result.operators).toContain('or');
      expect(result.variables).toContain('age');
      expect(result.variables).toContain('income');
      expect(result.variables).toContain('state');
    });

    it('should detect excessive depth', () => {
      // Create deeply nested rule
      let rule: JsonLogicRule = { var: 'value' };
      for (let i = 0; i < 25; i++) {
        rule = { '!': [rule] };
      }

      const result = validateRule(rule, { maxDepth: 20 });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'VAL_MAX_DEPTH')).toBe(true);
    });

    it('should detect excessive complexity', () => {
      // Create complex rule
      const conditions = Array.from({ length: 50 }, (_, i) => ({
        '>': [{ var: `field${i}` }, i],
      }));
      const rule: JsonLogicRule = { and: conditions };

      const result = validateRule(rule, { maxComplexity: 100 });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'VAL_MAX_COMPLEXITY')).toBe(true);
    });

    it('should detect unknown operators', () => {
      const rule: JsonLogicRule = { custom_op: [{ var: 'x' }, 10] };

      const result = validateRule(rule, { strict: true });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'VAL_UNKNOWN_OPERATOR')).toBe(true);
    });

    it('should warn about unknown operators in non-strict mode', () => {
      const rule: JsonLogicRule = { custom_op: [{ var: 'x' }, 10] };

      const result = validateRule(rule, { strict: false });

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.code === 'VAL_UNKNOWN_OPERATOR')).toBe(true);
    });

    it('should detect disallowed operators', () => {
      const rule: JsonLogicRule = { log: [{ var: 'value' }] };

      const result = validateRule(rule, { disallowedOperators: ['log'] });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'VAL_DISALLOWED_OPERATOR')).toBe(true);
    });

    it('should validate required variables', () => {
      const rule: JsonLogicRule = { '>': [{ var: 'age' }, 18] };

      const result = validateRule(rule, {
        requiredVariables: ['age', 'income'],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'VAL_MISSING_VARIABLE')).toBe(true);
    });

    it('should calculate complexity score', () => {
      const rule: JsonLogicRule = {
        and: [
          { '>': [{ var: 'age' }, 18] },
          { '<': [{ var: 'income' }, 50000] },
        ],
      };

      const result = validateRule(rule);

      expect(result.complexity).toBeDefined();
      expect(result.complexity!).toBeGreaterThan(0);
    });
  });

  describe('isValidRule', () => {
    it('should return true for valid rule', () => {
      const rule: JsonLogicRule = { '>': [{ var: 'age' }, 18] };

      expect(isValidRule(rule)).toBe(true);
    });

    it('should return false for invalid rule', () => {
      expect(isValidRule(undefined)).toBe(false);
    });
  });

  describe('sanitizeRule', () => {
    it('should remove disallowed operators', () => {
      const rule: JsonLogicRule = {
        and: [
          { '>': [{ var: 'age' }, 18] },
          { log: [{ var: 'value' }] },
        ],
      };

      const sanitized = sanitizeRule(rule, { disallowedOperators: ['log'] });

      expect(sanitized).toBeDefined();
      expect(JSON.stringify(sanitized)).not.toContain('log');
    });

    it('should preserve valid operators', () => {
      const rule: JsonLogicRule = { '>': [{ var: 'age' }, 18] };

      const sanitized = sanitizeRule(rule);

      expect(sanitized).toEqual(rule);
    });

    it('should return null for completely invalid rule', () => {
      const rule: JsonLogicRule = { disallowed: ['test'] };

      const sanitized = sanitizeRule(rule, {
        disallowedOperators: ['disallowed'],
      });

      expect(sanitized).toBeNull();
    });
  });

  describe('Standard Operators', () => {
    it('should include all standard operators', () => {
      expect(STANDARD_OPERATORS).toContain('if');
      expect(STANDARD_OPERATORS).toContain('and');
      expect(STANDARD_OPERATORS).toContain('or');
      expect(STANDARD_OPERATORS).toContain('==');
      expect(STANDARD_OPERATORS).toContain('>');
      expect(STANDARD_OPERATORS).toContain('<');
      expect(STANDARD_OPERATORS).toContain('var');
    });
  });
});

