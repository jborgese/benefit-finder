/**
 * Questionnaire Chunk Optimizer
 *
 * Splits questionnaire functionality into smaller, more focused chunks
 */

// Core questionnaire types and interfaces
export interface QuestionnaireFlow {
  id: string;
  name: string;
  steps: QuestionnaireStep[];
}

export interface QuestionnaireStep {
  id: string;
  type: 'question' | 'conditional' | 'group';
  question?: string;
  options?: string[];
  conditions?: Record<string, unknown>;
}

// Split questionnaire into focused modules
export const QuestionnaireCore = {
  // Core flow engine
  createFlow: () => import('../questionnaire/flow-engine'),

  // Enhanced questionnaire UI
  createEnhancedFlow: () => import('../questionnaire/enhanced-flow'),

  // Accessibility features
  createAccessibility: () => import('../questionnaire/accessibility'),

  // Question types
  // @ts-expect-error - dynamic import without static types (shim in src/types)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createQuestionTypes: () => import('../questionnaire/question-types').then(m => m as any),

  // Validation
  // @ts-expect-error - dynamic import without static types (shim in src/types)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createValidation: () => import('../questionnaire/validation').then(m => m as any),
};

// Lazy load questionnaire components
export const LazyQuestionnaireComponents = {
  EnhancedQuestionnaire: () => import('../questionnaire/ui').then(m => ({ default: m.EnhancedQuestionnaire })),
  FlowEngine: () => import('../questionnaire/flow-engine').then(m => ({ default: m.FlowEngine })),
  // @ts-expect-error - dynamic import without static types (shim in src/types)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  QuestionTypes: () => import('../questionnaire/question-types').then(m => ({ default: (m as any).QuestionTypes })),
  // @ts-expect-error - dynamic import without static types (shim in src/types)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Validation: () => import('../questionnaire/validation').then(m => ({ default: (m as any).Validation })),
};
