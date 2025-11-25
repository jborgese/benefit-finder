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
  (window as unknown as Record<string, unknown>).VITEST = true;
}

// Also set on process.env for Node.js side detection
if (typeof process !== 'undefined') {
  process.env.NODE_ENV = 'test';
  process.env.VITEST = 'true';
}

// Import vi early to mock React before anything else pulls it in
import { vi } from 'vitest';

// Ensure React.lazy never suspends in tests to avoid
// "A component suspended while responding to synchronous input" errors
// when components are rendered during event handlers.
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  const mockedLazy = <T extends React.ComponentType<any>>(
    _factory: () => Promise<{ default: T }>
  ) => {
    return (() => null) as unknown as T;
  };
  const mockedReact = { ...actual, lazy: mockedLazy } as typeof actual & { default?: unknown };
  // Ensure default export also has lazy overridden (for `React.lazy` usage)
  return {
    ...mockedReact,
    default: mockedReact as unknown as typeof actual,
  };
});

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';

// (React.lazy override defined above before any React consumers)

// CRITICAL: Mock database module at global setup level to prevent ANY RxDB initialization
// This must happen before any test files import modules that use the database
// Mock the database module globally to prevent RxDB instances from being created
// This is a critical fix for memory leaks - RxDB creates IndexedDB connections
// and storage event listeners that accumulate across tests
vi.mock('../db/database', () => {
  // In-memory stores for mock collections
  const mockPrograms: Array<Record<string, unknown>> = [];
  const mockRules: Array<Record<string, unknown>> = [];
  const mockProfiles: Array<Record<string, unknown>> = [];
  // Add eligibility results store to support caching tests
  const mockResults: Array<Record<string, any>> = [];

  // Safe property access helper to prevent object injection
  const safeGet = (obj: Record<string, unknown>, key: string): unknown => {
    if (typeof key !== 'string' || key.length === 0) return undefined;
    if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];
    return undefined;
  };

  // Seed WIC program and a minimal eligibility rule for tests
  const seededWicProgram = {
    id: 'wic-federal',
    name: 'Special Supplemental Nutrition Program for Women, Infants, and Children (WIC)',
    shortName: 'WIC',
    category: 'food',
    active: true,
  } as Record<string, unknown>;

  const seededWicRule = {
    id: 'wic-rule-2024-eligibility',
    programId: seededWicProgram.id,
    name: 'WIC Federal Eligibility Rules (2024)',
    ruleType: 'eligibility',
    jsonLogic: { if: [{ var: 'householdIncome' }, true, false] },
    active: true,
  } as Record<string, unknown>;

  // Collection implementations
  const userProfilesCollection: any = {};

  // Helper to create a live wrapper proxy for a backing object
  const makeProfileWrapper = (p: Record<string, any>) => {
    const wrapperHandler: ProxyHandler<any> = {
      get: (_target, prop) => {
        if (prop === 'toJSON') return () => p;
        if (prop === 'get') return (k: string) => safeGet(p, k);
        if (prop === 'collection') return userProfilesCollection;
        if (prop === 'update') return async (patch: any) => {
          const set = patch && patch.$set ? patch.$set : patch;
          // Debug: log updates to profiles during tests

          console.debug('[MOCK DB] update profile', p.id, set);
          if (set && typeof set === 'object') Object.assign(p, set);

          console.debug('[MOCK DB] profile after update', p.id, p);
          return makeProfileWrapper(p);
        };
        if (prop === 'remove') return async () => { const idx = mockProfiles.findIndex((d: any) => d.id === p.id); if (idx >= 0) mockProfiles.splice(idx, 1); return; };
        return p[prop as keyof typeof p];
      },
      ownKeys: () => Reflect.ownKeys(p),
      getOwnPropertyDescriptor: (_t, prop) => ({ configurable: true, enumerable: true, value: p[prop as keyof typeof p] }),
    };
    return new Proxy({}, wrapperHandler) as any;
  };

  // Provide find which returns wrapper documents with expected methods
  userProfilesCollection.find = () => ({
    exec: () => Promise.resolve(mockProfiles.map((p: any) => makeProfileWrapper(p))),
    limit: () => ({ exec: () => Promise.resolve(mockProfiles.map((p: any) => makeProfileWrapper(p))) }),
  });

  userProfilesCollection.findOne = (query?: any) => ({
    exec: () => {
      const id = typeof query === 'string' ? query : query && query.selector ? query.selector.id : undefined;
      const p = id ? mockProfiles.find(x => x.id === id) ?? null : null;
      if (!p) return Promise.resolve(null);

      console.debug('[MOCK DB] findOne returning profile', p.id, p);
      return Promise.resolve(makeProfileWrapper(p));
    },
  });

  userProfilesCollection.insert = (doc: Record<string, unknown>) => {
    const entry: Record<string, any> = { ...(doc || {}) } as Record<string, unknown> as Record<string, any>;
    if (!entry.id) entry.id = Math.random().toString(36).slice(2, 22);
    mockProfiles.push(entry);
    const wrapper: any = {
      ...entry,
      collection: userProfilesCollection,
      toJSON: () => entry,
      get: (k: string) => safeGet(entry, k),
      update: async (patch: any) => {
        const set = patch && patch.$set ? patch.$set : patch;
        if (set && typeof set === 'object') Object.assign(entry, set);
        return Promise.resolve(wrapper);
      },
      remove: async () => {
        const idx = mockProfiles.findIndex((d: any) => d.id === entry.id);
        if (idx >= 0) mockProfiles.splice(idx, 1);
        return Promise.resolve();
      },
    };
    return Promise.resolve(wrapper);
  };

  userProfilesCollection.count = () => ({ exec: () => Promise.resolve(mockProfiles.length) });

  const benefitProgramsCollection: any = {
    find: () => ({
      exec: () => Promise.resolve(mockPrograms.map(p => ({ ...p, toJSON: () => p, get: (k: string) => safeGet(p, k) }))),
      limit: () => ({ exec: () => Promise.resolve(mockPrograms.map(p => ({ ...p, toJSON: () => p, get: (k: string) => safeGet(p, k) }))) }),
    }),
    findOne: (query?: { selector?: { id?: string } } | string) => ({
      exec: () => {
        // Support both RxDB query format: { selector: { id: '...' } } and direct string
        const id = typeof query === 'string' ? query : (query && query.selector ? query.selector.id : undefined);
        const program = id ? mockPrograms.find(p => p.id === id) ?? null : null;
        // Debug: log benefit_programs.findOne lookups and result

        console.debug('[MOCK DB] benefit_programs.findOne lookup id=', id, 'found=', program ? program.id : null);
        return Promise.resolve(program ? { ...program, toJSON: () => program, get: (k: string) => safeGet(program, k) } : null);
      },
    }),
    insert: (data: Record<string, unknown>) => {
      const entry = { ...(data || {}) } as Record<string, unknown>;
      if (!entry.id) entry.id = Math.random().toString(36).slice(2, 22);
      const existing = mockPrograms.find(p => p.id === entry.id);
      if (existing) Object.assign(existing, entry);
      else mockPrograms.push(entry);
      return Promise.resolve({ ...entry, toJSON: () => entry, get: (k: string) => safeGet(entry, k) });
    },
    count: () => ({ exec: () => Promise.resolve(mockPrograms.length) }),
    // Provide a findActivePrograms helper used by evaluateAllPrograms
    findActivePrograms: () => {
      // If programs were seeded/inserted, return them
      if (mockPrograms.length > 0) return Promise.resolve(mockPrograms.filter((p: any) => p.active));
      // Fallback: derive programs from rules if programs are empty (helps tests that initialize via rules)
      const programIds = Array.from(new Set(mockRules.map((r: any) => r.programId).filter(Boolean)));
      if (programIds.length === 0) return Promise.resolve([]);
      const derived = programIds.map(pid => {
        const existing = mockPrograms.find(p => p.id === pid);
        if (existing) return existing;
        // Provide a minimal program object for known canonical ids
        if (pid === 'wic-federal') return { id: 'wic-federal', name: 'Special Supplemental Nutrition Program for Women, Infants, and Children (WIC)', shortName: 'WIC', category: 'food', active: true };
        return { id: pid, name: `Program ${pid}`, shortName: undefined, category: 'other', active: true };
      });
      return Promise.resolve(derived);
    },
  };

  const eligibilityRulesCollection: any = {
    find: (query?: { selector?: { programId?: string } }) => ({
      exec: () => {
        // Debug: log what's in mockRules and what we're searching for

        console.debug('[MOCK DB] eligibility_rules.find query=', query, 'mockRules.length=', mockRules.length, 'programIds=', mockRules.map(r => r.programId));
        const programId = query?.selector?.programId;
        if (programId) {
          const filtered = mockRules.filter(r => r.programId === programId);
          console.debug('[MOCK DB] eligibility_rules.find filtered count=', filtered.length, 'for programId=', programId);
          return Promise.resolve(filtered.map(r => ({ ...r, toJSON: () => r, get: (k: string) => safeGet(r, k) })));
        }
        return Promise.resolve(mockRules.map(r => ({ ...r, toJSON: () => r, get: (k: string) => safeGet(r, k) })));
      },
      limit: () => ({ exec: () => Promise.resolve(mockRules.map(r => ({ ...r, toJSON: () => r, get: (k: string) => safeGet(r, k) }))) }),
    }),
    findOne: (query?: { selector?: { id?: string } }) => ({
      exec: () => {
        const id = query && query.selector ? query.selector.id : undefined;
        const rule = id ? mockRules.find(r => r.id === id) ?? null : null;
        return Promise.resolve(rule ? { ...rule, toJSON: () => rule, get: (k: string) => safeGet(rule, k) } : null);
      },
    }),
    insert: (data: Record<string, unknown>) => {
      const entry = { ...(data || {}) } as Record<string, unknown>;
      if (!entry.id) entry.id = Math.random().toString(36).slice(2, 22);
      mockRules.push(entry);
      return Promise.resolve({ ...entry, toJSON: () => entry, get: (k: string) => safeGet(entry, k) });
    },
    // Upsert behaves like RxDB upsert: insert if missing, otherwise update the existing document
    upsert: async (data: Record<string, any>) => {
      if (!data) return Promise.resolve(null);
      const entry = { ...(data || {}) } as Record<string, any>;
      if (!entry.id) entry.id = Math.random().toString(36).slice(2, 22);
      const idx = mockRules.findIndex(r => r.id === entry.id);
      if (idx >= 0) {
        Object.assign(mockRules[idx], entry);
        const updated = mockRules[idx];

        console.debug('[MOCK DB] upsert updated rule', updated.id);
        return Promise.resolve({ ...updated, toJSON: () => updated, get: (k: string) => safeGet(updated, k) });
      }
      mockRules.push(entry);

      console.debug('[MOCK DB] upsert inserted rule', entry.id);
      return Promise.resolve({ ...entry, toJSON: () => entry, get: (k: string) => safeGet(entry, k) });
    },
    // Convenience helper used by rule evaluation to load rules for a program
    findRulesByProgram: async (programId: string) => {
      return Promise.resolve(mockRules.filter((r: any) => r.programId === programId).map((r: any) => ({ ...r, toJSON: () => r, get: (k: string) => safeGet(r, k) })));
    },
    count: () => ({ exec: () => Promise.resolve(mockRules.length) }),
  };

  const eligibilityResultsCollection: any = {
    find: (query?: { selector?: { userProfileId?: string; programId?: string } }) => ({
      exec: () => {
        let results = mockResults;
        if (query && query.selector) {
          const { userProfileId, programId } = query.selector;
          if (userProfileId) results = results.filter(r => r.userProfileId === userProfileId);
          if (programId) results = results.filter(r => r.programId === programId);
        }
        // Support sort by evaluatedAt desc if requested
        if (query && (query as any).sort) {
          const sortArr = (query as any).sort as Array<Record<string, 'asc' | 'desc'>>;
          const firstSort = sortArr[0];
          if (firstSort && 'evaluatedAt' in firstSort) {
            results = [...results].sort((a, b) => (firstSort.evaluatedAt === 'desc' ? b.evaluatedAt - a.evaluatedAt : a.evaluatedAt - b.evaluatedAt));
          }
        }
        return Promise.resolve(results.map(r => ({
          ...r,
          toJSON: () => r,
          get: (k: string) => safeGet(r, k),
          remove: async () => {
            const idx = mockResults.findIndex(x => x.id === r.id);
            if (idx >= 0) mockResults.splice(idx, 1);
          }
        })));
      },
      limit: () => ({ exec: () => Promise.resolve(mockResults.map(r => ({ ...r, toJSON: () => r, get: (k: string) => safeGet(r, k) }))) })
    }),
    findOne: (query?: { selector?: { userProfileId?: string; programId?: string } }) => ({
      exec: () => {
        if (query && query.selector) {
          const { userProfileId, programId } = query.selector;
          const found = mockResults.find(r => (!userProfileId || r.userProfileId === userProfileId) && (!programId || r.programId === programId)) || null;
          return Promise.resolve(found ? { ...found, toJSON: () => found, get: (k: string) => safeGet(found, k) } : null);
        }
        return Promise.resolve(null);
      }
    }),
    insert: (data: Record<string, any>) => {
      const entry: Record<string, any> = { ...(data || {}) };
      if (!entry.id) entry.id = Math.random().toString(36).slice(2, 22);
      // Provide evaluatedAt default if missing for sort stability
      if (!entry.evaluatedAt) entry.evaluatedAt = Date.now();
      mockResults.push(entry);
      return Promise.resolve({
        ...entry,
        toJSON: () => entry,
        get: (k: string) => safeGet(entry, k),
        remove: async () => {
          const idx = mockResults.findIndex(x => x.id === entry.id);
          if (idx >= 0) mockResults.splice(idx, 1);
        }
      });
    },
    count: () => ({ exec: () => Promise.resolve(mockResults.length) }),
  };

  const appSettingsCollection: any = {
    find: () => ({ exec: () => Promise.resolve([]), limit: () => ({ exec: () => Promise.resolve([]) }) }),
    findOne: () => ({ exec: () => Promise.resolve(null) }),
    count: () => ({ exec: () => Promise.resolve(0) }),
  };

  const mockDb = {
    name: 'benefitfinder',
    user_profiles: userProfilesCollection,
    benefit_programs: benefitProgramsCollection,
    eligibility_rules: eligibilityRulesCollection,
    eligibility_results: eligibilityResultsCollection,
    app_settings: appSettingsCollection,
    // expose internal stores for debugging in tests
    __internal_store: { mockPrograms, mockRules, mockProfiles, mockResults },
  } as const;

  return {
    initializeDatabase: () => {
      // Reset stores
      mockPrograms.length = 0;
      mockRules.length = 0;
      mockProfiles.length = 0;
      mockResults.length = 0;
      // Seed canonical WIC program and rule
      mockPrograms.push({ ...seededWicProgram });
      mockRules.push({ ...seededWicRule });
      // Debug: show seeded state so tests can confirm initialization

      console.debug('[MOCK DB] initializeDatabase seeded programs:', mockPrograms.map(p => p.id));

      console.debug('[MOCK DB] initializeDatabase seeded rules:', mockRules.map(r => r.id));
      return Promise.resolve(mockDb);
    },
    getDatabase: () => mockDb,
    isDatabaseInitialized: () => true,
    clearDatabase: () => {
      mockPrograms.length = 0;
      mockRules.length = 0;
      mockProfiles.length = 0;
      mockResults.length = 0;
      return Promise.resolve();
    },
    destroyDatabase: () => {
      mockPrograms.length = 0;
      mockRules.length = 0;
      mockProfiles.length = 0;
      mockResults.length = 0;
      return Promise.resolve();
    },
    exportDatabase: () => Promise.resolve({ version: '1.0.0', timestamp: Date.now(), collections: {} }),
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
// storeModules removed - no longer needed in test setup

// Lazy store loader removed - not used in current test setup

// Reset store references to force fresh state
function resetStoreReferences(): void {
  questionFlowStore = null;
  questionnaireStore = null;
  encryptionStore = null;
  uiStore = null;
  appSettingsStore = null;
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
function resetStoreIfAvailable<T>(
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
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__ZUSTAND_STORES__) {
      delete (window as unknown as Record<string, unknown>).__ZUSTAND_STORES__;
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
    // NOTE: Do NOT clear all mocks globally.
    // Global vi.clearAllMocks() interferes with baseline mocks established in test setup modules
    // and causes cross-file contamination. Per-file tests handle their own mock hygiene.

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

