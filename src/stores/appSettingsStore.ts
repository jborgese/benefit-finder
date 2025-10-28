/**
 * App Settings Store
 *
 * Manages user preferences and application settings.
 * Data persists to localStorage for user convenience.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      // Actions
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setLanguage: (language) => set({ language }),
      setAutoSave: (autoSaveEnabled) => set({ autoSaveEnabled }),
      setEncryption: (encryptionEnabled) => set({ encryptionEnabled }),
      setSessionTimeout: (sessionTimeout) => set({ sessionTimeout }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setScreenReaderMode: (screenReaderMode) => set({ screenReaderMode }),
      setKeyboardNavigationHints: (keyboardNavigationHints) =>
        set({ keyboardNavigationHints }),
      setShowTutorial: (showTutorial) => set({ showTutorial }),
      setShowPrivacyNotice: (showPrivacyNotice) => set({ showPrivacyNotice }),
      resetSettings: () => set(defaultSettings),
      clearAllCaches: async () => {
        const { clearAllCaches } = await import('@/utils/cacheBusting');
        await clearAllCaches();
      },
    }),
    {
      name: 'benefit-finder-settings',
      version: 1,
    }
  )
);

