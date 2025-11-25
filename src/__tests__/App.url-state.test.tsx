/**
 * App Component URL-based State Tests
 *
 * Tests for URL parameter handling and state initialization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import App from '../App';

// Mock the test mode hook to prevent it from running async operations
vi.mock('../App/hooks/useTestMode', () => ({
  useTestMode: () => {
    // Do nothing - prevents the hook from creating sample results
  },
}));

// Mock the results management hook to avoid database operations
vi.mock('../components/results/useResultsManagement', () => ({
  useResultsManagement: () => ({
    saveResults: vi.fn(() => Promise.resolve('test-id')),
    loadAllResults: vi.fn(() => Promise.resolve([])),
    loadResult: vi.fn(() => Promise.resolve(null)),
    isLoading: false,
    error: null,
    savedResults: [],
  }),
}));

describe('App Component - URL-based State Initialization', () => {
  // Store original values to restore after tests
  let originalLocation: Location;
  let originalURLSearchParams: typeof URLSearchParams;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    // Store originals
    originalLocation = window.location;
    originalURLSearchParams = global.URLSearchParams;
    originalMatchMedia = window.matchMedia;

    // Mock matchMedia for ThemeContext
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Clear any previous state
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup rendered components
    cleanup();

    // Restore originals
    try {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    } catch {
      // Ignore restoration errors
    }

    try {
      Object.defineProperty(window, 'matchMedia', {
        value: originalMatchMedia,
        writable: true,
        configurable: true,
      });
    } catch {
      // Ignore restoration errors
    }

    global.URLSearchParams = originalURLSearchParams;
    vi.restoreAllMocks();
  });

  it('should handle URL with test parameter for E2E testing', async () => {
    // Mock window.location
    const mockLocation = {
      pathname: '/results',
      hostname: 'localhost',
      search: '?test=true',
      hash: '',
      href: 'http://localhost/results?test=true',
    };

    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });

    // Mock URLSearchParams
    const mockSearchParams = new Map([['test', 'true']]);
    global.URLSearchParams = vi.fn().mockImplementation(() => ({
      get: (key: string) => mockSearchParams.get(key) ?? null,
      has: (key: string) => mockSearchParams.has(key),
      forEach: vi.fn(),
      append: vi.fn(),
      delete: vi.fn(),
      entries: vi.fn(),
      keys: vi.fn(),
      values: vi.fn(),
      set: vi.fn(),
      sort: vi.fn(),
      toString: () => 'test=true',
    })) as unknown as typeof URLSearchParams;

    // Render app - should not throw
    expect(() => render(<App />)).not.toThrow();

    // Wait for async operations to complete
    await waitFor(() => {
      expect(window.location.pathname).toBe('/results');
    }, { timeout: 1000 });
  });

  it('should handle URL with playwright test parameter', async () => {
    // Mock window.location
    const mockLocation = {
      pathname: '/results',
      hostname: 'localhost',
      search: '?test=true&playwright=true',
      hash: '',
      href: 'http://localhost/results?test=true&playwright=true',
    };

    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });

    // Mock URLSearchParams with both parameters
    const mockSearchParams = new Map([
      ['test', 'true'],
      ['playwright', 'true'],
    ]);
    global.URLSearchParams = vi.fn().mockImplementation(() => ({
      get: (key: string) => mockSearchParams.get(key) ?? null,
      has: (key: string) => mockSearchParams.has(key),
      forEach: vi.fn(),
      append: vi.fn(),
      delete: vi.fn(),
      entries: vi.fn(),
      keys: vi.fn(),
      values: vi.fn(),
      set: vi.fn(),
      sort: vi.fn(),
      toString: () => 'test=true&playwright=true',
    })) as unknown as typeof URLSearchParams;

    // Render app - should not throw
    expect(() => render(<App />)).not.toThrow();

    // Wait for async operations to complete
    await waitFor(() => {
      expect(window.location.pathname).toBe('/results');
    }, { timeout: 1000 });
  });

  it('should handle window.location access errors gracefully', () => {
    // Mock window.location to throw error on pathname access
    const mockLocation = {
      get pathname() {
        throw new Error('Location access denied');
      },
      hostname: 'localhost',
      search: '',
      hash: '',
      href: 'http://localhost/',
    };

    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });

    // Should not throw error and should render successfully
    expect(() => render(<App />)).not.toThrow();

    // Should render basic navigation structure
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('should render normally without any URL parameters', () => {
    // Mock window.location with clean state
    const mockLocation = {
      pathname: '/',
      hostname: 'localhost',
      search: '',
      hash: '',
      href: 'http://localhost/',
    };

    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });

    // Mock URLSearchParams with no parameters
    global.URLSearchParams = vi.fn().mockImplementation(() => ({
      get: () => null,
      has: () => false,
      forEach: vi.fn(),
      append: vi.fn(),
      delete: vi.fn(),
      entries: vi.fn(),
      keys: vi.fn(),
      values: vi.fn(),
      set: vi.fn(),
      sort: vi.fn(),
      toString: () => '',
    })) as unknown as typeof URLSearchParams;

    // Render app - should work normally
    render(<App />);

    // Should render navigation structure
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });
});
