/**
 * Component Loading Utilities
 *
 * Provides utilities for preloading lazy-loaded components to improve user experience.
 * Separated from LazyComponents.tsx to maintain fast refresh compatibility.
 */

import { ComponentType } from 'react';

// Type for lazy component loaders
type LazyComponentLoader = () => Promise<{ default: ComponentType<unknown> }>;

/**
 * Component loading utilities
 */
export const ComponentLoader = {
  /**
   * Preload a component for better UX
   */
  preload: (component: LazyComponentLoader): void => {
    void component();
  },

  /**
   * Preload multiple components
   */
  preloadMultiple: (components: LazyComponentLoader[]): void => {
    components.forEach(component => {
      void component();
    });
  },

  /**
   * Preload components based on user state
   * Note: This function should be called from components that have access to the lazy components
   */
  preloadForState: (state: 'home' | 'questionnaire' | 'results', lazyComponents: {
    LazyEnhancedQuestionnaire?: LazyComponentLoader;
    LazyResultsSummary?: LazyComponentLoader;
    LazyProgramCard?: LazyComponentLoader;
    LazyResultsExport?: LazyComponentLoader;
    LazyResultsImport?: LazyComponentLoader;
  }): void => {
    switch (state) {
      case 'home':
        // Preload questionnaire components
        if (lazyComponents.LazyEnhancedQuestionnaire) {
          void lazyComponents.LazyEnhancedQuestionnaire();
        }
        break;
      case 'questionnaire':
        // Preload results components
        if (lazyComponents.LazyResultsSummary) {
          void lazyComponents.LazyResultsSummary();
        }
        if (lazyComponents.LazyProgramCard) {
          void lazyComponents.LazyProgramCard();
        }
        break;
      case 'results':
        // Preload export/import components
        if (lazyComponents.LazyResultsExport) {
          void lazyComponents.LazyResultsExport();
        }
        if (lazyComponents.LazyResultsImport) {
          void lazyComponents.LazyResultsImport();
        }
        break;
    }
  }
};
