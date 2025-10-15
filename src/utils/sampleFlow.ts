/**
 * Sample questionnaire flow configuration
 */

import type { QuestionFlow, FlowNode } from '../questionnaire/types';
import { US_STATE_OPTIONS } from './stateOptions';

/**
 * Sample questionnaire flow nodes for benefit eligibility assessment
 */
const nodes: FlowNode[] = [
  {
    id: 'household-size',
    question: {
      id: 'household-size',
      text: 'How many people are in your household?',
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
    nextId: 'income'
  },
  {
    id: 'income',
    question: {
      id: 'income',
      text: 'What is your total household income?',
      inputType: 'currency',
      fieldName: 'householdIncome',
      required: true,
      min: 0
    },
    nextId: 'age'
  },
  {
    id: 'age',
    question: {
      id: 'age',
      text: 'What is your age?',
      inputType: 'number',
      fieldName: 'age',
      required: true,
      min: 0,
      max: 120
    },
    nextId: 'state'
  },
  {
    id: 'state',
    question: {
      id: 'state',
      text: 'Which state do you live in?',
      description: 'This is important because Medicaid coverage varies by state.',
      inputType: 'select',
      fieldName: 'state',
      required: true,
      options: US_STATE_OPTIONS
    },
    nextId: 'citizenship'
  },
  {
    id: 'citizenship',
    question: {
      id: 'citizenship',
      text: 'What is your citizenship or immigration status?',
      description: 'This affects eligibility for government benefits.',
      inputType: 'select',
      fieldName: 'citizenship',
      required: true,
      options: [
        { value: 'us_citizen', label: 'U.S. Citizen' },
        { value: 'permanent_resident', label: 'Permanent Resident (Green Card)' },
        { value: 'refugee', label: 'Refugee' },
        { value: 'asylee', label: 'Asylee' },
        { value: 'other', label: 'Other immigration status' }
      ]
    },
    nextId: 'categorical-eligibility'
  },
  {
    id: 'categorical-eligibility',
    question: {
      id: 'categorical-eligibility',
      text: 'Do any of these apply to you?',
      description: 'Select all that apply. These factors can affect your eligibility.',
      inputType: 'multiselect',
      fieldName: 'categories',
      required: false,
      options: [
        { value: 'pregnant', label: 'I am pregnant' },
        { value: 'has_children', label: 'I have children under 18' },
        { value: 'has_disability', label: 'I have a disability' },
        { value: 'is_veteran', label: 'I am a veteran' },
        { value: 'needs_long_term_care', label: 'I need long-term care or nursing home services' }
      ]
    },
    isTerminal: true
  }
];

/**
 * Sample questionnaire flow for benefit eligibility assessment
 */
export const sampleFlow: QuestionFlow = {
  id: 'benefit-eligibility',
  name: 'Benefit Eligibility Assessment',
  version: '1.0.0',
  description: 'Complete assessment to check eligibility for government benefits',
  startNodeId: 'household-size',
  nodes: new Map(nodes.map(node => [node.id, node]))
};

