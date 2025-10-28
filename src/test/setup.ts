/**
 * Vitest Setup File
 *
 * Global test configuration and setup.
 * This file runs before each test suite.
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { webcrypto } from 'crypto';
import { Buffer } from 'buffer';

// Cleanup after each test
afterEach(async () => {
  cleanup();

  // Clean up database instances to prevent memory leaks
  // Note: destroyDatabase is mocked in individual test files
  try {
    const { destroyDatabase } = await import('../db');
    await destroyDatabase();
  } catch (error) {
    // Ignore cleanup errors in tests - database might not be initialized or mocked
    if (import.meta.env.DEV) {
      console.warn('Database cleanup warning:', error);
    }
  }
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

