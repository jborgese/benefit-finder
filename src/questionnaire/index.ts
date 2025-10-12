/**
 * Questionnaire Module
 *
 * Dynamic question flow system with conditional logic,
 * skip/branch logic, and progress tracking.
 *
 * @module questionnaire
 */

// Types
export type * from './types';

// Flow Engine
export {
  FlowEngine,
  createFlow,
  createFlowNode,
  addNodeToFlow,
  linkNodes,
  addBranch,
} from './flow-engine';

// Navigation
export {
  NavigationManager,
  SkipLogicManager,
  evaluateBranches,
  findFlowPath,
} from './navigation';

// Progress
export {
  calculateProgress,
  estimateTimeRemaining,
  calculateCompletionPercentage,
  CheckpointManager,
  TimeTracker,
  calculateSectionProgress,
  calculateAllSectionsProgress,
  isFlowComplete,
  getIncompleteRequiredQuestions,
} from './progress';

// Store
export {
  useQuestionFlowStore,
  selectCurrentQuestion,
  selectProgress,
  selectIsComplete,
  selectCanGoForward,
  selectCanGoBack,
  selectAnswerContext,
  type QuestionFlowStore,
  type QuestionFlowState,
  type QuestionFlowActions,
} from './store';

// Components
export * from './components';

// UI
export * from './ui';

// Validation
export * from './validation/schemas';

// Accessibility
export * from './accessibility';

