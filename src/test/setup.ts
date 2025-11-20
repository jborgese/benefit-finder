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
import { afterEach, beforeAll, vi } from 'vitest';

// CRITICAL: Mock database module at global setup level to prevent ANY RxDB initialization
// This must happen before any test files import modules that use the database
// Mock the database module globally to prevent RxDB instances from being created
// This is a critical fix for memory leaks - RxDB creates IndexedDB connections
// and storage event listeners that accumulate across tests
vi.mock('../db/database', () => {
  // Store programs in memory for the mock
  const mockPrograms: Array<{ id: string; [key: string]: unknown }> = [];

  // Safe property access helper to prevent object injection
  const safeGet = (obj: Record<string, unknown>, key: string): unknown => {
    if (typeof key !== 'string' || key.length === 0) {
      return undefined;
    }
    // Use hasOwnProperty check to prevent prototype pollution
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return obj[key];
    }
    return undefined;
  };

  const mockDb = {
    name: 'benefitfinder',
    user_profiles: {
      find: () => ({ exec: () => Promise.resolve([]), limit: () => ({ exec: () => Promise.resolve([]) }) }),
      findOne: () => ({ exec: () => Promise.resolve(null) }),
      insert: () => Promise.resolve({}),
      count: () => ({ exec: () => Promise.resolve(0) }),
    },
    benefit_programs: {
      find: () => ({
        exec: () =>
          Promise.resolve(
            mockPrograms.map(p => ({
              ...p,
              toJSON: () => p,
              get: (key: string) => safeGet(p, key),
            })),
          ),
        limit: () => ({
          exec: () =>
            Promise.resolve(
              mockPrograms.map(p => ({
                ...p,
                toJSON: () => p,
                get: (key: string) => safeGet(p, key),
              })),
            ),
        }),
      }),
      findOne: (query?: { selector?: { id?: string } }) => ({
        exec: () => {
          if (query?.selector?.id) {
            const program = mockPrograms.find(p => p.id === query.selector.id);
            return Promise.resolve(
              program
                ? { ...program, toJSON: () => program, get: (key: string) => safeGet(program, key) }
                : null,
            );
          }
          return Promise.resolve(null);
        },
      }),
      insert: (data: { id: string; [key: string]: unknown }) => {
        // Check if program already exists
        const existing = mockPrograms.find(p => p.id === data.id);
        if (existing) {
          // Update existing program
          Object.assign(existing, data);
          return Promise.resolve({
            ...existing,
            toJSON: () => existing,
            get: (key: string) => safeGet(existing, key),
          });
        }
        // Add new program
        mockPrograms.push(data);
        return Promise.resolve({
          ...data,
          toJSON: () => data,
          get: (key: string) => safeGet(data, key),
        });
      },
      count: () => ({ exec: () => Promise.resolve(mockPrograms.length) }),
    },
    eligibility_rules: {
      find: () => ({ exec: () => Promise.resolve([]), limit: () => ({ exec: () => Promise.resolve([]) }) }),
      findOne: () => ({ exec: () => Promise.resolve(null) }),
      insert: () => Promise.resolve({}),
      count: () => ({ exec: () => Promise.resolve(0) }),
    },
    eligibility_results: {
      find: () => ({ exec: () => Promise.resolve([]), limit: () => ({ exec: () => Promise.resolve([]) }) }),
      findOne: () => ({ exec: () => Promise.resolve(null) }),
      insert: () => Promise.resolve({}),
      count: () => ({ exec: () => Promise.resolve(0) }),
    },
    app_settings: {
      find: () => ({ exec: () => Promise.resolve([]), limit: () => ({ exec: () => Promise.resolve([]) }) }),
      findOne: () => ({ exec: () => Promise.resolve(null) }),
      count: () => ({ exec: () => Promise.resolve(0) }),
    },
  };

  return {
    initializeDatabase: () => {
      // Clear programs on each initialization to simulate fresh database
      mockPrograms.length = 0;
      return Promise.resolve(mockDb);
    },
    getDatabase: () => mockDb,
    isDatabaseInitialized: () => true,
    clearDatabase: () => {
      mockPrograms.length = 0;
      return Promise.resolve();
    },
    destroyDatabase: () => {
      mockPrograms.length = 0;
      return Promise.resolve();
    },
    exportDatabase: () =>
      Promise.resolve({ version: '1.0.0', timestamp: Date.now(), collections: {} }),
    importDatabase: () => Promise.resolve(undefined),
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
// Currently unused but kept for potential future use
async function _ensureStoresLoaded(): Promise<void> {
  if (questionFlowStore === null) {
    try {
      const mod = await import('../questionnaire/store');
      storeModules.questionFlow = mod;
      questionFlowStore = mod.useQuestionFlowStore.getState();
    } catch {
      // Store not available
    }
  }
  if (questionnaireStore === null) {
    try {
      const mod = await import('../stores/questionnaireStore');
      storeModules.questionnaire = mod;
      questionnaireStore = mod.useQuestionnaireStore.getState();
    } catch {
      // Store not available
    }
  }
  if (encryptionStore === null) {
    try {
      const mod = await import('../stores/encryptionStore');
      storeModules.encryption = mod;
      encryptionStore = mod.useEncryptionStore.getState();
    } catch {
      // Store not available
    }
  }
  if (uiStore === null) {
    try {
      const mod = await import('../stores/uiStore');
      storeModules.ui = mod;
      uiStore = mod.useUIStore.getState();
    } catch {
      // Store not available
    }
  }
  if (appSettingsStore === null) {
    try {
      const mod = await import('../stores/appSettingsStore');
      storeModules.appSettings = mod;
      appSettingsStore = mod.useAppSettingsStore.getState();
    } catch {
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

// Helper functions to reduce cognitive complexity
function cleanupIframes(): void {
  if (typeof document === 'undefined') {
    return;
  }
  // Remove any iframes (RxDB might create these in dev mode)
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    try {
      const container = document.getElementById('root') ?? document.body;
      // container is always truthy (either root element or body)
      if (!container.contains(iframe)) {
        iframe.remove();
      }
    } catch {
      // Ignore errors during cleanup
    }
  });
}

function cleanupStorage(): void {
  try {
    localStorage.clear();
  } catch {
    // Ignore errors if localStorage is not available
  }
  try {
    sessionStorage.clear();
  } catch {
    // Ignore errors if sessionStorage is not available
  }
}

function forceGarbageCollection(): void {
  if (global.gc && typeof global.gc === 'function') {
    try {
      global.gc();
    } catch {
      // Ignore if GC is not available
    }
  }
}

// Helper function to reset a single store if it has a reset method
function resetStoreIfAvailable<T extends { reset?: () => void }>(
  store: T | null,
  resetMethod: (store: T) => void,
): void {
  if (store) {
    resetMethod(store);
  }
}

// Helper function to reset UIStore with its specific methods
function resetUIStore(): void {
  if (!uiStore) {
    return;
  }
  if (typeof uiStore.closeAllModals === 'function') {
    uiStore.closeAllModals();
  }
  if (typeof uiStore.clearToasts === 'function') {
    uiStore.clearToasts();
  }
  if (typeof uiStore.setLoading === 'function') {
    uiStore.setLoading(false);
  }
}

// Helper function to clear Zustand persist storage keys
function clearZustandPersistKeys(): void {
  if (typeof window === 'undefined') {
    return;
  }
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
      } catch {
        // Ignore errors
      }
    });
  } catch {
    // Ignore errors - this is best-effort cleanup
  }
}

function resetZustandStores(): void {
  try {
    // Reset stores if they're already loaded (they should be from previous tests)
    // We don't await ensureStoresLoaded() here because cleanup should be synchronous
    // and stores should already be loaded from the test itself

    // Reset QuestionFlowStore
    resetStoreIfAvailable(questionFlowStore, store => {
      if (typeof store.reset === 'function') {
        store.reset();
      }
    });

    // Reset QuestionnaireStore
    resetStoreIfAvailable(questionnaireStore, store => {
      if (typeof store.resetQuestionnaire === 'function') {
        store.resetQuestionnaire();
      }
    });

    // Reset EncryptionStore
    resetStoreIfAvailable(encryptionStore, store => {
      if (typeof store.reset === 'function') {
        store.reset();
      }
    });

    // Reset UIStore (has individual cleanup methods)
    resetUIStore();

    // Reset AppSettingsStore
    resetStoreIfAvailable(appSettingsStore, store => {
      if (typeof store.resetSettings === 'function') {
        store.resetSettings();
      }
    });

    // Clear Zustand devtools state if present
    if (typeof window !== 'undefined' && (window as Record<string, unknown>).__ZUSTAND_STORES__) {
      delete (window as Record<string, unknown>).__ZUSTAND_STORES__;
    }

    // CRITICAL: Clear Zustand persist storage keys to prevent middleware from processing stale data
    // This prevents persist middleware from creating subscriptions to localStorage changes
    // Zustand persist middleware subscribes to storage events, and clearing localStorage
    // before the middleware processes changes helps prevent memory leaks
    clearZustandPersistKeys();
  } catch (error) {
    // Ignore errors during cleanup - don't let store cleanup break tests
    console.warn('[GLOBAL SETUP DEBUG] Error during Zustand store cleanup:', error);
  }
}

function cleanupRxDB(): void {
  // Cleanup RxDB database instances to prevent memory leaks
  // This is critical because RxDB creates IndexedDB connections that accumulate
  // We do this asynchronously without awaiting to avoid blocking test cleanup
  void (async () => {
    try {
      // Dynamically import to avoid issues with test file mocks
      const dbModule = await import('../db/database');
      if (dbModule.isDatabaseInitialized()) {
        // Destroy database - this closes IndexedDB connections
        await dbModule.destroyDatabase().catch(() => {
          // Ignore errors - database might already be destroyed or mocked
        });
      }
    } catch {
      // Ignore errors - database module might not be available or might be mocked
    }
  })();
}

function cleanupModuleCache(): void {
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
    if (typeof require !== 'undefined') {
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
          // require.cache is always truthy when require is defined
          const cacheEntry = require.cache[resolvedPath];
          if (cacheEntry) {
            delete require.cache[resolvedPath];
            clearedCount++;
          }
        } catch {
          // Path might not resolve or module might not be in cache (expected for ES modules)
        }
      });
      if (clearedCount > 0 && import.meta.env.DEV) {
        console.log(`[GLOBAL SETUP DEBUG] Cleared ${clearedCount} CommonJS modules from require.cache`);
      }
    }

    // Force garbage collection hint if available
    forceGarbageCollection();
  } catch (error) {
    // Ignore errors during module cleanup
    console.warn('[GLOBAL SETUP DEBUG] Error during module cache cleanup:', error);
  }
}

// Cleanup after each test
afterEach(() => {
  console.log('[GLOBAL SETUP DEBUG] Global afterEach starting');
  const globalAfterEachStartTime = Date.now();

  // Clean up React components - this is synchronous and safe
  cleanup();
  console.log('[GLOBAL SETUP DEBUG] React cleanup completed');

  // Aggressive cleanup to prevent memory leaks
  cleanupIframes();
  cleanupStorage();
  forceGarbageCollection();

  // Reset all Zustand stores to prevent state accumulation across tests
  resetZustandStores();

  // Cleanup RxDB database instances
  cleanupRxDB();

  // Clear module cache to prevent state accumulation across test runs
  cleanupModuleCache();

  const globalAfterEachElapsed = Date.now() - globalAfterEachStartTime;
  console.log(`[GLOBAL SETUP DEBUG] Global afterEach completed in ${globalAfterEachElapsed}ms`);
});

// Setup Web Crypto API BEFORE all tests
// This needs to happen at module load time, not in beforeAll
if (!('crypto' in global) || !(global as Record<string, unknown>).crypto?.subtle) {
  Object.defineProperty(global, 'crypto', {
    value: webcrypto as unknown as Crypto,
    writable: false,
    configurable: true,
  });
}

// Also set on window for jsdom
if (typeof window !== 'undefined' && (!('crypto' in window) || !(window as Record<string, unknown>).crypto?.subtle)) {
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

