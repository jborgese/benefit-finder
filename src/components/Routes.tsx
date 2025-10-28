/**
 * Routes Component
 *
 * Provides lazy-loaded route components with optimized loading
 */

import React, { lazy, Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

// Lazy load route components
const LazyHomePage = lazy(() =>
  import('../pages/HomePage').then(module => ({
    default: module.HomePage
  }))
);

const LazyQuestionnairePage = lazy(() =>
  import('../pages/QuestionnairePage').then(module => ({
    default: module.QuestionnairePage
  }))
);

const LazyResultsPage = lazy(() =>
  import('../pages/ResultsPage').then(module => ({
    default: module.ResultsPage
  }))
);

const LazyErrorPage = lazy(() =>
  import('../pages/ErrorPage').then(module => ({
    default: module.ErrorPage
  }))
);

/**
 * Loading component for route transitions
 */
const RouteLoadingFallback = (): React.JSX.Element => (
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

/**
 * Route component with error boundary and loading fallback
 */
const RouteComponent = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => (
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

/**
 * Route components with optimized loading
 */
export const Routes = {
  Home: (props: {
    onStartQuestionnaire: () => void;
    onViewResults: () => void;
    hasResults: boolean;
    onStartWelcomeTour: () => void;
    onStartPrivacyExplainer: () => void;
    onStartQuickStartGuide: () => void;
    onStartShortcutsHelp: () => void;
  }) => (
    <RouteComponent>
      <LazyHomePage {...props} />
    </RouteComponent>
  ),

  Questionnaire: (props: {
    onComplete: (answers: Record<string, unknown>) => void;
  }) => (
    <RouteComponent>
      <LazyQuestionnairePage {...props} />
    </RouteComponent>
  ),

  Results: (props: {
    currentResults: any;
    currentUserProfile: any;
    isProcessingResults: boolean;
    onNewAssessment: () => void;
    onImportResults: (results: any) => Promise<void>;
  }) => (
    <RouteComponent>
      <LazyResultsPage {...props} />
    </RouteComponent>
  ),

  Error: (props: {
    errorMessage: string;
    onGoHome: () => void;
  }) => (
    <RouteComponent>
      <LazyErrorPage {...props} />
    </RouteComponent>
  ),
};
