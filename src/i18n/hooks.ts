import { useTranslation } from 'react-i18next';
import type { i18n as I18nInstance } from 'i18next';

/**
 * RTL (Right-to-Left) language codes
 */
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur', 'ku', 'dv'];

/**
 * Safely get language metadata
 */
const getLanguageMetadata = (lng: string): typeof LANGUAGE_METADATA[keyof typeof LANGUAGE_METADATA] | undefined => {
  const normalizedLng = lng.split('-')[0];
  if (normalizedLng === 'en') {return LANGUAGE_METADATA.en;}
  if (normalizedLng === 'es') {return LANGUAGE_METADATA.es;}
  return undefined;
};

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
    const metadata = getLanguageMetadata(lng);
    if (metadata) {
      return metadata.name;
    }
    return lng.split('-')[0];
  };

  /**
   * Get language native name
   */
  const getLanguageNativeName = (lng: string): string => {
    const metadata = getLanguageMetadata(lng);
    if (metadata) {
      return metadata.nativeName;
    }
    return lng.split('-')[0];
  };

  /**
   * Get language flag emoji
   */
  const getLanguageFlag = (lng: string): string => {
    const metadata = getLanguageMetadata(lng);
    if (metadata) {
      return metadata.flag;
    }
    return '🌐';
  };

  /**
   * Check if a language is right-to-left
   */
  const isRightToLeft = (lng: string): boolean => {
    const metadata = getLanguageMetadata(lng);
    if (metadata) {
      return metadata.isRTL;
    }
    return RTL_LANGUAGES.includes(lng.split('-')[0]);
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
    let localeCurrency = 'USD';
    const metadata = getLanguageMetadata(currentLanguage);
    if (metadata) {
      localeCurrency = metadata.currency;
    }
    const finalCurrency = currency ?? localeCurrency;
    return new Intl.NumberFormat(currentLanguage, {
      style: 'currency',
      currency: finalCurrency,
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
