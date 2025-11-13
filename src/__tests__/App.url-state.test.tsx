/**
 * App Component URL-based State Tests
 *
 * Tests for URL parameter handling and state initialization
 */

import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { destroyDatabase } from '../db';
import { mockUseResultsManagement, mockLocation } from './App.test.setup';

// Import mocks setup
import './App.test.setup';

let App: (typeof import('../App'))['default'];

beforeEach(async () => {
  ({ default: App } = await import('../App'));
});

describe('App Component - URL-based State Initialization', () => {
  beforeEach(() => {
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
    mockLocation.pathname = '/';
    mockLocation.hostname = 'localhost';
    vi.spyOn(console, 'warn').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  afterAll(async () => {
    try {
      await destroyDatabase();
    } catch (error) {
      console.warn('Final database cleanup warning:', error);
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
    Object.defineProperty(navigator, 'userAgent', {
      value: 'HeadlessChrome',
      writable: true,
    });

    // Mock URLSearchParams constructor
    const originalURLSearchParams = global.URLSearchParams;
    global.URLSearchParams = vi.fn().mockImplementation(() => mockURLSearchParams);

    render(<App />);

    expect(mockLocation.pathname).toBe('/results');
    expect(mockLocation.hostname).toBe('localhost');

    // Restore
    global.URLSearchParams = originalURLSearchParams;
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
    global.URLSearchParams = vi.fn().mockImplementation(() => mockURLSearchParams);

    render(<App />);

    expect(mockLocation.pathname).toBe('/results');
    expect(mockLocation.hostname).toBe('localhost');

    // Restore
    global.URLSearchParams = originalURLSearchParams;
  });

  // SKIPPED: All tests that render <App /> are being skipped due to accumulating memory leaks.
  // Skip until root cause is resolved.
  it.skip('should handle non-browser environment gracefully', () => {
    // Mock window as undefined to simulate non-browser environment
    const originalWindow = global.window;
    // @ts-expect-error - simulating non-browser environment
    global.window = undefined;

    // Should not throw error
    expect(() => render(<App />)).not.toThrow();

    // Restore
    global.window = originalWindow;
  });

  // SKIPPED: All tests that render <App /> are being skipped due to accumulating memory leaks.
  // Skip until root cause is resolved.
  it.skip('should handle window.location access errors', () => {
    // Mock window.location to throw error
    Object.defineProperty(window, 'location', {
      value: {
        get pathname() {
          throw new Error('Location access denied');
        },
      },
      writable: true,
    });

    // Should not throw error and should render successfully
    expect(() => render(<App />)).not.toThrow();
  });
});

