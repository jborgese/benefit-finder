/**
 * Custom hooks for Save & Resume UI
 */

import React from 'react';
import { useQuestionFlowStore } from '../store';

/**
 * Hook for exit confirmation
 */
export function useExitConfirmation(enabled = true): {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  confirmExit: () => Promise<boolean>;
} {
  const [showDialog, setShowDialog] = React.useState(false);
  const store = useQuestionFlowStore();

  React.useEffect(() => {
    // Only attach the beforeunload handler when exit confirmation is enabled,
    // the flow is started, not completed, and the user has entered at least
    // one answer. This avoids showing the browser "leave page" dialog on
    // automatic navigation or reloads that occur before the user interacts.
    if (!enabled || !store.started || store.completed || store.answers.size === 0) {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      // Standard way to trigger the browser confirmation dialog
      e.preventDefault();
      // Some browsers expect returnValue to be set to a non-empty string
      // though the specific message is ignored in modern browsers.
      e.returnValue = 'Your progress has been saved. Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, store.started, store.completed, store.answers.size]);

  const confirmExit = (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setShowDialog(true);

      // Wait for user response
      const checkInterval = setInterval(() => {
        if (!showDialog) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
    });
  };

  return {
    showDialog,
    setShowDialog,
    confirmExit,
  };
}

