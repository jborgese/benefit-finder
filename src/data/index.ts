/**
 * Data Module
 *
 * Centralized data access for BenefitFinder with type safety, validation,
 * and future-proofing. Provides clean APIs for all data operations.
 */

// Export types
export * from './types';

// Export services
export * from './services';

// Export validators
export * from './validators';

// Re-export commonly used types for convenience
export type {
  LocationData,
  StateOption,
  CountyOption
} from './types/location';

export type {
  ProcessedAMIData,
  AMIServiceConfig
} from './types/ami';

export type {
  ExtendedBenefitProgram,
  ProgramSearchFilters,
  ProgramSearchResult
} from './types/programs';
