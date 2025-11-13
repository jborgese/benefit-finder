/**
 * App Component URL-based State Tests
 *
 * Tests for URL parameter handling and state initialization
 */

import { describe, it, expect, vi, beforeEach, afterEach, afterAll, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { destroyDatabase } from '../db';

// CRITICAL: Reset window.location BEFORE importing setup to prevent hangs
// This ensures clean state even if previous tests left window.location in a bad state
try {
  if (typeof window !== 'undefined' && window.location) {
    // Try to reset window.location to a safe state
    const safeLocation = {
      pathname: '/',
      hostname: 'localhost',
      search: '',
      hash: '',
      href: 'http://localhost/',
    };
    Object.defineProperty(window, 'location', {
      value: safeLocation,
      writable: true,
      configurable: true,
    });
  }
} catch {
  // If we can't reset it, the setup file will handle it
}

import { mockUseResultsManagement, mockLocation } from './App.test.setup';

// Import mocks setup AFTER ensuring window.location is safe
import './App.test.setup';

describe('App Component - URL-based State Initialization', () => {
  let App: (typeof import('../App'))['default'];
  let appImportPromise: Promise<typeof import('../App')> | null = null;

  beforeAll(async () => {
    // Ensure clean state before any tests run
    // Reset all global state that might interfere
    mockLocation.pathname = '/';
    mockLocation.hostname = 'localhost';

    // Restore URLSearchParams if it was modified
    if (global.URLSearchParams !== URLSearchParams) {
      global.URLSearchParams = URLSearchParams;
    }

    // Ensure window.location is properly mocked
    if (!window.location || window.location !== mockLocation) {
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });
    }

    // Pre-import App in beforeAll to avoid hanging in beforeEach
    // Cache the import promise to avoid multiple imports
    if (!appImportPromise) {
      appImportPromise = import('../App');
    }
    ({ default: App } = await appImportPromise);
  }, 10000); // 10 second timeout for beforeAll

  beforeEach(async () => {
    // Set up mocks for each test
    vi.clearAllMocks();
    mockUseResultsManagement.mockImplementation(() => ({
      saveResults: vi.fn().mockResolvedValue(undefined),
      loadAllResults: vi.fn().mockResolvedValue([]),
      loadResult: vi.fn().mockResolvedValue(null),
      deleteResult: vi.fn().mockResolvedValue(undefined),
      updateResult: vi.fn().mockResolvedValue(undefined),
      savedResults: [],
      isLoading: false,
      error: null,
    }));
    localStorage.clear();
    // Reset mockLocation before each test
    mockLocation.pathname = '/';
    mockLocation.hostname = 'localhost';
    // Ensure URLSearchParams is restored
    if (global.URLSearchParams !== URLSearchParams) {
      global.URLSearchParams = URLSearchParams;
    }
    vi.spyOn(console, 'warn').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    // Reset mockLocation to defaults
    mockLocation.pathname = '/';
    mockLocation.hostname = 'localhost';
    // Ensure URLSearchParams is restored
    if (global.URLSearchParams !== URLSearchParams) {
      global.URLSearchParams = URLSearchParams;
    }
  });

  afterAll(async () => {
    try {
      await destroyDatabase();
    } catch (error) {
      console.warn('Final database cleanup warning:', error);
    }
    // Reset all mocks and clear any accumulated state
    vi.clearAllMocks();
    vi.restoreAllMocks();
    // Reset window.location to safe state
    try {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/',
          hostname: 'localhost',
          search: '',
          hash: '',
          href: 'http://localhost/',
        },
        writable: true,
        configurable: true,
      });
    } catch {
      // Ignore errors during cleanup
    }
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 8 - URL-based state tests
  it('should handle URL with test parameter for E2E testing', () => {
    mockLocation.pathname = '/results';
    mockLocation.hostname = 'localhost';

    // Mock URLSearchParams
    const mockSearchParams = new Map([['test', 'true']]);
    const mockURLSearchParams = {
      get: (key: string) => mockSearchParams.get(key),
      has: (key: string) => mockSearchParams.has(key),
    };

    // Mock navigator for HeadlessChrome detection
    const originalUserAgent = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      value: 'HeadlessChrome',
      writable: true,
      configurable: true,
    });

    // Mock URLSearchParams constructor
    const originalURLSearchParams = global.URLSearchParams;
    global.URLSearchParams = vi.fn().mockImplementation(() => mockURLSearchParams) as typeof URLSearchParams;

    render(<App />);

    expect(mockLocation.pathname).toBe('/results');
    expect(mockLocation.hostname).toBe('localhost');

    // Restore
    global.URLSearchParams = originalURLSearchParams;
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
      configurable: true,
    });
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 8 - URL-based state tests
  it('should handle URL with playwright test parameter', () => {
    mockLocation.pathname = '/results';
    mockLocation.hostname = 'localhost';

    // Mock URLSearchParams with playwright parameter
    const mockSearchParams = new Map([['test', 'true'], ['playwright', 'true']]);
    const mockURLSearchParams = {
      get: (key: string) => mockSearchParams.get(key),
      has: (key: string) => mockSearchParams.has(key),
    };

    // Mock URLSearchParams constructor
    const originalURLSearchParams = global.URLSearchParams;
    global.URLSearchParams = vi.fn().mockImplementation(() => mockURLSearchParams) as typeof URLSearchParams;

    render(<App />);

    expect(mockLocation.pathname).toBe('/results');
    expect(mockLocation.hostname).toBe('localhost');

    // Restore
    global.URLSearchParams = originalURLSearchParams;
  });

  it.skip('should handle non-browser environment gracefully', () => {
    // SKIPPED: Setting window to undefined breaks React DOM which requires window to exist
    // This test cannot work in a jsdom environment where React DOM needs window
    // Mock window as undefined to simulate non-browser environment
    const originalWindow = global.window;
    // @ts-expect-error - simulating non-browser environment
    global.window = undefined;

    // Should not throw error
    expect(() => render(<App />)).not.toThrow();

    // Restore
    global.window = originalWindow;
  });

  it('should handle window.location access errors', () => {
    // Save original location
    const originalLocation = window.location;

    // Mock window.location to throw error
    Object.defineProperty(window, 'location', {
      value: {
        get pathname() {
          throw new Error('Location access denied');
        },
        get hostname() {
          return 'localhost';
        },
      },
      writable: true,
      configurable: true,
    });

    // Should not throw error and should render successfully
    expect(() => render(<App />)).not.toThrow();

    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });
});

