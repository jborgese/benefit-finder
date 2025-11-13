/**
 * App Component Integration Test
 *
 * Simple integration test to verify the App component can be imported and rendered.
 * Detailed tests are split into focused test files:
 * - App.rendering.test.tsx - Basic rendering tests
 * - App.state-transitions.test.tsx - State transition tests
 * - App.onboarding.test.tsx - Onboarding modal tests
 * - App.error-handling.test.tsx - Error handling tests
 * - App.results.test.tsx - Results display tests
 * - App.navigation.test.tsx - Navigation tests
 * - App.helpers.test.tsx - Helper function tests
 * - App.url-state.test.tsx - URL-based state tests
 * - App.accessibility.test.tsx - Accessibility tests
 */

import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { render } from '@testing-library/react';
import { destroyDatabase } from '../db';
import { mockUseResultsManagement, mockLocation } from './App.test.setup';

// Import mocks setup
import './App.test.setup';

let App: (typeof import('../App'))['default'];

beforeEach(async () => {
  ({ default: App } = await import('../App'));
});

describe('App Component - Integration', () => {
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

  it('should import and render without errors', () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
