/**
 * App Navigation
 * Responsive navigation bar with desktop, tablet, and mobile layouts
 */

import React from 'react';
import { Button } from '../../components/Button';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import { TextSizeControls } from '../../components/TextSizeControls';
import { useI18n } from '../../i18n/hooks';
import type { AppState } from '../types';

const HelpTooltip = React.lazy(() => import('../../components/onboarding').then(m => ({ default: m.HelpTooltip })));

interface AppNavigationProps {
  appState: AppState;
  onBackToHome: () => void;
  onStartWelcomeTour: () => void;
  onShowPrivacyExplainer: () => void;
  onStartQuickStartGuide: () => void;
  onShowShortcutsHelp: () => void;
}

export function AppNavigation({
  appState,
  onBackToHome,
  onStartWelcomeTour,
  onShowPrivacyExplainer,
  onStartQuickStartGuide,
  onShowShortcutsHelp,
}: AppNavigationProps): React.ReactElement {
  const { t } = useI18n();
  const NAVIGATION_HOME_KEY = 'navigation.home';

  return (
    <nav className="bg-white/80 dark:bg-secondary-800/80 backdrop-blur-md border-b border-secondary-200 dark:border-secondary-700 px-4 py-4 shadow-sm overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-display font-semibold text-secondary-900 dark:text-secondary-100">
              {t('app.title')}
            </h1>
            <a
              href="https://frootsnoops.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
              aria-label="Visit frootsnoops.com - a frootsnoops site"
            >
              <div className="w-11 h-11 rounded-full border-2 border-secondary-300 dark:border-secondary-600 overflow-hidden hover:scale-110 transition-transform duration-200 hover:border-primary-500 dark:hover:border-primary-400">
                <img
                  src="/frootsnoops_mascot.png"
                  alt="Frootsnoops mascot"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-secondary-600 dark:text-secondary-400 font-medium">
                a frootsnoops site
              </span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            {appState !== 'home' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToHome}
                aria-label={t(NAVIGATION_HOME_KEY)}
                className="animate-slide-in-right"
              >
                {t(NAVIGATION_HOME_KEY)}
              </Button>
            )}

            {appState === 'home' && (
              <div className="flex items-center space-x-2">
                <HelpTooltip
                  content="Take a guided tour of the app to learn about key features"
                  trigger="hover"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onStartWelcomeTour}
                    className="text-xs"
                  >
                    🎯 {t('navigation.tour')}
                  </Button>
                </HelpTooltip>
                <HelpTooltip
                  content="Learn about how we protect your privacy and data"
                  trigger="hover"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShowPrivacyExplainer}
                    className="text-xs"
                  >
                    🔒 {t('navigation.privacy')}
                  </Button>
                </HelpTooltip>
                <HelpTooltip
                  content="Get a quick start guide to using the app"
                  trigger="hover"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onStartQuickStartGuide}
                    className="text-xs"
                  >
                    📖 {t('navigation.guide')}
                  </Button>
                </HelpTooltip>
                <HelpTooltip
                  content="View keyboard shortcuts for faster navigation"
                  trigger="hover"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShowShortcutsHelp}
                    className="text-xs"
                  >
                    ⌨️ {t('navigation.shortcuts')}
                  </Button>
                </HelpTooltip>
              </div>
            )}

            <div className="flex items-center gap-2">
              <TextSizeControls size="sm" variant="minimal" />
              <ThemeSwitcher size="sm" variant="minimal" />
              <LanguageSwitcher size="sm" />
            </div>
          </div>
        </div>

        {/* Tablet/Desktop Portrait Layout */}
        <div className="hidden md:flex lg:hidden items-center justify-between px-2">
          <div className="flex items-center gap-1 min-w-0 flex-shrink">
            <h2 className="text-base font-display font-semibold text-secondary-900 dark:text-secondary-100 truncate">
              {t('app.title')}
            </h2>
            <a
              href="https://frootsnoops.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:opacity-80 transition-opacity duration-200 flex-shrink-0"
              aria-label="Visit frootsnoops.com - a frootsnoops site"
            >
              <div className="w-11 h-11 rounded-full border-2 border-secondary-300 dark:border-secondary-600 overflow-hidden hover:scale-110 transition-transform duration-200 hover:border-primary-500 dark:hover:border-primary-400">
                <img
                  src="/frootsnoops_mascot.png"
                  alt="Frootsnoops mascot"
                  className="w-full h-full object-cover"
                />
              </div>
            </a>
          </div>

          <div className="flex items-center gap-1 min-w-0 flex-shrink-0">
            {appState !== 'home' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToHome}
                aria-label={t(NAVIGATION_HOME_KEY)}
                className="animate-slide-in-right flex-shrink-0 text-xs px-2"
              >
                {t(NAVIGATION_HOME_KEY)}
              </Button>
            )}

            {appState === 'home' && (
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <HelpTooltip
                  content="Take a guided tour of the app to learn about key features"
                  trigger="hover"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onStartWelcomeTour}
                    className="text-xs px-1.5"
                  >
                    🎯 Tour
                  </Button>
                </HelpTooltip>
                <HelpTooltip
                  content="Learn about how we protect your privacy and data"
                  trigger="hover"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShowPrivacyExplainer}
                    className="text-xs px-1.5"
                  >
                    🔒 Privacy
                  </Button>
                </HelpTooltip>
                <HelpTooltip
                  content="Get a quick start guide to using the app"
                  trigger="hover"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onStartQuickStartGuide}
                    className="text-xs px-1.5"
                  >
                    📖 Guide
                  </Button>
                </HelpTooltip>
                <HelpTooltip
                  content="View keyboard shortcuts for faster navigation"
                  trigger="hover"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShowShortcutsHelp}
                    className="text-xs px-1.5"
                  >
                    ⌨️ Shortcuts
                  </Button>
                </HelpTooltip>
              </div>
            )}

            <div className="flex items-center gap-1 flex-shrink-0">
              <TextSizeControls size="sm" variant="minimal" />
              <ThemeSwitcher size="sm" variant="minimal" />
              <LanguageSwitcher size="sm" variant="minimal" />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-display font-semibold text-secondary-900 dark:text-secondary-100">
              {t('app.title')}
            </h2>
            <a
              href="https://frootsnoops.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:opacity-80 transition-opacity duration-200"
              aria-label="Visit frootsnoops.com - a frootsnoops site"
            >
              <div className="w-11 h-11 rounded-full border-2 border-secondary-300 dark:border-secondary-600 overflow-hidden hover:scale-110 transition-transform duration-200 hover:border-primary-500 dark:hover:border-primary-400">
                <img
                  src="/frootsnoops_mascot.png"
                  alt="Frootsnoops mascot"
                  className="w-full h-full object-cover"
                />
              </div>
            </a>
          </div>
          <div className="flex items-center space-x-2">
            {appState !== 'home' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToHome}
                aria-label={t(NAVIGATION_HOME_KEY)}
                className="animate-slide-in-right"
              >
                {t(NAVIGATION_HOME_KEY)}
              </Button>
            )}

            <div className="flex items-center gap-1">
              <TextSizeControls size="sm" variant="minimal" />
              <ThemeSwitcher size="sm" variant="minimal" />
              <LanguageSwitcher size="sm" />
            </div>
          </div>
        </div>

        {/* Mobile onboarding row for home page */}
        {appState === 'home' && (
          <div className="flex md:hidden items-center justify-center mt-3 space-x-1">
            <HelpTooltip
              content="Take a guided tour of the app to learn about key features"
              trigger="hover"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onStartWelcomeTour}
                className="text-xs px-2"
              >
                🎯 Tour
              </Button>
            </HelpTooltip>
            <HelpTooltip
              content="Learn about how we protect your privacy and data"
              trigger="hover"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onShowPrivacyExplainer}
                className="text-xs px-2"
              >
                🔒 Privacy
              </Button>
            </HelpTooltip>
            <HelpTooltip
              content="Get a quick start guide to using the app"
              trigger="hover"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onStartQuickStartGuide}
                className="text-xs px-2"
              >
                📖 Guide
              </Button>
            </HelpTooltip>
            <HelpTooltip
              content="View keyboard shortcuts for faster navigation"
              trigger="hover"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onShowShortcutsHelp}
                className="text-xs px-2"
              >
                ⌨️ Shortcuts
              </Button>
            </HelpTooltip>
          </div>
        )}
      </div>
    </nav>
  );
}
