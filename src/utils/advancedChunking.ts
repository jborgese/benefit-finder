/**
 * Advanced Chunking Strategy
 *
 * Provides more granular chunking for better optimization
 */

// Helper functions for advanced chunking
export const getAdvancedChunkForSrcPath = (id: string): string | null => {
  const srcPathMappings = [
    // Core application
    { pattern: 'src/App.tsx', chunk: 'app-core' },
    { pattern: 'src/main.tsx', chunk: 'app-core' },

    // UI components - split by type
    { pattern: 'src/components/Button', chunk: 'ui-button' },
    { pattern: 'src/components/onboarding/', chunk: 'ui-onboarding' },
    { pattern: 'src/components/results/', chunk: 'ui-results' },
    { pattern: 'src/components/', chunk: 'ui-components' },

    // Rules engine - split by functionality
    { pattern: 'src/rules/core/evaluator', chunk: 'rules-evaluator' },
    { pattern: 'src/rules/core/validator', chunk: 'rules-validator' },
    { pattern: 'src/rules/core/tester', chunk: 'rules-tester' },
    { pattern: 'src/rules/core/', chunk: 'rules-engine' },
    { pattern: 'src/rules/federal/', chunk: 'rules-federal' },
    { pattern: 'src/rules/state/', chunk: 'rules-state' },

    // Database - split by functionality
    { pattern: 'src/db/schemas', chunk: 'db-schemas' },
    { pattern: 'src/db/collections', chunk: 'db-collections' },
    { pattern: 'src/db/', chunk: 'database' },

    // Utils - split by functionality
    { pattern: 'src/utils/formatCriteriaDetails', chunk: 'utils-formatting' },
    { pattern: 'src/utils/programHelpers', chunk: 'utils-program' },
    { pattern: 'src/utils/createSampleResults', chunk: 'utils-sample' },
    { pattern: 'src/utils/clearAndReinitialize', chunk: 'utils-clear' },
    { pattern: 'src/utils/forceFixProgramNames', chunk: 'utils-fix' },
    { pattern: 'src/utils/initializeApp', chunk: 'utils-init' },
    { pattern: 'src/utils/', chunk: 'utils' },

    // Other modules - i18n handled separately to avoid conflicts
    { pattern: 'src/questionnaire/', chunk: 'questionnaire' },
    { pattern: 'src/services/', chunk: 'services' },
    { pattern: 'src/stores/', chunk: 'stores' },
    { pattern: 'src/types/', chunk: 'types' },
  ];

  for (const mapping of srcPathMappings) {
    if (id.includes(mapping.pattern)) {
      return mapping.chunk;
    }
  }
  return null;
};

export const getAdvancedChunkForLibrary = (id: string): string | null => {
  const libraryMappings = [
    // React ecosystem - keep React modules together to avoid circular dependencies
    { patterns: ['react', 'react-dom', 'react-router-dom'], chunk: 'react-vendor' },

    // UI libraries - consolidate Radix UI to avoid circular dependencies
    { patterns: ['@radix-ui/'], chunk: 'radix-ui' },

    // Database - keep RxDB and all its plugins together
    { patterns: ['rxdb'], chunk: 'database' },
    { patterns: ['dexie'], chunk: 'database' },

    // State management
    { patterns: ['zustand'], chunk: 'state-zustand' },
    { patterns: ['immer'], chunk: 'state-immer' },

    // Validation and utilities
    { patterns: ['zod'], chunk: 'validation-zod' },
    { patterns: ['nanoid'], chunk: 'utils-nanoid' },
    { patterns: ['crypto-js'], chunk: 'utils-crypto' },
    { patterns: ['json-logic-js'], chunk: 'rule-evaluation' },

    // Visualization
    { patterns: ['reactflow'], chunk: 'visualization-reactflow' },
    { patterns: ['elkjs'], chunk: 'visualization-elk' },

    // Internationalization - keep ALL i18n modules together (both libraries and custom files)
    { patterns: ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'src/i18n/'], chunk: 'i18n' },
  ];

  for (const mapping of libraryMappings) {
    if (mapping.patterns.some(pattern => id.includes(pattern))) {
      return mapping.chunk;
    }
  }
  return null;
};

export const getAdvancedChunkForVendorLibrary = (id: string): string | null => {
  const vendorMappings = [
    // Visualization libraries
    { patterns: ['reactflow', 'elkjs'], chunk: 'visualization' },
    { patterns: ['chart', 'd3', 'plotly'], chunk: 'charts' },

    // Date/time libraries
    { patterns: ['date-fns', 'moment', 'dayjs'], chunk: 'date-utils' },

    // Form validation libraries
    { patterns: ['yup', 'joi'], chunk: 'validation-yup' },
    { patterns: ['ajv'], chunk: 'validation-ajv' },

    // Image processing libraries
    { patterns: ['sharp', 'canvas', 'jimp'], chunk: 'image-processing' },

    // Testing libraries (should be excluded from production)
    { patterns: ['vitest', 'playwright', 'testing-library'], chunk: 'testing' },

    // Development tools (should be excluded from production)
    { patterns: ['eslint', 'typescript', 'vite'], chunk: 'dev-tools' },
  ];

  for (const mapping of vendorMappings) {
    if (mapping.patterns.some(pattern => id.includes(pattern))) {
      return mapping.chunk;
    }
  }
  return 'vendor';
};

export const getStateSpecificChunk = (id: string): string | null => {
  if (id.includes('src/rules/state/')) {
    const stateMatch = id.match(/src\/rules\/state\/([^/]+)/);
    return stateMatch ? `rules-state-${stateMatch[1]}` : 'rules-state';
  }
  return null;
};
