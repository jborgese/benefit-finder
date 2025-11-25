/**
 * Onboarding Modals
 * Lazy-loaded onboarding dialogs and tours
 */

import React from 'react';

const WelcomeTour = React.lazy(() => import('../../components/onboarding').then(m => ({ default: m.WelcomeTour })));
const PrivacyExplainer = React.lazy(() => import('../../components/onboarding').then(m => ({ default: m.PrivacyExplainer })));
const QuickStartGuide = React.lazy(() => import('../../components/onboarding').then(m => ({ default: m.QuickStartGuide })));
const ShortcutsHelp = React.lazy(() => import('../../components/ShortcutsHelp').then(m => ({ default: m.ShortcutsHelp })));

interface OnboardingModalsProps {
  showWelcomeTour: boolean;
  showPrivacyExplainer: boolean;
  showQuickStartGuide: boolean;
  showShortcutsHelp: boolean;
  onCloseWelcomeTour: () => void;
  onCompleteWelcomeTour: () => void;
  onStartAssessment: () => void;
  onClosePrivacyExplainer: () => void;
  onCloseQuickStartGuide: () => void;
  onStartAssessmentFromGuide: () => void;
  onCloseShortcutsHelp: () => void;
}

export function OnboardingModals({
  showWelcomeTour,
  showPrivacyExplainer,
  showQuickStartGuide,
  showShortcutsHelp,
  onCloseWelcomeTour,
  onCompleteWelcomeTour,
  onStartAssessment,
  onClosePrivacyExplainer,
  onCloseQuickStartGuide,
  onStartAssessmentFromGuide,
  onCloseShortcutsHelp,
}: OnboardingModalsProps): React.ReactElement {
  return (
    <>
      <WelcomeTour
        isOpen={showWelcomeTour}
        onClose={onCloseWelcomeTour}
        onComplete={onCompleteWelcomeTour}
        onStartAssessment={onStartAssessment}
      />

      <PrivacyExplainer
        isOpen={showPrivacyExplainer}
        onClose={onClosePrivacyExplainer}
      />

      <QuickStartGuide
        isOpen={showQuickStartGuide}
        onClose={onCloseQuickStartGuide}
        onStartAssessment={onStartAssessmentFromGuide}
      />

      <ShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={onCloseShortcutsHelp}
      />
    </>
  );
}
