/**
 * Result transformation utilities
 * Converts evaluation results to display format
 */

import type { EligibilityEvaluationResult } from '../../rules';
import { getProgramName, getProgramDescription } from '../../utils/programHelpers';
import { formatCriteriaDetails } from '../../utils/formatCriteriaDetails';
import { US_FEDERAL_JURISDICTION } from '../constants';

export function createResultFromEvaluation(
  result: EligibilityEvaluationResult,
  programRulesMap: Map<string, string[]>
): {
  programId: string;
  programName: string;
  programDescription: string;
  jurisdiction: string;
  confidenceScore: number;
  explanation: {
    reason: string;
    details: string[];
    rulesCited: string[];
  };
  requiredDocuments: Array<{
    id: string;
    name: string;
    required: boolean;
    description?: string;
    where?: string;
  }>;
  nextSteps: Array<{
    step: string;
    url?: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  evaluatedAt: Date;
  rulesVersion: string;
  estimatedBenefit?: {
    amount: number;
    frequency: 'monthly' | 'annual' | 'one-time';
    description?: string;
  };
} {
  const baseResult = {
    programId: result.programId,
    programName: getProgramName(result.programId),
    programDescription: getProgramDescription(result.programId),
    jurisdiction: US_FEDERAL_JURISDICTION,
    confidenceScore: result.confidence,
    explanation: {
      reason: result.reason,
      details: formatCriteriaDetails(result.criteriaResults, result.eligible, result.programId),
      rulesCited: programRulesMap.get(result.programId) ?? [result.ruleId]
    },
    requiredDocuments: result.requiredDocuments?.map(doc => ({
      id: `doc-${Math.random().toString(36).substr(2, 9)}`,
      name: doc.document,
      required: true,
      description: doc.description,
      where: doc.where
    })) ?? [],
    nextSteps: result.nextSteps?.map(step => ({
      step: step.step,
      url: step.url,
      priority: step.priority ?? 'medium' as const
    })) ?? [],
    evaluatedAt: new Date(result.evaluatedAt),
    rulesVersion: result.ruleVersion ?? '1.0.0'
  };

  if (result.estimatedBenefit) {
    return {
      ...baseResult,
      estimatedBenefit: {
        amount: result.estimatedBenefit.amount ?? 0,
        frequency: ((): 'monthly' | 'annual' | 'one-time' => {
          const freq = result.estimatedBenefit.frequency;
          if (freq === 'one_time') { return 'one-time'; }
          if (freq === 'quarterly') { return 'monthly'; }
          if (freq === 'annual') { return 'annual'; }
          return 'monthly';
        })(),
        description: result.estimatedBenefit.description
      }
    };
  }

  return baseResult;
}
