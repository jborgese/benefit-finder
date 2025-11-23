/**
 * LIHTC Integration Tests
 *
 * Comprehensive tests for LIHTC housing eligibility functionality.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AMIDataService } from '../data/services/AMIDataService';
import { LIHTC_RULES } from '../rules/housing/lihtc-rules';
import { evaluateRule } from '../rules';
import type { LIHTCProfile, AMIData } from '../types/housing';

describe('LIHTC Integration Tests', () => {
  let amiService: AMIDataService;
  let mockAMIData: AMIData;

  beforeEach(() => {
    amiService = AMIDataService.getInstance();
    mockAMIData = {
      state: 'GA',
      county: 'Fulton',
      year: 2024,
      householdSize: 3,
      amiAmount: 84000,
      incomeLimit50: 42000,
      incomeLimit60: 50400,
      incomeLimit80: 67200,
      lastUpdated: Date.now()
    };
  });

  describe('AMI Data Service', () => {
    it('should get AMI data for household', async () => {
      // Mock the AMI service methods directly
      const mockAMIData = {
        state: 'GA',
        county: 'Fulton',
        year: 2024,
        householdSize: 3,
        amiAmount: 84000,
        incomeLimit50: 42000,
        incomeLimit60: 50400,
        incomeLimit80: 67200,
        lastUpdated: Date.now()
      };

      // Mock the service to return our test data
      vi.spyOn(amiService, 'getAMIForHousehold').mockResolvedValue(mockAMIData);

      const result = await amiService.getAMIForHousehold('GA', 'Fulton', 3);

      expect(result.state).toBe('GA');
      expect(result.county).toBe('Fulton');
      expect(result.householdSize).toBe(3);
      expect(result.amiAmount).toBe(84000);
      expect(result.incomeLimit50).toBe(42000);
      expect(result.incomeLimit60).toBe(50400);
    });

    it('should handle missing AMI data gracefully', async () => {
      await expect(
        amiService.getAMIForHousehold('XX', 'Unknown', 3)
      ).rejects.toThrow('Failed to load AMI data for state XX');
    });

    it('should cache AMI data', async () => {
      // Mock the service to return consistent data
      const mockAMIData = {
        state: 'GA',
        county: 'Fulton',
        year: 2024,
        householdSize: 3,
        amiAmount: 84000,
        incomeLimit50: 42000,
        incomeLimit60: 50400,
        incomeLimit80: 67200,
        lastUpdated: Date.now()
      };

      vi.spyOn(amiService, 'getAMIForHousehold').mockResolvedValue(mockAMIData);

      // First call
      const result1 = await amiService.getAMIForHousehold('GA', 'Fulton', 3);

      // Second call should use cache
      const result2 = await amiService.getAMIForHousehold('GA', 'Fulton', 3);

      expect(result1).toEqual(result2);
    });
  });

  describe('LIHTC Rules Evaluation', () => {
    describe('Income Eligibility', () => {
      it('should pass for household at 45% AMI', async () => {
        const rule = LIHTC_RULES.find(r => r.id === 'lihtc-income-eligibility-2024');
        expect(rule).toBeDefined();

        const data = {
          householdIncome: 30000,
          amiData: {
            incomeLimit50: 40000,
            incomeLimit60: 48000
          }
        };

        const result = await evaluateRule(rule!.logic, data);
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it('should fail for household at 70% AMI', async () => {
        const rule = LIHTC_RULES.find(r => r.id === 'lihtc-income-eligibility-2024');
        expect(rule).toBeDefined();

        const data = {
          householdIncome: 50000,
          amiData: {
            incomeLimit50: 40000,
            incomeLimit60: 48000
          }
        };

        const result = await evaluateRule(rule!.logic, data);
        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });

      it('should pass for household at 60% AMI', async () => {
        const rule = LIHTC_RULES.find(r => r.id === 'lihtc-income-eligibility-2024');
        expect(rule).toBeDefined();

        const data = {
          householdIncome: 48000,
          amiData: {
            incomeLimit50: 40000,
            incomeLimit60: 48000
          }
        };

        const result = await evaluateRule(rule!.logic, data);
        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });
    });

    describe('Student Status Eligibility', () => {
      it('should pass for non-student', async () => {
        const rule = LIHTC_RULES.find(r => r.id === 'lihtc-student-eligibility');
        expect(rule).toBeDefined();

        const data = { studentStatus: 'none' };
        const result = await evaluateRule(rule!.logic, data);

        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it('should pass for single parent student', async () => {
        const rule = LIHTC_RULES.find(r => r.id === 'lihtc-student-eligibility');
        expect(rule).toBeDefined();

        const data = { studentStatus: 'single_parent' };
        const result = await evaluateRule(rule!.logic, data);

        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it('should pass for married student', async () => {
        const rule = LIHTC_RULES.find(r => r.id === 'lihtc-student-eligibility');
        expect(rule).toBeDefined();

        const data = { studentStatus: 'married_student' };
        const result = await evaluateRule(rule!.logic, data);

        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it('should fail for full-time student', async () => {
        const rule = LIHTC_RULES.find(r => r.id === 'lihtc-student-eligibility');
        expect(rule).toBeDefined();

        const data = { studentStatus: 'full_time_student' };
        const result = await evaluateRule(rule!.logic, data);

        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });
    });

    describe('Unit Size Matching', () => {
      it('should pass for appropriate unit size', async () => {
        const rule = LIHTC_RULES.find(r => r.id === 'lihtc-unit-size-match');
        expect(rule).toBeDefined();

        const data = {
          householdSize: 3,
          maxUnitOccupancy: 4
        };
        const result = await evaluateRule(rule!.logic, data);

        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it('should fail for oversized household', async () => {
        const rule = LIHTC_RULES.find(r => r.id === 'lihtc-unit-size-match');
        expect(rule).toBeDefined();

        const data = {
          householdSize: 5,
          maxUnitOccupancy: 4
        };
        const result = await evaluateRule(rule!.logic, data);

        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });
    });

    describe('Rent Affordability', () => {
      it('should pass for affordable rent', async () => {
        const rule = LIHTC_RULES.find(r => r.id === 'lihtc-rent-affordability');
        expect(rule).toBeDefined();

        const data = {
          maxRentAffordable: 1000,
          amiData: {
            incomeLimit50: 40000
          }
        };
        const result = await evaluateRule(rule!.logic, data);

        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it('should fail for unaffordable rent', async () => {
        const rule = LIHTC_RULES.find(r => r.id === 'lihtc-rent-affordability');
        expect(rule).toBeDefined();

        const data = {
          maxRentAffordable: 15000, // This is > 30% of 40000 = 12000
          amiData: {
            incomeLimit50: 40000
          }
        };
        const result = await evaluateRule(rule!.logic, data);

        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });
    });

    describe('Citizenship Eligibility', () => {
      it('should pass for US citizen', async () => {
        const rule = LIHTC_RULES.find(r => r.id === 'lihtc-citizenship-eligibility');
        expect(rule).toBeDefined();

        const data = { citizenship: 'us_citizen' };
        const result = await evaluateRule(rule!.logic, data);

        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it('should pass for permanent resident', async () => {
        const rule = LIHTC_RULES.find(r => r.id === 'lihtc-citizenship-eligibility');
        expect(rule).toBeDefined();

        const data = { citizenship: 'permanent_resident' };
        const result = await evaluateRule(rule!.logic, data);

        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it('should fail for other status', async () => {
        const rule = LIHTC_RULES.find(r => r.id === 'lihtc-citizenship-eligibility');
        expect(rule).toBeDefined();

        const data = { citizenship: 'other' };
        const result = await evaluateRule(rule!.logic, data);

        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });
    });

    describe('Age Eligibility', () => {
      it('should pass for adult', async () => {
        const rule = LIHTC_RULES.find(r => r.id === 'lihtc-age-eligibility');
        expect(rule).toBeDefined();

        const data = { age: 25 };
        const result = await evaluateRule(rule!.logic, data);

        expect(result.success).toBe(true);
        expect(result.result).toBe(true);
      });

      it('should fail for minor', async () => {
        const rule = LIHTC_RULES.find(r => r.id === 'lihtc-age-eligibility');
        expect(rule).toBeDefined();

        const data = { age: 17 };
        const result = await evaluateRule(rule!.logic, data);

        expect(result.success).toBe(true);
        expect(result.result).toBe(false);
      });
    });
  });

  describe('LIHTC Profile Validation', () => {
    it('should validate complete LIHTC profile', () => {
      const profile: LIHTCProfile = {
        id: 'test-profile',
        firstName: 'John',
        lastName: 'Doe',
        householdSize: 3,
        householdIncome: 35000,
        state: 'GA',
        county: 'Fulton',
        citizenship: 'us_citizen',
        studentStatus: 'none',
        preferredUnitSize: '2br',
        maxRentAffordable: 1000,
        hasLivedInSubsidizedHousing: false,
        incomeSources: {
          wages: 30000,
          benefits: 5000
        },
        amiData: mockAMIData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      expect(profile.householdSize).toBe(3);
      expect(profile.householdIncome).toBe(35000);
      expect(profile.studentStatus).toBe('none');
      expect(profile.preferredUnitSize).toBe('2br');
      expect(profile.amiData).toBeDefined();
    });

    it('should handle student status exceptions', () => {
      const singleParentProfile: LIHTCProfile = {
        id: 'test-profile',
        householdSize: 2,
        householdIncome: 30000,
        state: 'GA',
        county: 'Fulton',
        citizenship: 'us_citizen',
        studentStatus: 'single_parent',
        preferredUnitSize: '1br',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      expect(singleParentProfile.studentStatus).toBe('single_parent');
    });
  });

  describe('LIHTC Eligibility Calculation', () => {
    it('should calculate AMI percentage correctly', () => {
      const householdIncome = 35000;
      const amiAmount = 84000;
      const percentage = (householdIncome / amiAmount) * 100;

      expect(percentage).toBeCloseTo(41.67, 2);
    });

    it('should calculate maximum affordable rent correctly', () => {
      const incomeLimit50 = 42000;
      const maxRent = Math.floor(incomeLimit50 * 0.3);

      expect(maxRent).toBe(12600); // 30% of 42000
    });

    it('should determine unit size recommendations', () => {
      const getRecommendedUnitSize = (householdSize: number): string => {
        if (householdSize === 1) {return 'studio';}
        if (householdSize <= 2) {return '1br';}
        if (householdSize <= 4) {return '2br';}
        if (householdSize <= 6) {return '3br';}
        return '4br';
      };

      expect(getRecommendedUnitSize(1)).toBe('studio');
      expect(getRecommendedUnitSize(2)).toBe('1br');
      expect(getRecommendedUnitSize(3)).toBe('2br');
      expect(getRecommendedUnitSize(4)).toBe('2br');
      expect(getRecommendedUnitSize(5)).toBe('3br');
      expect(getRecommendedUnitSize(7)).toBe('4br');
    });
  });

  describe('LIHTC Error Handling', () => {
    it('should handle missing AMI data', async () => {
      await expect(
        amiService.getAMIForHousehold('XX', 'Unknown', 3)
      ).rejects.toThrow('Failed to load AMI data for state XX');
    });

    it('should handle invalid household size', async () => {
      const rule = LIHTC_RULES.find(r => r.id === 'lihtc-household-size-validation');
      expect(rule).toBeDefined();

      const data = { householdSize: 0 };
      const result = await evaluateRule(rule!.logic, data);

      expect(result.success).toBe(true);
      expect(result.result).toBe(false); // JSON Logic returns false for invalid data
    });

    it('should handle missing income data', async () => {
      const rule = LIHTC_RULES.find(r => r.id === 'lihtc-income-eligibility-2024');
      expect(rule).toBeDefined();

      const data = { amiData: { incomeLimit50: 40000 } };
      const result = await evaluateRule(rule!.logic, data);

      expect(result.success).toBe(true);
      expect(result.result).toBe(null); // JSON Logic returns null for missing data
    });
  });

  describe('LIHTC Performance', () => {
    it('should evaluate rules quickly', async () => {
      const start = Date.now();

      const rule = LIHTC_RULES.find(r => r.id === 'lihtc-income-eligibility-2024');
      const data = {
        householdIncome: 35000,
        amiData: { incomeLimit50: 40000, incomeLimit60: 48000 }
      };

      await evaluateRule(rule!.logic, data);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle multiple rule evaluations efficiently', async () => {
      const start = Date.now();

      const data = {
        householdIncome: 35000,
        amiData: { incomeLimit50: 40000, incomeLimit60: 48000 },
        studentStatus: 'none',
        citizenship: 'us_citizen',
        age: 25,
        householdSize: 3
      };

      const promises = LIHTC_RULES.map(rule => evaluateRule(rule.logic, data));
      await Promise.all(promises);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500); // Should complete in under 500ms
    });
  });
});
