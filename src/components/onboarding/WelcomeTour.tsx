/**
 * Welcome Tour Component
 *
 * Interactive guided tour for new users introducing key features
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '../Button';
import { useI18n } from '../../i18n/hooks';

interface TourStep {
  id: string;
  target: string; // CSS selector for the element to highlight
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    text: string;
    onClick: () => void;
  };
}

interface WelcomeTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onStartAssessment?: () => void;
}

export const WelcomeTour: React.FC<WelcomeTourProps> = ({
  isOpen,
  onClose,
  onComplete,
  onStartAssessment,
}) => {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const tourSteps: TourStep[] = useMemo(() => [
    {
      id: 'welcome',
      target: 'body',
      title: t('onboarding.tour.welcome.title'),
      content: t('onboarding.tour.welcome.content'),
      position: 'bottom',
    },
    {
      id: 'privacy',
      target: '[data-tour="privacy-card"]',
      title: t('onboarding.tour.privacy.title'),
      content: t('onboarding.tour.privacy.content'),
      position: 'bottom',
    },
    {
      id: 'offline',
      target: '[data-tour="offline-card"]',
      title: t('onboarding.tour.offline.title'),
      content: t('onboarding.tour.offline.content'),
      position: 'bottom',
    },
    {
      id: 'encryption',
      target: '[data-tour="encryption-card"]',
      title: t('onboarding.tour.encryption.title'),
      content: t('onboarding.tour.encryption.content'),
      position: 'bottom',
    },
    {
      id: 'start-button',
      target: '[data-tour="start-button"]',
      title: t('onboarding.tour.startButton.title'),
      content: t('onboarding.tour.startButton.content'),
      position: 'bottom',
      action: {
        text: t('onboarding.tour.startButton.action'),
        onClick: () => {
          onStartAssessment?.();
        },
      },
    },
  ], [t, onStartAssessment]);

  // Highlight the current step's target element
  useEffect(() => {
    if (!isOpen) return;

    // eslint-disable-next-line security/detect-object-injection
    const step = tourSteps[currentStep] ?? tourSteps[0];
    const element = document.querySelector(step.target) as HTMLElement;

    if (element && element.offsetParent !== null) {
      setHighlightedElement(element);

      // Scroll element into view
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    } else {
      // If target element doesn't exist or is not visible, don't highlight
      setHighlightedElement(null);
    }

    return () => {
      setHighlightedElement(null);
    };
  }, [currentStep, isOpen, tourSteps]);

  const handleNext = useCallback((): void => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  }, [currentStep, tourSteps.length, onComplete]);

  const handlePrevious = useCallback((): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrevious, onClose]);

  const handleSkip = useCallback((): void => {
    onClose();
  }, [onClose]);

  const handleActionClick = useCallback((): void => {
    // eslint-disable-next-line security/detect-object-injection
    const step = tourSteps[currentStep] ?? tourSteps[0];
    if (step.action) {
      step.action.onClick();
    }
    handleNext();
  }, [currentStep, tourSteps, handleNext]);

  if (!isOpen) return null;

  // eslint-disable-next-line security/detect-object-injection
  const currentStepData = tourSteps[currentStep] ?? tourSteps[0];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={handleSkip}
      />

      {/* Highlight overlay */}
      {highlightedElement && (
        <div
          className="fixed z-41 pointer-events-none animate-scale-in"
          style={{
            top: highlightedElement.offsetTop - 8,
            left: highlightedElement.offsetLeft - 8,
            width: highlightedElement.offsetWidth + 16,
            height: highlightedElement.offsetHeight + 16,
            border: '2px solid #3b82f6',
            borderRadius: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)',
          }}
        />
      )}

      {/* Tour card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div
          className="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl border border-secondary-200 dark:border-secondary-600 p-6 w-full max-w-md animate-fade-in-up"
        >
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                {t('onboarding.tour.progress', { current: currentStep + 1, total: tourSteps.length })}
              </span>
              <span className="text-sm text-secondary-500 dark:text-secondary-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-secondary-200 dark:bg-secondary-600 rounded-full h-2">
              <div
                className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300 ease-smooth"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="mb-6">
            <h3 className="text-xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-3">
              {currentStepData.title}
            </h3>
            <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
              {currentStepData.content}
            </p>
          </div>

          {/* Action button (if applicable) */}
          {currentStepData.action && (
            <div className="mb-6">
              <Button
                onClick={handleActionClick}
                variant="primary"
                size="sm"
                className="w-full"
              >
                {currentStepData.action.text}
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              variant="ghost"
              size="sm"
              disabled={currentStep === 0}
            >
              {t('common.previous')}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSkip}
                variant="ghost"
                size="sm"
              >
                {t('common.skip')}
              </Button>
              <Button
                onClick={handleNext}
                variant="primary"
                size="sm"
              >
                {currentStep === tourSteps.length - 1 ? t('common.finish') : t('common.next')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeTour;

