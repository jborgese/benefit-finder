/**
 * Error Page Component
 *
 * Optimized error page component
 */

import React from 'react';
import { Button } from '../components/Button';

interface ErrorPageProps {
  errorMessage: string;
  onGoHome: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ errorMessage, onGoHome }) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-red-400">Error</h2>
      </div>
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Unable to Process Request</h3>
            <p className="text-slate-300 mb-4">{errorMessage}</p>
            <div className="flex gap-3">
              <Button
                onClick={onGoHome}
                variant="primary"
                aria-label="Return to home page"
              >
                Return to Home
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
                aria-label="Refresh the page"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
