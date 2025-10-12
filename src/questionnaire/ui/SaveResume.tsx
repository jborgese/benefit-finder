/**
 * Save & Resume Component
 *
 * UI for saving progress and resuming later
 */

import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useQuestionFlowStore } from '../store';
import {
  loadSavedProgress,
  clearSavedProgress,
  getSavedProgressMetadata,
} from './AutoSave';

export interface SaveResumeProps {
  /** Storage key */
  storageKey?: string;
  /** Callback when resumed */
  onResume?: () => void;
  /** Callback when cleared */
  onClear?: () => void;
}

/**
 * Save Progress Button
 */
export const SaveProgressButton: React.FC<{
  onSave?: () => void;
  className?: string;
}> = ({ onSave, className = '' }) => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Progress is auto-saved, so just show confirmation
    setSaved(true);
    onSave?.();

    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <button
      type="button"
      onClick={handleSave}
      className={`
        px-4 py-2 bg-blue-500 text-white rounded-md
        hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {saved ? (
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Saved!
        </span>
      ) : (
        'Save Progress'
      )}
    </button>
  );
};

/**
 * Resume Dialog
 */
export const ResumeDialog: React.FC<SaveResumeProps> = ({
  storageKey = 'bf-questionnaire-autosave',
  onResume,
  onClear,
}) => {
  const [open, setOpen] = React.useState(false);
  const store = useQuestionFlowStore();
  const metadata = getSavedProgressMetadata(storageKey);

  // Auto-show dialog if saved progress exists and no flow started
  React.useEffect(() => {
    if (metadata.exists && !store.started) {
      setOpen(true);
    }
  }, [metadata.exists, store.started]);

  const handleResume = () => {
    const saved = loadSavedProgress(storageKey);

    if (!saved) {
      return;
    }

    // Restore state
    // Note: This would need to reload the flow definition
    // and restore the store state
    onResume?.();
    setOpen(false);
  };

  const handleStartNew = () => {
    clearSavedProgress(storageKey);
    onClear?.();
    setOpen(false);
  };

  if (!metadata.exists) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Resume Previous Session?
          </Dialog.Title>

          <Dialog.Description className="text-gray-600 mb-6">
            We found a saved questionnaire from{' '}
            {metadata.lastSaved && (
              <strong>
                {new Intl.DateTimeFormat('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                }).format(metadata.lastSaved)}
              </strong>
            )}
            . Would you like to continue where you left off?
          </Dialog.Description>

          <div className="flex gap-3">
            <button
              onClick={handleResume}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Resume
            </button>

            <button
              onClick={handleStartNew}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Start New
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

/**
 * Exit Confirmation Dialog
 */
export const ExitConfirmDialog: React.FC<{
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, onConfirm, onCancel }) => {
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50">
          <AlertDialog.Title className="text-xl font-semibold mb-4">
            Are you sure you want to exit?
          </AlertDialog.Title>

          <AlertDialog.Description className="text-gray-600 mb-6">
            Your progress has been automatically saved. You can resume this questionnaire later.
          </AlertDialog.Description>

          <div className="flex gap-3 justify-end">
            <AlertDialog.Cancel asChild>
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Stay
              </button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Exit
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

/**
 * Hook for exit confirmation
 */
export function useExitConfirmation(enabled = true) {
  const [showDialog, setShowDialog] = React.useState(false);
  const store = useQuestionFlowStore();

  React.useEffect(() => {
    if (!enabled || !store.started || store.completed) {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Your progress has been saved. Are you sure you want to leave?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, store.started, store.completed]);

  const confirmExit = () => {
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

