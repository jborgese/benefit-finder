/**
 * Zustand Persist Helper
 *
 * Provides utilities to conditionally apply persist middleware based on environment.
 * This prevents storage event listeners from being created in test environments,
 * which can cause memory leaks when tests run in sequence.
 */

/**
 * Check if we're in a test environment
 *
 * This is used to conditionally disable persist middleware in tests,
 * preventing storage event listeners from being created and causing memory leaks.
 *
 * Checks multiple sources to reliably detect test environments:
 * - process.env.NODE_ENV === 'test'
 * - process.env.VITEST === 'true'
 * - import.meta.env.VITEST (Vite/Vitest environment variable)
 * - import.meta.env.MODE === 'test'
 * - window.VITEST (set by Vitest in jsdom environment)
 */
export const isTestEnvironment = (): boolean => {
  const debugInfo: {
    processEnv: {
      NODE_ENV?: string;
      VITEST?: string;
    };
    importMetaEnv: {
      VITEST?: unknown;
      MODE?: string;
    };
    windowVITEST?: unknown;
    result: boolean;
  } = {
    processEnv: {},
    importMetaEnv: {},
    result: false,
  };

  // Check Node.js process.env
  if (typeof process !== 'undefined') {
    debugInfo.processEnv.NODE_ENV = process.env.NODE_ENV;
    debugInfo.processEnv.VITEST = process.env.VITEST;
    if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
      debugInfo.result = true;
      console.log('[PERSIST DEBUG] isTestEnvironment() = true (process.env check)', debugInfo);
      return true;
    }
  }

  // Check Vite/Vitest import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    debugInfo.importMetaEnv.VITEST = import.meta.env.VITEST;
    debugInfo.importMetaEnv.MODE = import.meta.env.MODE;
    if (import.meta.env.VITEST === true || import.meta.env.MODE === 'test') {
      debugInfo.result = true;
      console.log('[PERSIST DEBUG] isTestEnvironment() = true (import.meta.env check)', debugInfo);
      return true;
    }
  }

  // Check window.VITEST (set by Vitest in jsdom)
  if (typeof window !== 'undefined') {
    debugInfo.windowVITEST = (window as Record<string, unknown>).VITEST;
    if ((window as Record<string, unknown>).VITEST === true) {
      debugInfo.result = true;
      console.log('[PERSIST DEBUG] isTestEnvironment() = true (window.VITEST check)', debugInfo);
      return true;
    }
  }

  debugInfo.result = false;
  console.warn('[PERSIST DEBUG] isTestEnvironment() = false - persist middleware will be ENABLED!', debugInfo);
  return false;
};

/**
 * Helper to conditionally wrap a store creator with persist middleware
 *
 * Usage in stores:
 * ```typescript
 * export const useMyStore = create<MyState>()(
 *   isTestEnvironment()
 *     ? (set) => ({ ...state, ...actions })
 *     : persist(
 *         (set) => ({ ...state, ...actions }),
 *         { name: 'my-store' }
 *       )
 * );
 * ```
 *
 * This pattern prevents persist middleware from running in test environments,
 * which eliminates storage event listeners that cause memory leaks.
 */

