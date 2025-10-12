/**
 * Zustand Store Architecture
 * 
 * Main store export combining all store slices.
 * Each slice handles a specific domain of the application state.
 */

export { useStore } from './useStore';
export { useAppSettingsStore } from './appSettingsStore';
export { useQuestionnaireStore } from './questionnaireStore';
export { useUIStore } from './uiStore';

// Re-export types
export type { AppSettingsState } from './appSettingsStore';
export type { QuestionnaireState } from './questionnaireStore';
export type { UIState } from './uiStore';

