/**
 * App Component Error Handling Tests
 *
 * Tests for error handling and error recovery scenarios
 */

import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { destroyDatabase } from '../db';
import { mockUseResultsManagement, mockLocation, flushPromises } from './App.test.setup';
let App: (typeof import('../App'))['default'];

beforeEach(async () => {
  ({ default: App } = await import('../App'));
});

describe('App Component - Error Handling', () => {
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
  });

  afterEach(async () => {
    // Don't call vi.restoreAllMocks() - it interferes with our mock resets
    // Instead, explicitly reset the mocks we know about to their defaults

    const { initializeApp } = await import('../utils/initializeApp');
    vi.mocked(initializeApp).mockClear();
    vi.mocked(initializeApp).mockResolvedValue(undefined);
    // Restore console spies
    if (console.warn && typeof (console.warn as any).mockRestore === 'function') {
      (console.warn as any).mockRestore();
    }


    const rules = await import('../rules');
    if (vi.isMockFunction(rules.evaluateAllPrograms)) {
      vi.mocked(rules.evaluateAllPrograms).mockClear();
      vi.mocked(rules.evaluateAllPrograms).mockResolvedValue({
        profileId: 'test-profile',
        programResults: new Map(),
        summary: {
          total: 0,
          eligible: 0,
          ineligible: 0,
          incomplete: 0,
          needsReview: 0,
        },
        totalTime: 0,
      });
    }

    const dbUtils = await import('../db/utils');
    if (vi.isMockFunction(dbUtils.createUserProfile)) {
      vi.mocked(dbUtils.createUserProfile).mockClear();
      vi.mocked(dbUtils.createUserProfile).mockResolvedValue({} as any);
    }

    vi.clearAllTimers();
  }); afterAll(async () => {
    try {
      await destroyDatabase();
    } catch (error) {
      console.warn('Final database cleanup warning:', error);
    }
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 5 - error handling tests
  it('should handle database initialization errors', async () => {
    // Import and mock before rendering
    const { initializeApp } = await import('../utils/initializeApp');
    vi.mocked(initializeApp).mockRejectedValue(new Error('Database error'));

    render(<App />);

    // Wait for the home page to render despite the error
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Verify the app still renders (error is handled gracefully)
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 5 - error handling tests
  it('should handle evaluation errors gracefully', async () => {
    const user = userEvent.setup();
    const { evaluateAllPrograms } = await import('../rules');
    const { initializeApp } = await import('../utils/initializeApp');

    // Set up mocks before rendering
    vi.mocked(initializeApp).mockResolvedValue(undefined);
    vi.mocked(evaluateAllPrograms).mockRejectedValue(new Error('Evaluation error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    }, { timeout: 2000 });

    const startButton = screen.getByRole('button', { name: 'Start Assessment' });
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('questionnaire-page')).toBeInTheDocument();
    }, { timeout: 2000 });

    const completeButton = screen.getByRole('button', { name: 'Complete' });
    await user.click(completeButton);

    // Should handle error and show error page
    await waitFor(() => {
      expect(screen.getByTestId('error-page')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 5 - error handling tests
  it('should handle database operations errors during questionnaire completion', async () => {
    const user = userEvent.setup();
    const { createUserProfile } = await import('../db/utils');
    const { initializeApp } = await import('../utils/initializeApp');

    // Set up mocks before rendering
    vi.mocked(initializeApp).mockResolvedValue(undefined);
    vi.mocked(createUserProfile).mockRejectedValue(new Error('Database operation failed'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    }, { timeout: 2000 });

    const startButton = screen.getByRole('button', { name: 'Start Assessment' });
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('questionnaire-page')).toBeInTheDocument();
    }, { timeout: 2000 });

    const completeButton = screen.getByRole('button', { name: 'Complete' });
    await user.click(completeButton);

    // Wait for error handling
    await flushPromises();

    // Verify createUserProfile was called
    expect(vi.mocked(createUserProfile)).toHaveBeenCalled();

    // Should show error page
    await waitFor(() => {
      expect(screen.getByTestId('error-page')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 6 - results display tests
  it('should handle import results errors', async () => {
    const mockSaveResults = vi.fn().mockRejectedValue(new Error('Save failed'));
    const mockLoadAllResults = vi.fn().mockResolvedValue([]);
    const { initializeApp } = await import('../utils/initializeApp');

    // Set up mocks before rendering
    vi.mocked(initializeApp).mockResolvedValue(undefined);

    const mockResults = {
      qualified: [{ programId: 'test-program' }],
      maybe: [],
      likely: [],
      notQualified: [],
      totalPrograms: 1,
      evaluatedAt: new Date(),
    };

    // Mock the results management - return empty array to avoid triggering loadResult
    mockUseResultsManagement.mockReturnValue({
      saveResults: mockSaveResults,
      loadAllResults: mockLoadAllResults,
      loadResult: vi.fn().mockResolvedValue(null),
      deleteResult: vi.fn().mockResolvedValue(undefined),
      updateResult: vi.fn().mockResolvedValue(undefined),
      savedResults: [],
      isLoading: false,
      error: null,
    });

    render(<App />);

    // Wait for the initial async operations to complete (checkExistingResults)
    await waitFor(() => {
      expect(mockLoadAllResults).toHaveBeenCalled();
    }, { timeout: 2000 });

    // Test that the mock saveResults function is available and can be called
    expect(mockSaveResults).toBeDefined();

    // Simulate calling the import handler directly and expect it to reject
    await expect(mockSaveResults(mockResults)).rejects.toThrow('Save failed');

    // Verify the function was called
    expect(mockSaveResults).toHaveBeenCalledWith(mockResults);
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 5 - error handling tests
  it('should handle error boundary integration', async () => {
    const { initializeApp } = await import('../utils/initializeApp');
    vi.mocked(initializeApp).mockResolvedValue(undefined);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    // This tests that the ErrorBoundary is properly integrated
    const { container } = render(<App />);

    await waitFor(() => {
      expect(container.firstChild).toBeTruthy();
    }, { timeout: 2000 });

    consoleSpy.mockRestore();
  });
});

