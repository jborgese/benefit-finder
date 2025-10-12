/**
 * Questionnaire UI Components
 *
 * Complete UI layer for questionnaires
 */

// Main components
export { Question } from './Question';
export { QuestionFlowUI, SimpleQuestionnaire } from './QuestionFlowUI';
export { NavigationControls, CompactNavigationControls, QuestionBreadcrumb } from './NavigationControls';

// Save & Resume
export {
  SaveProgressButton,
  ResumeDialog,
  ExitConfirmDialog,
} from './SaveResume';
export type { SaveResumeProps } from './SaveResume';

// Hooks
export { useExitConfirmation } from './hooks';

// Auto-save
export {
  useAutoSave,
  loadSavedProgress,
  hasSavedProgress,
  clearSavedProgress,
  getSavedProgressMetadata,
} from './AutoSave';

// Types
export type { QuestionProps } from './Question';
export type { NavigationControlsProps } from './NavigationControls';
export type { AutoSaveOptions } from './AutoSave';
export type { QuestionFlowUIProps } from './QuestionFlowUI';

