/**
 * Onboarding state management hook
 * Manages onboarding modal visibility states
 */

import { useState } from 'react';

export function useOnboarding() {
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [showPrivacyExplainer, setShowPrivacyExplainer] = useState(false);
  const [showQuickStartGuide, setShowQuickStartGuide] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  return {
    showWelcomeTour,
    setShowWelcomeTour,
    showPrivacyExplainer,
    setShowPrivacyExplainer,
    showQuickStartGuide,
    setShowQuickStartGuide,
    showShortcutsHelp,
    setShowShortcutsHelp,
  };
}
