import type { EligibilityResults } from '../components/results';

// Constants
const US_FEDERAL_JURISDICTION = 'US-FEDERAL';

/**
 * Create sample results for testing purposes
 */
export function createSampleResults(): EligibilityResults {
  return {
    qualified: [
      {
        programId: 'snap-federal',
        programName: 'Supplemental Nutrition Assistance Program (SNAP)',
        programDescription: 'SNAP helps low-income individuals and families buy food',
        jurisdiction: US_FEDERAL_JURISDICTION,
        status: 'qualified' as const,
        confidence: 'high' as const,
        confidenceScore: 95,
        explanation: {
          reason: 'Your household income of $1,800/month falls below the SNAP income limits for your household size.',
          details: ['Your household\'s monthly income: $1,800 (within limit of $2,072)', 'Your household size: 2 people (meets requirements)'],
          rulesCited: ['snap-federal']
        },
        requiredDocuments: [
          {
            id: 'doc-income-proof',
            name: 'Proof of Income',
            required: true,
            description: 'Pay stubs from the last 30 days or unemployment benefits letter',
            where: 'Available from employer or benefits office'
          }
        ],
        nextSteps: [
          {
            step: 'Apply online or visit your local SNAP office',
            url: 'https://www.benefits.gov/benefit/361',
            priority: 'high' as const
          }
        ],
        estimatedBenefit: {
          amount: 291,
          frequency: 'monthly' as const,
          description: 'Based on household size and income'
        },
        evaluatedAt: new Date(),
        rulesVersion: '1.0.0'
      }
    ],
    likely: [],
    maybe: [
      {
        programId: 'medicaid-federal',
        programName: 'Medicaid',
        programDescription: 'Health coverage for low-income individuals and families',
        jurisdiction: US_FEDERAL_JURISDICTION,
        status: 'maybe' as const,
        confidence: 'medium' as const,
        confidenceScore: 65,
        explanation: {
          reason: 'You may qualify based on income, but additional information about assets and state expansion is needed.',
          details: ['Your income appears to be within limits', 'Asset information needed for complete determination'],
          rulesCited: ['medicaid-federal']
        },
        requiredDocuments: [
          {
            id: 'doc-asset-info',
            name: 'Asset Information',
            required: true,
            description: 'Bank statements and asset documentation',
            where: 'Available from financial institutions'
          }
        ],
        nextSteps: [
          {
            step: 'Contact local Medicaid office for complete assessment',
            priority: 'medium' as const
          }
        ],
        evaluatedAt: new Date(),
        rulesVersion: '1.0.0'
      }
    ],
    notQualified: [],
    totalPrograms: 2,
    evaluatedAt: new Date()
  };
}

