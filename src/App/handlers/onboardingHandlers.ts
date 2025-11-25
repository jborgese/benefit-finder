/**
 * Onboarding handlers
 * Manages onboarding flow interactions
 */

import type { AppState } from '../types';

export function createOnboardingHandlers(
  setShowWelcomeTour: (show: boolean) => void,
  setShowQuickStartGuide: (show: boolean) => void,
  setAppState: (state: AppState) => void
) {
  const handleStartWelcomeTour = (): void => {
    setShowWelcomeTour(true);
  };

  const handleCompleteWelcomeTour = (): void => {
    setShowWelcomeTour(false);
    localStorage.setItem('bf-welcome-tour-completed', 'true');
  };

  const handleStartQuickStartGuide = (): void => {
    setShowQuickStartGuide(true);
  };

  const handleStartAssessmentFromGuide = (): void => {
    setShowQuickStartGuide(false);
    setAppState('questionnaire');
  };

  return {
    handleStartWelcomeTour,
    handleCompleteWelcomeTour,
    handleStartQuickStartGuide,
    handleStartAssessmentFromGuide,
  };
}
