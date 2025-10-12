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

/**
 * Composite hook that returns commonly used store selectors.
 * Use this for quick access to frequently needed state.
 */
export function useCommonState() {
  const theme = useAppSettingsStore((state) => state.theme);
  const language = useAppSettingsStore((state) => state.language);
  const isLoading = useUIStore((state) => state.isLoading);
  const addToast = useUIStore((state) => state.addToast);
  const isQuestionnaireActive = useQuestionnaireStore((state) => state.isActive);
  
  return {
    theme,
    language,
    isLoading,
    addToast,
    isQuestionnaireActive,
  };
}

