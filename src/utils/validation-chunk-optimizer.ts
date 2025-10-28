/**
 * Validation Chunk Optimizer
 *
 * Splits validation functionality into smaller, more focused chunks
 */

// Core validation types
export interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'number' | 'min' | 'max' | 'pattern';
  value?: unknown;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Split validation into focused modules
export const ValidationCore = {
  // Zod schemas
  schemas: () => import('../db/schemas'),

  // Form validation
  forms: () => import('../utils/formValidation'),

  // Data validation
  data: () => import('../utils/dataValidation'),

  // Rule validation
  rules: () => import('../rules/core/validator'),
};

// Lazy load validation components
export const LazyValidationComponents = {
  ZodSchemas: () => import('../db/schemas').then(m => ({ default: m.schemas })),
  FormValidation: () => import('../utils/formValidation').then(m => ({ default: m.FormValidation })),
  DataValidation: () => import('../utils/dataValidation').then(m => ({ default: m.DataValidation })),
  RuleValidation: () => import('../rules/core/validator').then(m => ({ default: m.RuleValidator })),
};
