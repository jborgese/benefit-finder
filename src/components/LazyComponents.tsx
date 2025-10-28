/**
 * Lazy Loading Components
 *
 * Provides lazy-loaded versions of heavy UI components to improve initial bundle size.
 * Components are loaded on-demand when needed.
 */

import { lazy } from 'react';

// Lazy load heavy components
export const LazyResultsSummary = lazy(() =>
  import('./results/ResultsSummary').then(module => ({
    default: module.ResultsSummary
  }))
);

export const LazyProgramCard = lazy(() =>
  import('./results/ProgramCard').then(module => ({
    default: module.ProgramCard
  }))
);

export const LazyResultsExport = lazy(() =>
  import('./results/ResultsExport').then(module => ({
    default: module.ResultsExport
  }))
);

export const LazyResultsImport = lazy(() =>
  import('./results/ResultsImport').then(module => ({
    default: module.ResultsImport
  }))
);

export const LazyQuestionnaireAnswersCard = lazy(() =>
  import('./results/QuestionnaireAnswersCard').then(module => ({
    default: module.QuestionnaireAnswersCard
  }))
);

// Lazy load onboarding components
export const LazyWelcomeTour = lazy(() =>
  import('./onboarding/WelcomeTour').then(module => ({
    default: module.WelcomeTour
  }))
);

export const LazyPrivacyExplainer = lazy(() =>
  import('./onboarding/PrivacyExplainer').then(module => ({
    default: module.PrivacyExplainer
  }))
);

export const LazyQuickStartGuide = lazy(() =>
  import('./onboarding/QuickStartGuide').then(module => ({
    default: module.QuickStartGuide
  }))
);

export const LazyShortcutsHelp = lazy(() =>
  import('./ShortcutsHelp').then(module => ({
    default: module.ShortcutsHelp
  }))
);

// Lazy load questionnaire components
export const LazyEnhancedQuestionnaire = lazy(() =>
  import('../questionnaire/ui').then(module => ({
    default: module.EnhancedQuestionnaire
  }))
);

// Component loading utilities moved to separate file to fix react-refresh warning
// See: src/utils/componentLoader.ts
