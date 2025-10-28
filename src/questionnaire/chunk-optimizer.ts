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
  createQuestionTypes: () => import('../questionnaire/question-types'),

  // Validation
  createValidation: () => import('../questionnaire/validation'),
};

// Lazy load questionnaire components
export const LazyQuestionnaireComponents = {
  EnhancedQuestionnaire: () => import('../questionnaire/ui').then(m => ({ default: m.EnhancedQuestionnaire })),
  FlowEngine: () => import('../questionnaire/flow-engine').then(m => ({ default: m.FlowEngine })),
  QuestionTypes: () => import('../questionnaire/question-types').then(m => ({ default: m.QuestionTypes })),
  Validation: () => import('../questionnaire/validation').then(m => ({ default: m.Validation })),
};
