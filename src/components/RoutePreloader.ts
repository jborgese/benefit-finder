/**
 * Route Preloader
 *
 * Provides intelligent route preloading for better user experience
 */

// Lazy load route components for preloading
const LazyHomePage = (): Promise<unknown> => import('../pages/HomePage').then(module => ({ default: module.HomePage }));
const LazyQuestionnairePage = (): Promise<unknown> => import('../pages/QuestionnairePage').then(module => ({ default: module.QuestionnairePage }));
const LazyResultsPage = (): Promise<unknown> => import('../pages/ResultsPage').then(module => ({ default: module.ResultsPage }));
const LazyErrorPage = (): Promise<unknown> => import('../pages/ErrorPage').then(module => ({ default: module.ErrorPage }));

/**
 * Route preloading utilities
 */
export const RoutePreloader = {
  /**
   * Preload all routes for instant navigation
   */
  preloadAll: (): void => {
    void LazyHomePage();
    void LazyQuestionnairePage();
    void LazyResultsPage();
    void LazyErrorPage();
  },

  /**
   * Preload specific route
   */
  preloadRoute: (route: 'home' | 'questionnaire' | 'results' | 'error'): void => {
    switch (route) {
      case 'home':
        void LazyHomePage();
        break;
      case 'questionnaire':
        void LazyQuestionnairePage();
        break;
      case 'results':
        void LazyResultsPage();
        break;
      case 'error':
        void LazyErrorPage();
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
        void LazyQuestionnairePage();
        break;
      case 'questionnaire':
        // User likely to go to results next
        void LazyResultsPage();
        break;
      case 'results':
        // User might start new assessment
        void LazyQuestionnairePage();
        break;
    }
  }
};
