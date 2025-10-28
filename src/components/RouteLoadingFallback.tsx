/**
 * Route Loading Fallback Component
 *
 * Loading component for route transitions
 */

import React from 'react';

export const RouteLoadingFallback = (): React.JSX.Element => (
  <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-900 dark:to-primary-900 flex items-center justify-center">
    <div className="text-center">
      <div className="relative mb-6">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200" />
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent absolute top-0 left-0"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <h2 className="text-2xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-2">
        Loading...
      </h2>
      <p className="text-secondary-600 dark:text-secondary-300">
        Preparing your experience
      </p>
    </div>
  </div>
);
