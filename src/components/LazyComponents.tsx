/**
 * Lazy Loading Components
 *
 * Provides lazy-loaded versions of heavy UI components to improve initial bundle size.
 * Components are loaded on-demand when needed.
 */

import { lazy } from 'react';

// Lazy load heavy components
export const LazyResultsSummary = lazy(() =>
  import('../components/results/ResultsSummary').then(module => ({
    default: module.ResultsSummary
  }))
);

export const LazyProgramCard = lazy(() =>
  import('../components/results/ProgramCard').then(module => ({
    default: module.ProgramCard
  }))
);

export const LazyResultsExport = lazy(() =>
  import('../components/results/ResultsExport').then(module => ({
    default: module.ResultsExport
  }))
);

export const LazyResultsImport = lazy(() =>
  import('../components/results/ResultsImport').then(module => ({
    default: module.ResultsImport
  }))
);

export const LazyQuestionnaireAnswersCard = lazy(() =>
  import('../components/results/QuestionnaireAnswersCard').then(module => ({
    default: module.QuestionnaireAnswersCard
  }))
);

// Lazy load onboarding components
export const LazyWelcomeTour = lazy(() =>
  import('../components/onboarding/WelcomeTour').then(module => ({
    default: module.WelcomeTour
  }))
);

export const LazyPrivacyExplainer = lazy(() =>
  import('../components/onboarding/PrivacyExplainer').then(module => ({
    default: module.PrivacyExplainer
  }))
);

export const LazyQuickStartGuide = lazy(() =>
  import('../components/onboarding/QuickStartGuide').then(module => ({
    default: module.QuickStartGuide
  }))
);

export const LazyShortcutsHelp = lazy(() =>
  import('../components/onboarding/ShortcutsHelp').then(module => ({
    default: module.ShortcutsHelp
  }))
);

// Lazy load questionnaire components
export const LazyEnhancedQuestionnaire = lazy(() =>
  import('../questionnaire/ui').then(module => ({
    default: module.EnhancedQuestionnaire
  }))
);

// Lazy load visualization components (if needed)
export const LazyFlowDiagram = lazy(() =>
  import('../components/FlowDiagram').then(module => ({
    default: module.FlowDiagram
  }))
);

/**
 * Component loading utilities
 */
export const ComponentLoader = {
  /**
   * Preload a component for better UX
   */
  preload: (component: () => Promise<any>) => {
    component();
  },

  /**
   * Preload multiple components
   */
  preloadMultiple: (components: (() => Promise<any>)[]) => {
    components.forEach(component => component());
  },

  /**
   * Preload components based on user state
   */
  preloadForState: (state: 'home' | 'questionnaire' | 'results') => {
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
