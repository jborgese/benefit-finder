/**
 * Eligibility Cache Helpers
 *
 * Functions for caching and retrieving eligibility evaluation results.
 */

import { nanoid } from 'nanoid';
import { getDatabase } from '../../../db/database';
import type { EligibilityResult, EligibilityResultDocument } from '../../../db/schemas';
import type { EligibilityEvaluationResult } from './types';

// Global debug log utility
function debugLog(...args: unknown[]): void {
  if (import.meta.env.DEV) {
    console.debug('[Eligibility Cache Debug]', ...args);
  }
}

/**
 * Check cache and return valid cached result if available
 */
export async function checkCache(
  profileId: string,
  programId: string,
  startTime: number,
  forceReEvaluation: boolean
): Promise<EligibilityEvaluationResult | null> {
  debugLog('Checking cache for', { profileId, programId, forceReEvaluation });
  if (forceReEvaluation) {
    debugLog('Cache bypassed due to forceReEvaluation option.');
    return null;
  }

  const cached = await getCachedResult(profileId, programId);
  if (!cached) {
    debugLog('No cached result found.');
    return null;
  }

  const isExpired = cached.expiresAt ? Date.now() > cached.expiresAt : false;
  if (isExpired) {
    debugLog('Cached result expired.', { expiresAt: cached.expiresAt });
    return null;
  }

  const endTime = performance.now();
  const cachedData = cached.toJSON();
  debugLog('Using cached eligibility result for', { profileId, programId, cachedResult: cachedData });
  return {
    ...cachedData,
    profileId: cachedData.userProfileId,
    missingFields: cachedData.missingFields ? Array.from(cachedData.missingFields) : [],
    executionTime: endTime - startTime,
  } as EligibilityEvaluationResult;
}

/**
 * Get cached result from database
 */
export async function getCachedResult(
  profileId: string,
  programId: string
): Promise<EligibilityResultDocument | null> {
  debugLog('Fetching cached result', { profileId, programId });
  const db = getDatabase();

  const results = await db.eligibility_results
    .find({
      selector: {
        userProfileId: profileId,
        programId,
      },
      sort: [{ evaluatedAt: 'desc' }],
      limit: 1,
    })
    .exec();

  debugLog('Cached result query results', results);
  return results[0] ?? null;
}

/**
 * Cache evaluation result in database
 */
export async function cacheResult(
  result: EligibilityEvaluationResult,
  expiresIn: number
): Promise<void> {
  debugLog('Caching evaluation result to database', { result, expiresIn });
  const db = getDatabase();

  const dbResult: Partial<EligibilityResult> = {
    id: nanoid(),
    userProfileId: result.profileId,
    programId: result.programId,
    ruleId: result.ruleId,
    eligible: result.eligible,
    confidence: result.confidence,
    reason: result.reason,
    criteriaResults: result.criteriaResults,
    missingFields: result.missingFields,
    nextSteps: result.nextSteps?.map(step => ({
      ...step,
      priority: step.priority ?? 'medium',
    })),
    requiredDocuments: result.requiredDocuments?.map(doc => ({
      document: doc.document,
      description: doc.description,
      where: doc.where,
      required: true,
    })),
    estimatedBenefit: result.estimatedBenefit ? {
      ...result.estimatedBenefit,
      frequency: result.estimatedBenefit.frequency ?? 'monthly',
      currency: 'USD' as const,
    } : undefined,
    ruleVersion: result.ruleVersion,
    evaluatedAt: result.evaluatedAt,
    expiresAt: Date.now() + expiresIn,
    needsReview: result.needsReview,
    incomplete: result.incomplete,
  };

  debugLog('Prepared dbResult object for insert', dbResult);

  await db.eligibility_results.insert(dbResult as EligibilityResult);
  debugLog('Eligibility evaluation result cached successfully.');
}

/**
 * Clear cached results for a profile
 *
 * @param profileId Profile ID
 * @param programId Optional program ID (clears all if not specified)
 */
export async function clearCachedResults(
  profileId: string,
  programId?: string
): Promise<number> {
  debugLog('Clearing cached results', { profileId, programId });
  const db = getDatabase();

  const selector: { userProfileId: string; programId?: string } = {
    userProfileId: profileId
  };
  if (programId) {
    selector.programId = programId;
  }

  const results = await db.eligibility_results
    .find({ selector })
    .exec();

  for (const result of results) {
    debugLog('Removing cached result', result.id);
    await result.remove();
  }

  debugLog('Total cached results cleared:', results.length);
  return results.length;
}

/**
 * Get cached results for a profile
 *
 * @param profileId Profile ID
 * @returns Array of cached results
 */
export async function getCachedResults(
  profileId: string
): Promise<EligibilityEvaluationResult[]> {
  debugLog('Fetching all cached results for profile', profileId);
  const db = getDatabase();

  const results = await db.eligibility_results
    .find({
      selector: { userProfileId: profileId },
      sort: [{ evaluatedAt: 'desc' }],
    })
    .exec();

  debugLog('Results fetched for getCachedResults', results.map(r => r.id));
  return results.map((r) => {
    const data = r.toJSON();
    debugLog('Parsed cached result', data);
    return {
      ...data,
      profileId: data.userProfileId,
      missingFields: data.missingFields ?? [],
    } as unknown as EligibilityEvaluationResult;
  });
}
