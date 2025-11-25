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
import { render, waitFor } from '@testing-library/react';
import { destroyDatabase } from '../db';
import { mockUseResultsManagement, mockLocation } from './App.test.setup';
let App: (typeof import('../App'))['default'];

beforeEach(async () => {
  ({ default: App } = await import('../App'));
});

// Import mocks setup
// (App.test.setup exports the mocks we import above; no side-effect import needed)

describe('App Component - Integration', () => {
  beforeEach(() => {
    mockUseResultsManagement.mockReset();
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
    // Ensure initializeApp resolves immediately to avoid Suspense-related sync errors
    // (App.test.setup provides a mock; here we reinforce its resolved value)
    import('../utils/initializeApp').then(mod => {
      if (vi.isMockFunction(mod.initializeApp)) {
        vi.mocked(mod.initializeApp).mockResolvedValue(undefined);
      }
    });
  });

  afterEach(async () => {
    // Don't call vi.restoreAllMocks() - it interferes with our mock resets
    const { initializeApp } = await import('../utils/initializeApp');
    vi.mocked(initializeApp).mockClear();
    vi.mocked(initializeApp).mockResolvedValue(undefined);
    // Restore console spies
    if (console.warn && typeof (console.warn as any).mockRestore === 'function') {
      (console.warn as any).mockRestore();
    }


    vi.clearAllTimers();
  });

  afterAll(async () => {
    try {
      await destroyDatabase();
    } catch (error) {
      console.warn('Final database cleanup warning:', error);
    }
  });

  it('should import and render without errors', async () => {
    // Simply render and verify the component mounts without throwing
    const { container, debug } = render(<App />);

    // Wait a bit for any async initialization
    await waitFor(() => {
      expect(container.firstChild).toBeTruthy();
    }, { timeout: 2000 });

    console.log('Container innerHTML:', container.innerHTML);
    debug();
  });
});
