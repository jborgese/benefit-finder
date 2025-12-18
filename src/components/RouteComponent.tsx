/**
 * Route Component with Error Boundary
 *
 * Route component with error boundary and loading fallback
 */

import React, { Suspense, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { RouteLoadingFallback } from './RouteLoadingFallback';

interface RouteComponentProps {
  children: React.ReactNode;
}

export const RouteComponent = ({ children }: RouteComponentProps): React.JSX.Element => {
  useEffect(() => {
    // Focus the main page heading on route content mount for accessibility
    const main = (document.querySelector('[role="main"]') || document.querySelector('main') || document.getElementById('main-content')) as HTMLElement | null;
    let target: HTMLElement | null = null;
    if (main) {
      target = (main.querySelector('[data-main-heading]') as HTMLElement) || (main.querySelector('h1') as HTMLElement) || (main.querySelector('[role="heading"]') as HTMLElement);
    }

    if (target) {
      const prevTabIndex = target.getAttribute('tabindex');
      if (target.tabIndex < 0) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: false });
      // Clean up temporary tabindex if it didn't exist before
      return () => {
        if (prevTabIndex === null) {
          target?.removeAttribute('tabindex');
        }
      };
    }
    return undefined;
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Route Error Boundary caught an error:', error, errorInfo);
      }}
    >
      <Suspense fallback={<RouteLoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};
