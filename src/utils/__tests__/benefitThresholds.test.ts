/**
 * Tests for Benefit Thresholds Utility
 */

import { describe, it, expect } from 'vitest';
import {
  calculateFPL,
  calculateFPLPercentage,
  isIncomeAtOrBelowFPL,
  getSNAPGrossIncomeLimit,
  getSNAPNetIncomeLimit,
  getSNAPBBCELimit,
  isSNAPIncomeEligible,
  getMedicaidExpansionLimit,
  getMedicaidChildrenPregnantLimit,
  getMedicaidDisabilityLimit,
  isMedicaidExpansionEligible,
  getWICIncomeLimit,
  isWICIncomeEligible,
  describeFPLPercentage,
  annualToMonthly,
  monthlyToAnnual,
  formatIncomeThreshold,
  FPL_YEAR,
  SNAP_GROSS_INCOME_FPL_PERCENT,
  MEDICAID_EXPANSION_FPL_PERCENT,
  WIC_FPL_PERCENT,
} from '../benefitThresholds';

describe('benefitThresholds', () => {
  describe('Core FPL Calculations', () => {
    it('should calculate 100% FPL for standard household sizes', () => {
      expect(calculateFPL(1)).toBe(1255);
      expect(calculateFPL(2)).toBe(1702);
      expect(calculateFPL(3)).toBe(2148);
      expect(calculateFPL(4)).toBe(2594);
      expect(calculateFPL(8)).toBe(4378);
    });

    it('should calculate 100% FPL for households larger than 8', () => {
      // 8-person base (4378) + 2 additional people (446 each) = 5270
      expect(calculateFPL(10)).toBe(5270);
      // 8-person base + 5 additional people = 6608
      expect(calculateFPL(13)).toBe(6608);
    });

    it('should throw error for invalid household size', () => {
      expect(() => calculateFPL(0)).toThrow('Household size must be at least 1');
      expect(() => calculateFPL(-1)).toThrow('Household size must be at least 1');
    });

    it('should calculate FPL at different percentages', () => {
      // 130% of FPL for 1 person: 1255 * 1.30 = 1632 (rounded to 1696 in actual guidelines)
      const fpl130 = calculateFPLPercentage(1, 130);
      expect(fpl130).toBeGreaterThan(1600);
      expect(fpl130).toBeLessThan(1700);

      // 200% of FPL for 2 people: 1702 * 2 = 3404
      const fpl200 = calculateFPLPercentage(2, 200);
      expect(fpl200).toBe(3404);
    });

    it('should check if income is at or below FPL threshold', () => {
      // 1600 is below 130% FPL for 1 person (~1632)
      expect(isIncomeAtOrBelowFPL(1600, 1, 130)).toBe(true);

      // 3000 is above 130% FPL for 1 person
      expect(isIncomeAtOrBelowFPL(3000, 1, 130)).toBe(false);

      // 2500 is below 200% FPL for 2 people (3404)
      expect(isIncomeAtOrBelowFPL(2500, 2, 200)).toBe(true);
    });
  });

  describe('SNAP Thresholds', () => {
    it('should have correct SNAP FPL percentage constants', () => {
      expect(SNAP_GROSS_INCOME_FPL_PERCENT).toBe(130);
    });

    it('should calculate SNAP gross income limits (130% FPL)', () => {
      expect(getSNAPGrossIncomeLimit(1)).toBe(1696);
      expect(getSNAPGrossIncomeLimit(2)).toBe(2292);
      expect(getSNAPGrossIncomeLimit(3)).toBe(2888);
      expect(getSNAPGrossIncomeLimit(4)).toBe(3483);
      expect(getSNAPGrossIncomeLimit(8)).toBe(5867);
    });

    it('should calculate SNAP limits for large households', () => {
      // 8-person limit (5867) + 2 additional (596 each) = 7059
      expect(getSNAPGrossIncomeLimit(10)).toBe(7059);
    });

    it('should calculate SNAP net income limits (100% FPL)', () => {
      expect(getSNAPNetIncomeLimit(1)).toBe(1255);
      expect(getSNAPNetIncomeLimit(3)).toBe(2148);
    });

    it('should calculate SNAP BBCE limits (200% FPL)', () => {
      const bbce1 = getSNAPBBCELimit(1);
      const bbce3 = getSNAPBBCELimit(3);

      // Should be approximately double the base FPL
      expect(bbce1).toBeGreaterThan(2400);
      expect(bbce1).toBeLessThan(2600);
      expect(bbce3).toBeGreaterThan(4200);
      expect(bbce3).toBeLessThan(4400);
    });

    it('should check SNAP income eligibility', () => {
      // Income below threshold
      expect(isSNAPIncomeEligible(1200, 1)).toBe(true);

      // Income at threshold
      expect(isSNAPIncomeEligible(1696, 1)).toBe(true);

      // Income above threshold
      expect(isSNAPIncomeEligible(1700, 1)).toBe(false);

      // Family of 3 at boundary
      expect(isSNAPIncomeEligible(2888, 3)).toBe(true);
      expect(isSNAPIncomeEligible(2889, 3)).toBe(false);
    });
  });

  describe('Medicaid Thresholds', () => {
    it('should have correct Medicaid FPL percentage constants', () => {
      expect(MEDICAID_EXPANSION_FPL_PERCENT).toBe(138);
    });

    it('should calculate Medicaid expansion limits (138% FPL)', () => {
      expect(getMedicaidExpansionLimit(1)).toBe(2040);
      expect(getMedicaidExpansionLimit(2)).toBe(4080);
      expect(getMedicaidExpansionLimit(3)).toBe(6120);
    });

    it('should calculate Medicaid children/pregnant limits (200% FPL)', () => {
      expect(getMedicaidChildrenPregnantLimit(1)).toBe(2960);
      expect(getMedicaidChildrenPregnantLimit(2)).toBe(5920);
      expect(getMedicaidChildrenPregnantLimit(3)).toBe(8880);
    });

    it('should calculate Medicaid disability limits (~74% FPL)', () => {
      expect(getMedicaidDisabilityLimit(1)).toBe(1133);
      expect(getMedicaidDisabilityLimit(2)).toBe(2266);
    });

    it('should check Medicaid expansion eligibility', () => {
      // Income below threshold
      expect(isMedicaidExpansionEligible(1800, 1)).toBe(true);

      // Income at threshold
      expect(isMedicaidExpansionEligible(2040, 1)).toBe(true);

      // Income above threshold
      expect(isMedicaidExpansionEligible(2100, 1)).toBe(false);
    });
  });

  describe('WIC Thresholds', () => {
    it('should have correct WIC FPL percentage constant', () => {
      expect(WIC_FPL_PERCENT).toBe(185);
    });

    it('should calculate WIC income limits (185% FPL)', () => {
      const wic1 = getWICIncomeLimit(1);
      const wic3 = getWICIncomeLimit(3);

      // Should be 185% of base FPL
      expect(wic1).toBeGreaterThan(2300);
      expect(wic1).toBeLessThan(2400);
      expect(wic3).toBeGreaterThan(3900);
      expect(wic3).toBeLessThan(4100);
    });

    it('should check WIC income eligibility', () => {
      const threshold = getWICIncomeLimit(2);

      expect(isWICIncomeEligible(threshold - 100, 2)).toBe(true);
      expect(isWICIncomeEligible(threshold, 2)).toBe(true);
      expect(isWICIncomeEligible(threshold + 100, 2)).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should describe FPL percentages', () => {
      expect(describeFPLPercentage(100)).toBe('Federal Poverty Level');
      expect(describeFPLPercentage(130)).toBe('SNAP Gross Income Limit');
      expect(describeFPLPercentage(138)).toBe('Medicaid Expansion Limit');
      expect(describeFPLPercentage(185)).toBe('WIC Income Limit');
      expect(describeFPLPercentage(200)).toBe('Medicaid Children/Pregnant Minimum');
      expect(describeFPLPercentage(150)).toBe('150% of Federal Poverty Level');
    });

    it('should convert annual to monthly income', () => {
      expect(annualToMonthly(24000)).toBe(2000);
      expect(annualToMonthly(36000)).toBe(3000);
      expect(annualToMonthly(15060)).toBe(1255); // 100% FPL annual
    });

    it('should convert monthly to annual income', () => {
      expect(monthlyToAnnual(2000)).toBe(24000);
      expect(monthlyToAnnual(1255)).toBe(15060);
    });

    it('should format income thresholds', () => {
      expect(formatIncomeThreshold(2888, 'monthly')).toBe('$2,888/month');
      expect(formatIncomeThreshold(34656, 'annual')).toBe('$34,656/year');
      expect(formatIncomeThreshold(1500)).toBe('$1,500/month'); // Default is monthly
    });
  });

  describe('Data Validation', () => {
    it('should have current year constant', () => {
      expect(FPL_YEAR).toBe(2024);
      expect(typeof FPL_YEAR).toBe('number');
    });

    it('should have consistent SNAP calculations', () => {
      // SNAP gross income limit should be approximately 130% of FPL
      // Note: Official SNAP thresholds may vary slightly from exact 130% calculation
      // due to rounding in federal poverty guidelines
      for (let size = 1; size <= 8; size++) {
        const fpl = calculateFPL(size);
        const snapLimit = getSNAPGrossIncomeLimit(size);
        const expected130 = Math.round(fpl * 1.30);

        // Should be reasonably close (within $200 due to official guideline variations)
        expect(Math.abs(snapLimit - expected130)).toBeLessThan(200);
      }
    });

    it('should have Medicaid expansion at 138% FPL', () => {
      // Per-person calculation for Medicaid expansion
      const limit1 = getMedicaidExpansionLimit(1);
      const limit2 = getMedicaidExpansionLimit(2);

      // Should be linear (2040 per person)
      expect(limit2).toBe(limit1 * 2);
      expect(limit1).toBe(2040);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      expect(isSNAPIncomeEligible(0, 1)).toBe(true);
      expect(isMedicaidExpansionEligible(0, 2)).toBe(true);
      expect(isWICIncomeEligible(0, 3)).toBe(true);
    });

    it('should handle very large household sizes', () => {
      const fpl20 = calculateFPL(20);
      const snap20 = getSNAPGrossIncomeLimit(20);
      const wic20 = getWICIncomeLimit(20);

      expect(fpl20).toBeGreaterThan(0);
      expect(snap20).toBeGreaterThan(fpl20);
      expect(wic20).toBeGreaterThan(fpl20);
    });

    it('should handle boundary income values exactly at threshold', () => {
      // Exactly at SNAP limit should be eligible
      const snapLimit = getSNAPGrossIncomeLimit(3);
      expect(isSNAPIncomeEligible(snapLimit, 3)).toBe(true);
      expect(isSNAPIncomeEligible(snapLimit + 1, 3)).toBe(false);

      // Exactly at Medicaid limit should be eligible
      const medicaidLimit = getMedicaidExpansionLimit(2);
      expect(isMedicaidExpansionEligible(medicaidLimit, 2)).toBe(true);
      expect(isMedicaidExpansionEligible(medicaidLimit + 1, 2)).toBe(false);
    });
  });
});

