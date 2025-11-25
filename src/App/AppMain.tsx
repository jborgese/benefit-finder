/**
 * Main App Component
 * Refactored modular structure
 */

import React from 'react';
import { LiveRegion } from '../questionnaire/accessibility';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TextSizeProvider } from '../contexts/TextSizeContext';
import { KeyboardShortcuts } from '../components/KeyboardShortcuts';
import { Routes } from '../components/Routes';
import type { EligibilityResults } from '../components/results';

// Import modular pieces
import {
  useAppState,
  useOnboarding,
  useResultsLoader,
  useDevHelpers,
  useRoutePreloading,
  useTestMode,
} from './hooks';
import {
  createNavigationHandlers,
  createOnboardingHandlers,
  createQuestionnaireHandlers,
  createResultsHandlers,
} from './handlers';
import { AppNavigation, OnboardingModals } from './components';

function App(): React.ReactElement {
  // State management
  const {
    appState,
    setAppState,
    hasResults,
    setHasResults,
    isProcessingResults,
    setIsProcessingResults,
    announcementMessage,
    setAnnouncementMessage,
    errorMessage,
    setErrorMessage,
  } = useAppState();

  const {
    showWelcomeTour,
    setShowWelcomeTour,
    showPrivacyExplainer,
    setShowPrivacyExplainer,
    showQuickStartGuide,
    setShowQuickStartGuide,
    showShortcutsHelp,
    setShowShortcutsHelp,
  } = useOnboarding();

  const {
    currentResults,
    setCurrentResults,
    currentUserProfile,
    setCurrentUserProfile,
    saveResults,
  } = useResultsLoader();

  // Effects
  useDevHelpers();
  useRoutePreloading(appState);
  useTestMode(appState, setCurrentResults, setHasResults, async (params) => {
    await saveResults(params);
  });

  // Handlers
  const {
    handleStartQuestionnaire,
    handleViewResults,
    handleBackToHome,
    handleGoHome,
    handleNewAssessment,
  } = createNavigationHandlers(
    setAppState,
    setIsProcessingResults,
    setErrorMessage,
    setAnnouncementMessage,
    setHasResults
  );

  const {
    handleStartWelcomeTour,
    handleCompleteWelcomeTour,
    handleStartQuickStartGuide,
    handleStartAssessmentFromGuide,
  } = createOnboardingHandlers(
    setShowWelcomeTour,
    setShowQuickStartGuide,
    setAppState
  );

  const { handleCompleteQuestionnaire } = createQuestionnaireHandlers(
    setIsProcessingResults,
    setAnnouncementMessage,
    setErrorMessage,
    setAppState,
    setCurrentUserProfile,
    setCurrentResults,
    setHasResults,
    async (params) => {
      await saveResults(params);
    }
  );

  const { handleImportResults } = createResultsHandlers(
    async (params) => {
      await saveResults(params);
    },
    setCurrentResults,
    setHasResults,
    setAnnouncementMessage
  );

  return (
    <ErrorBoundary
      onError={(error: Error, errorInfo: React.ErrorInfo) => {
        console.error('App Error Boundary caught an error:', error, errorInfo);
      }}
    >
      <ThemeProvider>
        <TextSizeProvider>
          <KeyboardShortcuts
            onStartQuestionnaire={handleStartQuestionnaire}
            onToggleTour={() => setShowWelcomeTour(true)}
            onTogglePrivacy={() => setShowPrivacyExplainer(true)}
            onToggleGuide={() => setShowQuickStartGuide(true)}
            onGoHome={handleBackToHome}
            onViewResults={handleViewResults}
          />
          <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-900 dark:to-primary-900 text-secondary-900 dark:text-secondary-100">
            <LiveRegion
              message={announcementMessage}
              priority="polite"
              clearAfter={3000}
            />

            <AppNavigation
              appState={appState}
              onBackToHome={handleBackToHome}
              onStartWelcomeTour={handleStartWelcomeTour}
              onShowPrivacyExplainer={() => setShowPrivacyExplainer(true)}
              onStartQuickStartGuide={handleStartQuickStartGuide}
              onShowShortcutsHelp={() => setShowShortcutsHelp(true)}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {appState === 'home' && (
                <Routes.Home
                  onStartQuestionnaire={handleStartQuestionnaire}
                  onViewResults={handleViewResults}
                  hasResults={hasResults}
                  onStartWelcomeTour={handleStartWelcomeTour}
                  onStartPrivacyExplainer={() => setShowPrivacyExplainer(true)}
                  onStartQuickStartGuide={handleStartQuickStartGuide}
                  onStartShortcutsHelp={() => setShowShortcutsHelp(true)}
                />
              )}
              {appState === 'questionnaire' && (
                <Routes.Questionnaire
                  onComplete={(answers: Record<string, unknown>): void => {
                    void handleCompleteQuestionnaire(answers);
                  }}
                />
              )}
              {appState === 'results' && (
                <Routes.Results
                  currentResults={currentResults}
                  currentUserProfile={currentUserProfile}
                  isProcessingResults={isProcessingResults}
                  onNewAssessment={handleNewAssessment}
                  onImportResults={async (results: EligibilityResults) => {
                    await handleImportResults(results);
                  }}
                />
              )}
              {appState === 'error' && (
                <Routes.Error
                  errorMessage={errorMessage}
                  onGoHome={handleGoHome}
                />
              )}
            </main>

            <OnboardingModals
              showWelcomeTour={showWelcomeTour}
              showPrivacyExplainer={showPrivacyExplainer}
              showQuickStartGuide={showQuickStartGuide}
              showShortcutsHelp={showShortcutsHelp}
              onCloseWelcomeTour={() => setShowWelcomeTour(false)}
              onCompleteWelcomeTour={handleCompleteWelcomeTour}
              onStartAssessment={handleStartQuestionnaire}
              onClosePrivacyExplainer={() => setShowPrivacyExplainer(false)}
              onCloseQuickStartGuide={() => setShowQuickStartGuide(false)}
              onStartAssessmentFromGuide={handleStartAssessmentFromGuide}
              onCloseShortcutsHelp={() => setShowShortcutsHelp(false)}
            />
          </div>
        </TextSizeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
