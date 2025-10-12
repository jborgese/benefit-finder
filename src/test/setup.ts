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

// Cleanup after each test
afterEach(() => {
  cleanup();
});

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

  // Mock crypto.getRandomValues (for encryption tests)
  // Use type assertion to handle environments where crypto might not be fully available
  const globalWithCrypto = global as typeof global & {
    crypto: Crypto & { getRandomValues?: <T extends ArrayBufferView | null>(array: T) => T };
  };

  if (typeof globalWithCrypto.crypto === 'undefined') {
    globalWithCrypto.crypto = {} as Crypto;
  }
  if (typeof globalWithCrypto.crypto.getRandomValues === 'undefined') {
    globalWithCrypto.crypto.getRandomValues = <T extends ArrayBufferView | null>(array: T): T => {
      if (array && 'length' in array && 'BYTES_PER_ELEMENT' in array) {
        const typedArray = array as unknown as Uint8Array;
        for (let i = 0; i < typedArray.length; i++) {
          // Safe: i is a controlled loop counter within array bounds
          // eslint-disable-next-line security/detect-object-injection
          typedArray[i] = Math.floor(Math.random() * 256);
        }
      }
      return array;
    };
  }

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

