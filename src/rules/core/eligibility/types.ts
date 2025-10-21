/**
 * Eligibility Evaluation Types
 *
 * Type definitions for eligibility evaluation system.
 */

import type { RuleEvaluationOptions, RuleEvaluationResult } from '../types';
import type { EligibilityRuleDocument, UserProfileDocument } from '../../../db/schemas';

/**
 * Eligibility evaluation result (extended)
 */
export interface EligibilityEvaluationResult {
  profileId: string;
  programId: string;
  ruleId: string;
  eligible: boolean;
  confidence: number;
  reason: string;
  criteriaResults?: Array<{
    criterion: string;
    met: boolean;
    value?: unknown;
    threshold?: unknown;
    comparison?: string;
    message?: string;
    description?: string;
  }>;
  missingFields?: string[];
  requiredDocuments?: Array<{
    document: string;
    description?: string;
    where?: string;
  }>;
  nextSteps?: Array<{
    step: string;
    url?: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
  estimatedBenefit?: {
    amount?: number;
    frequency?: 'one_time' | 'monthly' | 'quarterly' | 'annual';
    description?: string;
  };
  evaluatedAt: number;
  executionTime?: number;
  ruleVersion?: string;
  needsReview?: boolean;
  incomplete?: boolean;
}

/**
 * Eligibility evaluation options
 */
export interface EligibilityEvaluationOptions {
  cacheResult?: boolean;
  includeBreakdown?: boolean;
  forceReEvaluation?: boolean;
  expiresIn?: number;
  evaluationOptions?: Partial<RuleEvaluationOptions>;
}

/**
 * Batch eligibility result
 */
export interface BatchEligibilityResult {
  profileId: string;
  programResults: Map<string, EligibilityEvaluationResult>;
  summary: {
    total: number;
    eligible: number;
    ineligible: number;
    incomplete: number;
    needsReview: number;
  };
  totalTime: number;
}

/**
 * Evaluation entities from database
 */
export interface EvaluationEntities {
  profile: UserProfileDocument;
  rules: EligibilityRuleDocument[];
}

/**
 * Rule evaluation result with details
 */
export interface RuleEvaluationWithDetails {
  rule: EligibilityRuleDocument;
  evalResult: RuleEvaluationResult;
  missingFields: string[];
  detailedResult: unknown; // Will be imported from detailedEvaluator
}

/**
 * All rules evaluation result
 */
export interface AllRulesEvaluationResult {
  ruleResults: RuleEvaluationWithDetails[];
  overallEligible: boolean;
  firstFailedRule: EligibilityRuleDocument | null;
  firstFailedResult: RuleEvaluationResult | null;
  allMissingFields: Set<string>;
}

/**
 * Result rule selection
 */
export interface ResultRuleSelection {
  resultRule: EligibilityRuleDocument;
  combinedEvalResult: RuleEvaluationResult;
}

/**
 * Cache check result
 */
export interface CacheCheckResult {
  cached: EligibilityEvaluationResult | null;
  fromCache: boolean;
}

/**
 * Criteria breakdown item
 */
export interface CriteriaBreakdownItem {
  criterion: string;
  met: boolean;
  value?: unknown;
  threshold?: unknown;
  description?: string;
}

/**
 * Field name mapping for user-friendly descriptions
 */
export interface FieldNameMapping {
  [key: string]: string;
}
