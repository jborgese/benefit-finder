/**
 * Type Usage Examples
 *
 * Demonstrates how to use the comprehensive TypeScript types.
 */

import type {
  HouseholdProfile,
  BenefitProgram,
  RuleDefinition,
  EligibilityResult,
  QuestionDefinition,
  QuestionFlow,
  ValidationResult,
  AsyncResult,
} from './index';

// ============================================================================
// Example 1: Creating a Household Profile
// ============================================================================

export const exampleHouseholdProfile: HouseholdProfile = {
  id: 'profile-001',

  // Personal Information
  firstName: 'Jane',
  lastName: 'Doe',
  dateOfBirth: '1985-03-15',

  // Household
  householdSize: 3,
  householdIncome: 35000,

  // Location
  state: 'GA',
  zipCode: '30301',
  county: 'Fulton',

  // Status
  citizenship: 'us_citizen',
  employmentStatus: 'employed',

  // Demographics
  hasChildren: true,
  hasDisability: false,
  isVeteran: false,
  isPregnant: false,

  // Metadata
  createdAt: Date.now(),
  updatedAt: Date.now(),

  // Extended fields
  members: [
    {
      id: 'member-001',
      relationship: 'self',
      age: 38,
      income: 25000,
    },
    {
      id: 'member-002',
      relationship: 'spouse',
      age: 40,
      income: 10000,
    },
    {
      id: 'member-003',
      relationship: 'child',
      age: 5,
      isStudent: true,
    },
  ],

  address: {
    street1: '123 Main Street',
    street2: 'Apt 4B',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30301',
    county: 'Fulton',
  },

  contact: {
    email: 'jane.doe@example.com',
    phone: '404-555-0123',
    preferredContactMethod: 'email',
  },
};

// ============================================================================
// Example 2: Creating a Benefit Program
// ============================================================================

export const exampleBenefitProgram: BenefitProgram = {
  id: 'snap-ga',

  // Basic Information
  name: 'SNAP (Food Stamps) - Georgia',
  shortName: 'SNAP',
  description: 'The Supplemental Nutrition Assistance Program provides monthly benefits to help low-income families purchase food.',

  // Categorization
  category: 'food',
  jurisdiction: 'US-GA',
  jurisdictionLevel: 'state',

  // Contact Information
  website: 'https://dhs.georgia.gov/snap',
  phoneNumber: '1-877-423-4746',
  applicationUrl: 'https://gateway.ga.gov',
  officeAddress: 'Georgia Department of Human Services',

  // Additional Info
  eligibilitySummary: 'Low-income families with gross income at or below 130% of Federal Poverty Level',
  benefitAmount: 'Average $200-$600 per month based on household size and income',

  // Tags
  tags: ['food', 'nutrition', 'ebt', 'snap', 'food stamps'],

  // Status
  active: true,
  applicationOpen: true,

  // Source
  source: 'https://www.fns.usda.gov/snap/recipient/eligibility',
  sourceDate: Date.parse('2024-10-01'),

  // Metadata
  lastUpdated: Date.now(),
  createdAt: Date.parse('2024-01-01'),
};

// ============================================================================
// Example 3: Creating an Eligibility Rule
// ============================================================================

export const exampleEligibilityRule: RuleDefinition = {
  id: 'snap-ga-income-2024',

  // Rule Identification
  programId: 'snap-ga',
  name: 'SNAP Georgia Income Test 2024',
  description: 'Household gross income must be at or below 130% of the Federal Poverty Level',
  ruleType: 'eligibility',

  // JSON Logic Rule
  ruleLogic: {
    and: [
      {
        '<=': [
          { var: 'gross_income_fpl_percent' },
          130
        ]
      },
      {
        '==': [
          { var: 'has_eligible_citizenship' },
          true
        ]
      }
    ]
  },

  // Explanation
  explanation: 'To qualify for SNAP in Georgia, your household gross monthly income must be at or below 130% of the Federal Poverty Level for your household size, and you must be a US citizen or eligible non-citizen.',

  // Requirements
  requiredDocuments: [
    'Proof of income (pay stubs, tax returns)',
    'Proof of identity',
    'Proof of residency in Georgia',
    'Social Security numbers for all household members',
  ],

  requiredFields: [
    'householdSize',
    'householdIncome',
    'citizenship',
    'state',
  ],

  // Versioning
  version: '2024.1',
  effectiveDate: Date.parse('2024-01-01'),
  expirationDate: Date.parse('2024-12-31'),

  // Source
  source: 'https://www.fns.usda.gov/snap/recipient/eligibility',
  sourceDocument: 'SNAP Eligibility Guidelines FY2024',
  legalReference: '7 CFR 273.9',

  // Configuration
  priority: 100,
  active: true,
  draft: false,

  // Test Cases
  testCases: [
    {
      input: {
        gross_income_fpl_percent: 100,
        has_eligible_citizenship: true,
      },
      expectedOutput: true,
      description: 'Family at 100% FPL with eligible citizenship should qualify',
    },
    {
      input: {
        gross_income_fpl_percent: 150,
        has_eligible_citizenship: true,
      },
      expectedOutput: false,
      description: 'Family above 130% FPL should not qualify',
    },
    {
      input: {
        gross_income_fpl_percent: 100,
        has_eligible_citizenship: false,
      },
      expectedOutput: false,
      description: 'Family with ineligible citizenship should not qualify',
    },
  ],

  // Metadata
  createdAt: Date.parse('2024-01-01'),
  updatedAt: Date.now(),
  createdBy: 'system',
};

// ============================================================================
// Example 4: Creating an Eligibility Result
// ============================================================================

export const exampleEligibilityResult: EligibilityResult = {
  id: 'result-001',

  // References
  userProfileId: 'profile-001',
  programId: 'snap-ga',
  ruleId: 'snap-ga-income-2024',

  // Result
  eligible: true,
  confidence: 95,
  reason: 'Household income is at 95% of Federal Poverty Level, below the 130% threshold. All citizenship requirements met.',
  status: 'eligible',

  // Detailed Breakdown
  criteriaResults: [
    {
      criterion: 'Income at or below 130% FPL',
      met: true,
      value: 95,
      threshold: 130,
      importance: 'required',
    },
    {
      criterion: 'Eligible citizenship status',
      met: true,
      value: 'us_citizen',
      importance: 'required',
    },
    {
      criterion: 'Georgia residency',
      met: true,
      importance: 'required',
    },
  ],

  // Next Steps
  nextSteps: [
    {
      step: 'Apply online at Georgia Gateway',
      url: 'https://gateway.ga.gov',
      priority: 'high',
      estimatedTime: '30 minutes',
      requiresDocument: true,
    },
    {
      step: 'Gather required documents',
      priority: 'high',
      estimatedTime: '1 hour',
    },
    {
      step: 'Schedule interview (if required)',
      priority: 'medium',
      estimatedTime: '30 minutes',
    },
  ],

  // Required Documents
  requiredDocuments: [
    {
      document: 'Proof of Income',
      description: 'Recent pay stubs (last 30 days) or tax returns',
      where: 'From employer or IRS',
      required: true,
      alternatives: ['W2 forms', 'Bank statements showing deposits'],
      helpText: 'Include all household members with income',
    },
    {
      document: 'Proof of Identity',
      description: 'Driver\'s license or state ID',
      where: 'Georgia DDS',
      required: true,
    },
    {
      document: 'Proof of Residency',
      description: 'Utility bill or lease agreement',
      where: 'Utility company or landlord',
      required: true,
    },
  ],

  // Benefit Estimate
  estimatedBenefit: {
    amount: 500,
    minAmount: 450,
    maxAmount: 550,
    frequency: 'monthly',
    description: 'Estimated monthly benefit for household of 3 with income at 95% FPL',
    currency: 'USD',
    calculation: 'Based on household size and net income',
  },

  // Metadata
  ruleVersion: '2024.1',
  evaluatedAt: Date.now(),
  expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days

  // Flags
  needsReview: false,
  incomplete: false,
  requiresInterview: false,
  autoApprovalPossible: true,
};

// ============================================================================
// Example 5: Creating Question Definitions
// ============================================================================

export const exampleQuestions: QuestionDefinition[] = [
  // Question 1: Household Size
  {
    id: 'q-001',
    key: 'householdSize',
    question: 'How many people live in your household?',
    subtitle: 'Include yourself, spouse, children, and anyone else who lives with you',
    helpText: 'Count all people who buy and prepare food together',
    type: 'number',
    required: true,
    min: 1,
    max: 50,
    step: 1,
    validations: [
      {
        type: 'required',
        message: 'Household size is required',
      },
      {
        type: 'min',
        value: 1,
        message: 'Household must have at least 1 person',
      },
    ],
    nextQuestionId: 'q-002',
    category: 'household',
    priority: 1,
    exampleAnswer: '3',
    whyAsking: 'Household size is used to determine income limits and benefit amounts',
  },

  // Question 2: Annual Income
  {
    id: 'q-002',
    key: 'householdIncome',
    question: 'What is your total annual household income?',
    subtitle: 'Include income from all household members before taxes',
    helpText: 'Include wages, self-employment, Social Security, child support, etc.',
    type: 'currency',
    required: true,
    min: 0,
    max: 10000000,
    validations: [
      {
        type: 'required',
        message: 'Income is required',
      },
      {
        type: 'min',
        value: 0,
        message: 'Income cannot be negative',
      },
    ],
    previousQuestionId: 'q-001',
    nextQuestionId: 'q-003',
    category: 'household',
    priority: 2,
    privacyNote: 'Your income information is encrypted and stored only on your device',
  },

  // Question 3: State
  {
    id: 'q-003',
    key: 'state',
    question: 'What state do you live in?',
    type: 'select',
    required: true,
    options: [
      { value: 'AL', label: 'Alabama' },
      { value: 'GA', label: 'Georgia' },
      { value: 'FL', label: 'Florida' },
      { value: 'CA', label: 'California' },
      // ... all states
    ],
    validations: [
      {
        type: 'required',
        message: 'State is required',
      },
    ],
    previousQuestionId: 'q-002',
    nextQuestionId: (answer) => {
      // Dynamic next question based on state
      return answer === 'GA' ? 'q-004-ga' : 'q-004-other';
    },
    category: 'location',
    priority: 3,
  },

  // Question 4: Citizenship (with conditional logic)
  {
    id: 'q-004',
    key: 'citizenship',
    question: 'What is your citizenship status?',
    type: 'radio',
    required: true,
    options: [
      {
        value: 'us_citizen',
        label: 'U.S. Citizen',
      },
      {
        value: 'permanent_resident',
        label: 'Permanent Resident (Green Card)',
      },
      {
        value: 'refugee',
        label: 'Refugee',
      },
      {
        value: 'asylee',
        label: 'Asylee',
      },
      {
        value: 'other',
        label: 'Other',
      },
    ],
    validations: [
      {
        type: 'required',
        message: 'Citizenship status is required',
      },
    ],
    previousQuestionId: 'q-003',
    nextQuestionId: 'q-005',
    category: 'eligibility',
    priority: 4,
    privacyNote: 'Citizenship information is encrypted and never shared',
  },

  // Question 5: Has Children (boolean)
  {
    id: 'q-005',
    key: 'hasChildren',
    question: 'Do you have any children under 18 living with you?',
    type: 'boolean',
    required: true,
    nextQuestionId: (answer) => answer ? 'q-006-children' : 'q-007',
    category: 'household',
    priority: 5,
  },

  // Question 6: Conditional (only if has children)
  {
    id: 'q-006-children',
    key: 'childrenAges',
    question: 'How old are your children?',
    helpText: 'Enter ages separated by commas (e.g., 5, 8, 12)',
    type: 'text',
    required: false,
    showIf: {
      operator: 'and',
      conditions: [
        {
          questionId: 'q-005',
          comparison: '==',
          value: true,
        },
      ],
    },
    previousQuestionId: 'q-005',
    nextQuestionId: 'q-007',
    category: 'household',
  },
];

// ============================================================================
// Example 6: Creating a Question Flow
// ============================================================================

export const exampleQuestionFlow: QuestionFlow = {
  id: 'basic-screening-flow',
  name: 'Basic Benefit Screening',
  description: 'Quick questionnaire to determine potential benefit eligibility',
  version: '1.0',

  questions: exampleQuestions,
  startQuestionId: 'q-001',

  sections: [
    {
      id: 'section-household',
      title: 'Household Information',
      description: 'Tell us about your household',
      icon: 'home',
      questionIds: ['q-001', 'q-002', 'q-005', 'q-006-children'],
      required: true,
      order: 1,
    },
    {
      id: 'section-location',
      title: 'Location',
      description: 'Where do you live?',
      icon: 'map',
      questionIds: ['q-003'],
      required: true,
      order: 2,
    },
    {
      id: 'section-eligibility',
      title: 'Eligibility Information',
      description: 'Additional information to determine eligibility',
      icon: 'check',
      questionIds: ['q-004'],
      required: true,
      order: 3,
    },
  ],

  allowSaveAndResume: true,
  estimatedTime: 10, // minutes

  createdAt: Date.parse('2024-01-01'),
  updatedAt: Date.now(),
};

// ============================================================================
// Example 7: Type Guards
// ============================================================================

export function isHouseholdProfile(value: unknown): value is HouseholdProfile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'createdAt' in value &&
    'updatedAt' in value
  );
}

export function isBenefitProgram(value: unknown): value is BenefitProgram {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'category' in value &&
    'jurisdiction' in value
  );
}

export function isEligibleResult(result: EligibilityResult): boolean {
  return result.eligible === true && result.confidence >= 80;
}

// ============================================================================
// Example 8: Validation Functions
// ============================================================================

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Checks if a value is empty (null, undefined, or empty string)
 */
function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

/**
 * Validates numeric bounds for number and currency inputs
 */
function validateNumericBounds(
  question: QuestionDefinition,
  value: unknown,
  errors: ValidationError[]
): void {
  const num = Number(value);

  if (question.min !== undefined && num < question.min) {
    errors.push({
      field: question.key,
      message: `Value must be at least ${question.min}`,
      severity: 'error',
    });
  }

  if (question.max !== undefined && num > question.max) {
    errors.push({
      field: question.key,
      message: `Value must be at most ${question.max}`,
      severity: 'error',
    });
  }
}

/**
 * Validates custom validation rules
 */
function validateCustomRules(
  question: QuestionDefinition,
  value: unknown,
  errors: ValidationError[]
): void {
  if (!question.validations) {
    return;
  }

  for (const validation of question.validations) {
    if (validation.validator && !validation.validator(value)) {
      errors.push({
        field: question.key,
        message: validation.message,
        severity: 'error',
      });
    }
  }
}

export function validateQuestionAnswer(
  question: QuestionDefinition,
  value: unknown
): ValidationResult<unknown> {
  const errors: ValidationError[] = [];

  // Check required
  if (question.required && isEmptyValue(value)) {
    errors.push({
      field: question.key,
      message: `${question.question} is required`,
      severity: 'error',
    });
  }

  // Check type-specific validation
  if (question.type === 'number' || question.type === 'currency') {
    validateNumericBounds(question, value, errors);
  }

  // Check custom validations
  validateCustomRules(question, value, errors);

  return {
    valid: errors.length === 0,
    data: value,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ============================================================================
// Example 9: Async Operations with Types
// ============================================================================

export async function fetchProgramAsync(
  programId: string
): Promise<AsyncResult<BenefitProgram, string>> {
  try {
    // Simulate database fetch
    const program = await fetch(`/api/programs/${programId}`)
      .then(r => r.json()) as BenefitProgram;

    return {
      success: true,
      data: program,
    };
  } catch {
    return {
      success: false,
      error: `Program not found: ${programId}`,
    };
  }
}

// ============================================================================
// Example 10: Generic Functions with Types
// ============================================================================

export function filterByCategory<T extends { category: string }>(
  items: T[],
  category: string
): T[] {
  return items.filter(item => item.category === category);
}

export function sortByDate<T extends { createdAt: number }>(
  items: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    return order === 'asc'
      ? a.createdAt - b.createdAt
      : b.createdAt - a.createdAt;
  });
}

