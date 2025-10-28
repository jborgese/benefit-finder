/**
 * Route-Based Code Splitting
 *
 * Implements lazy loading for different application routes/states
 * to improve initial bundle size and loading performance.
 */

import { lazy, Suspense } from 'react';
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
const RouteLoadingFallback = () => (
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
export const RouteComponent = ({
  children,
  fallback = RouteLoadingFallback
}: {
  children: React.ReactNode;
  fallback?: React.ComponentType;
}) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Route Error Boundary caught an error:', error, errorInfo);
    }}
  >
    <Suspense fallback={<fallback />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

/**
 * Route components with optimized loading
 */
export const Routes = {
  Home: () => (
    <RouteComponent>
      <LazyHomePage />
    </RouteComponent>
  ),

  Questionnaire: () => (
    <RouteComponent>
      <LazyQuestionnairePage />
    </RouteComponent>
  ),

  Results: () => (
    <RouteComponent>
      <LazyResultsPage />
    </RouteComponent>
  ),

  Error: () => (
    <RouteComponent>
      <LazyErrorPage />
    </RouteComponent>
  ),
};

/**
 * Route preloading utilities
 */
export const RoutePreloader = {
  /**
   * Preload all routes for instant navigation
   */
  preloadAll: () => {
    LazyHomePage();
    LazyQuestionnairePage();
    LazyResultsPage();
    LazyErrorPage();
  },

  /**
   * Preload specific route
   */
  preloadRoute: (route: 'home' | 'questionnaire' | 'results' | 'error') => {
    switch (route) {
      case 'home':
        LazyHomePage();
        break;
      case 'questionnaire':
        LazyQuestionnairePage();
        break;
      case 'results':
        LazyResultsPage();
        break;
      case 'error':
        LazyErrorPage();
        break;
    }
  },

  /**
   * Preload routes based on user journey
   */
  preloadUserJourney: (currentRoute: string) => {
    switch (currentRoute) {
      case 'home':
        // User likely to go to questionnaire next
        LazyQuestionnairePage();
        break;
      case 'questionnaire':
        // User likely to go to results next
        LazyResultsPage();
        break;
      case 'results':
        // User might start new assessment
        LazyQuestionnairePage();
        break;
    }
  }
};
