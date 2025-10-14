/**
 * QuestionFlow UI Component
 *
 * Complete questionnaire orchestrator with all features:
 * - Question rendering
 * - Navigation
 * - Auto-save
 * - Save & Resume
 * - Progress tracking
 */

import React, { useEffect } from 'react';
import { useQuestionFlowStore } from '../store';
import { Question } from './Question';
import { NavigationControls, QuestionBreadcrumb } from './NavigationControls';
import { useAutoSave } from './AutoSave';
import { ResumeDialog, SaveProgressButton } from './SaveResume';
import { useExitConfirmation } from './hooks';
import type { QuestionFlow } from '../types';

export interface QuestionFlowUIProps {
  /** Question flow definition */
  flow: QuestionFlow;
  /** Enable auto-save */
  autoSave?: boolean;
  /** Auto-save debounce delay (ms) */
  autoSaveDelay?: number;
  /** Enable Save & Resume */
  enableSaveResume?: boolean;
  /** Enable navigation controls */
  showNavigation?: boolean;
  /** Enable breadcrumb */
  showBreadcrumb?: boolean;
  /** Enable progress bar */
  showProgress?: boolean;
  /** Callback when completed */
  onComplete?: (answers: Record<string, unknown>) => void;
  /** Callback on answer change */
  onAnswerChange?: (questionId: string, value: unknown) => void;
  /** Custom header */
  header?: React.ReactNode;
  /** Custom footer */
  footer?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export const QuestionFlowUI: React.FC<QuestionFlowUIProps> = ({
  flow,
  autoSave = true,
  autoSaveDelay = 1000,
  enableSaveResume = true,
  showNavigation = true,
  showBreadcrumb = true,
  showProgress = true,
  onComplete,
  onAnswerChange,
  header,
  footer,
  className = '',
}) => {
  const store = useQuestionFlowStore();
  const currentQuestion = store.getCurrentQuestion();
  const [isCurrentQuestionValid, setIsCurrentQuestionValid] = React.useState(false);

  // Auto-save
  useAutoSave({
    enabled: autoSave,
    debounceMs: autoSaveDelay,
    onSave: () => {
      // Progress auto-saved silently
    },
  });

  // Exit confirmation
  useExitConfirmation(
    enableSaveResume && store.started && !store.completed
  );

  // Initialize flow
  useEffect(() => {
    if (!store.started || !store.flow || store.flow.id !== flow.id) {
      store.startFlow(flow);
    }
  }, [flow, store]);

  // Handle completion
  useEffect(() => {
    if (store.completed && onComplete) {
      const answers = store.getAnswerContext();
      onComplete(answers);
    }
  }, [store.completed, onComplete, store]);

  // Handle answer changes
  const handleAnswerChange = (value: unknown): void => {
    if (!currentQuestion) return;

    store.answerQuestion(
      currentQuestion.id,
      currentQuestion.fieldName,
      value
    );

    onAnswerChange?.(currentQuestion.id, value);
  };

  // Handle validation changes
  const handleValidationChange = (isValid: boolean, _errors: string[]): void => {
    setIsCurrentQuestionValid(isValid);
  };

  // Handle Enter key press - navigate forward if valid
  const handleEnterKey = (): void => {
    if (isCurrentQuestionValid && store.canGoForward()) {
      const result = store.next();
      if (!result.success) {
        console.warn('Navigation failed:', result.error);
      }
    }
  };

  if (!store.started || !currentQuestion) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading questionnaire...</p>
        </div>
      </div>
    );
  }

  if (store.completed) {
    return (
      <div className={`questionnaire-complete ${className}`}>
        <div className="text-center p-8">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-green-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Questionnaire Complete!
          </h2>

          <p className="text-gray-600 mb-6">
            Thank you for completing the questionnaire.
          </p>

          {footer}
        </div>
      </div>
    );
  }

  const currentAnswer = store.answers.get(currentQuestion.id)?.value;

  return (
    <div className={`question-flow-ui ${className}`}>
      {enableSaveResume && <ResumeDialog storageKey="bf-questionnaire-autosave" />}

      {header && <div className="questionnaire-header mb-6">{header}</div>}

      {showBreadcrumb && (
        <QuestionBreadcrumb
          onJumpTo={(nodeId) => store.jumpTo(nodeId)}
          className="mb-4"
        />
      )}

      <div className="questionnaire-content mb-8">
        <Question
          question={currentQuestion}
          value={currentAnswer}
          onChange={handleAnswerChange}
          onValidationChange={handleValidationChange}
          onEnterKey={handleEnterKey}
          autoFocus
        />
      </div>

      {showNavigation && (
        <NavigationControls
          showBack
          showForward
          showProgress={showProgress}
          forwardDisabled={!isCurrentQuestionValid}
          isCurrentQuestionValid={isCurrentQuestionValid}
          onBeforeNavigate={(direction) => {
            // Only allow forward navigation if current question is valid
            if (direction === 'forward') {
              return isCurrentQuestionValid;
            }
            return true;
          }}
        />
      )}

      {enableSaveResume && (
        <div className="mt-4 flex justify-end">
          <SaveProgressButton />
        </div>
      )}

      {footer && <div className="questionnaire-footer mt-6">{footer}</div>}
    </div>
  );
};

QuestionFlowUI.displayName = 'QuestionFlowUI';

/**
 * Simple wrapper for basic use cases
 */
export const SimpleQuestionnaire: React.FC<{
  flow: QuestionFlow;
  onComplete: (answers: Record<string, unknown>) => void;
}> = ({ flow, onComplete }) => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <QuestionFlowUI
        flow={flow}
        onComplete={onComplete}
        autoSave
        enableSaveResume
      />
    </div>
  );
};

