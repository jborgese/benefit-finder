/**
 * Route preloading utilities
 *
 * Separated from RouteSplitting.tsx to comply with react-refresh requirements
 * that files should only export components for fast refresh to work properly.
 */

import { lazy } from 'react';

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
 * Route preloading utilities
 */
export const RoutePreloader = {
  /**
   * Preload all routes for instant navigation
   */
  preloadAll: (): void => {
    LazyHomePage();
    LazyQuestionnairePage();
    LazyResultsPage();
    LazyErrorPage();
  },

  /**
   * Preload specific route
   */
  preloadRoute: (route: 'home' | 'questionnaire' | 'results' | 'error'): void => {
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
  preloadUserJourney: (currentRoute: string): void => {
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
