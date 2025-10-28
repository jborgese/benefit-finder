/**
 * Route Component with Error Boundary
 *
 * Route component with error boundary and loading fallback
 */

import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { RouteLoadingFallback } from './RouteLoadingFallback';

interface RouteComponentProps {
  children: React.ReactNode;
}

export const RouteComponent = ({ children }: RouteComponentProps): React.JSX.Element => (
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
