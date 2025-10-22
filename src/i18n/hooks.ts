import { useTranslation } from 'react-i18next';
import type { i18n as I18nInstance } from 'i18next';
import { hasOwnProperty } from '../utils/safePropertyAccess';

/**
 * RTL (Right-to-Left) language codes
 */
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur', 'ku', 'dv'];

/**
 * Language metadata for display and formatting
 */
const LANGUAGE_METADATA: Record<string, {
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
  currency: string;
  dateFormat: string;
}> = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    isRTL: false,
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    isRTL: false,
    currency: 'USD',
    dateFormat: 'DD/MM/YYYY',
  },
};

/**
 * Custom hook for accessing translations with type safety
 * Provides access to the t function and i18n instance
 */
export const useI18n = (): {
  t: (key: string, options?: Record<string, unknown>) => string;
  changeLanguage: (lng: string) => Promise<void>;
  currentLanguage: string;
  availableLanguages: string[];
  getLanguageDisplayName: (lng: string) => string;
  getLanguageNativeName: (lng: string) => string;
  getLanguageFlag: (lng: string) => string;
  isRightToLeft: (lng: string) => boolean;
  getDirection: () => 'ltr' | 'rtl';
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  i18n: I18nInstance;
} => {
  const { t, i18n } = useTranslation();

  /**
   * Change the current language
   * @param lng - Language code (e.g., 'en', 'es')
   */
  const changeLanguage = async (lng: string): Promise<void> => {
    await i18n.changeLanguage(lng);

    // Update document direction for RTL support
    const isRTL = isRightToLeft(lng);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  /**
   * Get the current language
   */
  const currentLanguage = i18n.language;

  /**
   * Get all available languages
   */
  const availableLanguages = Object.keys(LANGUAGE_METADATA);

  /**
   * Get language display name
   */
  const getLanguageDisplayName = (lng: string): string => {
    // Normalize language code (handle cases like 'en-US' -> 'en')
    const normalizedLng = lng.split('-')[0];
    const metadata = hasOwnProperty(LANGUAGE_METADATA, normalizedLng)
      ? LANGUAGE_METADATA[normalizedLng]
      : undefined;
    return metadata?.name ?? normalizedLng;
  };

  /**
   * Get language native name
   */
  const getLanguageNativeName = (lng: string): string => {
    // Normalize language code (handle cases like 'en-US' -> 'en')
    const normalizedLng = lng.split('-')[0];
    const metadata = hasOwnProperty(LANGUAGE_METADATA, normalizedLng)
      ? LANGUAGE_METADATA[normalizedLng]
      : undefined;
    return metadata?.nativeName ?? normalizedLng;
  };

  /**
   * Get language flag emoji
   */
  const getLanguageFlag = (lng: string): string => {
    // Normalize language code (handle cases like 'en-US' -> 'en')
    const normalizedLng = lng.split('-')[0];
    const metadata = hasOwnProperty(LANGUAGE_METADATA, normalizedLng)
      ? LANGUAGE_METADATA[normalizedLng]
      : undefined;
    return metadata?.flag ?? '🌐';
  };

  /**
   * Check if a language is right-to-left
   */
  const isRightToLeft = (lng: string): boolean => {
    // Normalize language code (handle cases like 'en-US' -> 'en')
    const normalizedLng = lng.split('-')[0];
    const metadata = hasOwnProperty(LANGUAGE_METADATA, normalizedLng)
      ? LANGUAGE_METADATA[normalizedLng]
      : undefined;
    return RTL_LANGUAGES.includes(normalizedLng) || (metadata?.isRTL ?? false);
  };

  /**
   * Get current language direction
   */
  const getDirection = (): 'ltr' | 'rtl' => {
    return isRightToLeft(currentLanguage) ? 'rtl' : 'ltr';
  };

  /**
   * Format currency for current locale
   */
  const formatCurrency = (amount: number, currency?: string): string => {
    const metadata = hasOwnProperty(LANGUAGE_METADATA, currentLanguage)
      ? LANGUAGE_METADATA[currentLanguage]
      : undefined;
    const localeCurrency = currency ?? (metadata?.currency ?? 'USD');
    return new Intl.NumberFormat(currentLanguage, {
      style: 'currency',
      currency: localeCurrency,
    }).format(amount);
  };

  /**
   * Format date for current locale
   */
  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    return new Intl.DateTimeFormat(currentLanguage, options).format(date);
  };

  /**
   * Format number for current locale
   */
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(currentLanguage, options).format(number);
  };

  return {
    t,
    changeLanguage,
    currentLanguage,
    availableLanguages,
    getLanguageDisplayName,
    getLanguageNativeName,
    getLanguageFlag,
    isRightToLeft,
    getDirection,
    formatCurrency,
    formatDate,
    formatNumber,
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
): string => {
  const { t } = useTranslation();

  const translatedText = t(key, options);

  // Return fallback if translation is missing or same as key
  if (translatedText === key && fallback) {
    return fallback;
  }

  return translatedText;
};
