import { describe, it, expect } from 'vitest';
import {
  generateEvaluationBasedReasons,
  type EvaluationResult
} from '../evaluationBasedReasons';
import type { EligibilityStatus } from '../../components/results/types';
import type { UserProfile } from '../specificReasons';

describe('evaluationBasedReasons', () => {
  describe('generateEvaluationBasedReasons', () => {
    it('should return empty array for qualified status', () => {
      const evaluationResult: EvaluationResult = {
        result: true
      };

      const reasons = generateEvaluationBasedReasons(
        'snap-federal',
        'qualified' as EligibilityStatus,
        evaluationResult
      );

      expect(reasons).toEqual([]);
    });

    it('should return empty array for likely-qualified status', () => {
      const evaluationResult: EvaluationResult = {
        result: true
      };

      const reasons = generateEvaluationBasedReasons(
        'snap-federal',
        'likely-qualified' as EligibilityStatus,
        evaluationResult
      );

      expect(reasons).toEqual([]);
    });

    it('should return empty array for not-enough-info status', () => {
      const evaluationResult: EvaluationResult = {
        result: true
      };

      const reasons = generateEvaluationBasedReasons(
        'snap-federal',
        'not-enough-info' as EligibilityStatus,
        evaluationResult
      );

      expect(reasons).toEqual([]);
    });

    it('should return generic reason for not-qualified with no specific details', () => {
      const evaluationResult: EvaluationResult = {
        result: false
      };

      const reasons = generateEvaluationBasedReasons(
        'snap-federal',
        'not-qualified',
        evaluationResult
      );

      expect(reasons).toHaveLength(1);
      expect(reasons[0]).toEqual({
        key: 'generic',
        message: 'You may not meet the specific eligibility requirements for this program',
        severity: 'major',
        actionable: false
      });
    });

    describe('Income-related reasons', () => {
      it('should generate income reason from criteria with comparison', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'household_income',
              met: false,
              value: 50000,
              threshold: 30000,
              comparison: '>'
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('income');
        expect(reasons[0].message).toContain('$50,000');
        expect(reasons[0].message).toContain('$30,000');
        expect(reasons[0].message).toContain('above');
        expect(reasons[0].severity).toBe('critical');
        expect(reasons[0].actionable).toBe(true);
        expect(reasons[0].suggestion).toBeDefined();
      });

      it('should generate income reason without comparison', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'income_test',
              met: false,
              value: 15000,
              threshold: 20000
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'wic-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('income');
        expect(reasons[0].message).toContain('$15,000');
        expect(reasons[0].message).toContain('$20,000');
        expect(reasons[0].message).toContain('does not meet');
      });

      it('should format income values with locale string', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'income',
              met: false,
              value: 1234567,
              threshold: 2000000,
              comparison: '>'
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'medicaid-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons[0].message).toContain('1,234,567');
        expect(reasons[0].message).toContain('2,000,000');
      });

      it('should handle string income values', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'annual_income',
              met: false,
              value: '45000',
              threshold: '35000',
              comparison: '>'
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'tanf-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons[0].message).toContain('45,000');
        expect(reasons[0].message).toContain('35,000');
      });

      it('should generate income reason from calculations', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          calculations: [
            {
              label: 'Household Income',
              value: 60000,
              comparison: 'exceeds'
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'ssi-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('income_calculation');
        expect(reasons[0].message).toContain('household income');
        expect(reasons[0].message).toContain('$60,000');
        expect(reasons[0].message).toContain('exceeds');
      });

      it('should generate income reason from rule ID', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          rulesCited: ['snap-federal-income-limit']
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('income_rule');
        expect(reasons[0].message).toContain('income');
        expect(reasons[0].message).toContain('SNAP');
      });

      it('should include user income in rule reason when profile provided', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          rulesCited: ['medicaid-income-test']
        };

        const userProfile: UserProfile = {
          householdIncome: 75000
        };

        const reasons = generateEvaluationBasedReasons(
          'medicaid-federal',
          'not-qualified',
          evaluationResult,
          userProfile
        );

        expect(reasons[0].message).toContain('$75,000');
        expect(reasons[0].message).toContain('Medicaid');
      });
    });

    describe('Asset-related reasons', () => {
      it('should generate asset reason from criteria with comparison', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'household_assets',
              met: false,
              value: 15000,
              threshold: 10000,
              comparison: '>'
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('assets');
        expect(reasons[0].message).toContain('$15,000');
        expect(reasons[0].message).toContain('$10,000');
        expect(reasons[0].message).toContain('exceed');
        expect(reasons[0].severity).toBe('critical');
        expect(reasons[0].actionable).toBe(true);
      });

      it('should generate asset reason without comparison', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'asset_limit',
              met: false,
              value: 5000,
              threshold: 8000
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'tanf-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('assets');
        expect(reasons[0].message).toContain('do not meet');
      });

      it('should generate asset reason from calculations', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          calculations: [
            {
              label: 'Total Assets',
              value: 25000,
              comparison: 'exceeds'
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'ssi-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('asset_calculation');
        expect(reasons[0].message).toContain('total assets');
        expect(reasons[0].message).toContain('$25,000');
      });

      it('should generate asset reason from rule ID', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          rulesCited: ['snap-asset-limit-check']
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('asset_rule');
        expect(reasons[0].message).toContain('asset');
      });

      it('should include user assets in rule reason when profile provided', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          rulesCited: ['medicaid-asset-test']
        };

        const userProfile: UserProfile = {
          householdAssets: 50000
        };

        const reasons = generateEvaluationBasedReasons(
          'medicaid-federal',
          'not-qualified',
          evaluationResult,
          userProfile
        );

        expect(reasons[0].message).toContain('$50,000');
      });
    });

    describe('Age-related reasons', () => {
      it('should generate age reason when user is too young', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'minimum_age',
              met: false,
              value: 55,
              threshold: 65
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'ssi-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('age');
        expect(reasons[0].message).toContain('55 years old');
        expect(reasons[0].message).toContain('at least 65');
        expect(reasons[0].severity).toBe('critical');
        expect(reasons[0].actionable).toBe(false);
      });

      it('should generate age reason when user is too old', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'age_requirement',
              met: false,
              value: 70,
              threshold: 65
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'wic-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('age');
        expect(reasons[0].message).toContain('70');
        expect(reasons[0].message).toContain('does not meet');
      });

      it('should generate age reason from rule ID', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          rulesCited: ['ssi-age-requirement']
        };

        const reasons = generateEvaluationBasedReasons(
          'ssi-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('age_rule');
        expect(reasons[0].message).toContain('age');
      });

      it('should include user age in rule reason when profile provided', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          rulesCited: ['medicare-age-check']
        };

        const userProfile: UserProfile = {
          age: 58
        };

        const reasons = generateEvaluationBasedReasons(
          'medicare-federal',
          'not-qualified',
          evaluationResult,
          userProfile
        );

        expect(reasons[0].message).toContain('58');
      });
    });

    describe('Disability-related reasons', () => {
      it('should generate disability reason from criteria', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'has_disability',
              met: false
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'ssi-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('disability');
        expect(reasons[0].message).toContain('disability');
        expect(reasons[0].message).toContain('SSI');
        expect(reasons[0].severity).toBe('critical');
        expect(reasons[0].actionable).toBe(false);
      });

      it('should generate disability reason from rule ID', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          rulesCited: ['ssi-disability-requirement']
        };

        const reasons = generateEvaluationBasedReasons(
          'ssi-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('disability_rule');
        expect(reasons[0].message).toContain('disability');
      });
    });

    describe('Citizenship-related reasons', () => {
      it('should generate citizenship reason from criteria', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'citizenship_status',
              met: false
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('citizenship');
        expect(reasons[0].message).toContain('U.S. citizen');
        expect(reasons[0].message).toContain('SNAP');
        expect(reasons[0].severity).toBe('critical');
        expect(reasons[0].actionable).toBe(false);
      });

      it('should generate citizenship reason for immigration status', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'immigration_status',
              met: false
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'medicaid-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('citizenship');
        expect(reasons[0].message).toContain('immigration status');
      });
    });

    describe('Custom message reasons', () => {
      it('should use custom message when provided in criteria', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'special_requirement',
              met: false,
              message: 'You must be enrolled in an approved program'
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('custom');
        expect(reasons[0].message).toBe('You must be enrolled in an approved program');
        expect(reasons[0].severity).toBe('major');
        expect(reasons[0].actionable).toBe(true);
      });
    });

    describe('Multiple reasons', () => {
      it('should generate multiple reasons from different criteria', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'household_income',
              met: false,
              value: 50000,
              threshold: 30000,
              comparison: '>'
            },
            {
              criterion: 'household_assets',
              met: false,
              value: 15000,
              threshold: 10000,
              comparison: '>'
            },
            {
              criterion: 'minimum_age',
              met: false,
              value: 60,
              threshold: 65
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'ssi-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(3);
        expect(reasons[0].key).toBe('income');
        expect(reasons[1].key).toBe('assets');
        expect(reasons[2].key).toBe('age');
      });

      it('should generate reasons from criteria, calculations, and rules', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'household_income',
              met: false,
              value: 50000,
              threshold: 30000,
              comparison: '>'
            }
          ],
          calculations: [
            {
              label: 'Total Assets',
              value: 20000,
              comparison: 'exceeds'
            }
          ],
          rulesCited: ['snap-age-requirement']
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(3);
        expect(reasons[0].key).toBe('income');
        expect(reasons[1].key).toBe('asset_calculation');
        expect(reasons[2].key).toBe('age_rule');
      });

      it('should only include unmet criteria', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'household_income',
              met: true,
              value: 20000,
              threshold: 30000
            },
            {
              criterion: 'household_assets',
              met: false,
              value: 15000,
              threshold: 10000,
              comparison: '>'
            },
            {
              criterion: 'citizenship_status',
              met: true
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('assets');
      });
    });

    describe('Program display names', () => {
      it('should use correct program name for WIC', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'household_income',
              met: false,
              value: 50000,
              threshold: 30000,
              comparison: '>'
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'wic-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons[0].message).toContain('WIC');
      });

      it('should use correct program name for Medicaid', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'household_income',
              met: false,
              value: 50000,
              threshold: 30000,
              comparison: '>'
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'medicaid-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons[0].message).toContain('Medicaid');
      });

      it('should use correct program name for SNAP', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'household_income',
              met: false,
              value: 50000,
              threshold: 30000,
              comparison: '>'
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons[0].message).toContain('SNAP');
      });

      it('should use correct program name for TANF', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'household_income',
              met: false,
              value: 50000,
              threshold: 30000,
              comparison: '>'
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'tanf-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons[0].message).toContain('TANF');
      });

      it('should use correct program name for SSI', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'household_income',
              met: false,
              value: 50000,
              threshold: 30000,
              comparison: '>'
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'ssi-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons[0].message).toContain('SSI');
      });

      it('should use correct program name for Section 8', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'household_income',
              met: false,
              value: 50000,
              threshold: 30000,
              comparison: '>'
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'section8-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons[0].message).toContain('Section 8');
      });

      it('should use correct program name for LIHTC', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'household_income',
              met: false,
              value: 50000,
              threshold: 30000,
              comparison: '>'
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'lihtc-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons[0].message).toContain('LIHTC');
      });

      it('should use program ID as fallback for unknown programs', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'household_income',
              met: false,
              value: 50000,
              threshold: 30000,
              comparison: '>'
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'unknown-program',
          'not-qualified',
          evaluationResult
        );

        expect(reasons[0].message).toContain('unknown-program');
      });
    });

    describe('Edge cases', () => {
      it('should handle non-numeric value formats', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'household_income',
              met: false,
              value: 'invalid',
              threshold: 30000,
              comparison: '>'
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons[0].message).toContain('invalid');
      });

      it('should handle missing threshold values', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'household_income',
              met: false,
              value: 50000
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons[0].message).toContain('$50,000');
      });

      it('should handle empty criteriaResults array', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: []
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('generic');
      });

      it('should handle empty calculations array', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          calculations: []
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('generic');
      });

      it('should handle empty rulesCited array', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          rulesCited: []
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('generic');
      });

      it('should handle calculations without comparison', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          calculations: [
            {
              label: 'Monthly Income',
              value: 4000
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].message).toContain('monthly income');
      });

      it('should handle unrecognized criterion types', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          criteriaResults: [
            {
              criterion: 'unknown_criterion',
              met: false
            }
          ]
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        // Should fall back to generic reason since criterion is not recognized
        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('generic');
      });

      it('should handle unrecognized rule IDs', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          rulesCited: ['unknown-rule-id']
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult
        );

        // Should fall back to generic reason since rule is not recognized
        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('generic');
      });

      it('should handle partial user profile data', () => {
        const evaluationResult: EvaluationResult = {
          result: false,
          rulesCited: ['snap-income-limit']
        };

        const userProfile: UserProfile = {
          // Only some fields provided
        };

        const reasons = generateEvaluationBasedReasons(
          'snap-federal',
          'not-qualified',
          evaluationResult,
          userProfile
        );

        expect(reasons).toHaveLength(1);
        expect(reasons[0].key).toBe('income_rule');
        // Should not crash or include undefined values
      });
    });
  });
});
