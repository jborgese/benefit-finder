/**
 * Program Data Types
 *
 * Type definitions for benefit programs and related data structures.
 * Extends the database schema types with additional metadata.
 */

import type { BenefitProgram } from '../../db/schemas';

/**
 * Program metadata
 */
export interface ProgramMetadata {
  version: string;
  lastUpdated: string;
  source: string;
  description: string;
  totalPrograms: number;
  categories: string[];
  jurisdictions: string[];
}

/**
 * Program collection metadata
 */
export interface ProgramCollectionMetadata {
  name: string;
  description: string;
  version: string;
  lastUpdated: string;
  programCount: number;
  jurisdictions: string[];
}

/**
 * Extended program with computed fields
 */
export interface ExtendedBenefitProgram extends BenefitProgram {
  computedFields: {
    isActive: boolean;
    hasApplicationUrl: boolean;
    hasPhoneNumber: boolean;
    hasOfficeAddress: boolean;
    categoryDisplayName: string;
    jurisdictionDisplayName: string;
    eligibilityComplexity: 'simple' | 'moderate' | 'complex';
    applicationComplexity: 'simple' | 'moderate' | 'complex';
  };
}

/**
 * Program search filters
 */
export interface ProgramSearchFilters {
  category?: string;
  jurisdiction?: string;
  jurisdictionLevel?: 'federal' | 'state' | 'city' | 'county';
  active?: boolean;
  applicationOpen?: boolean;
  searchTerm?: string;
  tags?: string[];
}

/**
 * Program search result
 */
export interface ProgramSearchResult {
  program: ExtendedBenefitProgram;
  relevanceScore: number;
  matchReasons: string[];
}

/**
 * Program collection
 */
export interface ProgramCollection {
  metadata: ProgramCollectionMetadata;
  programs: BenefitProgram[];
}

/**
 * Program statistics
 */
export interface ProgramStatistics {
  totalPrograms: number;
  activePrograms: number;
  programsByCategory: Record<string, number>;
  programsByJurisdiction: Record<string, number>;
  programsByLevel: Record<string, number>;
  averageBenefitAmount: number;
  programsWithApplicationUrl: number;
  programsWithPhoneNumber: number;
}

/**
 * Program validation result
 */
export interface ProgramValidationResult {
  isValid: boolean;
  program: BenefitProgram;
  errors: string[];
  warnings: string[];
}
