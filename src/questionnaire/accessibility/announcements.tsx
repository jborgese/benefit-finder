/**
 * Screen Reader Announcements
 *
 * Components and hooks for screen reader announcements
 */

import React, { useEffect } from 'react';
import { useAnnouncer } from './aria';

/**
 * Live Region Component
 */
export const LiveRegion: React.FC<{
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number;
}> = ({ message, priority = 'polite', clearAfter = 3000 }) => {
  const [currentMessage, setCurrentMessage] = React.useState(message);

  useEffect(() => {
    setCurrentMessage(message);

    if (clearAfter > 0) {
      const timer = setTimeout(() => {
        setCurrentMessage('');
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      role={priority === 'assertive' ? 'alert' : 'status'}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {currentMessage}
    </div>
  );
};

/**
 * Status announcer component
 */
export const StatusAnnouncer: React.FC<{
  status: string;
}> = ({ status }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {status}
    </div>
  );
};

/**
 * Hook to announce navigation changes
 */
export function useNavigationAnnouncements() {
  const { announce } = useAnnouncer();

  const announceNext = (questionNumber: number, totalQuestions: number) => {
    announce(`Moving to question ${questionNumber} of ${totalQuestions}`, 'polite');
  };

  const announcePrevious = (questionNumber: number) => {
    announce(`Going back to question ${questionNumber}`, 'polite');
  };

  const announceComplete = () => {
    announce('Questionnaire complete. Thank you!', 'assertive');
  };

  const announceError = (fieldName: string, error: string) => {
    announce(`Error in ${fieldName}: ${error}`, 'assertive');
  };

  const announceSaved = () => {
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
export function useValidationAnnouncements() {
  const { announce } = useAnnouncer();

  useEffect(() => {
    // Announce validation errors would happen here
    // This is a placeholder for future implementation
  }, [announce]);

  const announceValidationErrors = (errors: string[]) => {
    if (errors.length === 0) return;

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
) {
  const { announce } = useAnnouncer();
  const previousPercentRef = React.useRef(progressPercent);

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

/**
 * Visually hidden text for screen readers only
 */
export const VisuallyHidden: React.FC<{
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}> = ({ children, as: Component = 'span' }) => {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
};

/**
 * Screen reader only description
 */
export const SRDescription: React.FC<{
  id?: string;
  children: React.ReactNode;
}> = ({ id, children }) => {
  return (
    <div id={id} className="sr-only">
      {children}
    </div>
  );
};

