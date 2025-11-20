/**
 * Announcement Hooks
 *
 * Utility hooks for screen reader announcements
 */

import { useEffect, useRef } from 'react';
import { useAnnouncer } from './aria';

/**
 * Hook to announce navigation changes
 */
export function useNavigationAnnouncements(): {
  announceNext: (questionNumber: number, totalQuestions: number) => void;
  announcePrevious: (questionNumber: number) => void;
  announceComplete: () => void;
  announceError: (fieldName: string, error: string) => void;
  announceSaved: () => void;
} {
  const { announce } = useAnnouncer();

  const announceNext = (questionNumber: number, totalQuestions: number): void => {
    announce(`Moving to question ${questionNumber} of ${totalQuestions}`, 'polite');
  };

  const announcePrevious = (questionNumber: number): void => {
    announce(`Going back to question ${questionNumber}`, 'polite');
  };

  const announceComplete = (): void => {
    announce('Questionnaire complete. Thank you!', 'assertive');
  };

  const announceError = (fieldName: string, error: string): void => {
    announce(`Error in ${fieldName}: ${error}`, 'assertive');
  };

  const announceSaved = (): void => {
    announce('Progress saved successfully', 'polite');
  };

  return {
    announceNext,
    announcePrevious,
    announceComplete,
    announceError,
    announceSaved,
  };
}

/**
 * Hook to announce validation errors
 */
export function useValidationAnnouncements(): {
  announceValidationErrors: (errors: string[]) => void;
} {
  const { announce } = useAnnouncer();

  useEffect(() => {
    // Announce validation errors would happen here
    // This is a placeholder for future implementation
  }, [announce]);

  const announceValidationErrors = (errors: string[]): void => {
    if (errors.length === 0) {return;}

    const message = errors.length === 1
      ? errors[0]
      : `${errors.length} errors found. ${errors.join('. ')}`;

    announce(message, 'assertive');
  };

  return { announceValidationErrors };
}

/**
 * Hook to announce progress updates
 */
export function useProgressAnnouncements(
  _currentQuestion: number,
  _totalQuestions: number,
  progressPercent: number
): void {
  const { announce } = useAnnouncer();
  const previousPercentRef = useRef(progressPercent);

  useEffect(() => {
    // Announce at 25%, 50%, 75%, 100%
    const milestones = [25, 50, 75, 100];
    const previousPercent = previousPercentRef.current;

    for (const milestone of milestones) {
      if (previousPercent < milestone && progressPercent >= milestone) {
        announce(`${milestone}% complete`, 'polite');
        break;
      }
    }

    previousPercentRef.current = progressPercent;
  }, [progressPercent, announce]);
}

