/**
 * Benefit Program Types
 *
 * Types for benefit program definitions and metadata.
 */

import type { BenefitProgram as DbBenefitProgram } from '../db/schemas';

/**
 * Program Category
 */
export type ProgramCategory =
  | 'food'
  | 'healthcare'
  | 'housing'
  | 'financial'
  | 'childcare'
  | 'education'
  | 'employment'
  | 'transportation'
  | 'utilities'
  | 'legal'
  | 'other';

/**
 * Jurisdiction Level
 */
export type JurisdictionLevel = 'federal' | 'state' | 'county' | 'city';

/**
 * Program Contact Information
 */
export interface ProgramContact {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  hours?: string;
}

/**
 * Office Location
 */
export interface OfficeLocation {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  hours?: string;
  servesCounties?: string[];
}

/**
 * Application Deadline
 */
export interface ApplicationDeadline {
  type: 'rolling' | 'fixed' | 'seasonal';
  date?: number; // timestamp
  description?: string;
}

/**
 * Benefit Amount Range
 */
export interface BenefitAmountRange {
  min: number;
  max: number;
  average?: number;
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'annual';
  currency: 'USD';
}

/**
 * Benefit Program
 *
 * Complete benefit program information.
 * This is the main interface for program data.
 *
 * Re-export of database type with same name for consistency.
 */
export type BenefitProgram = DbBenefitProgram;

/**
 * Extended Benefit Program
 *
 * Program with additional computed and related data.
 */
export interface ExtendedBenefitProgram extends BenefitProgram {
  // Extended fields (not in database)
  contacts?: ProgramContact[];
  offices?: OfficeLocation[];
  deadline?: ApplicationDeadline;
  benefitAmountRange?: BenefitAmountRange;

  // Additional metadata
  eligibilityRate?: number; // Percentage of applicants approved
  averageProcessingTime?: number; // Days
  applicationMethod?: ('online' | 'mail' | 'in_person')[];

  // Related programs
  relatedProgramIds?: string[];
  alternativeProgramIds?: string[];

  // Computed fields
  rulesCount?: number;
  eligibleUsersCount?: number;
}

/**
 * Program Search Filters
 */
export interface ProgramSearchFilters {
  categories?: ProgramCategory[];
  jurisdictions?: string[];
  activeOnly?: boolean;
  applicationOpenOnly?: boolean;
  tags?: string[];
  searchTerm?: string;
}

/**
 * Program Search Result
 */
export interface ProgramSearchResult {
  program: BenefitProgram;
  relevanceScore: number;
  matchedFields: string[];
  highlights?: Record<string, string>;
}

/**
 * Program Comparison
 *
 * For comparing multiple programs side-by-side.
 */
export interface ProgramComparison {
  programs: BenefitProgram[];
  comparisonFields: {
    field: keyof BenefitProgram;
    label: string;
    values: (string | number | boolean | undefined)[];
  }[];
}

/**
 * Program Statistics
 */
export interface ProgramStatistics {
  totalPrograms: number;
  byCategory: Record<ProgramCategory, number>;
  byJurisdiction: Record<string, number>;
  activePrograms: number;
  inactivePrograms: number;
}

/**
 * Program FAQs
 */
export interface ProgramFAQ {
  programId: string;
  faqs: {
    question: string;
    answer: string;
    category?: string;
  }[];
}

/**
 * Program Application Steps
 */
export interface ProgramApplicationSteps {
  programId: string;
  steps: {
    order: number;
    title: string;
    description: string;
    estimatedTime?: string;
    required: boolean;
    documents?: string[];
  }[];
}
