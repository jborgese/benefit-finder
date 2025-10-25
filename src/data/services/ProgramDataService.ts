/**
 * Program Data Service
 *
 * Centralized service for accessing benefit program data with caching,
 * validation, and type safety. Provides a clean API for program operations.
 */

import type { BenefitProgram } from '../../db/schemas';
import type {
  ExtendedBenefitProgram,
  ProgramSearchFilters,
  ProgramSearchResult,
  ProgramStatistics,
  ProgramValidationResult
} from '../types/programs';

// Import all LIHTC programs
import { FEDERAL_LIHTC_PROGRAM } from '../sources/programs/lihtc/federal';
import { GEORGIA_LIHTC_PROGRAM } from '../sources/programs/lihtc/state/georgia';
import { CALIFORNIA_LIHTC_PROGRAM } from '../sources/programs/lihtc/state/california';
import { FLORIDA_LIHTC_PROGRAM } from '../sources/programs/lihtc/state/florida';
import { ATLANTA_LIHTC_PROGRAM } from '../sources/programs/lihtc/city/atlanta';
import { LOS_ANGELES_LIHTC_PROGRAM } from '../sources/programs/lihtc/city/los-angeles';
import { MIAMI_LIHTC_PROGRAM } from '../sources/programs/lihtc/city/miami';

/**
 * Program Data Service
 *
 * Singleton service for managing benefit program data with caching and validation.
 */
export class ProgramDataService {
  private static instance: ProgramDataService;
  private cache = new Map<string, unknown>();
  private programs: BenefitProgram[] = [];
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour
  private readonly MAX_CACHE_SIZE = 1000;

  private constructor() {
    this.initializePrograms();
  }

  static getInstance(): ProgramDataService {
    if (ProgramDataService.instance === undefined) {
      ProgramDataService.instance = new ProgramDataService();
    }
    return ProgramDataService.instance;
  }

  /**
   * Get all programs
   */
  getAllPrograms(): BenefitProgram[] {
    return [...this.programs];
  }

  /**
   * Get programs by category
   */
  getProgramsByCategory(category: string): BenefitProgram[] {
    return this.programs.filter(program => program.category === category);
  }

  /**
   * Get programs by jurisdiction
   */
  getProgramsByJurisdiction(jurisdiction: string): BenefitProgram[] {
    return this.programs.filter(program => program.jurisdiction === jurisdiction);
  }

  /**
   * Get programs by jurisdiction level
   */
  getProgramsByJurisdictionLevel(level: 'federal' | 'state' | 'city' | 'county'): BenefitProgram[] {
    return this.programs.filter(program => program.jurisdictionLevel === level);
  }

  /**
   * Get active programs only
   */
  getActivePrograms(): BenefitProgram[] {
    return this.programs.filter(program => program.active);
  }

  /**
   * Get programs with open applications
   */
  getProgramsWithOpenApplications(): BenefitProgram[] {
    return this.programs.filter(program => program.active && program.applicationOpen);
  }

  /**
   * Search programs with filters
   */
  searchPrograms(filters: ProgramSearchFilters): ProgramSearchResult[] {
    let results = [...this.programs];

    // Apply filters
    if (filters.category) {
      results = results.filter(program => program.category === filters.category);
    }

    if (filters.jurisdiction) {
      results = results.filter(program => program.jurisdiction === filters.jurisdiction);
    }

    if (filters.jurisdictionLevel) {
      results = results.filter(program => program.jurisdictionLevel === filters.jurisdictionLevel);
    }

    if (filters.active !== undefined) {
      results = results.filter(program => program.active === filters.active);
    }

    if (filters.applicationOpen !== undefined) {
      results = results.filter(program => program.applicationOpen === filters.applicationOpen);
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(program =>
        filters.tags?.some(tag => program.tags.includes(tag)) ?? false
      );
    }

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      results = results.filter(program =>
        program.name.toLowerCase().includes(searchTerm) ||
        program.description.toLowerCase().includes(searchTerm) ||
        program.shortName.toLowerCase().includes(searchTerm)
      );
    }

    // Convert to search results with relevance scoring
    return results.map(program => ({
      program: this.extendProgram(program),
      relevanceScore: this.calculateRelevanceScore(program, filters),
      matchReasons: this.getMatchReasons(program, filters)
    }));
  }

  /**
   * Get program by ID
   */
  getProgramById(id: string): BenefitProgram | null {
    return this.programs.find(program => program.id === id) ?? null;
  }

  /**
   * Get program statistics
   */
  getProgramStatistics(): ProgramStatistics {
    const totalPrograms = this.programs.length;
    const activePrograms = this.programs.filter(p => p.active).length;

    const programsByCategory = this.programs.reduce((acc, program) => {
      const currentCount = acc[program.category] ?? 0;
      return { ...acc, [program.category]: currentCount + 1 };
    }, {} as Record<string, number>);

    const programsByJurisdiction = this.programs.reduce((acc, program) => {
      const currentCount = acc[program.jurisdiction] ?? 0;
      return { ...acc, [program.jurisdiction]: currentCount + 1 };
    }, {} as Record<string, number>);

    const programsByLevel = this.programs.reduce((acc, program) => {
      const currentCount = acc[program.jurisdictionLevel] ?? 0;
      return { ...acc, [program.jurisdictionLevel]: currentCount + 1 };
    }, {} as Record<string, number>);

    const programsWithApplicationUrl = this.programs.filter(p => p.applicationUrl).length;
    const programsWithPhoneNumber = this.programs.filter(p => p.phoneNumber).length;

    return {
      totalPrograms,
      activePrograms,
      programsByCategory,
      programsByJurisdiction,
      programsByLevel,
      averageBenefitAmount: 0, // Would need benefit amount data
      programsWithApplicationUrl,
      programsWithPhoneNumber
    };
  }

  /**
   * Validate program data
   */
  validateProgram(program: BenefitProgram): ProgramValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!program.id) errors.push('Program ID is required');
    if (!program.name) errors.push('Program name is required');
    if (!program.jurisdiction) errors.push('Program jurisdiction is required');

    // Contact information warnings
    if (!program.website) warnings.push('Program website is missing');
    if (!program.phoneNumber) warnings.push('Program phone number is missing');
    if (!program.applicationUrl) warnings.push('Program application URL is missing');

    return {
      isValid: errors.length === 0,
      program,
      errors,
      warnings
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  private initializePrograms(): void {
    this.programs = [
      FEDERAL_LIHTC_PROGRAM,
      GEORGIA_LIHTC_PROGRAM,
      CALIFORNIA_LIHTC_PROGRAM,
      FLORIDA_LIHTC_PROGRAM,
      ATLANTA_LIHTC_PROGRAM,
      LOS_ANGELES_LIHTC_PROGRAM,
      MIAMI_LIHTC_PROGRAM
    ];
  }

  private extendProgram(program: BenefitProgram): ExtendedBenefitProgram {
    return {
      ...program,
      computedFields: {
        isActive: program.active,
        hasApplicationUrl: !!program.applicationUrl,
        hasPhoneNumber: !!program.phoneNumber,
        hasOfficeAddress: !!program.officeAddress,
        categoryDisplayName: program.category.charAt(0).toUpperCase() + program.category.slice(1),
        jurisdictionDisplayName: program.jurisdiction,
        eligibilityComplexity: this.calculateEligibilityComplexity(program),
        applicationComplexity: this.calculateApplicationComplexity(program)
      }
    };
  }

  private calculateEligibilityComplexity(program: BenefitProgram): 'simple' | 'moderate' | 'complex' {
    // Simple heuristic based on available information
    if (program.eligibilitySummary && program.eligibilitySummary.length < 100) {
      return 'simple';
    } else if (program.eligibilitySummary && program.eligibilitySummary.length < 200) {
      return 'moderate';
    } else {
      return 'complex';
    }
  }

  private calculateApplicationComplexity(program: BenefitProgram): 'simple' | 'moderate' | 'complex' {
    // Simple heuristic based on available information
    const hasAllContactInfo = !!(program.website && program.phoneNumber && program.applicationUrl);
    if (hasAllContactInfo) {
      return 'simple';
    } else if (program.website || program.phoneNumber) {
      return 'moderate';
    } else {
      return 'complex';
    }
  }

  private calculateRelevanceScore(program: BenefitProgram, filters: ProgramSearchFilters): number {
    let score = 0;

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      if (program.name.toLowerCase().includes(searchTerm)) score += 3;
      if (program.description.toLowerCase().includes(searchTerm)) score += 2;
      if (program.shortName.toLowerCase().includes(searchTerm)) score += 1;
    }

    if (filters.tags) {
      const matchingTags = filters.tags.filter(tag => program.tags.includes(tag));
      score += matchingTags.length;
    }

    return score;
  }

  private getMatchReasons(program: BenefitProgram, filters: ProgramSearchFilters): string[] {
    const reasons: string[] = [];

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      if (program.name.toLowerCase().includes(searchTerm)) {
        reasons.push('Name matches search term');
      }
      if (program.description.toLowerCase().includes(searchTerm)) {
        reasons.push('Description matches search term');
      }
    }

    if (filters.tags) {
      const matchingTags = filters.tags.filter(tag => program.tags.includes(tag));
      if (matchingTags.length > 0) {
        reasons.push(`Matches tags: ${matchingTags.join(', ')}`);
      }
    }

    return reasons;
  }
}
