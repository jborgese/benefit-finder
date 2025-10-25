/**
 * LIHTC Rules Unit Tests
 *
 * Unit tests for individual LIHTC eligibility rules.
 */

import { describe, it, expect } from 'vitest';
import { evaluateRule } from '../rules';
import { LIHTC_RULES } from '../rules/housing/lihtc-rules';

describe('LIHTC Rules Unit Tests', () => {
  describe('Income Eligibility Rule', () => {
    const rule = LIHTC_RULES.find(r => r.id === 'lihtc-income-eligibility-2024')!;

    it('should pass for income at 50% AMI', async () => {
      const data = {
        householdIncome: 40000,
        amiData: { incomeLimit50: 40000, incomeLimit60: 48000 }
      };

      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should pass for income at 60% AMI', async () => {
      const data = {
        householdIncome: 48000,
        amiData: { incomeLimit50: 40000, incomeLimit60: 48000 }
      };

      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should pass for income below 50% AMI', async () => {
      const data = {
        householdIncome: 35000,
        amiData: { incomeLimit50: 40000, incomeLimit60: 48000 }
      };

      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should fail for income above 60% AMI', async () => {
      const data = {
        householdIncome: 50000,
        amiData: { incomeLimit50: 40000, incomeLimit60: 48000 }
      };

      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });

    it('should handle edge case at exactly 60% AMI', async () => {
      const data = {
        householdIncome: 48000,
        amiData: { incomeLimit50: 40000, incomeLimit60: 48000 }
      };

      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });
  });

  describe('Student Status Rule', () => {
    const rule = LIHTC_RULES.find(r => r.id === 'lihtc-student-eligibility')!;

    it('should pass for non-student', async () => {
      const data = { studentStatus: 'none' };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should pass for single parent student', async () => {
      const data = { studentStatus: 'single_parent' };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should pass for married student', async () => {
      const data = { studentStatus: 'married_student' };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should fail for full-time student', async () => {
      const data = { studentStatus: 'full_time_student' };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });
  });

  describe('Unit Size Match Rule', () => {
    const rule = LIHTC_RULES.find(r => r.id === 'lihtc-unit-size-match')!;

    it('should pass for appropriate household size', async () => {
      const data = { householdSize: 3, maxUnitOccupancy: 4 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should pass for exact match', async () => {
      const data = { householdSize: 4, maxUnitOccupancy: 4 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should fail for oversized household', async () => {
      const data = { householdSize: 5, maxUnitOccupancy: 4 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });

    it('should pass for single person in studio', async () => {
      const data = { householdSize: 1, maxUnitOccupancy: 1 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });
  });

  describe('Rent Affordability Rule', () => {
    const rule = LIHTC_RULES.find(r => r.id === 'lihtc-rent-affordability')!;

    it('should pass for affordable rent', async () => {
      const data = {
        maxRentAffordable: 1000,
        amiData: { incomeLimit50: 40000 }
      };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should fail for unaffordable rent', async () => {
      const data = {
        maxRentAffordable: 15000, // This should be > 30% of 40000 (12000)
        amiData: { incomeLimit50: 40000 }
      };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });

    it('should handle edge case at exactly 30% of income limit', async () => {
      const data = {
        maxRentAffordable: 1000, // 30% of 40000/12 = 1000
        amiData: { incomeLimit50: 40000 }
      };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });
  });

  describe('Citizenship Eligibility Rule', () => {
    const rule = LIHTC_RULES.find(r => r.id === 'lihtc-citizenship-eligibility')!;

    it('should pass for US citizen', async () => {
      const data = { citizenship: 'us_citizen' };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should pass for permanent resident', async () => {
      const data = { citizenship: 'permanent_resident' };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should pass for refugee', async () => {
      const data = { citizenship: 'refugee' };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should pass for asylee', async () => {
      const data = { citizenship: 'asylee' };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should fail for other status', async () => {
      const data = { citizenship: 'other' };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });
  });

  describe('Age Eligibility Rule', () => {
    const rule = LIHTC_RULES.find(r => r.id === 'lihtc-age-eligibility')!;

    it('should pass for 18 year old', async () => {
      const data = { age: 18 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should pass for adult', async () => {
      const data = { age: 25 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should pass for senior', async () => {
      const data = { age: 65 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should fail for minor', async () => {
      const data = { age: 17 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });

    it('should fail for very young', async () => {
      const data = { age: 16 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });
  });

  describe('Household Size Validation Rule', () => {
    const rule = LIHTC_RULES.find(r => r.id === 'lihtc-household-size-validation')!;

    it('should pass for single person', async () => {
      const data = { householdSize: 1 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should pass for small family', async () => {
      const data = { householdSize: 3 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should pass for large family', async () => {
      const data = { householdSize: 8 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should fail for zero household size', async () => {
      const data = { householdSize: 0 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });

    it('should fail for oversized household', async () => {
      const data = { householdSize: 9 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });
  });

  describe('Background Check Rule', () => {
    const rule = LIHTC_RULES.find(r => r.id === 'lihtc-background-check')!;

    it('should pass for clean background', async () => {
      const data = { hasCriminalHistory: false };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should fail for criminal history', async () => {
      const data = { hasCriminalHistory: true };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });
  });

  describe('Income Verification Rule', () => {
    const rule = LIHTC_RULES.find(r => r.id === 'lihtc-income-verification')!;

    it('should pass for positive income', async () => {
      const data = { householdIncome: 30000 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    it('should fail for zero income', async () => {
      const data = { householdIncome: 0 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });

    it('should fail for negative income', async () => {
      const data = { householdIncome: -1000 };
      const result = await evaluateRule(rule.ruleLogic, data);
      expect(result.success).toBe(true);
      expect(result.result).toBe(false);
    });
  });

  describe('Rule Error Handling', () => {
    it('should handle missing required fields gracefully', async () => {
      const rule = LIHTC_RULES.find(r => r.id === 'lihtc-income-eligibility-2024')!;

      const data = {}; // Missing required fields
      const result = await evaluateRule(rule.ruleLogic, data);

      expect(result.success).toBe(true);
      expect(result.result).toBe(null); // Should return null when data is missing
    });

    it('should handle invalid data types', async () => {
      const rule = LIHTC_RULES.find(r => r.id === 'lihtc-age-eligibility')!;

      const data = { age: 'not-a-number' };
      const result = await evaluateRule(rule.ruleLogic, data);

      expect(result.success).toBe(true);
      expect(result.result).toBe(null); // Should return null for invalid data
    });

    it('should handle null values', async () => {
      const rule = LIHTC_RULES.find(r => r.id === 'lihtc-student-eligibility')!;

      const data = { studentStatus: null };
      const result = await evaluateRule(rule.ruleLogic, data);

      expect(result.success).toBe(true);
      expect(result.result).toBe(null); // Should return null for null values
    });
  });

  describe('Rule Performance', () => {
    it('should evaluate rules quickly', async () => {
      const rule = LIHTC_RULES.find(r => r.id === 'lihtc-income-eligibility-2024')!;
      const data = {
        householdIncome: 35000,
        amiData: { incomeLimit50: 40000, incomeLimit60: 48000 }
      };

      const start = Date.now();
      await evaluateRule(rule.ruleLogic, data);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50); // Should complete in under 50ms
    });

    it('should handle multiple evaluations efficiently', async () => {
      const rule = LIHTC_RULES.find(r => r.id === 'lihtc-income-eligibility-2024')!;
      const data = {
        householdIncome: 35000,
        amiData: { incomeLimit50: 40000, incomeLimit60: 48000 }
      };

      const start = Date.now();
      const promises = Array(100).fill(null).map(() => evaluateRule(rule.ruleLogic, data));
      await Promise.all(promises);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete 100 evaluations in under 1 second
    });
  });
});
