/**
 * Eligibility Evaluation
 *
 * High-level functions for evaluating benefit program eligibility.
 * Integrates rule evaluation, result caching, and result generation.
 */

import { getDatabase } from '../../db/database';
import type { DetailedEvaluationResult } from './detailedEvaluator';
import { evaluateRuleWithDetails } from './detailedEvaluator';
import type { JsonLogicRule } from './types';

// Import types
import type {
  EligibilityEvaluationResult,
  EligibilityEvaluationOptions,
  BatchEligibilityResult,
} from './eligibility/types';

// Import helper functions
import { checkCache, cacheResult } from './eligibility/cache';
import {
  getEvaluationEntities,
  getAllProgramRuleIds,
  evaluateAllRules,
  selectResultRule,
  buildEvaluationResult,
  buildErrorResult,
  prepareDataContext,
  ensureOperatorsRegistered
} from './eligibility/evaluation';
import { generateCriteriaBreakdown } from './eligibility/utils';
import { ensureSNAPRulesAreCorrect } from './eligibility/snap';

// Re-export types
export type {
  EligibilityEvaluationResult,
  EligibilityEvaluationOptions,
  BatchEligibilityResult,
};

// Re-export helper functions
export { getAllProgramRuleIds, ensureSNAPRulesAreCorrect };

// Global debug log utility
function debugLog(...args: unknown[]): void {
  if (import.meta.env.DEV) {
    console.debug('[Eligibility Debug]', ...args);
  }
}

// ============================================================================
// MAIN EVALUATION FUNCTIONS
// ============================================================================





/**
 * Process benefit amount rules for eligible programs
 */
function processBenefitAmountRules(
  rules: Array<{ id: string; ruleType: string; ruleLogic: JsonLogicRule }>,
  data: Record<string, unknown>,
  overallEligible: boolean
): { amount: number; frequency: 'one_time' | 'monthly' | 'quarterly' | 'annual'; description?: string } | undefined {
  if (!overallEligible) {
    return undefined;
  }

  const benefitAmountRules = rules.filter(rule => rule.ruleType === 'benefit_amount');
  debugLog('Processing benefit amount rules', { benefitAmountRulesCount: benefitAmountRules.length });

  for (const benefitRule of benefitAmountRules) {
    try {
      const benefitResult = evaluateRuleWithDetails(
        benefitRule.ruleLogic,
        data
      );

      if (benefitResult.success && benefitResult.result && typeof benefitResult.result === 'object') {
        const benefitInfo = benefitResult.result as { amount: number; frequency: 'one_time' | 'monthly' | 'quarterly' | 'annual'; description?: string };
        if (benefitInfo.amount > 0) {
          debugLog('Benefit amount calculated', { ruleId: benefitRule.id, estimatedBenefit: benefitInfo });
          return benefitInfo; // Use the first matching benefit amount rule
        }
      }
    } catch (error) {
      debugLog('Error evaluating benefit amount rule', { ruleId: benefitRule.id, error });
    }
  }

  return undefined;
}

/**
 * Log debug information for development
 */
function logDebugInfo(
  resultRule: { id: string },
  resultRuleDetails: unknown,
  result: EligibilityEvaluationResult,
  ruleResults: Array<{ rule: { id: string; priority: number }; evalResult: { success: boolean; result: unknown } }>,
  overallEligible: boolean,
  programId: string
): void {
  if (!import.meta.env.DEV) {
    return;
  }

  debugLog('DEV: Building final result for rule:', resultRule.id);
  console.log('eligibility.ts - evaluateEligibility - 🔍 [DEBUG] Building final result for rule:', resultRule.id);
  console.log('eligibility.ts - evaluateEligibility - 🔍 [DEBUG] Result rule details found:', !!resultRuleDetails);
  console.log('eligibility.ts - evaluateEligibility - 🔍 [DEBUG] Result rule details:', resultRuleDetails);

  if (resultRuleDetails && typeof resultRuleDetails === 'object' && 'criteriaResults' in resultRuleDetails) {
    const details = resultRuleDetails as DetailedEvaluationResult;
    console.log('eligibility.ts - evaluateEligibility - 🔍 [DEBUG] Criteria results count:', details.criteriaResults.length);
    console.log('eligibility.ts - evaluateEligibility - 🔍 [DEBUG] Criteria results:', details.criteriaResults);
  }

  console.log('eligibility.ts - evaluateEligibility - 🔍 [DEBUG] Final built result:', {
    ruleId: result.ruleId,
    eligible: result.eligible,
    criteriaResults: result.criteriaResults,
    criteriaResultsCount: result.criteriaResults?.length ?? 0
  });
  console.warn(`eligibility.ts - evaluateEligibility - 🔍 [DEBUG] evaluateEligibility: Built result for ${programId}:`, {
    eligible: result.eligible,
    confidence: result.confidence,
    reason: result.reason,
    missingFields: result.missingFields,
    ruleId: result.ruleId,
    executionTime: result.executionTime,
    rulesEvaluated: ruleResults.length,
    allRulesPassed: overallEligible,
    ruleBreakdown: ruleResults.map(r => ({
      ruleId: r.rule.id,
      passed: r.evalResult.success ? Boolean(r.evalResult.result) : false,
      priority: r.rule.priority
    }))
  });
}

/**
 * Evaluate eligibility for a single program
 */
export async function evaluateEligibility(
  profileId: string,
  programId: string,
  options: EligibilityEvaluationOptions = {}
): Promise<EligibilityEvaluationResult> {
  debugLog('Evaluating eligibility', { profileId, programId, options });
  ensureOperatorsRegistered();

  const startTime = performance.now();

  const opts = {
    cacheResult: options.cacheResult !== false,
    includeBreakdown: options.includeBreakdown !== false,
    forceReEvaluation: options.forceReEvaluation ?? false,
    expiresIn: options.expiresIn ?? 1000 * 60 * 60 * 24 * 30,
    evaluationOptions: options.evaluationOptions ?? {},
  };

  try {
    // Check cache first
    const cachedResult = await checkCache(profileId, programId, startTime, opts.forceReEvaluation);
    if (cachedResult) {
      debugLog('Returning cached eligibility result', cachedResult);
      return cachedResult;
    }

    // Get required entities
    const { profile, rules } = await getEvaluationEntities(profileId, programId);

    // Prepare data
    const data = await prepareDataContext(profile);

    // Evaluate ALL rules - ALL must pass for eligibility
    const {
      ruleResults,
      overallEligible,
      firstFailedRule,
      firstFailedResult,
      allMissingFields
    } = evaluateAllRules(rules, data, profileId, programId);

    const executionTime = performance.now() - startTime;
    const finalMissingFields = Array.from(allMissingFields);

    debugLog('Summary after rule evaluation', {
      ruleResults, overallEligible, firstFailedRule, firstFailedResult, allMissingFields: finalMissingFields, executionTime
    });

    // Select result rule and create combined result
    const { resultRule, combinedEvalResult } = selectResultRule(
      rules,
      ruleResults,
      overallEligible,
      firstFailedRule,
      firstFailedResult
    );

    debugLog('Result rule selected', { resultRule, combinedEvalResult });

    // Process benefit amount rules if eligible
    const estimatedBenefit = processBenefitAmountRules(rules, data, overallEligible);

    const resultRuleDetails = ruleResults.find(r => r.rule.id === resultRule.id)?.detailedResult;

    // Create fallback detailed result if none found
    const fallbackDetailedResult: DetailedEvaluationResult = {
      result: combinedEvalResult.result,
      success: combinedEvalResult.success,
      executionTime: combinedEvalResult.executionTime,
      criteriaResults: []
    };

    const result = buildEvaluationResult(
      profileId,
      programId,
      resultRule,
      combinedEvalResult,
      resultRuleDetails ? (resultRuleDetails as DetailedEvaluationResult) : fallbackDetailedResult,
      finalMissingFields,
      executionTime,
      estimatedBenefit
    );

    debugLog('Final built result', result);

    // Log debug information
    logDebugInfo(resultRule, resultRuleDetails, result, ruleResults, overallEligible, programId);

    // Add detailed breakdown if requested and no detailed results are available
    if (opts.includeBreakdown && (!result.criteriaResults || result.criteriaResults.length === 0)) {
      debugLog('Generating detailed criteria breakdown...');
      result.criteriaResults = generateCriteriaBreakdown(resultRule, data, combinedEvalResult);
    }

    // Cache result if enabled
    if (opts.cacheResult && combinedEvalResult.success) {
      debugLog('Caching eligibility result...');
      await cacheResult(result, opts.expiresIn);
    }

    debugLog('Returning eligibility result', result);

    return result;

  } catch (error) {
    debugLog('Error caught during eligibility evaluation', error);
    const executionTime = performance.now() - startTime;
    return buildErrorResult(profileId, programId, error, executionTime);
  }
}

/**
 * Evaluate eligibility for multiple programs
 *
 * @param profileId User profile ID
 * @param programIds Array of program IDs
 * @param options Evaluation options
 * @returns Batch eligibility result
 */
export async function evaluateMultiplePrograms(
  profileId: string,
  programIds: string[],
  options: EligibilityEvaluationOptions = {}
): Promise<BatchEligibilityResult> {
  debugLog('Batch eligibility evaluation started', { profileId, programIds, options });
  if (import.meta.env.DEV) {
    console.warn('🔍 [DEBUG] evaluateMultiplePrograms: Starting batch evaluation:', {
      profileId,
      programIds,
      options
    });
  }

  const startTime = performance.now();
  const programResults = new Map<string, EligibilityEvaluationResult>();

  // Evaluate each program
  for (const programId of programIds) {
    debugLog('Evaluating next program in batch', programId);
    if (import.meta.env.DEV) {
      console.warn(`🔍 [DEBUG] evaluateMultiplePrograms: Evaluating program ${programId}...`);
    }

    try {
      const result = await evaluateEligibility(profileId, programId, options);
      programResults.set(programId, result);
      debugLog('Program eligibility result', { programId, result });
      if (import.meta.env.DEV) {
        console.warn(`🔍 [DEBUG] evaluateMultiplePrograms: Program ${programId} result:`, {
          eligible: result.eligible,
          confidence: result.confidence,
          ruleId: result.ruleId,
          reason: result.reason,
          executionTime: result.executionTime
        });
      }
    } catch (error) {
      debugLog('Error evaluating program in batch', { programId, error });
      console.error(`🚨 [ERROR] evaluateMultiplePrograms: Failed to evaluate program ${programId}:`, error);
    }
  }

  const endTime = performance.now();

  // Calculate summary
  const results = Array.from(programResults.values());
  const summary = {
    total: results.length,
    eligible: results.filter((r) => r.eligible).length,
    ineligible: results.filter((r) => !r.eligible && !r.incomplete).length,
    incomplete: results.filter((r) => r.incomplete).length,
    needsReview: results.filter((r) => r.needsReview).length,
  };

  debugLog('Batch evaluation complete', { totalTime: endTime - startTime, summary, rawResults: programResults });

  if (import.meta.env.DEV) {
    console.warn('🔍 [DEBUG] evaluateMultiplePrograms: Batch evaluation complete:', {
      totalTime: endTime - startTime,
      summary,
      programResults: Array.from(programResults.entries()).map(([id, result]) => ({
        programId: id,
        eligible: result.eligible,
        confidence: result.confidence,
        ruleId: result.ruleId
      }))
    });
  }

  return {
    profileId,
    programResults,
    summary,
    totalTime: endTime - startTime,
  };
}

/**
 * Evaluate eligibility for all available programs
 *
 * @param profileId User profile ID
 * @param options Evaluation options
 * @returns Batch eligibility result
 */
export async function evaluateAllPrograms(
  profileId: string,
  options: EligibilityEvaluationOptions = {}
): Promise<BatchEligibilityResult> {
  debugLog('Evaluating all programs for profile', { profileId, options });
  if (import.meta.env.DEV) {
    console.warn('🔍 [DEBUG] evaluateAllPrograms: Starting evaluation for profile:', profileId);
  }

  if (import.meta.env.DEV) {
    await ensureSNAPRulesAreCorrect();
  }

  const db = getDatabase();

  // Get all active programs
  console.log('🔍 [PROGRAM RETRIEVAL DEBUG] Retrieving all active programs');
  const programs = await db.benefit_programs.findActivePrograms();
  console.log('🔍 [PROGRAM RETRIEVAL DEBUG] Active programs retrieved', {
    programsFound: programs.length,
    programIds: programs.map(p => p.id),
    programNames: programs.map(p => p.name)
  });

  // Re-check if we have fewer programs than expected
  if (programs.length < 7) {
    console.log('🔍 [PROGRAM RETRIEVAL DEBUG] Fewer programs than expected, re-checking database');
    const allProgramsRecheck = await db.benefit_programs.find({}).exec();
    console.log('🔍 [PROGRAM RETRIEVAL DEBUG] All programs in database', {
      totalPrograms: allProgramsRecheck.length,
      programIds: allProgramsRecheck.map(p => p.id),
      activePrograms: allProgramsRecheck.filter(p => p.active).length
    });

    // Use all active programs if we found more
    const activePrograms = allProgramsRecheck.filter(p => p.active);
    if (activePrograms.length > programs.length) {
      console.log('🔍 [PROGRAM RETRIEVAL DEBUG] Using all active programs found');
      programs.splice(0, programs.length, ...activePrograms);
    }
  }

  debugLog('Active programs retrieved.', { programsFound: programs.length, programIds: programs.map(p => p.id) });
  const programIds = programs.map((p) => p.id);

  if (import.meta.env.DEV) {
    console.warn('🔍 [DEBUG] evaluateAllPrograms: Found programs:', {
      total: programs.length,
      programIds,
      programNames: programs.map(p => ({ id: p.id, name: p.name }))
    });
  }

  const result = await evaluateMultiplePrograms(profileId, programIds, options);

  debugLog('All programs evaluation complete', { summary: result.summary });

  if (import.meta.env.DEV) {
    console.warn('🔍 [DEBUG] evaluateAllPrograms: Final result summary:', {
      total: result.summary.total,
      eligible: result.summary.eligible,
      ineligible: result.summary.ineligible,
      incomplete: result.summary.incomplete,
      programResults: Array.from(result.programResults.entries()).map(([id, res]) => ({
        programId: id,
        eligible: res.eligible,
        confidence: res.confidence,
        ruleId: res.ruleId
      }))
    });
  }

  return result;
}

// Re-export cache functions
export { clearCachedResults, getCachedResults } from './eligibility/cache';
