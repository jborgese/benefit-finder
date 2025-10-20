import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

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

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,

    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],

      // Keys to look for in localStorage
      lookupLocalStorage: 'benefit-finder-language',

      // Cache user language detection
      caches: ['localStorage'],

      // Don't cache language detection in sessionStorage
      lookupSessionStorage: false,
    },

    interpolation: {
      escapeValue: false, // React already does escaping
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
  });

export default i18n;
