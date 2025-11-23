/**
 * Types for Eligibility Results Display
 */

/**
 * Eligibility status for a program
 */
export type EligibilityStatus = 'qualified' | 'likely' | 'maybe' | 'unlikely' | 'not-qualified';

/**
 * Confidence level for eligibility determination
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Required document for program application
 */
export interface RequiredDocument {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  alternatives?: string[];
  where?: string;
  obtained?: boolean; // User can mark as obtained
}

/**
 * Next step for applying to program
 */
export interface NextStep {
  step: string;
  url?: string;
  priority?: 'high' | 'medium' | 'low';
  estimatedTime?: string;
  completed?: boolean; // User can mark as completed
}

/**
 * Explanation for eligibility determination
 */
export interface EligibilityExplanation {
  // Primary, canonical fields
  reason?: string;
  details?: string[];
  rulesCited?: string[];
  calculations?: {
    label: string;
    value: string | number;
    comparison?: string;
  }[];

  // Allow legacy/custom shapes during migration (e.g. `reasoning`, `confidence`, `factors`, `criteria`)
  [key: string]: unknown;
}

/**
 * Program eligibility result
 */
export interface ProgramEligibilityResult {
  // Program info
  programId: string;
  programName: string;
  programDescription: string;
  jurisdiction: string; // e.g., "US-FEDERAL", "US-GA", "US-CA"

  // Eligibility determination
  status: EligibilityStatus;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0-100

  // Explanation
  explanation: EligibilityExplanation;

  // Requirements
  requiredDocuments: RequiredDocument[];
  nextSteps: NextStep[];

  // Additional info
  estimatedBenefit?: {
    amount: number;
    frequency: 'monthly' | 'annual' | 'one-time';
    description?: string;
  };
  applicationDeadline?: Date;
  processingTime?: string;

  // Metadata
  evaluatedAt: Date;
  rulesVersion: string;
}

/**
 * Overall eligibility results for all programs
 */
export interface EligibilityResults {
  qualified: ProgramEligibilityResult[];
  likely: ProgramEligibilityResult[];
  maybe: ProgramEligibilityResult[];
  notQualified: ProgramEligibilityResult[];
  totalPrograms: number;
  evaluatedAt: Date;
}

/**
 * Filter options for results display
 */
export interface ResultsFilter {
  status?: EligibilityStatus[];
  programs?: string[];
  jurisdiction?: string[];
  showOnlyQualified?: boolean;
}

/**
 * Sort options for results display
 */
export type ResultsSortBy =
  | 'status'
  | 'confidence'
  | 'benefit-amount'
  | 'name'
  | 'deadline';

export interface ResultsSortOptions {
  sortBy: ResultsSortBy;
  direction: 'asc' | 'desc';
}

