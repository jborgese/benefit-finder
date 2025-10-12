/**
 * Core TypeScript Types
 *
 * Centralized type definitions for BenefitFinder.
 * Exports all types for use throughout the application.
 */

// Database types
export type {
  HouseholdProfile,
  HouseholdMember,
  Address,
  ContactInfo,
} from './household';

export type {
  BenefitProgram,
  ProgramCategory,
  JurisdictionLevel,
  ProgramContact,
} from './program';

export type {
  RuleDefinition,
  RuleType,
  RuleLogic,
  RuleCriterion,
  RuleTestCase,
} from './rule';

export type {
  EligibilityResult,
  EligibilityStatus,
  CriterionResult,
  NextStep,
  RequiredDocument,
  BenefitEstimate,
} from './eligibility';

export type {
  QuestionDefinition,
  QuestionType,
  QuestionOption,
  QuestionValidation,
  ConditionalLogic,
  QuestionFlow,
} from './question';

// Utility types
export type {
  ValidationResult,
  AsyncResult,
  DeepPartial,
  Writeable,
} from './utility';

