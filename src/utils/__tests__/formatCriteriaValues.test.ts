/**
 * Tests for formatCriteriaValues utilities
 */

import { describe, it, expect } from 'vitest';
import {
  formatCriteriaValue,
  formatThreshold,
  formatComparison,
} from '../formatCriteriaValues';

describe('formatCriteriaValue', () => {
  describe('null and undefined handling', () => {
    it('should handle null values', () => {
      expect(formatCriteriaValue(null)).toBe('Not provided');
    });

    it('should handle undefined values', () => {
      expect(formatCriteriaValue(undefined)).toBe('Not provided');
    });
  });

  describe('boolean values', () => {
    it('should format true as Yes', () => {
      expect(formatCriteriaValue(true)).toBe('Yes');
    });

    it('should format false as No', () => {
      expect(formatCriteriaValue(false)).toBe('No');
    });
  });

  describe('currency formatting', () => {
    it('should format income values as currency', () => {
      expect(formatCriteriaValue(1000, 'householdIncome')).toBe('$1,000');
      expect(formatCriteriaValue(2500, 'monthlyIncome')).toBe('$2,500');
      expect(formatCriteriaValue(50000, 'annualIncome')).toBe('$50,000');
    });

    it('should format asset values as currency', () => {
      expect(formatCriteriaValue(5000, 'assets')).toBe('$5,000');
      expect(formatCriteriaValue(10000, 'liquidAssets')).toBe('$10,000');
    });

    it('should format housing costs as currency', () => {
      expect(formatCriteriaValue(1200, 'rentAmount')).toBe('$1,200');
      expect(formatCriteriaValue(1500, 'mortgageAmount')).toBe('$1,500');
    });

    it('should handle zero and negative currency values', () => {
      expect(formatCriteriaValue(0, 'income')).toBe('$0');
      expect(formatCriteriaValue(-500, 'income')).toBe('-$500');
    });

    it('should format large currency values', () => {
      expect(formatCriteriaValue(1000000, 'assets')).toBe('$1,000,000');
    });
  });

  describe('percentage formatting', () => {
    it('should format percentage values', () => {
      expect(formatCriteriaValue(50, 'percentage')).toBe('50%');
      expect(formatCriteriaValue(25.5, 'rate')).toBe('25.5%');
    });
  });

  describe('age formatting', () => {
    it('should format age values with years', () => {
      expect(formatCriteriaValue(25, 'age')).toBe('25 years');
      expect(formatCriteriaValue(65, 'ageMinimum')).toBe('65 years');
    });
  });

  describe('household size formatting', () => {
    it('should format household size with correct pluralization', () => {
      expect(formatCriteriaValue(1, 'householdSize')).toBe('1 person');
      expect(formatCriteriaValue(4, 'householdSize')).toBe('4 people');
    });
  });

  describe('generic number formatting', () => {
    it('should format numbers with commas', () => {
      expect(formatCriteriaValue(1000, 'someNumber')).toBe('1,000');
      expect(formatCriteriaValue(1234567, 'count')).toBe('1,234,567');
    });
  });

  describe('date formatting', () => {
    it('should format dates in readable format', () => {
      // Use explicit time to avoid timezone issues
      const date = new Date(2024, 0, 15); // January 15, 2024 in local time
      const formatted = formatCriteriaValue(date);
      expect(formatted).toContain('January');
      expect(formatted).toContain('2024');
      // Check that it contains a day number
      expect(/\d{1,2}/.test(formatted)).toBe(true);
    });
  });

  describe('array formatting', () => {
    it('should join array elements with commas', () => {
      expect(formatCriteriaValue(['a', 'b', 'c'])).toBe('a, b, c');
      expect(formatCriteriaValue([1, 2, 3])).toBe('1, 2, 3');
    });
  });

  describe('string values', () => {
    it('should return strings as-is', () => {
      expect(formatCriteriaValue('test string')).toBe('test string');
      expect(formatCriteriaValue('California')).toBe('California');
    });
  });
});

describe('formatThreshold', () => {
  it('should use the same formatting as formatCriteriaValue', () => {
    expect(formatThreshold(1000, 'income')).toBe('$1,000');
    expect(formatThreshold(65, 'age')).toBe('65 years');
    expect(formatThreshold(true)).toBe('Yes');
  });
});

describe('formatComparison', () => {
  describe('eligible results', () => {
    it('should show value within limit for met criteria', () => {
      const result = formatComparison(2000, 3000, 'householdIncome', true, true);
      expect(result).toBe('$2,000 (within limit of $3,000)');
    });

    it('should handle age comparisons', () => {
      const result = formatComparison(30, 18, 'age', true, true);
      expect(result).toBe('30 years (within limit of 18 years)');
    });
  });

  describe('ineligible income results', () => {
    it('should show income exceeds limit', () => {
      const result = formatComparison(4000, 3000, 'householdIncome', false, false);
      expect(result).toBe('$4,000 exceeds limit of $3,000');
    });

    it('should handle monthly income', () => {
      const result = formatComparison(5000, 4000, 'monthlyIncome', false, false);
      expect(result).toBe('$5,000 exceeds limit of $4,000');
    });
  });

  describe('ineligible age results', () => {
    it('should show age below minimum', () => {
      const result = formatComparison(16, 18, 'age', false, false);
      expect(result).toBe('16 years is below minimum of 18 years');
    });

    it('should show age exceeds maximum', () => {
      const result = formatComparison(70, 65, 'ageMaximum', false, false);
      expect(result).toBe('70 years exceeds maximum of 65 years');
    });
  });

  describe('ineligible asset results', () => {
    it('should show assets exceed limit', () => {
      const result = formatComparison(10000, 5000, 'assets', false, false);
      expect(result).toBe('$10,000 exceeds limit of $5,000');
    });

    it('should handle resource limits', () => {
      const result = formatComparison(8000, 6000, 'liquidResources', false, false);
      expect(result).toBe('$8,000 exceeds limit of $6,000');
    });
  });

  describe('generic comparisons', () => {
    it('should show generic does not meet for unknown fields', () => {
      const result = formatComparison(100, 200, 'unknownField', false, false);
      expect(result).toBe('100 does not meet requirement of 200');
    });

    it('should handle mixed eligibility states', () => {
      const result = formatComparison(100, 200, 'someField', true, false);
      expect(result).toBe('100 vs 200');
    });
  });

  describe('non-numeric values', () => {
    it('should format boolean comparisons', () => {
      const result = formatComparison(true, true, 'isCitizen', true, true);
      expect(result).toBe('Yes (within limit of Yes)');
    });

    it('should format string comparisons', () => {
      const result = formatComparison('California', 'California', 'state', true, true);
      expect(result).toBe('California (within limit of California)');
    });
  });
});

