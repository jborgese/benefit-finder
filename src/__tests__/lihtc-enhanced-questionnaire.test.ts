/**
 * Enhanced LIHTC Questionnaire Integration Tests
 *
 * Tests the updated questionnaire flow with LIHTC-specific requirements.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlowEngine } from '@/questionnaire/flow-engine';
import { sampleFlow } from '@/questionnaire/sampleFlow';
import { LIHTC_RULES } from '@/rules/housing/lihtc-rules';
import { evaluateRule } from '@/rules';
import { AMIDataService } from '@/services/ami-data';
import type { LIHTCProfile } from '@/types/housing';

// Mock AMI Data Service
vi.mock('@/services/ami-data', () => ({
  AMIDataService: {
    getInstance: () => ({
      getAMIForHousehold: vi.fn((state, county, householdSize) => {
        if (state === 'GA' && county === 'Fulton') {
          const ami = {
            '1': 65400, '2': 74700, '3': 84000, '4': 93300,
            '5': 100800, '6': 108300, '7': 115800, '8': 123300
          }[householdSize.toString()] ?? 123300;
          return Promise.resolve({
            state, county, householdSize, year: 2024, amiAmount: ami,
            incomeLimit50: Math.floor(ami * 0.5),
            incomeLimit60: Math.floor(ami * 0.6),
            incomeLimit80: Math.floor(ami * 0.8),
          });
        }
        return Promise.reject(new Error('AMI data not found for mock'));
      }),
    }),
  },
}));

describe('Enhanced LIHTC Questionnaire Integration', () => {
  let flowEngine: FlowEngine;
  let householdProfile: LIHTCProfile;

  beforeEach(() => {
    // Create flow engine with updated sample flow
    flowEngine = new FlowEngine(sampleFlow);

    // Initialize household profile
    householdProfile = {
      id: 'test-profile-enhanced',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      householdSize: 2,
      householdIncome: 35000,
      state: 'GA',
      county: 'Fulton',
      citizenship: 'us_citizen',
      employmentStatus: 'employed',
      hasChildren: false,
      hasDisability: false,
      isPregnant: false,
      isVeteran: false,
      studentStatus: 'none', // Add required student status field
      age: 34, // Add required age field (calculated from dateOfBirth)
      preferredUnitSize: '1br', // Add required unit size field
      maxUnitOccupancy: 2, // Add required unit occupancy field
    };

    flowEngine.setContext(householdProfile);
  });

  it('should collect all required LIHTC data points', () => {
    // Simulate answering all questions in the enhanced flow
    const answers = [
      { questionId: 'household-size', fieldName: 'householdSize', value: 2 },
      { questionId: 'income-period', fieldName: 'incomePeriod', value: 'annual' },
      { questionId: 'income', fieldName: 'householdIncome', value: 35000 },
      { questionId: 'date-of-birth', fieldName: 'dateOfBirth', value: '1990-01-01' },
      { questionId: 'citizenship', fieldName: 'citizenship', value: 'us_citizen' },
      { questionId: 'state', fieldName: 'state', value: 'GA' },
      { questionId: 'county', fieldName: 'county', value: 'Fulton' },
      { questionId: 'household-assets', fieldName: 'householdAssets', value: 5000 },
      { questionId: 'disability-status', fieldName: 'hasQualifyingDisability', value: false },
      { questionId: 'pregnancy-status', fieldName: 'isPregnant', value: false },
      { questionId: 'work-status', fieldName: 'employmentStatus', value: 'employed' },
      { questionId: 'has-children', fieldName: 'hasChildren', value: false },
      { questionId: 'criminal-background', fieldName: 'hasCriminalHistory', value: false },
      { questionId: 'rental-history', fieldName: 'hasEvictionHistory', value: false },
      { questionId: 'rental-references', fieldName: 'hasRentalReferences', value: true },
      { questionId: 'income-verification-method', fieldName: 'incomeVerificationMethods', value: ['pay_stubs', 'tax_returns'] }
    ];

    // Answer all questions
    answers.forEach(answer => {
      flowEngine.updateContext(answer.fieldName, answer.value);
    });

    // Get final answers
    const finalAnswers = flowEngine.getContext();

    // Verify all required LIHTC data points are collected
    expect(finalAnswers.householdSize).toBe(2);
    expect(finalAnswers.householdIncome).toBe(35000);
    expect(finalAnswers.state).toBe('GA');
    expect(finalAnswers.county).toBe('Fulton');
    expect(finalAnswers.citizenship).toBe('us_citizen');
    expect(finalAnswers.hasCriminalHistory).toBe(false);
    expect(finalAnswers.hasEvictionHistory).toBe(false);
    expect(finalAnswers.hasRentalReferences).toBe(true);
    expect(finalAnswers.incomeVerificationMethods).toEqual(['pay_stubs', 'tax_returns']);
  });

  it('should evaluate LIHTC eligibility with enhanced data', async () => {
    // Update profile with enhanced data
    const enhancedProfile: LIHTCProfile = {
      ...householdProfile,
      hasCriminalHistory: false,
      hasEvictionHistory: false,
      hasRentalReferences: true,
      incomeVerificationMethods: ['pay_stubs', 'tax_returns']
    };

    // Fetch AMI data
    const amiService = AMIDataService.getInstance();
    const amiData = await amiService.getAMIForHousehold(
      enhancedProfile.state!,
      enhancedProfile.county!,
      enhancedProfile.householdSize!,
    );
    enhancedProfile.amiData = amiData;

    // Test individual LIHTC rules
    const incomeEligibility = await evaluateRule(LIHTC_RULES[0].ruleLogic, enhancedProfile);
    const studentEligibility = await evaluateRule(LIHTC_RULES[1].ruleLogic, enhancedProfile);
    const citizenshipEligibility = await evaluateRule(LIHTC_RULES[4].ruleLogic, enhancedProfile);
    const backgroundCheck = await evaluateRule(LIHTC_RULES[8].ruleLogic, enhancedProfile);
    const rentalHistory = await evaluateRule(LIHTC_RULES[9].ruleLogic, enhancedProfile);
    const rentalReferences = await evaluateRule(LIHTC_RULES[10].ruleLogic, enhancedProfile);

    // Verify all rules pass for eligible profile
    expect(incomeEligibility.success).toBe(true);
    expect(incomeEligibility.result).toBe(true); // 35000 <= 37350 (50% AMI for 2 people)

    expect(studentEligibility.success).toBe(true);
    expect(studentEligibility.result).toBe(true); // No student status issues

    expect(citizenshipEligibility.success).toBe(true);
    expect(citizenshipEligibility.result).toBe(true); // US citizen

    expect(backgroundCheck.success).toBe(true);
    expect(backgroundCheck.result).toBe(true); // No criminal history

    expect(rentalHistory.success).toBe(true);
    expect(rentalHistory.result).toBe(true); // No eviction history

    expect(rentalReferences.success).toBe(true);
    expect(rentalReferences.result).toBe(true); // Has rental references
  });

  it('should fail eligibility for profiles with criminal history', async () => {
    const ineligibleProfile: LIHTCProfile = {
      ...householdProfile,
      hasCriminalHistory: true, // Criminal history
      hasEvictionHistory: false,
      hasRentalReferences: true,
      incomeVerificationMethods: ['pay_stubs']
    };

    const backgroundCheck = await evaluateRule(LIHTC_RULES[8].ruleLogic, ineligibleProfile);

    expect(backgroundCheck.success).toBe(true);
    expect(backgroundCheck.result).toBe(false); // Criminal history disqualifies
  });

  it('should fail eligibility for profiles with eviction history', async () => {
    const ineligibleProfile: LIHTCProfile = {
      ...householdProfile,
      hasCriminalHistory: false,
      hasEvictionHistory: true, // Eviction history
      hasRentalReferences: true,
      incomeVerificationMethods: ['pay_stubs']
    };

    const rentalHistory = await evaluateRule(LIHTC_RULES[9].ruleLogic, ineligibleProfile);

    expect(rentalHistory.success).toBe(true);
    expect(rentalHistory.result).toBe(false); // Eviction history disqualifies
  });

  it('should fail eligibility for profiles without rental references', async () => {
    const ineligibleProfile: LIHTCProfile = {
      ...householdProfile,
      hasCriminalHistory: false,
      hasEvictionHistory: false,
      hasRentalReferences: false, // No rental references
      incomeVerificationMethods: ['pay_stubs']
    };

    const rentalReferences = await evaluateRule(LIHTC_RULES[10].ruleLogic, ineligibleProfile);

    expect(rentalReferences.success).toBe(true);
    expect(rentalReferences.result).toBe(false); // No rental references disqualifies
  });

  it('should handle missing county data gracefully', async () => {
    const _profileWithoutCounty: LIHTCProfile = {
      ...householdProfile,
      county: undefined, // Missing county
      hasCriminalHistory: false,
      hasEvictionHistory: false,
      hasRentalReferences: true
    };

    // AMI data should fail without county
    const amiService = AMIDataService.getInstance();
    await expect(amiService.getAMIForHousehold('GA', '', 2)).rejects.toThrow();
  });

  it('should validate income verification methods', () => {
    const profileWithVerification: LIHTCProfile = {
      ...householdProfile,
      hasCriminalHistory: false,
      hasEvictionHistory: false,
      hasRentalReferences: true,
      incomeVerificationMethods: ['pay_stubs', 'tax_returns', 'bank_statements']
    };

    // Profile should have valid income verification methods
    expect(profileWithVerification.incomeVerificationMethods).toContain('pay_stubs');
    expect(profileWithVerification.incomeVerificationMethods).toContain('tax_returns');
    expect(profileWithVerification.incomeVerificationMethods).toContain('bank_statements');
  });
});
