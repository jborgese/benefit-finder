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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemas: () => import('../db/schemas').then(m => m as any),

  // Form validation
  // @ts-expect-error - dynamic import without static types (shim in src/types)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forms: () => import('../utils/formValidation').then(m => m as any),

  // Data validation
  // @ts-expect-error - dynamic import without static types (shim in src/types)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: () => import('../utils/dataValidation').then(m => m as any),

  // Rule validation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules: () => import('../rules/core/validator').then(m => m as any),
};

// Lazy load validation components
export const LazyValidationComponents = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ZodSchemas: () => import('../db/schemas').then(m => ({ default: (m as any).schemas })),
  // @ts-expect-error - dynamic import without static types (shim in src/types)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FormValidation: () => import('../utils/formValidation').then(m => ({ default: (m as any).FormValidation })),
  // @ts-expect-error - dynamic import without static types (shim in src/types)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DataValidation: () => import('../utils/dataValidation').then(m => ({ default: (m as any).DataValidation })),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RuleValidation: () => import('../rules/core/validator').then(m => ({ default: (m as any).RuleValidator })),
};
