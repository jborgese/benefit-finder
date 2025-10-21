import type { QuestionFlow, FlowNode } from './types';

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
      max: 20
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
      ]
    },
    previousId: 'household-size',
    nextId: 'income'
  },
  {
    id: 'income',
    question: {
      id: 'income',
      text: 'What is your total household income?',
      description: 'Include all income sources: wages, benefits, child support, etc.',
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
      ]
    },
    previousId: 'date-of-birth',
    nextId: 'state'
  },
  {
    id: 'state',
    question: {
      id: 'state',
      text: 'What state do you live in?',
      description: 'Benefits vary by state, so this helps us give you accurate information.',
      inputType: 'select',
      fieldName: 'state',
      required: true,
      options: US_STATES
    },
    previousId: 'citizenship',
    nextId: 'household-assets'
  },
  {
    id: 'household-assets',
    question: {
      id: 'household-assets',
      text: 'What is the total value of your household assets?',
      description: 'Include bank accounts, cash, investments, and savings. Do not include your home, one vehicle, or retirement accounts.',
      inputType: 'currency',
      fieldName: 'householdAssets',
      required: true,
      min: 0,
      placeholder: 'Enter amount in dollars'
    },
    previousId: 'state',
    nextId: 'disability-status'
  },

  // Priority 2: Important for Specific Programs
  {
    id: 'disability-status',
    question: {
      id: 'disability-status',
      text: 'Do you have a disability or receive SSI/SSDI benefits?',
      description: 'This may qualify you for additional programs and higher asset limits.',
      inputType: 'boolean',
      fieldName: 'hasQualifyingDisability',
      required: true
    },
    previousId: 'household-assets',
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
    previousId: 'disability-status',
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
      ]
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
    isTerminal: true
  }
];

export const sampleFlow: QuestionFlow = {
  id: 'benefit-eligibility',
  name: 'Benefit Eligibility Assessment',
  version: '2.0.0',
  description: 'Comprehensive assessment to check eligibility for government benefits including SNAP, Medicaid, WIC, and state-specific programs',
  startNodeId: 'household-size',
  nodes: new Map(nodes.map(node => [node.id, node]))
};

