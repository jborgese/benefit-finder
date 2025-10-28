/**
 * Route Preloader
 *
 * Provides intelligent route preloading for better user experience
 */

// Lazy load route components for preloading
const LazyHomePage = () => import('../pages/HomePage');
const LazyQuestionnairePage = () => import('../pages/QuestionnairePage');
const LazyResultsPage = () => import('../pages/ResultsPage');
const LazyErrorPage = () => import('../pages/ErrorPage');

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
