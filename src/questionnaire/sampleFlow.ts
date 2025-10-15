import type { QuestionFlow, FlowNode } from './types';

// Sample questionnaire flow for testing
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
    isTerminal: true
  }
];

export const sampleFlow: QuestionFlow = {
  id: 'benefit-eligibility',
  name: 'Benefit Eligibility Assessment',
  version: '1.0.0',
  description: 'Complete assessment to check eligibility for government benefits',
  startNodeId: 'household-size',
  nodes: new Map(nodes.map(node => [node.id, node]))
};

