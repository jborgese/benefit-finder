/**
 * Navigation Controls
 *
 * Back/Forward navigation buttons with progress indicator
 */

import React from 'react';
import * as Progress from '@radix-ui/react-progress';
import { useQuestionFlowStore } from '../store';

export interface NavigationControlsProps {
  /** Show back button */
  showBack?: boolean;
  /** Show forward button */
  showForward?: boolean;
  /** Show progress bar */
  showProgress?: boolean;
  /** Back button label */
  backLabel?: string;
  /** Forward button label */
  forwardLabel?: string;
  /** Callback before navigation */
  onBeforeNavigate?: (direction: 'back' | 'forward') => boolean | Promise<boolean>;
  /** Is forward navigation disabled */
  forwardDisabled?: boolean;
  /** Is current question valid (used for Complete button on last question) */
  isCurrentQuestionValid?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  showBack = true,
  showForward = true,
  showProgress = true,
  backLabel = 'Back',
  forwardLabel = 'Next',
  onBeforeNavigate,
  forwardDisabled = false,
  isCurrentQuestionValid = true,
  className = '',
}) => {
  const {
    previous,
    next,
    complete,
    canGoBack,
    canGoForward,
    progress,
    completed,
  } = useQuestionFlowStore();

  const [isNavigating, setIsNavigating] = React.useState(false);

  const handleBack = async (): Promise<void> => {
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      const allowed = await onBeforeNavigate?.('back');
      if (allowed === false) {
        setIsNavigating(false);
        return;
      }

      previous();
    } finally {
      setIsNavigating(false);
    }
  };

  const handleForward = async (): Promise<void> => {
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      const allowed = await onBeforeNavigate?.('forward');
      if (allowed === false) {
        setIsNavigating(false);
        return;
      }

      if (isLastQuestion) {
        complete();
      } else {
        next();
      }
    } finally {
      setIsNavigating(false);
    }
  };

  const progressPercent = progress?.progressPercent ?? 0;
  const isLastQuestion = !canGoForward();

  // Use the current question position from progress calculation
  const currentQuestionNumber = progress?.currentQuestionPosition ?? 1;
  const totalQuestions = progress?.totalQuestions ?? 0;

  return (
    <div className={`navigation-controls relative z-0 ${className}`}>
      {showProgress && progress && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-secondary-200">
              Question {currentQuestionNumber} of {totalQuestions}
            </span>
            <span className="text-sm text-gray-500 dark:text-secondary-400">
              {progressPercent}% Complete
            </span>
          </div>

          <Progress.Root
            className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-secondary-700 z-0"
            value={progressPercent}
          >
            <Progress.Indicator
              className="h-full bg-blue-500 transition-all duration-300 ease-in-out relative z-0"
              style={{ width: `${progressPercent}%` }}
            />
          </Progress.Root>

          {progress.requiredQuestions > 0 && (
            <p className="mt-1 text-xs text-gray-500 dark:text-secondary-400">
              {progress.answeredQuestions} of {progress.requiredQuestions} required questions answered
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3 justify-between">
        {showBack && (
          <button
            type="button"
            onClick={() => void handleBack()}
            disabled={!canGoBack() || isNavigating}
            data-testid="nav-back-button"
            aria-label="Go to previous question"
            className="
              flex items-center gap-2 px-4 py-2
              border border-gray-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-gray-700 dark:text-secondary-200 rounded-md
              hover:bg-gray-50 dark:hover:bg-secondary-600 hover:border-gray-400 dark:hover:border-secondary-500
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {backLabel}
          </button>
        )}

        {showForward && (
          <button
            type="button"
            onClick={() => void handleForward()}
            disabled={(!canGoForward() && !completed && !isLastQuestion) || (!isLastQuestion && forwardDisabled) || (isLastQuestion && !isCurrentQuestionValid) || isNavigating}
            data-testid="nav-forward-button"
            aria-label={isLastQuestion || completed ? 'Submit questionnaire' : 'Go to next question'}
            className={`
              flex items-center gap-2 px-6 py-2 rounded-md
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors ml-auto
              ${isLastQuestion || completed
                ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 text-white'
              }
            `}
          >
            {isLastQuestion || completed ? 'Complete' : forwardLabel}
            {!isLastQuestion && !completed && (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

NavigationControls.displayName = 'NavigationControls';

/**
 * Compact navigation for mobile
 */
export const CompactNavigationControls: React.FC<NavigationControlsProps> = (props) => {
  return (
    <NavigationControls
      {...props}
      className={`${props.className ?? ''} compact-navigation`}
    />
  );
};

/**
 * Question navigation breadcrumb
 */
export const QuestionBreadcrumb: React.FC<{
  onJumpTo?: (questionId: string) => void;
  className?: string;
}> = ({ onJumpTo, className = '' }) => {
  const { history, getCurrentQuestion, progress } = useQuestionFlowStore();
  const currentQuestion = getCurrentQuestion();

  if (!currentQuestion || history.length <= 1) {
    return null;
  }

  // Calculate the starting question number for the breadcrumb
  // The current question position tells us what question number we're on
  const currentQuestionNumber = progress?.currentQuestionPosition ?? 1;
  const startQuestionNumber = currentQuestionNumber - history.length + 1;

  // For mobile screens, show only the last few questions to prevent overflow
  const shouldShowTruncated = history.length > 5;
  const visibleHistory = shouldShowTruncated
    ? history.slice(-4) // Show last 4 questions on mobile
    : history;

  return (
    <nav aria-label="Question breadcrumb" className={`mb-4 relative z-0 ${className}`}>
      <ol className="flex items-center space-x-2 text-sm overflow-x-auto scrollbar-hide pb-1">
        {shouldShowTruncated && (
          <>
            <li className="flex items-center flex-shrink-0">
              <span className="text-gray-500 dark:text-secondary-400">...</span>
              <svg
                className="w-4 h-4 mx-2 text-gray-400 dark:text-secondary-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </li>
          </>
        )}
        {visibleHistory.map((nodeId, index) => {
          const isCurrentQuestion = index === visibleHistory.length - 1;
          const questionNumber = shouldShowTruncated
            ? startQuestionNumber + (history.length - visibleHistory.length) + index
            : startQuestionNumber + index;

          return (
            <li key={nodeId} className="flex items-center flex-shrink-0">
              {index > 0 && (
                <svg
                  className="w-4 h-4 mx-2 text-gray-400 dark:text-secondary-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}

              {isCurrentQuestion ? (
                <span className="text-gray-700 dark:text-secondary-200 font-medium">
                  Question {questionNumber}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onJumpTo?.(nodeId)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                >
                  Question {questionNumber}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

