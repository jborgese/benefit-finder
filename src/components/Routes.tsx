/**
 * Routes Component
 *
 * Provides lazy-loaded route components with optimized loading
 */

import React, { lazy } from 'react';
import { RouteComponent } from './RouteComponent';
import type { EligibilityResults } from './results';

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
 * Route components with optimized loading
 */
export const Routes = {
  Home: (props: {
    onStartQuestionnaire: () => void;
    onViewResults: () => void;
    hasResults: boolean;
    onStartWelcomeTour: () => void;
    onStartPrivacyExplainer: () => void;
    onStartQuickStartGuide: () => void;
    onStartShortcutsHelp: () => void;
  }) => (
    <RouteComponent>
      <LazyHomePage {...props} />
    </RouteComponent>
  ),

  Questionnaire: (props: {
    onComplete: (answers: Record<string, unknown>) => void;
  }) => (
    <RouteComponent>
      <LazyQuestionnairePage {...props} />
    </RouteComponent>
  ),

  Results: (props: {
    currentResults: EligibilityResults | null;
    currentUserProfile: { state?: string;[key: string]: unknown } | null;
    isProcessingResults: boolean;
    onNewAssessment: () => void;
    onImportResults: (results: EligibilityResults) => Promise<void>;
  }) => (
    <RouteComponent>
      <LazyResultsPage {...props} />
    </RouteComponent>
  ),

  Error: (props: {
    errorMessage: string;
    onGoHome: () => void;
  }) => (
    <RouteComponent>
      <LazyErrorPage {...props} />
    </RouteComponent>
  ),
};
