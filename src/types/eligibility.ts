/**
 * Eligibility Result Types
 *
 * Types for eligibility evaluation results and related data.
 */

import type { EligibilityResult as DbEligibilityResult } from '../db/schemas';
import type { HouseholdProfile } from './household';

/**
 * Eligibility Status
 */
export type EligibilityStatus =
  | 'eligible'
  | 'likely_eligible'
  | 'possibly_eligible'
  | 'not_eligible'
  | 'unknown'
  | 'incomplete_data';

/**
 * Criterion Result
 *
 * Result of evaluating a single eligibility criterion.
 */
export interface CriterionResult {
  criterion: string;
  met: boolean;
  value?: unknown;
  threshold?: unknown;
  comparison?: string;
  message?: string;
  importance?: 'required' | 'preferred' | 'optional';
}

/**
 * Next Step
 *
 * Recommended action for the user.
 */
export interface NextStep {
  step: string;
  url?: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime?: string;
  requiresDocument?: boolean;
}

/**
 * Required Document
 *
 * Document needed for application.
 */
export interface RequiredDocument {
  document: string;
  description?: string;
  where?: string;
  alternatives?: string[];
  required: boolean;
  helpText?: string;
}

/**
 * Benefit Estimate
 *
 * Estimated benefit amount and details.
 */
export interface BenefitEstimate {
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'annual';
  description?: string;
  currency: 'USD';
  calculation?: string;
}

/**
 * Eligibility Result
 *
 * Complete eligibility evaluation result.
 * This is the main interface for eligibility results.
 *
 * Extends database type with helper fields and methods.
 */
export interface EligibilityResult extends DbEligibilityResult {
  // Computed fields
  status?: EligibilityStatus;
  programName?: string;

  // Enhanced fields
  summary?: string;
  detailedExplanation?: string;

  // Application info
  applicationDeadline?: number;
  estimatedProcessingTime?: string;

  // Flags
  requiresInterview?: boolean;
  autoApprovalPossible?: boolean;
}

/**
 * Batch Eligibility Result
 *
 * Results for multiple programs evaluated together.
 */
export interface BatchEligibilityResult {
  userProfileId: string;
  evaluatedAt: number;
  results: EligibilityResult[];
  summary: {
    totalEvaluated: number;
    eligible: number;
    likelyEligible: number;
    notEligible: number;
    incomplete: number;
  };
}

/**
 * Eligibility Comparison
 *
 * Compare eligibility across multiple scenarios.
 */
export interface EligibilityComparison {
  scenarios: {
    name: string;
    profile: HouseholdProfile;
    result: EligibilityResult;
  }[];
  differences: string[];
}

/**
 * Eligibility Timeline
 *
 * Historical eligibility results over time.
 */
export interface EligibilityTimeline {
  userProfileId: string;
  programId: string;
  results: {
    date: number;
    eligible: boolean;
    confidence: number;
    changes?: string[];
  }[];
}

/**
 * Confidence Score Breakdown
 */
export interface ConfidenceBreakdown {
  overall: number;
  factors: {
    factor: string;
    impact: number; // -100 to +100
    description: string;
  }[];
}

