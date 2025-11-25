/**
 * Tests for specificReasons utility
 *
 * Tests specific disqualification and maybe reasons for benefit programs
 */

import { describe, it, expect } from 'vitest';
import {
  getSpecificReasons,
  getMaybeReasons,
  getSpecificReasonsTitleKey,
  supportsSpecificReasons,
  type UserProfile,
} from '../specificReasons';

describe('specificReasons', () => {
  describe('getSpecificReasons', () => {
    describe('Status validation', () => {
      it('should return empty array for qualified status', () => {
        const profile: UserProfile = { citizenship: 'us_citizen' };
        const reasons = getSpecificReasons('wic-federal', 'qualified', profile);
        expect(reasons).toEqual([]);
      });

      it('should return empty array for maybe status', () => {
        const profile: UserProfile = { citizenship: 'us_citizen' };
        const reasons = getSpecificReasons('wic-federal', 'maybe', profile);
        expect(reasons).toEqual([]);
      });

      it('should return empty array when no user profile', () => {
        const reasons = getSpecificReasons('wic-federal', 'not-qualified');
        expect(reasons).toEqual([]);
      });

      it('should return empty array when user profile is undefined', () => {
        const reasons = getSpecificReasons('wic-federal', 'not-qualified', undefined);
        expect(reasons).toEqual([]);
      });
    });

    describe('WIC specific reasons', () => {
      it('should return not pregnant reason', () => {
        const profile: UserProfile = { isPregnant: false };
        const reasons = getSpecificReasons('wic-federal', 'not-qualified', profile);
        expect(reasons).toContain('You indicated you are not pregnant. WIC provides nutrition assistance for pregnant women, new mothers, and children under 5.');
      });

      it('should return no children reason', () => {
        const profile: UserProfile = { hasChildren: false };
        const reasons = getSpecificReasons('wic-federal', 'not-qualified', profile);
        expect(reasons).toContain('You indicated you don\'t have children under 5 years old. WIC serves pregnant women, new mothers, and children up to age 5.');
      });

      it('should return no WIC category reason when not pregnant and no children', () => {
        const profile: UserProfile = { isPregnant: false, hasChildren: false };
        const reasons = getSpecificReasons('wic-federal', 'not-qualified', profile);
        expect(reasons).toContain('You don\'t meet the WIC participant categories. WIC serves pregnant women, new mothers (up to 6 months postpartum), breastfeeding mothers (up to 1 year), and children under 5.');
      });

      it('should return income too high reason for WIC', () => {
        const profile: UserProfile = {
          householdIncome: 60000,
          householdSize: 1,
        };
        const reasons = getSpecificReasons('wic-federal', 'not-qualified', profile);
        expect(reasons).toContain('Your household income appears to be above the WIC income guidelines (185% of federal poverty level). WIC has strict income limits that vary by household size.');
      });

      it('should not return income reason when income per person is below threshold', () => {
        const profile: UserProfile = {
          householdIncome: 25000,
          householdSize: 1,
        };
        const reasons = getSpecificReasons('wic-federal', 'not-qualified', profile);
        expect(reasons.some(r => r.includes('income'))).toBe(false);
      });
    });

    describe('Medicaid specific reasons', () => {
      it('should return income too high reason', () => {
        const profile: UserProfile = {
          householdIncome: 50000,
          householdSize: 1,
        };
        const reasons = getSpecificReasons('medicaid-federal', 'not-qualified', profile);
        expect(reasons).toContain('Your household income appears to be above the Medicaid income guidelines. Medicaid income limits vary significantly by state and household size.');
      });

      it('should return no disability reason', () => {
        const profile: UserProfile = { hasDisability: false };
        const reasons = getSpecificReasons('medicaid-federal', 'not-qualified', profile);
        expect(reasons).toContain('You indicated you don\'t have a qualifying disability. Medicaid covers people with disabilities, but also serves children, pregnant women, and low-income adults in expansion states.');
      });

      it('should return age restriction reason', () => {
        const profile: UserProfile = { age: 30, isPregnant: false };
        const reasons = getSpecificReasons('medicaid-federal', 'not-qualified', profile);
        expect(reasons).toContain('You may not meet the age requirements for Medicaid. Medicaid typically covers children under 19, pregnant women, adults 65+, and people with disabilities. Some states have expanded coverage for adults 19-64.');
      });

      it('should not return age restriction for pregnant person', () => {
        const profile: UserProfile = { age: 30, isPregnant: true };
        const reasons = getSpecificReasons('medicaid-federal', 'not-qualified', profile);
        expect(reasons.some(r => r.includes('age requirements'))).toBe(false);
      });

      it('should return citizenship reason', () => {
        const profile: UserProfile = { citizenship: 'undocumented' };
        const reasons = getSpecificReasons('medicaid-federal', 'not-qualified', profile);
        expect(reasons).toContain('You indicated you are not a U.S. citizen or qualified immigrant. Medicaid requires U.S. citizenship or eligible immigration status.');
      });
    });

    describe('SNAP specific reasons', () => {
      it('should return income too high reason', () => {
        const profile: UserProfile = {
          householdIncome: 40000,
          householdSize: 1,
        };
        const reasons = getSpecificReasons('snap-federal', 'not-qualified', profile);
        expect(reasons).toContain('Your household income appears to be above the SNAP income guidelines (130% of federal poverty level). SNAP has strict income limits that vary by household size.');
      });

      it('should return employment status reason for retired', () => {
        const profile: UserProfile = { employmentStatus: 'retired' };
        const reasons = getSpecificReasons('snap-federal', 'not-qualified', profile);
        expect(reasons).toContain('Your employment status may not meet SNAP work requirements. Able-bodied adults without dependents (ABAWD) must work at least 20 hours per week or participate in work activities.');
      });

      it('should return employment status reason for student', () => {
        const profile: UserProfile = { employmentStatus: 'student' };
        const reasons = getSpecificReasons('snap-federal', 'not-qualified', profile);
        expect(reasons).toContain('Your employment status may not meet SNAP work requirements. Able-bodied adults without dependents (ABAWD) must work at least 20 hours per week or participate in work activities.');
      });

      it('should return citizenship reason', () => {
        const profile: UserProfile = { citizenship: 'tourist_visa' };
        const reasons = getSpecificReasons('snap-federal', 'not-qualified', profile);
        expect(reasons).toContain('You indicated you are not a U.S. citizen or qualified immigrant. SNAP requires U.S. citizenship or eligible immigration status.');
      });

      it('should return age restriction reason', () => {
        const profile: UserProfile = { age: 16, hasChildren: false };
        const reasons = getSpecificReasons('snap-federal', 'not-qualified', profile);
        expect(reasons).toContain('You may not meet the age requirements for SNAP. SNAP serves households with children or adults 18 and older.');
      });
    });

    describe('TANF specific reasons', () => {
      it('should return no children reason', () => {
        const profile: UserProfile = { hasChildren: false };
        const reasons = getSpecificReasons('tanf-federal', 'not-qualified', profile);
        expect(reasons).toContain('You indicated you don\'t have children under 18 years old. TANF provides cash assistance to families with dependent children.');
      });

      it('should return income too high reason', () => {
        const profile: UserProfile = {
          householdIncome: 30000,
          householdSize: 1,
        };
        const reasons = getSpecificReasons('tanf-federal', 'not-qualified', profile);
        expect(reasons).toContain('Your household income appears to be above the TANF income guidelines. TANF has very strict income limits that vary by state and household size.');
      });

      it('should return employment status reason', () => {
        const profile: UserProfile = { employmentStatus: 'retired' };
        const reasons = getSpecificReasons('tanf-federal', 'not-qualified', profile);
        expect(reasons).toContain('Your employment status may not meet TANF work requirements. TANF requires parents to participate in work activities or job search programs.');
      });

      it('should return citizenship reason', () => {
        const profile: UserProfile = { citizenship: 'work_visa' };
        const reasons = getSpecificReasons('tanf-federal', 'not-qualified', profile);
        expect(reasons).toContain('You indicated you are not a U.S. citizen or qualified immigrant. TANF requires U.S. citizenship or eligible immigration status.');
      });
    });

    describe('SSI specific reasons', () => {
      it('should return no disability reason', () => {
        const profile: UserProfile = { hasDisability: false };
        const reasons = getSpecificReasons('ssi-federal', 'not-qualified', profile);
        expect(reasons).toContain('You indicated you don\'t have a qualifying disability. SSI provides cash assistance to people with disabilities or those 65 and older.');
      });

      it('should return age restriction reason when no disability and under 65', () => {
        const profile: UserProfile = { hasDisability: false, age: 50 };
        const reasons = getSpecificReasons('ssi-federal', 'not-qualified', profile);
        expect(reasons).toContain('You may not meet the age requirements for SSI. SSI serves people with qualifying disabilities or those 65 and older.');
      });

      it('should return age restriction when disability undefined and no age', () => {
        const profile: UserProfile = {};
        const reasons = getSpecificReasons('ssi-federal', 'not-qualified', profile);
        expect(reasons).toContain('You may not meet the age requirements for SSI. SSI serves people with qualifying disabilities or those 65 and older.');
      });

      it('should return income too high reason', () => {
        const profile: UserProfile = {
          householdIncome: 25000,
          householdSize: 1,
        };
        const reasons = getSpecificReasons('ssi-federal', 'not-qualified', profile);
        expect(reasons).toContain('Your household income appears to be above the SSI income guidelines. SSI has very strict income and asset limits.');
      });

      it('should return citizenship reason', () => {
        const profile: UserProfile = { citizenship: 'student_visa' };
        const reasons = getSpecificReasons('ssi-federal', 'not-qualified', profile);
        expect(reasons).toContain('You indicated you are not a U.S. citizen or qualified immigrant. SSI requires U.S. citizenship or eligible immigration status.');
      });
    });

    describe('Section 8 specific reasons', () => {
      it('should return income too high reason', () => {
        const profile: UserProfile = {
          householdIncome: 50000,
          householdSize: 1,
        };
        const reasons = getSpecificReasons('section8-federal', 'not-qualified', profile);
        expect(reasons).toContain('Your household income appears to be above the Section 8 income guidelines (50% of area median income). Section 8 income limits vary significantly by location and household size.');
      });

      it('should return citizenship reason', () => {
        const profile: UserProfile = { citizenship: 'temporary_resident' };
        const reasons = getSpecificReasons('section8-federal', 'not-qualified', profile);
        expect(reasons).toContain('You indicated you are not a U.S. citizen or qualified immigrant. Section 8 requires U.S. citizenship or eligible immigration status.');
      });

      it('should return age restriction reason', () => {
        const profile: UserProfile = { age: 17, hasChildren: false };
        const reasons = getSpecificReasons('section8-federal', 'not-qualified', profile);
        expect(reasons).toContain('You may not meet the age requirements for Section 8. Section 8 serves households with adults 18 and older or families with children.');
      });
    });

    describe('LIHTC specific reasons', () => {
      it('should return income too high reason', () => {
        const profile: UserProfile = {
          householdIncome: 70000,
          householdSize: 1,
        };
        const reasons = getSpecificReasons('lihtc-federal', 'not-qualified', profile);
        expect(reasons).toContain('Your household income appears to be above the LIHTC income guidelines. LIHTC income limits vary significantly by area and household size.');
      });

      it('should return student status reason', () => {
        const profile: UserProfile = { employmentStatus: 'student' };
        const reasons = getSpecificReasons('lihtc-federal', 'not-qualified', profile);
        expect(reasons).toContain('You may be a full-time student, which can affect LIHTC eligibility. LIHTC has restrictions on full-time students in some properties.');
      });

      it('should return citizenship reason', () => {
        const profile: UserProfile = { citizenship: 'other' };
        const reasons = getSpecificReasons('lihtc-federal', 'not-qualified', profile);
        expect(reasons).toContain('You indicated you are not a U.S. citizen or qualified immigrant. LIHTC requires U.S. citizenship or eligible immigration status.');
      });

      it('should return age restriction reason', () => {
        const profile: UserProfile = { age: 16, hasChildren: false };
        const reasons = getSpecificReasons('lihtc-federal', 'not-qualified', profile);
        expect(reasons).toContain('You may not meet the age requirements for LIHTC housing. LIHTC serves households with adults 18 and older or families with children.');
      });
    });

    describe('Generic reasons', () => {
      it('should return generic citizenship reason for unknown program', () => {
        const profile: UserProfile = { citizenship: 'invalid_status' };
        const reasons = getSpecificReasons('unknown-program', 'not-qualified', profile);
        expect(reasons).toContain('You indicated you are not a U.S. citizen or qualified immigrant. Most benefit programs require U.S. citizenship or eligible immigration status.');
      });

      it('should return generic income too high reason', () => {
        const profile: UserProfile = {
          householdIncome: 60000,
          householdSize: 1,
        };
        const reasons = getSpecificReasons('unknown-program', 'not-qualified', profile);
        expect(reasons).toContain('Your household income appears to be above the program income guidelines. Income limits vary by program and household size.');
      });

      it('should not return generic citizenship for eligible status', () => {
        const profile: UserProfile = { citizenship: 'us_citizen' };
        const reasons = getSpecificReasons('unknown-program', 'not-qualified', profile);
        expect(reasons.some(r => r.includes('citizenship'))).toBe(false);
      });

      it('should not return generic citizenship for permanent resident', () => {
        const profile: UserProfile = { citizenship: 'permanent_resident' };
        const reasons = getSpecificReasons('unknown-program', 'not-qualified', profile);
        expect(reasons.some(r => r.includes('citizenship'))).toBe(false);
      });

      it('should not return generic citizenship for refugee', () => {
        const profile: UserProfile = { citizenship: 'refugee' };
        const reasons = getSpecificReasons('unknown-program', 'not-qualified', profile);
        expect(reasons.some(r => r.includes('citizenship'))).toBe(false);
      });

      it('should not return generic citizenship for asylee', () => {
        const profile: UserProfile = { citizenship: 'asylee' };
        const reasons = getSpecificReasons('unknown-program', 'not-qualified', profile);
        expect(reasons.some(r => r.includes('citizenship'))).toBe(false);
      });
    });

    describe('Fallback behavior', () => {
      it('should return generic fallback when no reasons match', () => {
        const profile: UserProfile = { citizenship: 'us_citizen' };
        const reasons = getSpecificReasons('unknown-program', 'not-qualified', profile);
        expect(reasons).toContain('You may not meet the specific eligibility requirements for this program');
      });

      it('should not return fallback when specific reasons exist', () => {
        const profile: UserProfile = { hasChildren: false };
        const reasons = getSpecificReasons('wic-federal', 'not-qualified', profile);
        expect(reasons).not.toContain('You may not meet the specific eligibility requirements for this program');
      });
    });

    describe('Edge cases', () => {
      it('should not return income reason when householdIncome is missing', () => {
        const profile: UserProfile = { householdSize: 2 };
        const reasons = getSpecificReasons('snap-federal', 'not-qualified', profile);
        expect(reasons.some(r => r.includes('income'))).toBe(false);
      });

      it('should not return income reason when householdSize is missing', () => {
        const profile: UserProfile = { householdIncome: 50000 };
        const reasons = getSpecificReasons('snap-federal', 'not-qualified', profile);
        expect(reasons.some(r => r.includes('income'))).toBe(false);
      });

      it('should handle empty profile', () => {
        const profile: UserProfile = {};
        const reasons = getSpecificReasons('wic-federal', 'not-qualified', profile);
        expect(reasons.length).toBeGreaterThan(0);
      });

      it('should prevent duplicate reasons between program and generic', () => {
        const profile: UserProfile = { citizenship: 'invalid' };
        const reasons = getSpecificReasons('medicaid-federal', 'not-qualified', profile);
        const citizenshipReasons = reasons.filter(r => r.includes('citizenship'));
        expect(citizenshipReasons.length).toBe(1);
      });
    });
  });

  describe('getMaybeReasons', () => {
    describe('Status validation', () => {
      it('should return empty array for qualified status', () => {
        const profile: UserProfile = { citizenship: 'us_citizen' };
        const reasons = getMaybeReasons('wic-federal', 'qualified', profile);
        expect(reasons).toEqual([]);
      });

      it('should return empty array for not-qualified status', () => {
        const profile: UserProfile = { citizenship: 'us_citizen' };
        const reasons = getMaybeReasons('wic-federal', 'not-qualified', profile);
        expect(reasons).toEqual([]);
      });

      it('should return empty array when no user profile', () => {
        const reasons = getMaybeReasons('wic-federal', 'maybe');
        expect(reasons).toEqual([]);
      });

      it('should return empty array when user profile is undefined', () => {
        const reasons = getMaybeReasons('wic-federal', 'maybe', undefined);
        expect(reasons).toEqual([]);
      });
    });

    describe('WIC maybe reasons', () => {
      it('should return pregnancy status clarification', () => {
        const profile: UserProfile = {};
        const reasons = getMaybeReasons('wic-federal', 'maybe', profile);
        expect(reasons).toContain('Clarify your pregnancy status - WIC serves pregnant women, new mothers (up to 6 months postpartum), and breastfeeding mothers (up to 1 year)');
      });

      it('should return children status clarification', () => {
        const profile: UserProfile = {};
        const reasons = getMaybeReasons('wic-federal', 'maybe', profile);
        expect(reasons).toContain('Clarify if you have children under 5 - WIC provides nutrition assistance for children up to age 5');
      });

      it('should return income verification when missing', () => {
        const profile: UserProfile = {};
        const reasons = getMaybeReasons('wic-federal', 'maybe', profile);
        expect(reasons).toContain('Provide detailed income verification - WIC has strict income guidelines (185% of federal poverty level) that vary by household size');
      });

      it('should always return nutritional risk assessment', () => {
        const profile: UserProfile = {
          isPregnant: true,
          householdIncome: 20000,
          householdSize: 2,
        };
        const reasons = getMaybeReasons('wic-federal', 'maybe', profile);
        expect(reasons).toContain('Complete nutritional risk assessment - WIC requires documented nutritional need assessed by a health professional');
      });

      it('should not return pregnancy clarification when defined', () => {
        const profile: UserProfile = { isPregnant: true };
        const reasons = getMaybeReasons('wic-federal', 'maybe', profile);
        expect(reasons.some(r => r.includes('Clarify your pregnancy'))).toBe(false);
      });

      it('should not return children clarification when defined', () => {
        const profile: UserProfile = { hasChildren: true };
        const reasons = getMaybeReasons('wic-federal', 'maybe', profile);
        expect(reasons.some(r => r.includes('Clarify if you have children'))).toBe(false);
      });
    });

    describe('Medicaid maybe reasons', () => {
      it('should return income verification', () => {
        const profile: UserProfile = {};
        const reasons = getMaybeReasons('medicaid-federal', 'maybe', profile);
        expect(reasons).toContain('Provide detailed income verification - Medicaid income limits vary significantly by state and household size');
      });

      it('should return disability status clarification', () => {
        const profile: UserProfile = {};
        const reasons = getMaybeReasons('medicaid-federal', 'maybe', profile);
        expect(reasons).toContain('Clarify disability status - Medicaid covers people with disabilities, children, pregnant women, and low-income adults in expansion states');
      });

      it('should return age verification when missing', () => {
        const profile: UserProfile = { householdIncome: 20000, householdSize: 2 };
        const reasons = getMaybeReasons('medicaid-federal', 'maybe', profile);
        expect(reasons).toContain('Verify age requirements - Medicaid has different rules for children (under 19), adults (19-64), and seniors (65+)');
      });

      it('should return state-specific information when state missing', () => {
        const profile: UserProfile = { age: 30 };
        const reasons = getMaybeReasons('medicaid-federal', 'maybe', profile);
        expect(reasons).toContain('Check state-specific Medicaid expansion - eligibility varies significantly by state, with some states covering adults 19-64');
      });

      it('should not return disability clarification when defined', () => {
        const profile: UserProfile = { hasDisability: true };
        const reasons = getMaybeReasons('medicaid-federal', 'maybe', profile);
        expect(reasons.some(r => r.includes('Clarify disability status'))).toBe(false);
      });
    });

    describe('SNAP maybe reasons', () => {
      it('should return income verification', () => {
        const profile: UserProfile = {};
        const reasons = getMaybeReasons('snap-federal', 'maybe', profile);
        expect(reasons).toContain('Provide detailed income verification - SNAP has strict income limits (130% of federal poverty level) that vary by household size');
      });

      it('should return work requirements clarification', () => {
        const profile: UserProfile = { householdIncome: 15000, householdSize: 1 };
        const reasons = getMaybeReasons('snap-federal', 'maybe', profile);
        expect(reasons).toContain('Clarify work status - SNAP has work requirements for able-bodied adults without dependents (ABAWD) who must work 20+ hours per week');
      });

      it('should always return expense deductions', () => {
        const profile: UserProfile = {
          householdIncome: 15000,
          householdSize: 1,
          employmentStatus: 'employed',
        };
        const reasons = getMaybeReasons('snap-federal', 'maybe', profile);
        expect(reasons).toContain('Document allowable expenses - SNAP considers housing, utilities, medical costs, and other deductions that can lower your countable income');
      });

      it('should return citizenship verification when missing', () => {
        const profile: UserProfile = { householdIncome: 15000, householdSize: 1 };
        const reasons = getMaybeReasons('snap-federal', 'maybe', profile);
        expect(reasons).toContain('Provide citizenship documentation - SNAP requires U.S. citizenship or qualified immigrant status for all household members');
      });

      it('should not return work requirements when employment status defined', () => {
        const profile: UserProfile = { employmentStatus: 'employed' };
        const reasons = getMaybeReasons('snap-federal', 'maybe', profile);
        expect(reasons.some(r => r.includes('Clarify work status'))).toBe(false);
      });
    });

    describe('TANF maybe reasons', () => {
      it('should return children verification', () => {
        const profile: UserProfile = {};
        const reasons = getMaybeReasons('tanf-federal', 'maybe', profile);
        expect(reasons).toContain('Provide children\'s birth certificates and Social Security numbers - TANF requires dependent children under 18');
      });

      it('should return income verification', () => {
        const profile: UserProfile = {};
        const reasons = getMaybeReasons('tanf-federal', 'maybe', profile);
        expect(reasons).toContain('Provide detailed income verification - TANF has very strict income limits that vary by state and household size');
      });

      it('should return work plan for unemployed', () => {
        const profile: UserProfile = { employmentStatus: 'unemployed' };
        const reasons = getMaybeReasons('tanf-federal', 'maybe', profile);
        expect(reasons).toContain('Develop work plan - TANF requires participation in work activities, job search, or education/training programs');
      });

      it('should always return time limits information', () => {
        const profile: UserProfile = {
          hasChildren: true,
          householdIncome: 10000,
          householdSize: 2,
        };
        const reasons = getMaybeReasons('tanf-federal', 'maybe', profile);
        expect(reasons).toContain('Check lifetime limits - TANF has 60-month lifetime limit in most states, with some exceptions for hardship cases');
      });

      it('should not return children verification when defined', () => {
        const profile: UserProfile = { hasChildren: true };
        const reasons = getMaybeReasons('tanf-federal', 'maybe', profile);
        expect(reasons.some(r => r.includes('children\'s birth certificates'))).toBe(false);
      });
    });

    describe('SSI maybe reasons', () => {
      it('should return disability documentation', () => {
        const profile: UserProfile = {};
        const reasons = getMaybeReasons('ssi-federal', 'maybe', profile);
        expect(reasons).toContain('Provide medical documentation of disability - SSI requires extensive medical evidence and professional assessments');
      });

      it('should return income verification', () => {
        const profile: UserProfile = {};
        const reasons = getMaybeReasons('ssi-federal', 'maybe', profile);
        expect(reasons).toContain('Provide detailed income and asset verification - SSI has very strict financial limits for both income and assets');
      });

      it('should return age verification when missing', () => {
        const profile: UserProfile = { householdIncome: 5000, householdSize: 1 };
        const reasons = getMaybeReasons('ssi-federal', 'maybe', profile);
        expect(reasons).toContain('Verify age requirements - SSI serves people 65 and older or those with qualifying disabilities');
      });

      it('should return work history when missing', () => {
        const profile: UserProfile = { age: 30 };
        const reasons = getMaybeReasons('ssi-federal', 'maybe', profile);
        expect(reasons).toContain('Provide work history - SSI considers work credits and employment history, but work history is not required for SSI');
      });

      it('should not return disability documentation when defined', () => {
        const profile: UserProfile = { hasDisability: true };
        const reasons = getMaybeReasons('ssi-federal', 'maybe', profile);
        expect(reasons.some(r => r.includes('medical documentation of disability'))).toBe(false);
      });
    });

    describe('Section 8 maybe reasons', () => {
      it('should return income verification', () => {
        const profile: UserProfile = {};
        const reasons = getMaybeReasons('section8-federal', 'maybe', profile);
        expect(reasons).toContain('Provide detailed income verification - Section 8 income limits are based on area median income');
      });

      it('should return family size verification', () => {
        const profile: UserProfile = { householdIncome: 20000 };
        const reasons = getMaybeReasons('section8-federal', 'maybe', profile);
        expect(reasons).toContain('Verify household size - Section 8 unit size depends on family composition');
      });

      it('should always return criminal background check', () => {
        const profile: UserProfile = {
          householdIncome: 20000,
          householdSize: 2,
        };
        const reasons = getMaybeReasons('section8-federal', 'maybe', profile);
        expect(reasons).toContain('Complete criminal background check - Section 8 requires clean criminal history');
      });

      it('should always return rental history', () => {
        const profile: UserProfile = {
          householdIncome: 20000,
          householdSize: 2,
        };
        const reasons = getMaybeReasons('section8-federal', 'maybe', profile);
        expect(reasons).toContain('Provide rental history and references - Section 8 requires good rental record');
      });
    });

    describe('LIHTC maybe reasons', () => {
      it('should return income verification', () => {
        const profile: UserProfile = {};
        const reasons = getMaybeReasons('lihtc-federal', 'maybe', profile);
        expect(reasons).toContain('Provide detailed income verification - LIHTC income limits vary by area and household size');
      });

      it('should return student status clarification', () => {
        const profile: UserProfile = { employmentStatus: 'student' };
        const reasons = getMaybeReasons('lihtc-federal', 'maybe', profile);
        expect(reasons).toContain('Clarify student status - LIHTC has restrictions on full-time students');
      });

      it('should return family composition verification', () => {
        const profile: UserProfile = { householdIncome: 30000 };
        const reasons = getMaybeReasons('lihtc-federal', 'maybe', profile);
        expect(reasons).toContain('Verify household composition - LIHTC unit size depends on family size and composition');
      });

      it('should always return waiting list information', () => {
        const profile: UserProfile = {
          householdIncome: 30000,
          householdSize: 2,
        };
        const reasons = getMaybeReasons('lihtc-federal', 'maybe', profile);
        expect(reasons).toContain('Get on waiting lists immediately - LIHTC properties have long waiting lists');
      });
    });

    describe('Fallback behavior', () => {
      it('should return generic fallback for unknown program', () => {
        const profile: UserProfile = { citizenship: 'us_citizen' };
        const reasons = getMaybeReasons('unknown-program', 'maybe', profile);
        expect(reasons).toContain('You may need to provide additional information or meet certain requirements');
      });

      it('should not return fallback when specific reasons exist', () => {
        const profile: UserProfile = {};
        const reasons = getMaybeReasons('wic-federal', 'maybe', profile);
        expect(reasons).not.toContain('You may need to provide additional information or meet certain requirements');
      });
    });
  });

  describe('getSpecificReasonsTitleKey', () => {
    it('should return correct title key for wic-federal', () => {
      const key = getSpecificReasonsTitleKey('wic-federal');
      expect(key).toBe('results.wic.specificReasons.title');
    });

    it('should return correct title key for medicaid-federal', () => {
      const key = getSpecificReasonsTitleKey('medicaid-federal');
      expect(key).toBe('results.medicaid.specificReasons.title');
    });

    it('should return correct title key for snap-federal', () => {
      const key = getSpecificReasonsTitleKey('snap-federal');
      expect(key).toBe('results.snap.specificReasons.title');
    });

    it('should return correct title key for tanf-federal', () => {
      const key = getSpecificReasonsTitleKey('tanf-federal');
      expect(key).toBe('results.tanf.specificReasons.title');
    });

    it('should return correct title key for ssi-federal', () => {
      const key = getSpecificReasonsTitleKey('ssi-federal');
      expect(key).toBe('results.ssi.specificReasons.title');
    });

    it('should return correct title key for section8-federal', () => {
      const key = getSpecificReasonsTitleKey('section8-federal');
      expect(key).toBe('results.section8.specificReasons.title');
    });

    it('should return correct title key for lihtc-federal', () => {
      const key = getSpecificReasonsTitleKey('lihtc-federal');
      expect(key).toBe('results.lihtc.specificReasons.title');
    });

    it('should extract first part before hyphen', () => {
      const key = getSpecificReasonsTitleKey('custom-program-name');
      expect(key).toBe('results.custom.specificReasons.title');
    });
  });

  describe('supportsSpecificReasons', () => {
    it('should return true for wic-federal', () => {
      expect(supportsSpecificReasons('wic-federal')).toBe(true);
    });

    it('should return true for medicaid-federal', () => {
      expect(supportsSpecificReasons('medicaid-federal')).toBe(true);
    });

    it('should return true for snap-federal', () => {
      expect(supportsSpecificReasons('snap-federal')).toBe(true);
    });

    it('should return true for tanf-federal', () => {
      expect(supportsSpecificReasons('tanf-federal')).toBe(true);
    });

    it('should return true for ssi-federal', () => {
      expect(supportsSpecificReasons('ssi-federal')).toBe(true);
    });

    it('should return true for section8-federal', () => {
      expect(supportsSpecificReasons('section8-federal')).toBe(true);
    });

    it('should return true for lihtc-federal', () => {
      expect(supportsSpecificReasons('lihtc-federal')).toBe(true);
    });

    it('should return true for unknown program due to generic reasons', () => {
      expect(supportsSpecificReasons('unknown-program')).toBe(true);
    });

    it('should return true for any program ID', () => {
      expect(supportsSpecificReasons('custom-program')).toBe(true);
    });
  });
});
