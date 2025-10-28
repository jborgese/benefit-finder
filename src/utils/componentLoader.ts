/**
 * Component Loader Utilities
 *
 * Provides utilities for preloading components for better UX
 */

import {
  LazyResultsSummary,
  LazyProgramCard,
  LazyResultsExport,
  LazyResultsImport,
  LazyEnhancedQuestionnaire
} from '../components/LazyComponents';

/**
 * Component loading utilities
 */
export const ComponentLoader = {
  /**
   * Preload a component for better UX
   */
  preload: (component: () => Promise<unknown>): void => {
    void component();
  },

  /**
   * Preload multiple components
   */
  preloadMultiple: (components: (() => Promise<unknown>)[]): void => {
    components.forEach(component => {
      void component();
    });
  },

  /**
   * Preload components based on user state
   */
  preloadForState: (state: 'home' | 'questionnaire' | 'results'): void => {
    switch (state) {
      case 'home':
        // Preload questionnaire components
        ComponentLoader.preload(LazyEnhancedQuestionnaire);
        break;
      case 'questionnaire':
        // Preload results components
        ComponentLoader.preload(LazyResultsSummary);
        ComponentLoader.preload(LazyProgramCard);
        break;
      case 'results':
        // Preload export/import components
        ComponentLoader.preload(LazyResultsExport);
        ComponentLoader.preload(LazyResultsImport);
        break;
    }
  }
};
