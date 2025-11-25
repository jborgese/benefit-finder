/**
 * Program evaluation logic
 */

import type { RuleDefinition, RulePackage } from '../../../rules/core/schema';
import type { ProgramEligibilityResult } from '../types';
import type { UserProfile, ProgramInfo } from './types';
import { evaluateRules } from './ruleEvaluation';
import { determineStatus, getReasonText } from './statusDetermination';
import { collectRequirements } from './requirements';

/**
 * Gathers program information from rule package
 */
export function gatherProgramInfo(rulePackage: RulePackage, _programId: string): ProgramInfo {
  return {
    programName: rulePackage.metadata.name,
    programDescription: rulePackage.metadata.description ?? '',
    jurisdiction: rulePackage.metadata.jurisdiction ?? 'US-FEDERAL',
  };
}

/**
 * Evaluates eligibility for a single program
 */
export function evaluateProgram(
  programId: string,
  rules: RuleDefinition[],
  profile: UserProfile,
  rulePackage: RulePackage
): ProgramEligibilityResult | null {
  // Add SNAP-specific debug logging
  if (programId.includes('snap') && import.meta.env.DEV) {
    console.warn(`🔍 [SNAP DEBUG] Starting program evaluation:`);
    console.warn(`  - Program ID: ${programId}`);
    console.warn(`  - Rules Count: ${rules.length}`);
    console.warn(`  - Profile Data:`, {
      householdIncome: profile.householdIncome,
      householdSize: profile.householdSize,
      incomePeriod: profile.incomePeriod,
      citizenship: profile.citizenship,
      state: profile.state
    });
  }

  // Evaluate all rules and collect results
  const evaluationData = evaluateRules(rules, profile);

  // Add SNAP-specific debug logging for evaluation results
  if (programId.includes('snap') && import.meta.env.DEV) {
    console.warn(`🔍 [SNAP DEBUG] Rule evaluation results:`);
    console.warn(`  - Passed Rules: ${evaluationData.passedRules}/${evaluationData.totalRules}`);
    console.warn(`  - Has Income Failure: ${evaluationData.hasIncomeFailure}`);
    console.warn(`  - Rules Cited: ${evaluationData.rulesCited.join(', ')}`);
    console.warn(`  - Details: ${evaluationData.details.join('; ')}`);
  }

  // Determine eligibility status
  const statusData = determineStatus(evaluationData.passedRules, evaluationData.totalRules, evaluationData.hasIncomeFailure);

  // Add SNAP-specific debug logging for final status
  if (programId.includes('snap') && import.meta.env.DEV) {
    console.warn(`🔍 [SNAP DEBUG] Final eligibility status:`);
    console.warn(`  - Status: ${statusData.status}`);
    console.warn(`  - Confidence: ${statusData.confidence}`);
    console.warn(`  - Confidence Score: ${statusData.confidenceScore}`);
  }

  // Gather program information
  const programInfo = gatherProgramInfo(rulePackage, programId);

  // Collect documents and next steps
  const requirements = collectRequirements(rules, evaluationData.passedRules);

  // Build explanation
  const reason = getReasonText(statusData.status, evaluationData.passedRules, evaluationData.totalRules);

  return {
    programId,
    ...programInfo,
    ...statusData,
    explanation: {
      reason,
      details: evaluationData.details,
      rulesCited: evaluationData.rulesCited,
      calculations: evaluationData.calculations.length > 0 ? evaluationData.calculations : undefined,
    },
    ...requirements,
    evaluatedAt: new Date(),
    rulesVersion: '',
  };
}
