# Internationalization (i18n) Implementation

This document describes the internationalization setup for the BenefitFinder application.

## Overview

The application supports multiple languages using the i18next library with React integration. Currently supported languages are:

- English (en) - Default
- Spanish (es)

## Architecture

### Core Files

- `src/i18n/index.ts` - Main i18n configuration
- `src/i18n/hooks.ts` - Custom React hooks for i18n
- `src/i18n/locales/` - Translation files directory
  - `en.json` - English translations
  - `es.json` - Spanish translations

### Components

- `src/components/LanguageSwitcher.tsx` - Accessible language switcher component

## Features

### Language Detection

The system automatically detects the user's preferred language using:

1. **localStorage** - Previously selected language
2. **navigator** - Browser language settings
3. **htmlTag** - HTML lang attribute fallback

### Language Persistence

- Selected language is stored in localStorage with key `benefit-finder-language`
- Language preference persists across browser sessions
- Automatic fallback to English if no preference is found

### Translation Structure

Translations are organized by feature/component:

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error"
  },
  "navigation": {
    "home": "Home",
    "results": "Results"
  },
  "app": {
    "title": "BenefitFinder",
    "subtitle": "Find Your Government Benefits"
  }
}
```

## Usage

### Using Translations in Components

```tsx
import { useI18n } from '../i18n/hooks';

function MyComponent() {
  const { t } = useI18n();

  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('app.description')}</p>
    </div>
  );
}
```

### Language Switcher Component

```tsx
import { LanguageSwitcher } from './components/LanguageSwitcher';

// Basic usage
<LanguageSwitcher />

// With custom styling
<LanguageSwitcher
  size="lg"
  variant="minimal"
  className="custom-class"
/>
```

### Custom Hooks

```tsx
import { useI18n } from '../i18n/hooks';

function MyComponent() {
  const {
    t,
    changeLanguage,
    currentLanguage,
    availableLanguages,
    getLanguageDisplayName
  } = useI18n();

  const handleLanguageChange = async () => {
    await changeLanguage('es');
  };

  return (
    <div>
      <p>Current language: {currentLanguage}</p>
      <p>Available languages: {availableLanguages.join(', ')}</p>
      <button onClick={handleLanguageChange}>
        Switch to Spanish
      </button>
    </div>
  );
}
```

## Adding New Languages

1. Create a new translation file in `src/i18n/locales/`
2. Add the language code to the supported languages in `src/i18n/index.ts`
3. Update the `getLanguageDisplayName` function in `src/i18n/hooks.ts`
4. Add flag emoji and display name to `LanguageSwitcher.tsx`

Example for French:

```typescript
// src/i18n/locales/fr.json
{
  "common": {
    "loading": "Chargement...",
    "error": "Erreur"
  }
  // ... other translations
}

// src/i18n/index.ts
supportedLngs: ['en', 'es', 'fr'],

// src/i18n/hooks.ts
const getLanguageDisplayName = (lng: string): string => {
  const names: Record<string, string> = {
    en: 'English',
    es: 'Español',
    fr: 'Français', // Add this
  };
  return names[lng] || lng;
};
```

## Translation Keys

### Common Keys

- `common.loading` - Loading text
- `common.error` - Error text
- `common.save` - Save button text
- `common.cancel` - Cancel button text

### Navigation Keys

- `navigation.home` - Home navigation
- `navigation.results` - Results navigation
- `navigation.settings` - Settings navigation

### App Keys

- `app.title` - Application title
- `app.subtitle` - Application subtitle
- `app.description` - Application description

### Questionnaire Keys

- `questionnaire.title` - Questionnaire title
- `questionnaire.progress` - Progress indicator
- `questionnaire.validation.*` - Validation messages

### Results Keys

- `results.title` - Results page title
- `results.eligible` - Eligible status
- `results.notEligible` - Not eligible status

## Accessibility

The language switcher component follows accessibility best practices:

- Uses Radix UI Select for consistent keyboard navigation
- Includes proper ARIA labels
- Supports screen readers
- Maintains focus management
- Provides visual feedback for state changes

## Testing

Unit tests are available for the language switcher component:

```bash
npm test LanguageSwitcher
```

Integration tests should verify:
- Language switching functionality
- Translation loading
- Language persistence
- Accessibility features

## Performance Considerations

- Translations are loaded statically (no dynamic loading)
- Language switching is instant
- No external API calls for translations
- Minimal bundle size impact

## Future Enhancements

Potential future improvements:

1. **Dynamic Translation Loading** - Load translations on demand
2. **Pluralization Support** - Handle plural forms properly
3. **Date/Number Formatting** - Locale-specific formatting
4. **RTL Support** - Right-to-left language support
5. **Translation Management** - External translation management system
6. **Auto-translation** - Automatic translation for new keys
7. **Translation Validation** - Ensure all keys are translated
