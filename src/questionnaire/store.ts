/**
 * Question Flow Store (Wrapper)
 * 
 * This file maintains backward compatibility by re-exporting from the modular store implementation.
 * The store has been refactored into a more maintainable structure in the ./flow-store directory.
 */

// Re-export everything from the modular store
export { useQuestionFlowStore } from './flow-store';
export type { QuestionFlowState, QuestionFlowActions, QuestionFlowStore } from './flow-store';
export {
  selectCurrentQuestion,
  selectProgress,
  selectIsComplete,
  selectCanGoForward,
  selectCanGoBack,
  selectAnswerContext,
} from './flow-store';