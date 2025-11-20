import i18n, { type InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { hasOwnProperty } from '../utils/safePropertyAccess';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';

const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
};

/**
 * Normalize language code to supported format
 * Converts browser language codes like 'en-US' to 'en'
 */
const normalizeLanguageCode = (language: string): string => {
  // Map common browser language codes to our supported languages
  const languageMap: Record<string, string> = {
    'en-US': 'en',
    'en-GB': 'en',
    'en-CA': 'en',
    'en-AU': 'en',
    'es-ES': 'es',
    'es-MX': 'es',
    'es-AR': 'es',
    'es-CO': 'es',
    'es-PE': 'es',
    'es-VE': 'es',
    'es-CL': 'es',
    'es-UY': 'es',
    'es-PY': 'es',
    'es-BO': 'es',
    'es-EC': 'es',
    'es-CR': 'es',
    'es-PA': 'es',
    'es-HN': 'es',
    'es-SV': 'es',
    'es-GT': 'es',
    'es-NI': 'es',
    'es-CU': 'es',
    'es-DO': 'es',
    'es-PR': 'es',
  };

  // Return mapped language or just the first part (before hyphen)
  // Use safe property access to avoid security warnings
  if (hasOwnProperty(languageMap, language)) {
     
    return (languageMap[language] as string);
  }
  return language.split('-')[0];
};

const initOptions: InitOptions = {
  resources,
  fallbackLng: 'en',

  detection: {
    // Order of detection methods
    order: ['localStorage', 'navigator', 'htmlTag'],

    // Keys to look for in localStorage
    lookupLocalStorage: 'benefit-finder-language',

    // Cache user language detection
    caches: ['localStorage'],

    // Convert detected language to supported format
    convertDetectedLanguage: normalizeLanguageCode,
  },

  interpolation: {
    escapeValue: false, // React already does escaping
    format: (value: unknown, format?: string, lng?: string) => {
      // Handle locale-specific formatting
      if (format === 'number' && typeof value === 'number') {
        return new Intl.NumberFormat(lng).format(value);
      }
      if (format === 'currency' && typeof value === 'number') {
        // Default to USD for now, can be made configurable
        return new Intl.NumberFormat(lng, {
          style: 'currency',
          currency: 'USD',
        }).format(value);
      }
      if (format === 'date' && value instanceof Date) {
        return new Intl.DateTimeFormat(lng).format(value);
      }
      if (format === 'dateTime' && value instanceof Date) {
        return new Intl.DateTimeFormat(lng, {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(value);
      }
      return value;
    },
  },

  // Namespace configuration
  defaultNS: 'translation',
  ns: ['translation'],

  // Language codes
  supportedLngs: ['en', 'es'],

  // Don't load unsupported languages
  load: 'languageOnly',

  // Clean code (en instead of en-US)
  cleanCode: true,
};

// Initialize i18n synchronously with proper error handling
let isInitialized = false;

const initializeI18n = async (): Promise<void> => {
  if (isInitialized) {return;}

  try {
    await i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init(initOptions);
    isInitialized = true;
    console.log('i18n initialized successfully');
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
    // Fallback initialization without language detection
    try {
      await i18n
        .use(initReactI18next)
        .init({
          ...initOptions,
          lng: 'en', // Force English as fallback
        });
      isInitialized = true;
      console.log('i18n initialized with fallback');
    } catch (fallbackError) {
      console.error('Failed to initialize i18n with fallback:', fallbackError);
    }
  }
};

// Initialize immediately
void initializeI18n();

// Ensure the i18n instance is properly exported
export default i18n;

// Also export the instance for explicit use
export { i18n };
