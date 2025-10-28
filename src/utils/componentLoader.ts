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
  LazyQuestionnaireAnswersCard,
  LazyEnhancedQuestionnaire
} from '../components/LazyComponents';

/**
 * Component loading utilities
 */
export const ComponentLoader = {
  /**
   * Preload a component for better UX
   */
  preload: (component: () => Promise<any>): void => {
    component();
  },

  /**
   * Preload multiple components
   */
  preloadMultiple: (components: (() => Promise<any>)[]): void => {
    components.forEach(component => component());
  },

  /**
   * Preload components based on user state
   */
  preloadForState: (state: 'home' | 'questionnaire' | 'results'): void => {
    switch (state) {
      case 'home':
        // Preload questionnaire components
        LazyEnhancedQuestionnaire();
        break;
      case 'questionnaire':
        // Preload results components
        LazyResultsSummary();
        LazyProgramCard();
        break;
      case 'results':
        // Preload export/import components
        LazyResultsExport();
        LazyResultsImport();
        break;
    }
  }
};
