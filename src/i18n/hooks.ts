import { useTranslation } from 'react-i18next';

/**
 * Custom hook for accessing translations with type safety
 * Provides access to the t function and i18n instance
 */
export const useI18n = () => {
  const { t, i18n } = useTranslation();

  /**
   * Change the current language
   * @param lng - Language code (e.g., 'en', 'es')
   */
  const changeLanguage = async (lng: string): Promise<void> => {
    await i18n.changeLanguage(lng);
  };

  /**
   * Get the current language
   */
  const currentLanguage = i18n.language;

  /**
   * Get all available languages
   */
  const availableLanguages = ['en', 'es'];

  /**
   * Get language display name
   */
  const getLanguageDisplayName = (lng: string): string => {
    const names: Record<string, string> = {
      en: 'English',
      es: 'Español',
    };
    return names[lng] || lng;
  };

  return {
    t,
    changeLanguage,
    currentLanguage,
    availableLanguages,
    getLanguageDisplayName,
    i18n,
  };
};

/**
 * Hook for getting translated text with fallback
 * @param key - Translation key
 * @param fallback - Fallback text if translation is missing
 * @param options - Translation options
 */
export const useTranslationWithFallback = (
  key: string,
  fallback?: string,
  options?: Record<string, unknown>
) => {
  const { t } = useTranslation();

  const translatedText = t(key, options);

  // Return fallback if translation is missing or same as key
  if (translatedText === key && fallback) {
    return fallback;
  }

  return translatedText;
};
