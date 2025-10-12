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
    if (!enabled || !store.started || store.completed) {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent): string => {
      e.preventDefault();
      // eslint-disable-next-line no-param-reassign
      e.returnValue = 'Your progress has been saved. Are you sure you want to leave?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, store.started, store.completed]);

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

