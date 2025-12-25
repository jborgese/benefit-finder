/**
 * App Navigation
 * Responsive navigation bar with desktop, tablet, and mobile layouts
 */

import React, { useState, useRef, useEffect } from 'react';
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

  // Simple accessible overflow menu for small screens
  const OverflowMenu: React.FC = () => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const onDocClick = (e: MouseEvent) => {
        if (!containerRef.current) return;
        if (open && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('click', onDocClick);
      return () => document.removeEventListener('click', onDocClick);
    }, [open]);

    return (
      <div ref={containerRef} className="relative">
        <button
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
          className="inline-flex items-center justify-center p-2 rounded-md bg-transparent hover:bg-secondary-100 dark:hover:bg-secondary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          aria-label={t('navigation.more') || 'More'}
        >
          <span className="sr-only">{t('navigation.more') || 'More'}</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M10 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM10 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM10 13a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" fill="currentColor" />
          </svg>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-44 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-md shadow-lg z-50"
          >
            <ul className="py-1">
              <li>
                <button
                  role="menuitem"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-secondary-100 dark:hover:bg-secondary-700"
                  onClick={() => { setOpen(false); onStartWelcomeTour(); }}
                >
                  🎯 {t('navigation.tour')}
                </button>
              </li>
              <li>
                <button
                  role="menuitem"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-secondary-100 dark:hover:bg-secondary-700"
                  onClick={() => { setOpen(false); onShowPrivacyExplainer(); }}
                >
                  🔒 {t('navigation.privacy')}
                </button>
              </li>
              <li>
                <button
                  role="menuitem"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-secondary-100 dark:hover:bg-secondary-700"
                  onClick={() => { setOpen(false); onStartQuickStartGuide(); }}
                >
                  📖 {t('navigation.guide')}
                </button>
              </li>
              <li>
                <button
                  role="menuitem"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-secondary-100 dark:hover:bg-secondary-700"
                  onClick={() => { setOpen(false); onShowShortcutsHelp(); }}
                >
                  ⌨️ {t('navigation.shortcuts')}
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  };

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
              // Use an overflow menu on tablet/portrait to save space
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <OverflowMenu />
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
              {appState === 'home' && (
                // Use overflow menu on mobile onboarding row to reduce vertical space
                <OverflowMenu />
              )}
            </div>
          </div>
        </div>

        {/* Mobile onboarding — replaced with overflow menu to save vertical space */}
      </div>
    </nav>
  );
}
