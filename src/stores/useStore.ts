/**
 * Main Store Hook
 *
 * Re-exports all store hooks for convenient importing.
 * This is the primary entry point for accessing stores.
 *
 * Usage:
 * ```tsx
 * import { useAppSettingsStore, useUIStore } from '@/stores/useStore';
 *
 * function MyComponent() {
 *   const theme = useAppSettingsStore((state) => state.theme);
 *   const addToast = useUIStore((state) => state.addToast);
 *   // ...
 * }
 * ```
 */

// Re-export all store hooks
export { useAppSettingsStore } from './appSettingsStore';
export { useQuestionnaireStore } from './questionnaireStore';
export { useUIStore } from './uiStore';

// Re-export types for convenience
export type { AppSettingsState } from './appSettingsStore';
export type { QuestionnaireState, QuestionAnswer, QuestionnaireProgress } from './questionnaireStore';
export type { UIState, Toast, ToastType, Modal } from './uiStore';

import { useAppSettingsStore as appSettingsStore } from './appSettingsStore';
import { useUIStore as uiStore } from './uiStore';
import { useQuestionnaireStore as questionnaireStore } from './questionnaireStore';

/**
 * Composite hook that returns commonly used store selectors.
 * Use this for quick access to frequently needed state.
 */
export function useCommonState() {
  const theme = appSettingsStore((state) => state.theme);
  const language = appSettingsStore((state) => state.language);
  const isLoading = uiStore((state) => state.isLoading);
  const addToast = uiStore((state) => state.addToast);
  const isQuestionnaireActive = questionnaireStore((state) => state.isActive);

  return {
    theme,
    language,
    isLoading,
    addToast,
    isQuestionnaireActive,
  };
}

