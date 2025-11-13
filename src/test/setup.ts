/**
 * Vitest Setup File
 *
 * Global test configuration and setup.
 * This file runs before each test suite.
 */

// CRITICAL: Set VITEST flag FIRST, before any other imports
// This ensures persist middleware correctly detects test environment
// when stores are created at module load time
if (typeof window !== 'undefined') {
  (window as Record<string, unknown>).VITEST = true;
}

// Also set on process.env for Node.js side detection
if (typeof process !== 'undefined') {
  process.env.NODE_ENV = 'test';
  process.env.VITEST = 'true';
}

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';

// CRITICAL: Mock database module at global setup level to prevent ANY RxDB initialization
// This must happen before any test files import modules that use the database
// Mock the database module globally to prevent RxDB instances from being created
// This is a critical fix for memory leaks - RxDB creates IndexedDB connections
// and storage event listeners that accumulate across tests
vi.mock('../db/database', async () => {
  const mockDb = {
    name: 'benefitfinder',
    user_profiles: {
      find: () => ({ exec: async () => [] }),
      findOne: () => ({ exec: async () => null }),
      insert: async () => ({}),
    },
    benefit_programs: {
      find: () => ({ exec: async () => [] }),
      findOne: () => ({ exec: async () => null }),
    },
    eligibility_rules: {
      find: () => ({ exec: async () => [] }),
    },
    eligibility_results: {
      find: () => ({ exec: async () => [] }),
      insert: async () => ({}),
    },
    app_settings: {
      find: () => ({ exec: async () => [] }),
    },
  };

  return {
    initializeDatabase: async () => mockDb,
    getDatabase: () => mockDb,
    isDatabaseInitialized: () => true,
    clearDatabase: async () => undefined,
    destroyDatabase: async () => undefined,
    exportDatabase: async () => ({ version: '1.0.0', timestamp: Date.now(), collections: {} }),
    importDatabase: async () => undefined,
  };
});
import 'fake-indexeddb/auto';
import { webcrypto } from 'crypto';
import { Buffer } from 'buffer';

// Import Zustand stores for cleanup (these are module-level singletons)
// Using try-catch to handle cases where stores might not be available
let questionFlowStore: ReturnType<typeof import('../questionnaire/store').useQuestionFlowStore.getState> | null = null;
let questionnaireStore: ReturnType<typeof import('../stores/questionnaireStore').useQuestionnaireStore.getState> | null = null;
let encryptionStore: ReturnType<typeof import('../stores/encryptionStore').useEncryptionStore.getState> | null = null;
let uiStore: ReturnType<typeof import('../stores/uiStore').useUIStore.getState> | null = null;
let appSettingsStore: ReturnType<typeof import('../stores/appSettingsStore').useAppSettingsStore.getState> | null = null;

// Store module references for cache clearing
let storeModules: {
  questionFlow?: typeof import('../questionnaire/store');
  questionnaire?: typeof import('../stores/questionnaireStore');
  encryption?: typeof import('../stores/encryptionStore');
  ui?: typeof import('../stores/uiStore');
  appSettings?: typeof import('../stores/appSettingsStore');
} = {};

// Lazy load stores on first afterEach call
function ensureStoresLoaded(): void {
  if (questionFlowStore === null) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('../questionnaire/store');
      storeModules.questionFlow = mod;
      questionFlowStore = mod.useQuestionFlowStore.getState();
    } catch (e) {
      // Store not available
    }
  }
  if (questionnaireStore === null) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('../stores/questionnaireStore');
      storeModules.questionnaire = mod;
      questionnaireStore = mod.useQuestionnaireStore.getState();
    } catch (e) {
      // Store not available
    }
  }
  if (encryptionStore === null) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('../stores/encryptionStore');
      storeModules.encryption = mod;
      encryptionStore = mod.useEncryptionStore.getState();
    } catch (e) {
      // Store not available
    }
  }
  if (uiStore === null) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('../stores/uiStore');
      storeModules.ui = mod;
      uiStore = mod.useUIStore.getState();
    } catch (e) {
      // Store not available
    }
  }
  if (appSettingsStore === null) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('../stores/appSettingsStore');
      storeModules.appSettings = mod;
      appSettingsStore = mod.useAppSettingsStore.getState();
    } catch (e) {
      // Store not available
    }
  }
}

// Reset store references to force fresh state
function resetStoreReferences(): void {
  questionFlowStore = null;
  questionnaireStore = null;
  encryptionStore = null;
  uiStore = null;
  appSettingsStore = null;
  storeModules = {};
}

// Cleanup after each test
afterEach(() => {
  console.log('[GLOBAL SETUP DEBUG] Global afterEach starting');
  const globalAfterEachStartTime = Date.now();

  // Clean up React components - this is synchronous and safe
  cleanup();
  console.log('[GLOBAL SETUP DEBUG] React cleanup completed');

  // Aggressive cleanup to prevent memory leaks
  if (typeof document !== 'undefined') {
    // Remove any iframes (RxDB might create these in dev mode)
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        const container = document.getElementById('root') || document.body;
        if (container && !container.contains(iframe)) {
          iframe.remove();
        }
      } catch (e) {
        // Ignore errors during cleanup
      }
    });
  }

  // Clear localStorage to prevent accumulation across tests
  // This is important because RxDB and other code may store data
  try {
    localStorage.clear();
  } catch (e) {
    // Ignore errors if localStorage is not available
  }

  // Clear sessionStorage
  try {
    sessionStorage.clear();
  } catch (e) {
    // Ignore errors if sessionStorage is not available
  }

  // Force garbage collection hint (if available)
  // This helps Node.js clean up memory between tests
  if (global.gc && typeof global.gc === 'function') {
    try {
      global.gc();
    } catch (e) {
      // Ignore if GC is not available
    }
  }

  // Reset all Zustand stores to prevent state accumulation across tests
  // This is critical because Zustand stores are module-level singletons that persist
  try {
    ensureStoresLoaded();

    // Reset QuestionFlowStore
    if (questionFlowStore && typeof questionFlowStore.reset === 'function') {
      questionFlowStore.reset();
    }

    // Reset QuestionnaireStore
    if (questionnaireStore && typeof questionnaireStore.resetQuestionnaire === 'function') {
      questionnaireStore.resetQuestionnaire();
    }

    // Reset EncryptionStore
    if (encryptionStore && typeof encryptionStore.reset === 'function') {
      encryptionStore.reset();
    }

    // Reset UIStore (has individual cleanup methods)
    if (uiStore) {
      if (typeof uiStore.closeAllModals === 'function') uiStore.closeAllModals();
      if (typeof uiStore.clearToasts === 'function') uiStore.clearToasts();
      if (typeof uiStore.setLoading === 'function') uiStore.setLoading(false);
    }

    // Reset AppSettingsStore
    if (appSettingsStore && typeof appSettingsStore.resetSettings === 'function') {
      appSettingsStore.resetSettings();
    }

    // Clear Zustand devtools state if present
    if (typeof window !== 'undefined' && (window as Record<string, unknown>).__ZUSTAND_STORES__) {
      delete (window as Record<string, unknown>).__ZUSTAND_STORES__;
    }

    // CRITICAL: Clear Zustand persist storage keys to prevent middleware from processing stale data
    // This prevents persist middleware from creating subscriptions to localStorage changes
    // Zustand persist middleware subscribes to storage events, and clearing localStorage
    // before the middleware processes changes helps prevent memory leaks
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // Clear all Zustand persist keys to prevent rehydration
        const persistKeys = [
          'bf-question-flow-store',
          'bf-app-settings-store',
          'bf-encryption-store',
        ];
        persistKeys.forEach(key => {
          try {
            window.localStorage.removeItem(key);
          } catch (e) {
            // Ignore errors
          }
        });
      } catch (e) {
        // Ignore errors - this is best-effort cleanup
      }
    }
  } catch (e) {
    // Ignore errors during cleanup - don't let store cleanup break tests
    console.warn('[GLOBAL SETUP DEBUG] Error during Zustand store cleanup:', e);
  }

  // Cleanup RxDB database instances to prevent memory leaks
  // This is critical because RxDB creates IndexedDB connections that accumulate
  // We do this asynchronously without awaiting to avoid blocking test cleanup
  void (async () => {
    try {
      // Dynamically import to avoid issues with test file mocks
      const dbModule = await import('../db/database');
      if (dbModule.isDatabaseInitialized && dbModule.isDatabaseInitialized()) {
        // Destroy database - this closes IndexedDB connections
        await dbModule.destroyDatabase().catch(() => {
          // Ignore errors - database might already be destroyed or mocked
        });
      }
    } catch (e) {
      // Ignore errors - database module might not be available or might be mocked
    }
  })();

  // CRITICAL: Clear module cache to prevent state accumulation across test runs
  // This ensures that Zustand stores and other module-level singletons are recreated
  // fresh for each test, preventing memory leaks from cached module instances
  try {
    // Clear all registered mocks to prevent stale references
    vi.clearAllMocks();

    // Reset store references to force fresh state on next access
    // This helps prevent stale closures and event listeners from accumulating
    resetStoreReferences();

    // NOTE: Module cache clearing for ES modules
    // Vitest uses ES modules, not CommonJS, so require.cache won't work.
    // ES modules are managed by Vite's module graph and cannot be cleared at runtime.
    // Instead, we rely on:
    // 1. Test isolation (isolate: true in vitest.config.ts)
    // 2. Mock reset (vi.clearAllMocks above)
    // 3. Store reference reset (resetStoreReferences above)
    // 4. Garbage collection hints below

    // Clear Node.js require cache if available (for any CommonJS dependencies)
    // This is a best-effort attempt - most code uses ES modules
    if (typeof require !== 'undefined' && require.cache) {
      const storePaths = [
        '../questionnaire/store',
        '../stores/questionnaireStore',
        '../stores/encryptionStore',
        '../stores/uiStore',
        '../stores/appSettingsStore',
        '../db/database',
        '../db/utils',
      ];
      let clearedCount = 0;
      storePaths.forEach(path => {
        try {
          const resolvedPath = require.resolve(path);
          if (require.cache[resolvedPath]) {
            delete require.cache[resolvedPath];
            clearedCount++;
          }
        } catch (e) {
          // Path might not resolve or module might not be in cache (expected for ES modules)
        }
      });
      if (clearedCount > 0 && import.meta.env.DEV) {
        console.log(`[GLOBAL SETUP DEBUG] Cleared ${clearedCount} CommonJS modules from require.cache`);
      }
    }

    // Force garbage collection hint if available
    // This helps Node.js release memory between tests
    if (global.gc && typeof global.gc === 'function') {
      try {
        global.gc();
      } catch (e) {
        // Ignore if GC is not available
      }
    }
  } catch (e) {
    // Ignore errors during module cleanup
    console.warn('[GLOBAL SETUP DEBUG] Error during module cache cleanup:', e);
  }

  const globalAfterEachElapsed = Date.now() - globalAfterEachStartTime;
  console.log(`[GLOBAL SETUP DEBUG] Global afterEach completed in ${globalAfterEachElapsed}ms`);
});

// Setup Web Crypto API BEFORE all tests
// This needs to happen at module load time, not in beforeAll
if (!('crypto' in global) || !(global as any).crypto?.subtle) {
  Object.defineProperty(global, 'crypto', {
    value: webcrypto as unknown as Crypto,
    writable: false,
    configurable: true,
  });
}

// Also set on window for jsdom
if (typeof window !== 'undefined' && (!('crypto' in window) || !(window as any).crypto?.subtle)) {
  Object.defineProperty(window, 'crypto', {
    value: webcrypto as unknown as Crypto,
    writable: false,
    configurable: true,
  });
}

// Ensure btoa and atob are available globally (for Node.js environment)
if (typeof global.btoa === 'undefined') {
  global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}

if (typeof global.atob === 'undefined') {
  global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}

// Global test setup
beforeAll(() => {
  // Set test environment variables for proper detection
  process.env.NODE_ENV = 'test';
  process.env.VITEST = 'true';

  // Mock window.matchMedia (for responsive tests)
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect(): void {}
    observe(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
    unobserve(): void {}
  } as any;

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect(): void {}
    observe(): void {}
    unobserve(): void {}
  } as any;

  // Mock localStorage (already available in jsdom, but ensure clean state)
  localStorage.clear();
  sessionStorage.clear();
});

// Suppress console errors in tests (optional)
// Uncomment if you want cleaner test output
// const originalError = console.error;
// beforeAll(() => {
//   console.error = (...args: any[]) => {
//     if (
//       typeof args[0] === 'string' &&
//       args[0].includes('Warning: ReactDOM.render')
//     ) {
//       return;
//     }
//     originalError.call(console, ...args);
//   };
// });

// afterAll(() => {
//   console.error = originalError;
// });

