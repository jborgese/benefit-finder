/**
 * Home Page Component
 *
 * Optimized home page with lazy-loaded components
 */

import React from 'react';
import { Button } from '../components/Button';
import { HelpTooltip } from '../components/onboarding/HelpTooltip';
import { LanguageSwitcher as _LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeSwitcher as _ThemeSwitcher } from '../components/ThemeSwitcher';
import { TextSizeControls as _TextSizeControls } from '../components/TextSizeControls';
import { useI18n } from '../i18n/hooks';

interface HomePageProps {
  onStartQuestionnaire: () => void;
  onViewResults: () => void;
  hasResults: boolean;
  onStartWelcomeTour: () => void;
  onStartPrivacyExplainer: () => void;
  onStartQuickStartGuide: () => void;
  onStartShortcutsHelp: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartQuestionnaire,
  onViewResults,
  hasResults,
  onStartWelcomeTour: _onStartWelcomeTour,
  onStartPrivacyExplainer: _onStartPrivacyExplainer,
  onStartQuickStartGuide: _onStartQuickStartGuide,
  onStartShortcutsHelp: _onStartShortcutsHelp,
}) => {
  const { t } = useI18n();

  return (
    <div className="text-center animate-fade-in-up">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4 sm:mb-6 text-secondary-900 dark:text-secondary-100 px-4">
        {t('app.subtitle')}
      </h2>
      <p className="text-secondary-600 dark:text-secondary-300 mb-8 sm:mb-12 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed px-4">
        {t('app.description')}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4">
        <HelpTooltip
          content="Click here to start the benefit eligibility assessment. It takes about 5-10 minutes to complete."
          trigger="hover"
          position="bottom"
        >
          <Button
            onClick={onStartQuestionnaire}
            size="lg"
            className="animate-bounce-gentle"
            aria-label={t('questionnaire.title')}
            data-tour="start-button"
          >
            {hasResults ? t('common.continue') : t('questionnaire.title')}
          </Button>
        </HelpTooltip>

        {hasResults && (
          <Button
            variant="secondary"
            size="lg"
            onClick={onViewResults}
            className="animate-slide-in-right"
            aria-label={t('navigation.results')}
          >
            {t('navigation.results')}
          </Button>
        )}
      </div>

      <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
        <div
          className="bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg border border-secondary-200 dark:border-secondary-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          data-tour="privacy-card"
        >
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-secondary-900 dark:text-secondary-100">{t('privacy.title')}</h3>
          <p className="text-secondary-600 dark:text-secondary-300 text-sm leading-relaxed">
            {t('privacy.description')}
          </p>
        </div>
        <div
          className="bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg border border-secondary-200 dark:border-secondary-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          data-tour="offline-card"
        >
          <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📱</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-secondary-900 dark:text-secondary-100">{t('privacy.offline')}</h3>
          <p className="text-secondary-600 dark:text-secondary-300 text-sm leading-relaxed">
            {t('privacy.localStorage')}
          </p>
        </div>
        <div
          className="bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg border border-secondary-200 dark:border-secondary-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1"
          data-tour="encryption-card"
        >
          <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🛡️</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-secondary-900 dark:text-secondary-100">{t('app.encryption')}</h3>
          <p className="text-secondary-600 dark:text-secondary-300 text-sm leading-relaxed">
            {t('privacy.encryption')}
          </p>
        </div>
      </div>
    </div>
  );
};
