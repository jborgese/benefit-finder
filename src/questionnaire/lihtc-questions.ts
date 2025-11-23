/**
 * LIHTC (Low-Income Housing Tax Credit) Questionnaire Questions
 *
 * Specialized questions for LIHTC housing eligibility determination.
 */

import type { QuestionDefinition } from './types';

/**
 * LIHTC-specific questionnaire questions
 */
export const LIHTC_QUESTIONS: QuestionDefinition[] = [
  // Student Status Question
  {
    id: 'lihtc-student-status',
    fieldName: 'studentStatus',
    text: 'Are you or any household members full-time students?',
    description: 'This affects LIHTC eligibility - full-time students are generally ineligible unless exceptions apply',
    helpText: 'Single parents and married students may still be eligible even if they are students',
    inputType: 'radio',
    required: true,
    options: [
      {
        value: 'none',
        label: 'No full-time students in household',
        description: 'No household members are full-time students'
      },
      {
        value: 'single_parent',
        label: 'Single parent student',
        description: 'I am a single parent who is a full-time student'
      },
      {
        value: 'married_student',
        label: 'Married student',
        description: 'I am married and a full-time student'
      },
      {
        value: 'full_time_student',
        label: 'Full-time student (may be ineligible)',
        description: 'I am a full-time student without the above exceptions'
      }
    ],
    validations: [
      {
        type: 'required',
        message: 'Student status is required for LIHTC eligibility'
      }
    ],
    category: 'housing',
    priority: 3,
    whyAsking: 'Student status affects LIHTC eligibility - full-time students are generally ineligible unless they are single parents or married students',
    nextQuestionId: (answer) => {
      if (answer === 'full_time_student') {
        return 'lihtc-student-ineligible';
      }
      return 'lihtc-unit-size-preference';
    }
  },

  // Unit Size Preference Question
  {
    id: 'lihtc-unit-size-preference',
    fieldName: 'preferredUnitSize',
    text: 'What size unit are you looking for?',
    description: 'Choose the unit size that best fits your household needs',
    helpText: 'LIHTC units are available in various sizes. Your household size will help determine the appropriate unit size.',
    inputType: 'select',
    required: true,
    options: [
      {
        value: 'studio',
        label: 'Studio (1 person)',
        description: 'Efficiency or studio apartment'
      },
      {
        value: '1br',
        label: '1 Bedroom (1-2 people)',
        description: 'One bedroom apartment'
      },
      {
        value: '2br',
        label: '2 Bedroom (2-4 people)',
        description: 'Two bedroom apartment'
      },
      {
        value: '3br',
        label: '3 Bedroom (3-6 people)',
        description: 'Three bedroom apartment'
      },
      {
        value: '4br',
        label: '4+ Bedroom (4+ people)',
        description: 'Four or more bedroom apartment'
      }
    ],
    validations: [
      {
        type: 'required',
        message: 'Unit size preference is required'
      }
    ],
    category: 'housing',
    priority: 4,
    whyAsking: 'Unit size helps determine if LIHTC housing is appropriate for your household size',
    nextQuestionId: 'lihtc-housing-history'
  },

  // Housing History Question
  {
    id: 'lihtc-housing-history',
    fieldName: 'hasLivedInSubsidizedHousing',
    text: 'Have you or any household members lived in subsidized housing before?',
    description: 'This includes public housing, Section 8, LIHTC, or other subsidized housing',
    helpText: 'Previous subsidized housing experience may affect eligibility for certain programs',
    inputType: 'radio',
    required: true,
    options: [
      {
        value: 'yes',
        label: 'Yes, I have lived in subsidized housing',
        description: 'I have experience with subsidized housing programs'
      },
      {
        value: 'no',
        label: 'No, I have not lived in subsidized housing',
        description: 'This would be my first time in subsidized housing'
      }
    ],
    validations: [
      {
        type: 'required',
        message: 'Housing history is required'
      }
    ],
    category: 'housing',
    priority: 5,
    whyAsking: 'Housing history helps determine eligibility and may affect application priority',
    nextQuestionId: 'lihtc-income-sources'
  },

  // Income Sources Breakdown
  {
    id: 'lihtc-income-sources',
    fieldName: 'incomeSources',
    text: 'What are your main sources of household income?',
    description: 'Select all that apply to help determine LIHTC eligibility',
    helpText: 'Different income sources may be treated differently for LIHTC calculations',
    inputType: 'checkbox',
    required: true,
    options: [
      {
        value: 'wages',
        label: 'Wages/Salary',
        description: 'Income from employment'
      },
      {
        value: 'benefits',
        label: 'Government Benefits',
        description: 'SSI, SSDI, TANF, SNAP, etc.'
      },
      {
        value: 'childSupport',
        label: 'Child Support',
        description: 'Child support payments received'
      },
      {
        value: 'selfEmployment',
        label: 'Self-Employment',
        description: 'Income from self-employment or business'
      },
      {
        value: 'retirement',
        label: 'Retirement/Pension',
        description: 'Social Security, pension, 401k, etc.'
      },
      {
        value: 'other',
        label: 'Other Income',
        description: 'Other sources of income'
      }
    ],
    validations: [
      {
        type: 'required',
        message: 'At least one income source must be selected'
      }
    ],
    category: 'housing',
    priority: 6,
    whyAsking: 'Income sources help determine LIHTC eligibility and may affect rent calculations',
    nextQuestionId: 'lihtc-rent-affordability'
  },

  // Rent Affordability Question
  {
    id: 'lihtc-rent-affordability',
    fieldName: 'maxRentAffordable',
    text: 'What is the maximum monthly rent you can afford?',
    description: 'LIHTC units typically have rent caps at 30% of the applicable income limit',
    helpText: 'This helps determine if LIHTC housing is financially appropriate for your household',
    inputType: 'currency',
    required: true,
    min: 0,
    max: 10000,
    step: 50,
    validations: [
      {
        type: 'required',
        message: 'Maximum affordable rent is required'
      },
      {
        type: 'min',
        value: 0,
        message: 'Rent amount cannot be negative'
      }
    ],
    category: 'housing',
    priority: 7,
    whyAsking: 'Rent affordability helps determine if LIHTC housing is appropriate for your budget',
    nextQuestionId: 'lihtc-preferences'
  },

  // Housing Preferences
  {
    id: 'lihtc-preferences',
    fieldName: 'housingPreferences',
    text: 'Do you have any specific housing preferences or needs?',
    description: 'Select any that apply to help match you with appropriate LIHTC properties',
    helpText: 'These preferences help identify suitable LIHTC properties in your area',
    inputType: 'checkbox',
    required: false,
    options: [
      {
        value: 'accessible',
        label: 'Accessible/ADA Compliant',
        description: 'Wheelchair accessible or ADA compliant units'
      },
      {
        value: 'senior',
        label: 'Senior Housing',
        description: 'Age-restricted housing for seniors'
      },
      {
        value: 'family',
        label: 'Family Housing',
        description: 'Housing suitable for families with children'
      },
      {
        value: 'nearTransit',
        label: 'Near Public Transit',
        description: 'Close to bus stops or train stations'
      },
      {
        value: 'nearSchools',
        label: 'Near Schools',
        description: 'Close to schools or educational facilities'
      },
      {
        value: 'petFriendly',
        label: 'Pet Friendly',
        description: 'Allows pets'
      }
    ],
    category: 'housing',
    priority: 8,
    whyAsking: 'Housing preferences help match you with suitable LIHTC properties',
    nextQuestionId: 'lihtc-contact-preferences'
  },

  // Contact Preferences
  {
    id: 'lihtc-contact-preferences',
    fieldName: 'contactPreferences',
    text: 'How would you like to be contacted about LIHTC housing opportunities?',
    description: 'Select your preferred method for receiving housing information',
    helpText: 'This helps housing authorities contact you about available LIHTC units',
    inputType: 'checkbox',
    required: true,
    options: [
      {
        value: 'phone',
        label: 'Phone Call',
        description: 'Receive phone calls about housing opportunities'
      },
      {
        value: 'email',
        label: 'Email',
        description: 'Receive emails about housing opportunities'
      },
      {
        value: 'text',
        label: 'Text Message',
        description: 'Receive text messages about housing opportunities'
      },
      {
        value: 'mail',
        label: 'Mail',
        description: 'Receive mail about housing opportunities'
      }
    ],
    validations: [
      {
        type: 'required',
        message: 'At least one contact method must be selected'
      }
    ],
    category: 'housing',
    priority: 9,
    whyAsking: 'Contact preferences ensure you receive information about available LIHTC housing',
    nextQuestionId: 'lihtc-complete'
  },

  // Completion Question
  {
    id: 'lihtc-complete',
    fieldName: 'lihtcComplete',
    text: 'LIHTC Housing Assessment Complete',
    description: 'Thank you for completing the LIHTC housing assessment',
    helpText: 'Your responses will be used to determine LIHTC eligibility and match you with appropriate housing options',
    inputType: 'text',
    required: false,
    category: 'housing',
    priority: 10,
    whyAsking: 'This confirms completion of the LIHTC assessment',
    isTerminal: true
  },

  // Student Ineligible Question
  {
    id: 'lihtc-student-ineligible',
    fieldName: 'studentIneligible',
    text: 'Student Status May Affect Eligibility',
    description: 'Full-time students are generally ineligible for LIHTC housing',
    helpText: 'However, you may still be eligible for other housing programs. We will check your eligibility for alternative housing assistance.',
    inputType: 'text',
    required: false,
    category: 'housing',
    priority: 3.5,
    whyAsking: 'This explains why student status may affect LIHTC eligibility',
    nextQuestionId: 'lihtc-alternatives'
  },

  // Alternative Housing Programs
  {
    id: 'lihtc-alternatives',
    fieldName: 'alternativeHousing',
    text: 'Alternative Housing Programs',
    description: 'While LIHTC may not be available, other housing programs may be suitable',
    helpText: 'We will check your eligibility for Section 8, public housing, and other affordable housing programs',
    inputType: 'text',
    required: false,
    category: 'housing',
    priority: 3.6,
    whyAsking: 'This provides information about alternative housing programs',
    nextQuestionId: 'lihtc-complete'
  }
];

/**
 * LIHTC Question Flow Configuration
 */
export const LIHTC_QUESTION_FLOW = {
  id: 'lihtc-housing-flow',
  name: 'LIHTC Housing Eligibility Assessment',
  description: 'Comprehensive assessment for LIHTC housing eligibility',
  startQuestionId: 'lihtc-student-status',
  questions: LIHTC_QUESTIONS,
  estimatedTimeMinutes: 10,
  requiredFields: [
    'householdSize',
    'householdIncome',
    'state',
    'county',
    'studentStatus',
    'preferredUnitSize',
    'hasLivedInSubsidizedHousing',
    'incomeSources',
    'maxRentAffordable',
    'contactPreferences'
  ],
  optionalFields: [
    'housingPreferences'
  ]
};
