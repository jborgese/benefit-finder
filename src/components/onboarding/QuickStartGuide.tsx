/**
 * Quick Start Guide Component
 *
 * Step-by-step guide for new users to get started quickly
 */

import React, { useState } from 'react';
import { Button } from '../Button';
import { useI18n } from '../../i18n/hooks';

interface QuickStartGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAssessment: () => void;
}

export const QuickStartGuide: React.FC<QuickStartGuideProps> = ({
  isOpen,
  onClose,
  onStartAssessment,
}) => {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) {return null;}

  const steps = [
    {
      id: 'welcome',
      title: t('quickstart.steps.welcome.title'),
      content: t('quickstart.steps.welcome.content'),
      icon: '👋',
      action: t('quickstart.steps.welcome.action'),
    },
    {
      id: 'privacy',
      title: t('quickstart.steps.privacy.title'),
      content: t('quickstart.steps.privacy.content'),
      icon: '🔒',
      action: t('quickstart.steps.privacy.action'),
    },
    {
      id: 'questionnaire',
      title: t('quickstart.steps.questionnaire.title'),
      content: t('quickstart.steps.questionnaire.content'),
      icon: '📝',
      action: t('quickstart.steps.questionnaire.action'),
    },
    {
      id: 'results',
      title: t('quickstart.steps.results.title'),
      content: t('quickstart.steps.results.content'),
      icon: '📊',
      action: t('quickstart.steps.results.action'),
    },
    {
      id: 'next-steps',
      title: t('quickstart.steps.nextSteps.title'),
      content: t('quickstart.steps.nextSteps.content'),
      icon: '🎯',
      action: t('quickstart.steps.nextSteps.action'),
    },
  ];

  // eslint-disable-next-line security/detect-object-injection
  const currentStepData = steps[currentStep] ?? steps[0];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = (): void => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onStartAssessment();
    }
  };

  const handlePrevious = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = (): void => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl border border-secondary-200 dark:border-secondary-600 max-w-2xl w-full animate-scale-in">
        {/* Header */}
        <div className="border-b border-secondary-200 dark:border-secondary-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-secondary-900 dark:text-secondary-100">
                {t('quickstart.title')}
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mt-1">
                {t('quickstart.subtitle')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 bg-secondary-50 dark:bg-secondary-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-secondary-700 dark:text-secondary-200">
              {t('quickstart.progress', { current: currentStep + 1, total: steps.length })}
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

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
              <span className="text-3xl">{currentStepData.icon}</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-4">
              {currentStepData.title}
            </h3>
            <p className="text-secondary-600 dark:text-secondary-300 text-lg leading-relaxed">
              {currentStepData.content}
            </p>
          </div>

          {/* Step-specific content */}
          {currentStep === 0 && (
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-3">
                {t('quickstart.welcome.whatYouGet')}
              </h4>
              <ul className="space-y-2 text-primary-800 dark:text-primary-200">
                <li className="flex items-center">
                  <span className="text-primary-600 dark:text-primary-400 mr-2">✓</span>
                  {t('quickstart.welcome.eligibilityCheck')}
                </li>
                <li className="flex items-center">
                  <span className="text-primary-600 dark:text-primary-400 mr-2">✓</span>
                  {t('quickstart.welcome.personalizedResults')}
                </li>
                <li className="flex items-center">
                  <span className="text-primary-600 dark:text-primary-400 mr-2">✓</span>
                  {t('quickstart.welcome.nextSteps')}
                </li>
                <li className="flex items-center">
                  <span className="text-primary-600 dark:text-primary-400 mr-2">✓</span>
                  {t('quickstart.welcome.privacyFirst')}
                </li>
              </ul>
            </div>
          )}

          {currentStep === 1 && (
            <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-success-900 dark:text-success-100 mb-3">
                {t('quickstart.privacy.keyPoints')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-success-800 dark:text-success-200">
                <div className="flex items-start">
                  <span className="text-success-600 dark:text-success-400 mr-2 mt-0.5">🔒</span>
                  <span className="text-sm">{t('quickstart.privacy.encrypted')}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-success-600 dark:text-success-400 mr-2 mt-0.5">🏠</span>
                  <span className="text-sm">{t('quickstart.privacy.local')}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-success-600 dark:text-success-400 mr-2 mt-0.5">🚫</span>
                  <span className="text-sm">{t('quickstart.privacy.noTracking')}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-success-600 dark:text-success-400 mr-2 mt-0.5">📱</span>
                  <span className="text-sm">{t('quickstart.privacy.offline')}</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-info-900 dark:text-info-100 mb-3">
                {t('quickstart.questionnaire.whatToExpect')}
              </h4>
              <div className="space-y-3 text-info-800 dark:text-info-200">
                <div className="flex items-center">
                  <span className="bg-info-600 dark:bg-info-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3">1</span>
                  <span className="text-sm">{t('quickstart.questionnaire.step1')}</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-info-600 dark:bg-info-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3">2</span>
                  <span className="text-sm">{t('quickstart.questionnaire.step2')}</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-info-600 dark:bg-info-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3">3</span>
                  <span className="text-sm">{t('quickstart.questionnaire.step3')}</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-info-600 dark:bg-info-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3">4</span>
                  <span className="text-sm">{t('quickstart.questionnaire.step4')}</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-warning-900 dark:text-warning-100 mb-3">
                {t('quickstart.results.whatYouGet')}
              </h4>
              <div className="space-y-3 text-warning-800 dark:text-warning-200">
                <div className="flex items-start">
                  <span className="text-warning-600 dark:text-warning-400 mr-2 mt-0.5">📋</span>
                  <span className="text-sm">{t('quickstart.results.eligibilityStatus')}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-warning-600 dark:text-warning-400 mr-2 mt-0.5">📄</span>
                  <span className="text-sm">{t('quickstart.results.requiredDocuments')}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-warning-600 dark:text-warning-400 mr-2 mt-0.5">🎯</span>
                  <span className="text-sm">{t('quickstart.results.nextSteps')}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-warning-600 dark:text-warning-400 mr-2 mt-0.5">📊</span>
                  <span className="text-sm">{t('quickstart.results.estimatedBenefits')}</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-success-900 dark:text-success-100 mb-3">
                {t('quickstart.nextSteps.readyToStart')}
              </h4>
              <p className="text-success-800 dark:text-success-200 text-sm mb-4">
                {t('quickstart.nextSteps.description')}
              </p>
              <div className="flex items-center text-success-700 dark:text-success-300">
                <span className="text-success-600 dark:text-success-400 mr-2">⏱️</span>
                <span className="text-sm font-medium">
                  {t('quickstart.nextSteps.timeEstimate')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-secondary-200 dark:border-secondary-600 p-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              variant="ghost"
              size="sm"
              disabled={currentStep === 0}
            >
              {t('common.previous')}
            </Button>

            <div className="flex items-center gap-3">
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
                {currentStep === steps.length - 1 ? t('quickstart.startAssessment') : t('common.next')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStartGuide;

