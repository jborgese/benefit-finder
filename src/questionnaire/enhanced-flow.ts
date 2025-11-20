/**
 * Enhanced Questionnaire Flow with California Integration
 *
 * This flow includes California-specific questions that only appear when the user selects California.
 */

import type { QuestionFlow, FlowNode } from './types';
import { getCaliforniaQuestions } from './california-questions';

// Constants for flow node IDs
const DISABILITY_STATUS_ID = 'disability-status';

// US States list for the state selection question
const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' }
];

// Comprehensive questionnaire flow for benefit eligibility assessment
const nodes: FlowNode[] = [
  // Basic Information Section
  {
    id: 'household-size',
    question: {
      id: 'household-size',
      text: 'How many people are in your household?',
      description: 'Include yourself and anyone who lives with you and shares expenses.',
      inputType: 'number',
      fieldName: 'householdSize',
      required: true,
      min: 1,
      max: 20,
      defaultValue: 1
    },
    nextId: 'income-period'
  },
  {
    id: 'income-period',
    question: {
      id: 'income-period',
      text: 'How would you like to enter your household income?',
      description: 'You can enter your income either monthly or annually - whichever is easier for you.',
      inputType: 'select',
      fieldName: 'incomePeriod',
      required: true,
      options: [
        { value: 'monthly', label: 'Monthly income (e.g., $3,000/month)' },
        { value: 'annual', label: 'Annual income (e.g., $36,000/year)' }
      ],
      defaultValue: 'monthly'
    },
    previousId: 'household-size',
    nextId: 'income'
  },
  {
    id: 'income',
    question: {
      id: 'income',
      text: (context: Record<string, unknown>) => {
        const incomePeriod = context.incomePeriod as string | undefined;

        if (import.meta.env.DEV) {
          console.log('[Enhanced Flow] Income question text function called', {
            context,
            incomePeriod,
            contextKeys: Object.keys(context),
            hasIncomePeriod: 'incomePeriod' in context,
          });
        }

        if (incomePeriod === 'monthly') {
          return 'What is your total monthly household income?';
        } else if (incomePeriod === 'annual') {
          return 'What is your total annual household income?';
        }
        // Default fallback
        return 'What is your total household income?';
      },
      description: (context: Record<string, unknown>) => {
        const incomePeriod = context.incomePeriod as string | undefined;

        if (import.meta.env.DEV) {
          console.log('[Enhanced Flow] Income question description function called', {
            context,
            incomePeriod,
            contextKeys: Object.keys(context),
          });
        }

        if (incomePeriod === 'monthly') {
          return 'Include all income sources: wages, benefits, child support, etc. Enter your monthly total.';
        } else if (incomePeriod === 'annual') {
          return 'Include all income sources: wages, benefits, child support, etc. Enter your annual total.';
        }
        // Default fallback
        return 'Include all income sources: wages, benefits, child support, etc.';
      },
      inputType: 'currency',
      fieldName: 'householdIncome',
      required: true,
      min: 0
    },
    previousId: 'income-period',
    nextId: 'date-of-birth'
  },
  {
    id: 'date-of-birth',
    question: {
      id: 'date-of-birth',
      text: 'What is your date of birth?',
      description: 'We need your exact birth date to determine your age for eligibility calculations.',
      inputType: 'date',
      fieldName: 'dateOfBirth',
      required: true,
      helpText: 'Your age will be calculated automatically from your birth date.'
    },
    previousId: 'income',
    nextId: 'citizenship'
  },

  // Priority 1: Essential Eligibility Questions
  {
    id: 'citizenship',
    question: {
      id: 'citizenship',
      text: 'What is your citizenship status?',
      description: 'This helps determine which programs you may be eligible for.',
      inputType: 'select',
      fieldName: 'citizenship',
      required: true,
      options: [
        { value: 'us_citizen', label: 'U.S. Citizen' },
        { value: 'permanent_resident', label: 'Permanent Resident (Green Card)' },
        { value: 'refugee', label: 'Refugee' },
        { value: 'asylee', label: 'Asylee' },
        { value: 'other', label: 'Other Status' }
      ],
      defaultValue: 'us_citizen'
    },
    previousId: 'date-of-birth',
    nextId: 'state'
  },
  {
    id: 'state',
    question: {
      id: 'state',
      text: 'What state do you live in?',
      description: 'Benefits vary by state, so we need to know where you live.',
      inputType: 'searchable-select',
      fieldName: 'state',
      required: true,
      options: US_STATES,
      triggers: [
        {
          type: 'show',
          targetId: 'immigration-status-ca',
          condition: { '==': [{ var: 'state' }, 'CA'] }
        }
      ]
    },
    previousId: 'citizenship',
    nextId: 'county'
  },
  {
    id: 'county',
    question: {
      id: 'county',
      text: 'Which county do you live in?',
      description: 'Some programs may have county-specific requirements or assistance.',
      inputType: 'searchable-select',
      fieldName: 'county',
      required: true,
      helpText: 'County information helps connect you with local resources and county-specific programs.'
    },
    previousId: 'state',
    nextId: 'immigration-status-ca' // This will be dynamically set based on state
  },

  // California-specific questions (only shown if state === 'CA')
  ...getCaliforniaQuestions(),

  // Continue with regular flow after California questions
  {
    id: DISABILITY_STATUS_ID,
    question: {
      id: DISABILITY_STATUS_ID,
      text: 'Do you have a disability that affects your ability to work?',
      description: 'This may qualify you for additional programs and benefits.',
      inputType: 'boolean',
      fieldName: 'hasQualifyingDisability',
      required: true
    },
    previousId: 'california-assistance-preferences-ca', // This will be dynamically set
    nextId: 'pregnancy-status'
  },
  {
    id: 'pregnancy-status',
    question: {
      id: 'pregnancy-status',
      text: 'Are you pregnant or have you recently had a baby?',
      description: 'This may qualify you for special programs for pregnant women and new mothers.',
      inputType: 'boolean',
      fieldName: 'isPregnant',
      required: true
    },
    previousId: DISABILITY_STATUS_ID,
    nextId: 'existing-benefits'
  },
  {
    id: 'existing-benefits',
    question: {
      id: 'existing-benefits',
      text: 'Do you currently receive any of these benefits?',
      description: 'This helps us avoid duplicating benefits you already have.',
      inputType: 'multiselect',
      fieldName: 'existingBenefits',
      required: false,
      options: [
        { value: 'snap', label: 'SNAP (Food Stamps)' },
        { value: 'medicaid', label: 'Medicaid' },
        { value: 'tanf', label: 'TANF (Cash Assistance)' },
        { value: 'wic', label: 'WIC' },
        { value: 'ssi', label: 'SSI (Supplemental Security Income)' },
        { value: 'ssdi', label: 'SSDI (Social Security Disability)' },
        { value: 'unemployment', label: 'Unemployment Benefits' }
      ]
    },
    previousId: 'pregnancy-status',
    nextId: 'work-status'
  },

  // Priority 3: For Complete Assessment
  {
    id: 'work-status',
    question: {
      id: 'work-status',
      text: 'What is your current work status?',
      description: 'This helps determine work requirements for certain programs.',
      inputType: 'select',
      fieldName: 'employmentStatus',
      required: true,
      options: [
        { value: 'employed', label: 'Employed' },
        { value: 'unemployed', label: 'Unemployed' },
        { value: 'self_employed', label: 'Self-Employed' },
        { value: 'retired', label: 'Retired' },
        { value: 'disabled', label: 'Disabled' },
        { value: 'student', label: 'Student' }
      ],
      defaultValue: 'employed'
    },
    previousId: 'existing-benefits',
    nextId: 'student-status'
  },
  {
    id: 'student-status',
    question: {
      id: 'student-status',
      text: 'Are you enrolled in college at least half-time?',
      description: 'College students may have additional eligibility requirements for some programs.',
      inputType: 'boolean',
      fieldName: 'isStudent',
      required: false,
      showIf: { '==': [{ var: 'employmentStatus' }, 'student'] }
    },
    previousId: 'work-status',
    nextId: 'has-children'
  },
  {
    id: 'has-children',
    question: {
      id: 'has-children',
      text: 'Do you have children under 18 living with you?',
      description: 'This may qualify you for additional programs and benefits.',
      inputType: 'boolean',
      fieldName: 'hasChildren',
      required: true
    },
    previousId: 'student-status',
    nextId: 'criminal-background'
  },

  // LIHTC-Specific Questions
  {
    id: 'criminal-background',
    question: {
      id: 'criminal-background',
      text: 'Do you or any household members have a criminal background?',
      description: 'This information is required for housing programs and will be verified through background checks.',
      inputType: 'boolean',
      fieldName: 'hasCriminalHistory',
      required: true,
      helpText: 'Include any convictions, pending charges, or arrests. This information is used for housing eligibility determination.'
    },
    previousId: 'has-children',
    nextId: 'rental-history'
  },
  {
    id: 'rental-history',
    question: {
      id: 'rental-history',
      text: 'Have you ever been evicted from housing?',
      description: 'This includes formal evictions, lease violations, or being asked to leave housing.',
      inputType: 'boolean',
      fieldName: 'hasEvictionHistory',
      required: true,
      helpText: 'Be honest about your rental history. This information helps determine housing program eligibility.'
    },
    previousId: 'criminal-background',
    nextId: 'rental-references'
  },
  {
    id: 'rental-references',
    question: {
      id: 'rental-references',
      text: 'Do you have rental references from previous landlords?',
      description: 'Housing programs typically require references from previous landlords.',
      inputType: 'boolean',
      fieldName: 'hasRentalReferences',
      required: true,
      helpText: 'References from previous landlords help demonstrate good rental history.'
    },
    previousId: 'rental-history',
    nextId: 'income-verification-method'
  },
  {
    id: 'income-verification-method',
    question: {
      id: 'income-verification-method',
      text: 'How can you verify your income?',
      description: 'Select all methods available to you for income verification.',
      inputType: 'multiselect',
      fieldName: 'incomeVerificationMethods',
      required: true,
      options: [
        { value: 'pay_stubs', label: 'Pay stubs (last 3 months)' },
        { value: 'tax_returns', label: 'Tax returns (last 2 years)' },
        { value: 'bank_statements', label: 'Bank statements (last 3 months)' },
        { value: 'employer_letter', label: 'Employer verification letter' },
        { value: 'ssa_benefits', label: 'Social Security award letters' },
        { value: 'unemployment', label: 'Unemployment benefits documentation' },
        { value: 'child_support', label: 'Child support documentation' },
        { value: 'other', label: 'Other income verification' }
      ],
      helpText: 'You will need to provide documentation to verify your income for housing programs.'
    },
    previousId: 'rental-references',
    isTerminal: true
  }
];

/**
 * Link county node to first California question or disability status
 */
function linkCountyNode(
  flow: QuestionFlow,
  californiaQuestions: FlowNode[]
): void {
  const countyNode = flow.nodes.get('county');
  if (!countyNode) {return;}

  countyNode.nextId = californiaQuestions.length > 0
    ? californiaQuestions[0].id
    : DISABILITY_STATUS_ID;
  flow.nodes.set('county', countyNode);
}

/**
 * Link first California question back to county
 */
function linkFirstCaliforniaQuestion(
  flow: QuestionFlow,
  californiaQuestions: FlowNode[]
): void {
  if (californiaQuestions.length === 0) {return;}

  const firstCaliforniaQuestion = californiaQuestions[0];
  const firstCaliforniaNode = flow.nodes.get(firstCaliforniaQuestion.id);
  if (firstCaliforniaNode) {
    firstCaliforniaNode.previousId = 'county';
    flow.nodes.set(firstCaliforniaQuestion.id, firstCaliforniaNode);
  }
}

/**
 * Link last California question to disability status
 */
function linkLastCaliforniaQuestion(
  flow: QuestionFlow,
  californiaQuestions: FlowNode[]
): void {
  if (californiaQuestions.length === 0) {return;}

  const lastCaliforniaQuestion = californiaQuestions[californiaQuestions.length - 1];
  const lastCaliforniaNode = flow.nodes.get(lastCaliforniaQuestion.id);
  if (lastCaliforniaNode) {
    lastCaliforniaNode.nextId = DISABILITY_STATUS_ID;
    flow.nodes.set(lastCaliforniaQuestion.id, lastCaliforniaNode);
  }

  const disabilityNode = flow.nodes.get(DISABILITY_STATUS_ID);
  if (disabilityNode) {
    disabilityNode.previousId = lastCaliforniaQuestion.id;
    flow.nodes.set(DISABILITY_STATUS_ID, disabilityNode);
  }
}

/**
 * Link county directly to disability status when no California questions exist
 */
function linkCountyToDisability(flow: QuestionFlow): void {
  const countyNode = flow.nodes.get('county');
  const disabilityNode = flow.nodes.get(DISABILITY_STATUS_ID);
  if (countyNode && disabilityNode) {
    disabilityNode.previousId = 'county';
    flow.nodes.set(DISABILITY_STATUS_ID, disabilityNode);
  }
}

/**
 * Create the enhanced questionnaire flow with California integration
 */
export function createEnhancedFlow(): QuestionFlow {
  // Create the base flow
  const flow: QuestionFlow = {
    id: 'benefit-eligibility-enhanced',
    name: 'Enhanced Benefit Eligibility Assessment',
    version: '3.0.0',
    description: 'Comprehensive assessment to check eligibility for government benefits including SNAP, Medicaid, WIC, and state-specific programs with California-specific questions',
    startNodeId: 'household-size',
    nodes: new Map()
  };

  // Add all nodes to the flow
  nodes.forEach(node => {
    flow.nodes.set(node.id, node);
  });

  // Set up proper linking for California questions
  const californiaQuestions = getCaliforniaQuestions();

  linkCountyNode(flow, californiaQuestions);
  linkFirstCaliforniaQuestion(flow, californiaQuestions);

  if (californiaQuestions.length > 0) {
    linkLastCaliforniaQuestion(flow, californiaQuestions);
  } else {
    linkCountyToDisability(flow);
  }

  return flow;
}

// Export the enhanced flow
export const enhancedFlow = createEnhancedFlow();
