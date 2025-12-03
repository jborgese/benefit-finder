/**
 * Route Preloader
 *
 * Provides intelligent route preloading for better user experience
 * with aggressive prefetching of likely next routes
 */

// Lazy load route components for preloading
const LazyHomePage = (): Promise<unknown> => import('../pages/HomePage').then(module => ({ default: module.HomePage }));
const LazyQuestionnairePage = (): Promise<unknown> => import('../pages/QuestionnairePage').then(module => ({ default: module.QuestionnairePage }));
const LazyResultsPage = (): Promise<unknown> => import('../pages/ResultsPage').then(module => ({ default: module.ResultsPage }));
const LazyErrorPage = (): Promise<unknown> => import('../pages/ErrorPage').then(module => ({ default: module.ErrorPage }));

// Preload critical components
const preloadProgramCard = (): Promise<unknown> => import('./results/ProgramCard');
const preloadResultsSummary = (): Promise<unknown> => import('./results/ResultsSummary');
const preloadOnboarding = (): Promise<unknown> => import('./onboarding');

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
        // Prefetch results components ahead of time
        void preloadProgramCard();
        void preloadResultsSummary();
        break;
      case 'error':
        void LazyErrorPage();
        break;
    }
  },

  /**
   * Preload routes based on user journey with aggressive prefetching
   */
  preloadUserJourney: (currentRoute: string): void => {
    switch (currentRoute) {
      case 'home':
        // User likely to go to questionnaire next
        void LazyQuestionnairePage();
        // Also preload onboarding modals (often shown on home)
        void preloadOnboarding();
        break;
      case 'questionnaire':
        // User likely to go to results next - preload aggressively
        void LazyResultsPage();
        void preloadProgramCard();
        void preloadResultsSummary();
        break;
      case 'results':
        // User might start new assessment
        void LazyQuestionnairePage();
        // Keep home page ready
        void LazyHomePage();
        break;
    }
  },

  /**
   * Preload critical components for current route
   */
  preloadCriticalComponents: (currentRoute: string): void => {
    switch (currentRoute) {
      case 'home':
        void preloadOnboarding();
        break;
      case 'results':
        void preloadProgramCard();
        void preloadResultsSummary();
        break;
    }
  },

  /**
   * Add prefetch link hints to DOM for browser-level prefetching
   */
  addPrefetchHints: (routes: string[]): void => {
    routes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'script';
      
      // Map route names to chunk patterns
      const chunkPatterns: Record<string, string> = {
        'questionnaire': 'QuestionnairePage',
        'results': 'ResultsPage',
        'home': 'HomePage',
      };
      
      const pattern = chunkPatterns[route];
      if (pattern) {
        link.href = `/${pattern}`;
        document.head.appendChild(link);
      }
    });
  }
};
