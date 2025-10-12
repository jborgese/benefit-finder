/**
 * Explanation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  explainResult,
  explainRule,
  explainWhatWouldPass,
  formatRuleExplanation,
} from '../explanation';
import type { JsonLogicRule, JsonLogicData } from '../types';
import type { EligibilityEvaluationResult } from '../eligibility';

describe('Rule Explanation', () => {
  describe('explainRule', () => {
    it('should explain a simple rule', () => {
      const rule: JsonLogicRule = { '>': [{ var: 'age' }, 18] };

      const explanation = explainRule(rule);

      expect(explanation.description).toBeDefined();
      expect(explanation.variables).toContain('age');
      expect(explanation.operators).toContain('>');
      expect(explanation.complexity).toBeDefined();
    });

    it('should explain a complex rule', () => {
      const rule: JsonLogicRule = {
        and: [
          { '>': [{ var: 'age' }, 18] },
          { '<': [{ var: 'income' }, 50000] },
          { in: [{ var: 'state' }, ['GA', 'FL']] },
        ],
      };

      const explanation = explainRule(rule);

      expect(explanation.variables).toContain('age');
      expect(explanation.variables).toContain('income');
      expect(explanation.variables).toContain('state');
      expect(explanation.operators).toContain('and');
      expect(['moderate', 'complex']).toContain(explanation.complexity);
    });

    it('should adjust language level', () => {
      const rule: JsonLogicRule = { '>': [{ var: 'age' }, 18] };

      const simple = explainRule(rule, 'simple');
      const technical = explainRule(rule, 'technical');

      expect(simple.description).toBeDefined();
      expect(technical.description).toBeDefined();
    });
  });

  describe('explainResult', () => {
    it('should explain eligible result', () => {
      const result: EligibilityEvaluationResult = {
        profileId: 'user-1',
        programId: 'program-1',
        ruleId: 'rule-1',
        eligible: true,
        confidence: 95,
        reason: 'You meet all requirements',
        evaluatedAt: Date.now(),
      };

      const rule: JsonLogicRule = { '>': [{ var: 'age' }, 18] };
      const data: JsonLogicData = { age: 25 };

      const explanation = explainResult(result, rule, data);

      expect(explanation.summary).toBeDefined();
      expect(explanation.plainLanguage).toContain('eligible');
      expect(explanation.reasoning.length).toBeGreaterThan(0);
    });

    it('should explain ineligible result', () => {
      const result: EligibilityEvaluationResult = {
        profileId: 'user-1',
        programId: 'program-1',
        ruleId: 'rule-1',
        eligible: false,
        confidence: 95,
        reason: 'You do not meet requirements',
        evaluatedAt: Date.now(),
      };

      const rule: JsonLogicRule = { '>': [{ var: 'age' }, 18] };
      const data: JsonLogicData = { age: 15 };

      const explanation = explainResult(result, rule, data);

      expect(explanation.plainLanguage).toContain('not');
      expect(explanation.reasoning.length).toBeGreaterThan(0);
    });

    it('should explain incomplete result', () => {
      const result: EligibilityEvaluationResult = {
        profileId: 'user-1',
        programId: 'program-1',
        ruleId: 'rule-1',
        eligible: false,
        confidence: 50,
        reason: 'Missing information',
        incomplete: true,
        missingFields: ['income', 'householdSize'],
        evaluatedAt: Date.now(),
      };

      const rule: JsonLogicRule = { '<': [{ var: 'income' }, 50000] };
      const data: JsonLogicData = {};

      const explanation = explainResult(result, rule, data);

      expect(explanation.missingInformation).toContain('income');
      expect(explanation.plainLanguage).toContain('information');
    });

    it('should provide suggestions for changing result', () => {
      const result: EligibilityEvaluationResult = {
        profileId: 'user-1',
        programId: 'program-1',
        ruleId: 'rule-1',
        eligible: false,
        confidence: 95,
        reason: 'Income too high',
        criteriaResults: [
          {
            criterion: 'income',
            met: false,
            value: 60000,
            threshold: 50000,
          },
        ],
        evaluatedAt: Date.now(),
      };

      const rule: JsonLogicRule = { '<': [{ var: 'income' }, 50000] };
      const data: JsonLogicData = { income: 60000 };

      const explanation = explainResult(result, rule, data, {
        includeSuggestions: true,
      });

      expect(explanation.whatWouldChange).toBeDefined();
      expect(explanation.whatWouldChange!.length).toBeGreaterThan(0);
    });
  });

  describe('explainWhatWouldPass', () => {
    it('should suggest changes to pass rule', () => {
      const rule: JsonLogicRule = { '>': [{ var: 'income' }, 30000] };
      const data: JsonLogicData = { income: 25000 };

      const suggestions = explainWhatWouldPass(rule, data);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.toLowerCase().includes('income') || s.includes('Income'))).toBe(true);
    });
  });

  describe('formatRuleExplanation', () => {
    it('should format rule explanation', () => {
      const rule: JsonLogicRule = { '>': [{ var: 'age' }, 18] };
      const explanation = explainRule(rule);

      const formatted = formatRuleExplanation(explanation);

      expect(formatted).toContain('checks');
      expect(typeof formatted).toBe('string');
    });
  });
});

