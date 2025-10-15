/**
 * Tests for formatCriteriaDetails function
 */

import { describe, it, expect } from 'vitest';
import { formatCriteriaDetails } from '../utils/formatCriteriaDetails';

describe('formatCriteriaDetails', () => {
  describe('SNAP income display', () => {
    it('should display SNAP income limit for eligible household', () => {
      const criteriaResults = [
        {
          criterion: 'householdSize',
          met: true,
          value: 2,
        },
        {
          criterion: 'householdIncome',
          met: true,
          value: 1800,
        },
      ];

      const result = formatCriteriaDetails(criteriaResults, true, 'snap-federal');

      // Should include SNAP threshold information
      const incomeDetail = result.find(r => r.includes('monthly income'));
      expect(incomeDetail).toBeDefined();
      expect(incomeDetail).toContain('$1,800'); // User's income
      expect(incomeDetail).toContain('$2,292/month'); // SNAP limit for 2 people
      expect(incomeDetail).toContain('2 people');
      expect(incomeDetail).toContain('within SNAP limit');
    });

    it('should display SNAP income limit for ineligible household', () => {
      const criteriaResults = [
        {
          criterion: 'householdSize',
          met: true,
          value: 1,
        },
        {
          criterion: 'householdIncome',
          met: false,
          value: 2000,
          // Note: Even if there's a comparison, SNAP logic should take precedence
          comparison: '$2,000 exceeds the limit of $1,696',
          threshold: 1696,
        },
      ];

      const result = formatCriteriaDetails(criteriaResults, false, 'snap-federal');

      // Should show income exceeds limit using SNAP-specific formatting
      const incomeDetail = result.find(r => r.includes('monthly income'));
      expect(incomeDetail).toBeDefined();
      expect(incomeDetail).toContain('$2,000'); // User's income
      expect(incomeDetail).toContain('$1,696/month'); // SNAP limit for 1 person
      expect(incomeDetail).toContain('1 person');
      expect(incomeDetail).toContain('exceeds SNAP limit');

      // Household size should use generic formatting (not SNAP-specific)
      const sizeDetail = result.find(r => r.includes('household size'));
      expect(sizeDetail).toBeDefined();
      expect(sizeDetail).not.toContain('SNAP limit');
    });

    it('should display SNAP income limit for larger households', () => {
      const criteriaResults = [
        {
          criterion: 'householdSize',
          met: true,
          value: 4,
        },
        {
          criterion: 'householdIncome',
          met: true,
          value: 3200,
        },
      ];

      const result = formatCriteriaDetails(criteriaResults, true, 'snap-federal');

      const incomeDetail = result.find(r => r.includes('monthly income'));
      expect(incomeDetail).toBeDefined();
      expect(incomeDetail).toContain('$3,200');
      expect(incomeDetail).toContain('$3,483/month'); // SNAP limit for 4 people
      expect(incomeDetail).toContain('4 people');
    });

    it('should use correct SNAP thresholds for different household sizes', () => {
      // Test 2-person household with income just above limit
      const criteriaResults2 = [
        { criterion: 'householdSize', met: true, value: 2 },
        { criterion: 'householdIncome', met: false, value: 2400 }, // Above $2,292 limit
      ];

      const result2 = formatCriteriaDetails(criteriaResults2, false, 'snap-federal');
      const incomeDetail2 = result2.find(r => r.includes('monthly income'));
      expect(incomeDetail2).toContain('$2,400');
      expect(incomeDetail2).toContain('$2,292/month'); // Correct 2-person limit
      expect(incomeDetail2).toContain('exceeds SNAP limit');

      // Test 3-person household with income just below limit
      const criteriaResults3 = [
        { criterion: 'householdSize', met: true, value: 3 },
        { criterion: 'householdIncome', met: true, value: 2800 }, // Below $2,888 limit
      ];

      const result3 = formatCriteriaDetails(criteriaResults3, true, 'snap-federal');
      const incomeDetail3 = result3.find(r => r.includes('monthly income'));
      expect(incomeDetail3).toContain('$2,800');
      expect(incomeDetail3).toContain('$2,888/month'); // Correct 3-person limit
      expect(incomeDetail3).toContain('within SNAP limit');
    });

    it('should not display SNAP limits for non-SNAP programs', () => {
      const criteriaResults = [
        {
          criterion: 'householdSize',
          met: true,
          value: 2,
        },
        {
          criterion: 'householdIncome',
          met: true,
          value: 1800,
          threshold: 2500,
        },
      ];

      const result = formatCriteriaDetails(criteriaResults, true, 'medicaid-federal');

      // Should use generic threshold display, not SNAP-specific
      const incomeDetail = result.find(r => r.includes('monthly income'));
      expect(incomeDetail).toBeDefined();
      expect(incomeDetail).not.toContain('SNAP limit');
      expect(incomeDetail).toContain('within limit of $2,500');
    });

    it('should default to household size of 1 if not provided', () => {
      const criteriaResults = [
        {
          criterion: 'householdIncome',
          met: true,
          value: 1500,
        },
      ];

      const result = formatCriteriaDetails(criteriaResults, true, 'snap-federal');

      const incomeDetail = result.find(r => r.includes('monthly income'));
      expect(incomeDetail).toBeDefined();
      expect(incomeDetail).toContain('$1,696/month'); // Default to 1-person limit
      expect(incomeDetail).toContain('1 person');
    });
  });

  describe('general criteria formatting', () => {
    it('should format criteria with value and threshold', () => {
      const criteriaResults = [
        {
          criterion: 'age',
          met: true,
          value: 25,
          threshold: 18,
        },
      ];

      const result = formatCriteriaDetails(criteriaResults, true);

      expect(result).toHaveLength(1);
      expect(result[0]).toContain('Your age');
      expect(result[0]).toContain('25 years');
    });

    it('should handle empty criteria results', () => {
      const result = formatCriteriaDetails(undefined, true);
      expect(result).toEqual([]);

      const result2 = formatCriteriaDetails([], true);
      expect(result2).toEqual([]);
    });

    it('should format criteria with custom messages', () => {
      const criteriaResults = [
        {
          criterion: 'citizenship',
          met: false,
          message: 'Must be a U.S. citizen or qualified immigrant',
        },
      ];

      const result = formatCriteriaDetails(criteriaResults, false);

      expect(result).toHaveLength(1);
      expect(result[0]).toContain('Citizenship');
      expect(result[0]).toContain('Must be a U.S. citizen or qualified immigrant');
    });
  });
});
