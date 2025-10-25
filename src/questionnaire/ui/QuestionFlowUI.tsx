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
import { useQuestionnaireKeyboard } from '../accessibility';
import { useDynamicCountyOptions } from '../hooks/useDynamicCountyOptions';
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

  // Dynamic county options
  useDynamicCountyOptions();

  // Keyboard shortcuts
  useQuestionnaireKeyboard({
    onNext: () => {
      if (isCurrentQuestionValid && store.canGoForward()) {
        store.next();
      }
    },
    onPrevious: () => {
      if (store.canGoBack()) {
        store.previous();
      }
    },
    onSave: () => {
      // Trigger auto-save
      store.pause(); // This will trigger auto-save
    },
    onHelp: () => {
      // Show keyboard shortcuts help
      // This could be implemented with a help modal
    },
    onSkip: () => {
      if (currentQuestion) {
        store.skipQuestion(currentQuestion.id);
      }
    },
  });

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

  // Initialize answer with default value if not set
  useEffect(() => {
    if (currentQuestion?.defaultValue !== undefined && !store.answers.has(currentQuestion.id)) {
      store.answerQuestion(
        currentQuestion.id,
        currentQuestion.fieldName,
        currentQuestion.defaultValue
      );
    }
  }, [currentQuestion, store]);

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

  // Handle Enter key press - navigate forward or complete questionnaire if valid
  const handleEnterKey = (): void => {
    // For date inputs, allow Enter key even if not fully valid (user might be typing)
    if (!isCurrentQuestionValid && currentQuestion.inputType !== 'date') return;

    // Check if we can go forward (not on last question)
    if (store.canGoForward()) {
      const result = store.next();
      if (!result.success) {
        console.warn('Navigation failed:', result.error);
      }
    } else {
      // On last question - trigger completion
      store.complete();
    }
  };

  if (!store.started || !currentQuestion) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center animate-fade-in-up">
          <div className="relative mx-auto mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200" />
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-secondary-600 text-lg">Loading questionnaire...</p>
        </div>
      </div>
    );
  }

  if (store.completed) {
    return (
      <div className={`questionnaire-complete ${className} animate-fade-in-up`}>
        <div className="text-center p-12">
          <div className="mb-6 animate-bounce-gentle">
            <svg
              className="w-20 h-20 text-success-500 mx-auto"
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

          <h2 className="text-3xl font-display font-bold text-secondary-900 mb-4">
            Questionnaire Complete!
          </h2>

          <p className="text-secondary-600 mb-8 text-lg">
            Thank you for completing the questionnaire. Your results are being processed.
          </p>

          {footer}
        </div>
      </div>
    );
  }

  const currentAnswer = store.answers.get(currentQuestion.id)?.value ?? currentQuestion.defaultValue;

  return (
    <div className={`question-flow-ui questionnaire-container ${className} animate-fade-in`}>
      {enableSaveResume && <ResumeDialog storageKey="bf-questionnaire-autosave" />}

      {header && <div className="questionnaire-header mb-8 animate-fade-in-up">{header}</div>}

      {showBreadcrumb && (
        <QuestionBreadcrumb
          onJumpTo={(nodeId) => store.jumpTo(nodeId)}
          className="mb-6 animate-slide-in-left"
        />
      )}

      <div className="questionnaire-content mb-8">
        <div className="card-questionnaire p-8 animate-scale-in relative z-10">
          <Question
            question={currentQuestion}
            value={currentAnswer}
            onChange={handleAnswerChange}
            onValidationChange={handleValidationChange}
            onEnterKey={handleEnterKey}
            autoFocus={currentQuestion.inputType === 'date'}
          />
        </div>
      </div>

      {showNavigation && (
        <div className="animate-fade-in-up">
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
        </div>
      )}

      {enableSaveResume && (
        <div className="mt-6 flex justify-end animate-slide-in-right">
          <SaveProgressButton />
        </div>
      )}

      {footer && <div className="questionnaire-footer mt-8 animate-fade-in">{footer}</div>}
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

