/**
 * Route components with optimized loading
 *
 * Separated from RouteSplitting.tsx to comply with react-refresh requirements
 * that files should only export components for fast refresh to work properly.
 */

import React from 'react';
import { RouteComponent } from './RouteSplitting';

// Import lazy components
const LazyHomePage = React.lazy(() =>
  import('../pages/HomePage').then(module => ({
    default: module.HomePage
  }))
);

const LazyQuestionnairePage = React.lazy(() =>
  import('../pages/QuestionnairePage').then(module => ({
    default: module.QuestionnairePage
  }))
);

const LazyResultsPage = React.lazy(() =>
  import('../pages/ResultsPage').then(module => ({
    default: module.ResultsPage
  }))
);

const LazyErrorPage = React.lazy(() =>
  import('../pages/ErrorPage').then(module => ({
    default: module.ErrorPage
  }))
);

/**
 * Route components with optimized loading
 */
export const Routes = {
  Home: (): React.JSX.Element => (
    <RouteComponent>
      <LazyHomePage />
    </RouteComponent>
  ),

  Questionnaire: (): React.JSX.Element => (
    <RouteComponent>
      <LazyQuestionnairePage />
    </RouteComponent>
  ),

  Results: (): React.JSX.Element => (
    <RouteComponent>
      <LazyResultsPage />
    </RouteComponent>
  ),

  Error: (): React.JSX.Element => (
    <RouteComponent>
      <LazyErrorPage />
    </RouteComponent>
  ),
};
