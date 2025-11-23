/**
 * LIHTC (Low-Income Housing Tax Credit) Eligibility Rules
 *
 * JSON Logic rules for determining LIHTC housing eligibility.
 * Based on HUD guidelines and federal regulations.
 */

import type { RuleDefinition } from '../core/types';

/**
 * LIHTC Program ID constant
 */
const LIHTC_PROGRAM_ID = 'lihtc-housing';

/**
 * LIHTC Income Eligibility Rule
 *
 * Household income must be at or below 50% or 60% of Area Median Income (AMI)
 * depending on the property's income targeting.
 */
export const LIHTC_INCOME_ELIGIBILITY: RuleDefinition = {
  id: 'lihtc-income-eligibility-2024',
  programId: LIHTC_PROGRAM_ID,
  logic: {
    or: [
      {
        and: [
          { var: 'householdIncome' },
          { '<=': [
            { var: 'householdIncome' },
            { var: 'amiData.incomeLimit50' }
          ]}
        ]
      },
      {
        and: [
          { var: 'householdIncome' },
          { '<=': [
            { var: 'householdIncome' },
            { var: 'amiData.incomeLimit60' }
          ]}
        ]
      }
    ]
  },
  metadata: {
    name: 'LIHTC Income Eligibility Test',
    description: 'Household income must be at or below 50-60% of Area Median Income',
    ruleType: 'eligibility',
    explanation: 'Your household income must be at or below 50% or 60% of the Area Median Income for your location and household size',
    requiredFields: ['householdSize', 'householdIncome', 'state', 'county', 'amiData'],
    version: '2024.1',
    effectiveDate: Date.parse('2024-01-01'),
    source: 'https://www.huduser.gov/portal/datasets/lihtc.html',
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
};

/**
 * LIHTC Student Status Eligibility Rule
 *
 * Full-time students are generally ineligible for LIHTC housing unless
 * they are single parents or married students.
 */
export const LIHTC_STUDENT_ELIGIBILITY: RuleDefinition = {
  id: 'lihtc-student-eligibility',
  programId: LIHTC_PROGRAM_ID,
  logic: {
    or: [
      { '==': [{ var: 'studentStatus' }, 'none'] },
      { '==': [{ var: 'studentStatus' }, 'single_parent'] },
      { '==': [{ var: 'studentStatus' }, 'married_student'] }
    ]
  },
  metadata: {
    name: 'LIHTC Student Status Eligibility',
    description: 'Full-time students are generally ineligible unless exceptions apply',
    ruleType: 'eligibility',
    explanation: 'Full-time students are generally ineligible for LIHTC housing unless they are single parents or married students',
    requiredFields: ['studentStatus'],
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
};

/**
 * LIHTC Unit Size Matching Rule
 *
 * Household size must be appropriate for the available unit size.
 */
export const LIHTC_UNIT_SIZE_MATCH: RuleDefinition = {
  id: 'lihtc-unit-size-match',
  programId: LIHTC_PROGRAM_ID,
  logic: {
    and: [
      { var: 'householdSize' },
      { '>=': [{ var: 'householdSize' }, 1] },
      { '<=': [{ var: 'householdSize' }, { var: 'maxUnitOccupancy' }] }
    ]
  },
  metadata: {
    name: 'LIHTC Unit Size Requirements',
    description: 'Household size must match appropriate unit size',
    ruleType: 'eligibility',
    explanation: 'Your household size must be appropriate for the available unit size',
    requiredFields: ['householdSize', 'preferredUnitSize'],
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
};

/**
 * LIHTC Rent Affordability Rule
 *
 * Rent must not exceed 30% of the applicable income limit.
 */
export const LIHTC_RENT_AFFORDABILITY: RuleDefinition = {
  id: 'lihtc-rent-affordability',
  programId: LIHTC_PROGRAM_ID,
  logic: {
    '<=': [
      { var: 'maxRentAffordable' },
      { '*': [
        { var: 'amiData.incomeLimit50' },
        0.3
      ]}
    ]
  },
  metadata: {
    name: 'LIHTC Rent Affordability Test',
    description: 'Rent must not exceed 30% of applicable income limit',
    ruleType: 'benefit_amount',
    explanation: 'Your maximum affordable rent is 30% of the 50% AMI income limit',
    requiredFields: ['householdIncome', 'amiData'],
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
};

/**
 * LIHTC Citizenship Eligibility Rule
 *
 * Must be a U.S. citizen or eligible non-citizen.
 */
export const LIHTC_CITIZENSHIP_ELIGIBILITY: RuleDefinition = {
  id: 'lihtc-citizenship-eligibility',
  programId: LIHTC_PROGRAM_ID,
  logic: {
    or: [
      { '==': [{ var: 'citizenship' }, 'us_citizen'] },
      { '==': [{ var: 'citizenship' }, 'permanent_resident'] },
      { '==': [{ var: 'citizenship' }, 'refugee'] },
      { '==': [{ var: 'citizenship' }, 'asylee'] }
    ]
  },
  metadata: {
    name: 'LIHTC Citizenship Eligibility',
    description: 'Must be a U.S. citizen or eligible non-citizen',
    ruleType: 'eligibility',
    explanation: 'You must be a U.S. citizen or eligible non-citizen to qualify for LIHTC housing',
    requiredFields: ['citizenship'],
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
};

/**
 * LIHTC Age Eligibility Rule
 *
 * Must be at least 18 years old to apply for LIHTC housing.
 */
export const LIHTC_AGE_ELIGIBILITY: RuleDefinition = {
  id: 'lihtc-age-eligibility',
  programId: LIHTC_PROGRAM_ID,
  logic: {
    '>=': [
      { var: 'age' },
      18
    ]
  },
  metadata: {
    name: 'LIHTC Age Eligibility',
    description: 'Must be at least 18 years old to apply',
    ruleType: 'eligibility',
    explanation: 'You must be at least 18 years old to apply for LIHTC housing',
    requiredFields: ['age'],
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
};

/**
 * LIHTC Household Size Validation Rule
 *
 * Household size must be reasonable for LIHTC units.
 */
export const LIHTC_HOUSEHOLD_SIZE_VALIDATION: RuleDefinition = {
  id: 'lihtc-household-size-validation',
  programId: LIHTC_PROGRAM_ID,
  logic: {
    and: [
      { '>=': [{ var: 'householdSize' }, 1] },
      { '<=': [{ var: 'householdSize' }, 8] }
    ]
  },
  metadata: {
    name: 'LIHTC Household Size Validation',
    description: 'Household size must be appropriate for LIHTC units',
    ruleType: 'eligibility',
    explanation: 'Household size must be between 1 and 8 people for LIHTC units',
    requiredFields: ['householdSize'],
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
};

/**
 * LIHTC Income Verification Rule
 *
 * Income must be verifiable through documentation.
 */
export const LIHTC_INCOME_VERIFICATION: RuleDefinition = {
  id: 'lihtc-income-verification',
  programId: LIHTC_PROGRAM_ID,
  logic: {
    '>': [{ var: 'householdIncome' }, 0]
  },
  metadata: {
    name: 'LIHTC Income Verification',
    description: 'Income must be verifiable through documentation',
    ruleType: 'document_requirements',
    explanation: 'You must provide documentation to verify your household income',
    requiredFields: ['householdIncome'],
    requiredDocuments: [
      'Pay stubs or employment verification',
      'Tax returns or W-2 forms',
      'Bank statements',
      'Social Security award letters',
      'Other income verification documents'
    ],
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
};

/**
 * LIHTC Background Check Rule
 *
 * Must pass background check requirements.
 */
export const LIHTC_BACKGROUND_CHECK: RuleDefinition = {
  id: 'lihtc-background-check',
  programId: LIHTC_PROGRAM_ID,
  logic: {
    '==': [{ var: 'hasCriminalHistory' }, false]
  },
  metadata: {
    name: 'LIHTC Background Check',
    description: 'Must pass background check requirements',
    ruleType: 'eligibility',
    explanation: 'You must pass a background check to qualify for LIHTC housing',
    requiredFields: ['hasCriminalHistory'],
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
};

/**
 * LIHTC Rental History Rule
 *
 * Must have good rental history without evictions.
 */
export const LIHTC_RENTAL_HISTORY: RuleDefinition = {
  id: 'lihtc-rental-history',
  programId: LIHTC_PROGRAM_ID,
  logic: {
    '==': [{ var: 'hasEvictionHistory' }, false]
  },
  metadata: {
    name: 'LIHTC Rental History',
    description: 'Must have good rental history without evictions',
    ruleType: 'eligibility',
    explanation: 'You must have good rental history without evictions to qualify for LIHTC housing',
    requiredFields: ['hasEvictionHistory'],
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
};

/**
 * LIHTC Rental References Rule
 *
 * Must have rental references from previous landlords.
 */
export const LIHTC_RENTAL_REFERENCES: RuleDefinition = {
  id: 'lihtc-rental-references',
  programId: LIHTC_PROGRAM_ID,
  logic: {
    '==': [{ var: 'hasRentalReferences' }, true]
  },
  metadata: {
    name: 'LIHTC Rental References',
    description: 'Must have rental references from previous landlords',
    ruleType: 'eligibility',
    explanation: 'You must have rental references from previous landlords to qualify for LIHTC housing',
    requiredFields: ['hasRentalReferences'],
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
};

/**
 * All LIHTC Rules
 */
export const LIHTC_RULES: RuleDefinition[] = [
  LIHTC_INCOME_ELIGIBILITY,
  LIHTC_STUDENT_ELIGIBILITY,
  LIHTC_UNIT_SIZE_MATCH,
  LIHTC_RENT_AFFORDABILITY,
  LIHTC_CITIZENSHIP_ELIGIBILITY,
  LIHTC_AGE_ELIGIBILITY,
  LIHTC_HOUSEHOLD_SIZE_VALIDATION,
  LIHTC_INCOME_VERIFICATION,
  LIHTC_BACKGROUND_CHECK,
  LIHTC_RENTAL_HISTORY,
  LIHTC_RENTAL_REFERENCES
];

/**
 * LIHTC Rule Categories
 */
export const LIHTC_RULE_CATEGORIES = {
  ELIGIBILITY: [
    LIHTC_INCOME_ELIGIBILITY,
    LIHTC_STUDENT_ELIGIBILITY,
    LIHTC_CITIZENSHIP_ELIGIBILITY,
    LIHTC_AGE_ELIGIBILITY,
    LIHTC_HOUSEHOLD_SIZE_VALIDATION,
    LIHTC_BACKGROUND_CHECK,
    LIHTC_RENTAL_HISTORY,
    LIHTC_RENTAL_REFERENCES
  ],
  BENEFIT_AMOUNT: [
    LIHTC_RENT_AFFORDABILITY
  ],
  DOCUMENT_REQUIREMENTS: [
    LIHTC_INCOME_VERIFICATION
  ],
  UNIT_MATCHING: [
    LIHTC_UNIT_SIZE_MATCH
  ]
};
