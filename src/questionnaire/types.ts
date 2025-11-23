/**
 * Questionnaire Types
 *
 * Type definitions for dynamic question flows, conditional logic,
 * and progress tracking.
 */

import type { JsonLogicRule } from '../rules/core/types';

// ============================================================================
// QUESTION TYPES
// ============================================================================

/**
 * Question input types
 */
export type QuestionInputType =
  | 'text'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'currency'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'boolean'
  | 'address'
  | 'ssn'
  | 'searchable-select';

/**
 * Question validation rule
 */
export interface QuestionValidation {
  /** Validation type */
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  /** Validation value */
  value?: string | number | RegExp;
  /** Error message */
  message: string;
  /** Custom validation function (JSON Logic rule) */
  rule?: JsonLogicRule;
}

/**
 * Question option (for select, radio, checkbox)
 */
export interface QuestionOption {
  /** Option value */
  value: string | number;
  /** Display label */
  label: string;
  /** Optional description */
  description?: string;
  /** Icon or emoji */
  icon?: string;
  /** Is this option disabled */
  disabled?: boolean;
  /** Triggers when this option is selected */
  triggers?: QuestionTrigger[];
}

/**
 * Question trigger (action when question is answered)
 */
export interface QuestionTrigger {
  /** Trigger type */
  type: 'jump' | 'skip' | 'show' | 'hide' | 'complete' | 'calculate';
  /** Target question ID (for jump/show/hide) */
  targetId?: string;
  /** Condition for trigger (JSON Logic) */
  condition?: JsonLogicRule;
  /** Calculation to perform (for calculate type) */
  calculation?: JsonLogicRule;
  /** Field to store calculation result */
  targetField?: string;
}

/**
 * Question definition
 */
export interface QuestionDefinition {
  /** Unique question ID */
  id: string;
  /** Legacy key (optional) - maps to profile field in older definitions */
  key?: string;
  /** Question text - can be a string or a function that takes context and returns string */
  text: string | ((context: QuestionContext) => string);
  /** Legacy question text property (optional) for older definitions */
  question?: string;
  /** Optional description/help text - can be a string or a function that takes context and returns string */
  description?: string | ((context: QuestionContext) => string);
  /** Legacy subtitle/help fields from older definitions */
  subtitle?: string;
  /** Input type */
  inputType?: QuestionInputType;
  /** Legacy 'type' property (optional) to accept older question definitions */
  type?: string;
  /** Field name to store answer */
  fieldName?: string;
  /** Legacy priority value used by older flows */
  priority?: number;
  /** Category for question grouping (legacy/optional) */
  category?: string;
  /** Legacy explanation of why asking this question */
  whyAsking?: string;
  /** Legacy 'key' alias for field name (if present) */
  // `key` above can be used by older code; this keeps the shape compatible.
  /** Default value */
  defaultValue?: unknown;
  /** Placeholder text */
  placeholder?: string;
  /** Validation rules */
  validations?: QuestionValidation[];
  /** Options (for select types) */
  options?: QuestionOption[];
  /** Is this question required */
  required?: boolean;
  /** Condition to show this question (JSON Logic) */
  showIf?: JsonLogicRule;
  /** Triggers when answered */
  triggers?: QuestionTrigger[];
  /** Tags for categorization */
  tags?: string[];
  /** Help text or tooltip */
  helpText?: string;
  /** Accessibility label */
  ariaLabel?: string;
  /** Related questions (for grouping) */
  relatedQuestions?: string[];
  /** Minimum value (for number/currency inputs) */
  min?: number;
  /** Maximum value (for number/currency inputs) */
  max?: number;
  /** Step value (for number inputs) */
  step?: number;
  /** Maximum length (for text inputs) */
  maxLength?: number;
  /** Legacy navigation properties */
  nextQuestionId?: string | ((answer: unknown) => string);
  previousQuestionId?: string;
  allowSkip?: boolean;
  /** Marker for terminal questions (legacy placement on question objects) */
  isTerminal?: boolean;
  /** Legacy/compatibility fields for migration */
  legacyId?: string;
  legacyType?: string;
  legacyOptions?: unknown;
  legacyHelp?: string;
  legacyRequired?: boolean;
  legacyCategory?: string;
  legacyFlow?: string;
  legacyOrder?: number;
  legacyShowIf?: JsonLogicRule;
  legacyNext?: string;
  legacyPrevious?: string;
  legacyTags?: string[];
  legacyPlaceholder?: string;
  legacyDefault?: unknown;
  legacyExtra?: Record<string, unknown>;
}

// ============================================================================
// QUESTION FLOW TYPES
// ============================================================================

/**
 * Question flow node
 */
export interface FlowNode {
  /** Node ID */
  id: string;
  /** Question definition */
  question: QuestionDefinition;
  /** Next node ID (default path) */
  nextId?: string;
  /** Previous node ID */
  previousId?: string;
  /** Conditional branches */
  branches?: FlowBranch[];
  /** Is this a terminal node */
  isTerminal?: boolean;
  /** Node metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Conditional branch in flow
 */
export interface FlowBranch {
  /** Branch ID */
  id: string;
  /** Condition to take this branch (JSON Logic) */
  condition: JsonLogicRule;
  /** Target node ID */
  targetId: string;
  /** Branch description */
  description?: string;
  /** Priority (higher = evaluated first) */
  priority?: number;
}

/**
 * Question flow definition
 */
export interface QuestionFlow {
  /** Flow ID */
  id: string;
  /** Flow name */
  name: string;
  /** Flow description */
  description?: string;
  /** Starting node ID */
  startNodeId: string;
  /** All nodes in flow */
  nodes: Map<string, FlowNode>;
  /** Flow version */
  version: string;
  /** Flow metadata */
  metadata?: Record<string, unknown>;
  /** Allow saving and resuming this flow */
  allowSaveAndResume?: boolean;
  /** Created at timestamp */
  createdAt?: number;
  /** Last updated timestamp */
  updatedAt?: number;
}

// ============================================================================
// QUESTION STATE TYPES
// ============================================================================

/**
 * Answer to a question
 */
export interface QuestionAnswer {
  /** Question ID */
  questionId: string;
  /** Field name */
  fieldName: string;
  /** Answer value */
  value: unknown;
  /** When answered */
  answeredAt: number;
  /** Answer confidence (optional) */
  confidence?: number;
  /** Was this auto-filled */
  autoFilled?: boolean;
  /** Answer source */
  source?: 'user' | 'prefilled' | 'calculated';
}

/**
 * Question state
 */
export interface QuestionState {
  /** Question ID */
  questionId: string;
  /** Current status */
  status: 'pending' | 'current' | 'answered' | 'skipped' | 'hidden';
  /** Answer (if answered) */
  answer?: QuestionAnswer;
  /** Validation errors */
  errors?: string[];
  /** Is question visible */
  visible: boolean;
  /** Was question visited */
  visited: boolean;
  /** Visit count */
  visitCount: number;
}

/**
 * Flow session state
 */
export interface FlowSessionState {
  /** Session ID */
  sessionId: string;
  /** Flow ID */
  flowId: string;
  /** Current node ID */
  currentNodeId: string;
  /** Question states */
  questionStates: Map<string, QuestionState>;
  /** All answers */
  answers: Map<string, QuestionAnswer>;
  /** Navigation history */
  history: string[];
  /** Started at */
  startedAt: number;
  /** Last updated */
  updatedAt: number;
  /** Completed at */
  completedAt?: number;
  /** Is flow completed */
  completed: boolean;
  /** Session metadata */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// PROGRESS TRACKING TYPES
// ============================================================================

/**
 * Progress metrics
 */
export interface ProgressMetrics {
  /** Total questions in flow */
  totalQuestions: number;
  /** Required questions */
  requiredQuestions: number;
  /** Answered questions */
  answeredQuestions: number;
  /** Skipped questions */
  skippedQuestions: number;
  /** Remaining questions */
  remainingQuestions: number;
  /** Current question position (1-based) */
  currentQuestionPosition: number;
  /** Progress percentage (0-100) */
  progressPercent: number;
  /** Completion percentage for required questions */
  requiredProgressPercent: number;
  /** Estimated time remaining (seconds) */
  estimatedTimeRemaining?: number;
  /** Current section */
  currentSection?: string;
}

/**
 * Progress checkpoint
 */
export interface ProgressCheckpoint {
  /** Checkpoint ID */
  id: string;
  /** Node ID */
  nodeId: string;
  /** Checkpoint name */
  name: string;
  /** Description */
  description?: string;
  /** Timestamp */
  timestamp: number;
  /** Answers at checkpoint */
  answersSnapshot: Record<string, unknown>;
}

/**
 * Section definition
 */
export interface FlowSection {
  /** Section ID */
  id: string;
  /** Section name */
  name: string;
  /** Section description */
  description?: string;
  /** Question IDs in this section */
  questionIds: string[];
  /** Section order */
  order: number;
  /** Is section required */
  required?: boolean;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

/**
 * Navigation direction
 */
export type NavigationDirection = 'forward' | 'backward' | 'jump';

/**
 * Navigation result
 */
export interface NavigationResult {
  /** Was navigation successful */
  success: boolean;
  /** Target node ID */
  targetNodeId?: string;
  /** Previous node ID */
  previousNodeId?: string;
  /** Error message if failed */
  error?: string;
  /** Was a branch taken */
  branchTaken?: boolean;
  /** Branch ID if taken */
  branchId?: string;
  /** Questions skipped */
  questionsSkipped?: string[];
}

/**
 * Navigation options
 */
export interface NavigationOptions {
  /** Validate current question before navigating */
  validate?: boolean;
  /** Save progress before navigating */
  saveProgress?: boolean;
  /** Allow navigation if validation fails */
  allowInvalid?: boolean;
}

// ============================================================================
// CONDITIONAL LOGIC TYPES
// ============================================================================

/**
 * Condition evaluation result
 */
export interface ConditionEvaluationResult {
  /** Condition met */
  met: boolean;
  /** Rule evaluated */
  rule: JsonLogicRule;
  /** Data used */
  data: Record<string, unknown>;
  /** Evaluation time */
  evaluationTime: number;
  /** Error if evaluation failed */
  error?: string;
}

/**
 * Skip rule definition
 */
export interface SkipRule {
  /** Skip rule ID */
  id: string;
  /** Questions to skip */
  questionIds: string[];
  /** Condition to trigger skip (JSON Logic) */
  condition: JsonLogicRule;
  /** Skip description */
  description?: string;
  /** Priority (higher = evaluated first) */
  priority?: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Question context (all answers as object)
 */
export type QuestionContext = Record<string, unknown>;

/**
 * Flow event
 */
export interface FlowEvent {
  /** Event type */
  type: 'start' | 'question_answered' | 'navigation' | 'skip' | 'branch' | 'complete' | 'error' | 'question_updated';
  /** Event timestamp */
  timestamp: number;
  /** Node ID */
  nodeId?: string;
  /** Additional data */
  data?: Record<string, unknown>;
}

/**
 * Flow validation result
 */
export interface FlowValidationResult {
  /** Is flow valid */
  valid: boolean;
  /** Validation errors */
  errors: Array<{
    nodeId?: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  /** Orphaned nodes (not reachable) */
  orphanedNodes: string[];
  /** Circular references */
  circularReferences: string[][];
  /** Missing branches */
  missingBranches: string[];
}

