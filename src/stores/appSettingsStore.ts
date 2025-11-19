/**
 * App Settings Store
 *
 * Manages user preferences and application settings.
 * Data persists to localStorage for user convenience.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isTestEnvironment } from './persist-helper';

export interface AppSettingsState {
  // Appearance
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;

  // Language & Localization
  language: 'en' | 'es';

  // Privacy & Security
  autoSaveEnabled: boolean;
  encryptionEnabled: boolean;
  sessionTimeout: number; // minutes, 0 = never

  // Accessibility
  reduceMotion: boolean;
  screenReaderMode: boolean;
  keyboardNavigationHints: boolean;

  // Feature Flags
  showTutorial: boolean;
  showPrivacyNotice: boolean;

  // Actions
  setTheme: (theme: AppSettingsState['theme']) => void;
  setFontSize: (size: AppSettingsState['fontSize']) => void;
  setHighContrast: (enabled: boolean) => void;
  setLanguage: (language: AppSettingsState['language']) => void;
  setAutoSave: (enabled: boolean) => void;
  setEncryption: (enabled: boolean) => void;
  setSessionTimeout: (minutes: number) => void;
  setReduceMotion: (enabled: boolean) => void;
  setScreenReaderMode: (enabled: boolean) => void;
  setKeyboardNavigationHints: (enabled: boolean) => void;
  setShowTutorial: (show: boolean) => void;
  setShowPrivacyNotice: (show: boolean) => void;
  resetSettings: () => void;
  clearAllCaches: () => Promise<void>;
}

const defaultSettings = {
  // Appearance
  theme: 'system' as const,
  fontSize: 'medium' as const,
  highContrast: false,

  // Language & Localization
  language: 'en' as const,

  // Privacy & Security
  autoSaveEnabled: true,
  encryptionEnabled: true,
  sessionTimeout: 30,

  // Accessibility
  reduceMotion: false,
  screenReaderMode: false,
  keyboardNavigationHints: true,

  // Feature Flags
  showTutorial: true,
  showPrivacyNotice: true,
};

const storeCreator = (set: (partial: Partial<AppSettingsState> | ((state: AppSettingsState) => Partial<AppSettingsState>)) => void): AppSettingsState => ({
  ...defaultSettings,

  // Actions
  setTheme: (theme: AppSettingsState['theme']) => set({ theme }),
  setFontSize: (fontSize: AppSettingsState['fontSize']) => set({ fontSize }),
  setHighContrast: (highContrast: boolean) => set({ highContrast }),
  setLanguage: (language: AppSettingsState['language']) => set({ language }),
  setAutoSave: (autoSaveEnabled: boolean) => set({ autoSaveEnabled }),
  setEncryption: (encryptionEnabled: boolean) => set({ encryptionEnabled }),
  setSessionTimeout: (sessionTimeout: number) => set({ sessionTimeout }),
  setReduceMotion: (reduceMotion: boolean) => set({ reduceMotion }),
  setScreenReaderMode: (screenReaderMode: boolean) => set({ screenReaderMode }),
  setKeyboardNavigationHints: (keyboardNavigationHints: boolean) =>
    set({ keyboardNavigationHints }),
  setShowTutorial: (showTutorial: boolean) => set({ showTutorial }),
  setShowPrivacyNotice: (showPrivacyNotice: boolean) => set({ showPrivacyNotice }),
  resetSettings: () => set(defaultSettings),
  clearAllCaches: async () => {
    const { clearAllCaches } = await import('@/utils/cacheBusting');
    await clearAllCaches();
  },
});

const isTest = isTestEnvironment();
console.log('[PERSIST DEBUG] appSettingsStore: isTestEnvironment() =', isTest, '-', isTest ? 'persist DISABLED' : 'persist ENABLED');

export const useAppSettingsStore = create<AppSettingsState>()(
  isTest
    ? storeCreator
    : persist(storeCreator, {
        name: 'benefit-finder-settings',
        version: 1,
      })
);

