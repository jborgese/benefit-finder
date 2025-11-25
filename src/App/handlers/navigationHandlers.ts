/**
 * Navigation handlers
 * Handles app navigation and state transitions
 */

import { RoutePreloader } from '../../components/RoutePreloader';
import type { AppState } from '../types';

export function createNavigationHandlers(
  setAppState: (state: AppState) => void,
  setIsProcessingResults: (processing: boolean) => void,
  setErrorMessage: (message: string) => void,
  setAnnouncementMessage: (message: string) => void,
  setHasResults: (hasResults: boolean) => void
) {
  const handleStartQuestionnaire = (): void => {
    RoutePreloader.preloadRoute('questionnaire');
    setAppState('questionnaire');
  };

  const handleViewResults = (): void => {
    RoutePreloader.preloadRoute('results');
    setAppState('results');
    setAnnouncementMessage('Viewing benefit eligibility results.');
  };

  const handleBackToHome = (): void => {
    setAppState('home');
  };

  const handleGoHome = (): void => {
    setAppState('home');
    setIsProcessingResults(false);
    setErrorMessage('');
    setAnnouncementMessage('');
  };

  const handleNewAssessment = (): void => {
    RoutePreloader.preloadRoute('questionnaire');
    setHasResults(false);
    setIsProcessingResults(false);
    setAppState('questionnaire');
  };

  return {
    handleStartQuestionnaire,
    handleViewResults,
    handleBackToHome,
    handleGoHome,
    handleNewAssessment,
  };
}
