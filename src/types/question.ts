/**
 * Question Definition Types
 *
 * Types for the dynamic questionnaire system.
 */

/**
 * Question Type
 *
 * Different types of questions that can be asked.
 */
export type QuestionType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'boolean'
  | 'slider'
  | 'address'
  | 'phone'
  | 'email';

/**
 * Question Option
 *
 * Option for select, radio, or checkbox questions.
 */
export interface QuestionOption {
  value: string | number | boolean;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
  // Conditional display
  showIf?: ConditionalLogic;
}

/**
 * Question Validation Rule
 */
export interface QuestionValidation {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

/**
 * Conditional Logic
 *
 * Determines if a question should be shown based on previous answers.
 */
export interface ConditionalLogic {
  operator: 'and' | 'or' | 'not';
  conditions: {
    questionId: string;
    comparison: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'contains';
    value: any;
  }[];
}

/**
 * Question Definition
 *
 * Complete question definition for the questionnaire.
 */
export interface QuestionDefinition {
  // Identification
  id: string;
  key: string; // Maps to profile field (e.g., 'householdIncome')

  // Display
  question: string;
  subtitle?: string;
  helpText?: string;
  placeholder?: string;

  // Type & Options
  type: QuestionType;
  options?: QuestionOption[];

  // Validation
  required?: boolean;
  validations?: QuestionValidation[];

  // Conditional Display
  showIf?: ConditionalLogic;

  // Input Configuration
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  multiline?: boolean;
  maxLength?: number;

  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;

  // Navigation
  nextQuestionId?: string | ((answer: any) => string);
  previousQuestionId?: string;
  allowSkip?: boolean;

  // Metadata
  category?: string;
  priority?: number;
  weight?: number; // For confidence scoring

  // Help & Documentation
  exampleAnswer?: string;
  whyAsking?: string;
  privacyNote?: string;
}

/**
 * Question Flow
 *
 * Complete questionnaire flow definition.
 */
export interface QuestionFlow {
  id: string;
  name: string;
  description: string;
  version: string;

  // Questions
  questions: QuestionDefinition[];
  startQuestionId: string;

  // Organization
  sections?: QuestionSection[];

  // Configuration
  allowSaveAndResume?: boolean;
  estimatedTime?: number; // minutes

  // Metadata
  createdAt: number;
  updatedAt?: number;
}

/**
 * Question Section
 *
 * Logical grouping of questions.
 */
export interface QuestionSection {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  questionIds: string[];
  required?: boolean;
  order: number;
}

/**
 * Question Answer
 *
 * User's answer to a question.
 */
export interface QuestionAnswer {
  questionId: string;
  questionKey?: string;
  value: any;
  timestamp: number;
  source?: 'user' | 'prefilled' | 'calculated';
  confidence?: number;
}

/**
 * Question Navigation State
 */
export interface QuestionNavigationState {
  currentQuestionId: string;
  previousQuestionId?: string;
  nextQuestionId?: string;
  canGoBack: boolean;
  canGoForward: boolean;
  canSkip: boolean;
}

/**
 * Question Progress
 */
export interface QuestionProgress {
  totalQuestions: number;
  answeredQuestions: number;
  requiredQuestions: number;
  answeredRequired: number;
  percentComplete: number;
  estimatedTimeRemaining?: number; // minutes
}

/**
 * Question Validation Result
 */
export interface QuestionValidationResult {
  valid: boolean;
  errors: {
    message: string;
    field?: string;
  }[];
  warnings?: string[];
}

/**
 * Question Flow State
 *
 * Current state of the questionnaire session.
 */
export interface QuestionFlowState {
  flowId: string;
  sessionId: string;

  // Navigation
  currentQuestion: QuestionDefinition;
  navigation: QuestionNavigationState;

  // Answers
  answers: Record<string, QuestionAnswer>;

  // Progress
  progress: QuestionProgress;

  // Status
  started: boolean;
  completed: boolean;
  paused: boolean;

  // Timestamps
  startedAt: number;
  lastUpdatedAt: number;
  completedAt?: number;
}

/**
 * Question Skip Reason
 */
export interface QuestionSkipReason {
  questionId: string;
  reason: 'not_applicable' | 'prefer_not_to_answer' | 'unknown' | 'conditional_skip';
  timestamp: number;
}

/**
 * Question Flow Analytics
 *
 * Analytics for questionnaire completion.
 */
export interface QuestionFlowAnalytics {
  flowId: string;

  // Completion stats
  totalStarts: number;
  totalCompletions: number;
  completionRate: number;

  // Time stats
  averageCompletionTime: number; // minutes
  medianCompletionTime: number;

  // Question stats
  questionCompletionRates: Record<string, number>;
  mostSkippedQuestions: string[];

  // Drop-off points
  dropOffPoints: {
    questionId: string;
    dropOffRate: number;
  }[];
}

