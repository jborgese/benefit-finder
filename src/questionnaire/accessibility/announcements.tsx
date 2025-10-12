/**
 * Screen Reader Announcements
 *
 * Components for screen reader announcements
 */

import React, { useEffect } from 'react';

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
 * Visually hidden text for screen readers only
 */
export const VisuallyHidden: React.FC<{
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
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

