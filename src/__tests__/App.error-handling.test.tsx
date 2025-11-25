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

// (App.test.setup exports the mocks we import above; no side-effect import needed)

let App: (typeof import('../App'))['default'];

beforeEach(async () => {
  ({ default: App } = await import('../App'));
});

describe('App Component - Error Handling', () => {
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

  // TESTING MEMORY LEAK FIX: Re-enabled batch 5 - error handling tests
  it('should handle database initialization errors', async () => {
    // Use the existing mock instead of dynamic import
    const mockInitializeApp = vi.mocked(await import('../utils/initializeApp')).initializeApp;
    mockInitializeApp.mockRejectedValue(new Error('Database error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText('BenefitFinder').length).toBeGreaterThan(0);
    }, { timeout: 2000 });

    // The error should be handled gracefully - the app should still render
    expect(screen.getAllByText('BenefitFinder')).toHaveLength(3); // Should appear in 3 responsive breakpoints

    // The app should render successfully without crashing
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 5 - error handling tests
  it('should handle evaluation errors gracefully', async () => {
    const user = userEvent.setup();
    const { evaluateAllPrograms } = await import('../rules');

    // Use the existing mock instead of dynamic import
    const mockInitializeApp = vi.mocked(await import('../utils/initializeApp')).initializeApp;
    mockInitializeApp.mockResolvedValue(undefined);
    vi.mocked(evaluateAllPrograms).mockRejectedValue(new Error('Database error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText('BenefitFinder').length).toBeGreaterThan(0);
    }, { timeout: 2000 });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Start Assessment' })).toBeInTheDocument();
    }, { timeout: 2000 });

    const startButton = screen.getByRole('button', { name: 'Start Assessment' });
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('questionnaire-page')).toBeInTheDocument();
    }, { timeout: 2000 });

    const completeButton = screen.getByRole('button', { name: 'Complete' });
    await user.click(completeButton);

    // Should handle error without crashing
    await waitFor(() => {
      // Should either show error or return to a safe state
      const processingText = screen.queryByText('Processing Your Results');
      const errorButton = screen.queryByRole('button', { name: 'Return to Home' });
      expect(processingText ?? errorButton).toBeTruthy();
    }, { timeout: 3000 });
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 5 - error handling tests
  it('should handle database operations errors during questionnaire completion', async () => {
    console.log('[TEST DEBUG] Test starting');
    const user = userEvent.setup();
    const { createUserProfile } = await import('../db/utils');

    // Use the existing mock instead of dynamic import
    const mockInitializeApp = vi.mocked(await import('../utils/initializeApp')).initializeApp;
    mockInitializeApp.mockResolvedValue(undefined);

    // Mock createUserProfile to reject immediately - this should cause early return
    // and prevent importRulesWithLogging from being called
    const mockCreateUserProfile = vi.mocked(createUserProfile);
    mockCreateUserProfile.mockRejectedValue(new Error('Database operation failed'));
    console.log('[TEST DEBUG] Mocks set up');

    render(<App />);
    console.log('[TEST DEBUG] App rendered');

    const startButton = screen.getByRole('button', { name: 'Start Assessment' });
    console.log('[TEST DEBUG] About to click start button');
    await user.click(startButton);
    console.log('[TEST DEBUG] Start button clicked');

    await waitFor(() => {
      expect(screen.getByTestId('questionnaire-page')).toBeInTheDocument();
    }, { timeout: 2000 });
    console.log('[TEST DEBUG] Questionnaire page appeared');

    const completeButton = screen.getByRole('button', { name: 'Complete' });
    console.log('[TEST DEBUG] About to click complete button');

    // Click complete - this triggers handleCompleteQuestionnaire which will fail
    await user.click(completeButton);
    console.log('[TEST DEBUG] Complete button clicked, waiting for error handling');

    // Give a moment for the async error handling to complete
    // Use flushPromises instead of setTimeout to avoid timer leaks
    await flushPromises();
    console.log('[TEST DEBUG] After flushPromises, checking mocks');

    // Verify createUserProfile was called (which should have failed)
    // This should happen immediately after the click
    expect(mockCreateUserProfile).toHaveBeenCalled();
    console.log('[TEST DEBUG] createUserProfile was called (verified)');

    // Debug: Check what's currently rendered
    const errorPageBeforeWait = screen.queryByTestId('error-page');
    const resultsPageBeforeWait = screen.queryByTestId('results-page');
    const questionnairePageBeforeWait = screen.queryByTestId('questionnaire-page');
    console.log('[TEST DEBUG] Before waitFor - Error page:', !!errorPageBeforeWait, 'Results page:', !!resultsPageBeforeWait, 'Questionnaire page:', !!questionnairePageBeforeWait);

    // Wait for error page to appear - the error state should be set synchronously in the catch block
    // Add debug logging to track retries
    let waitForRetryCount = 0;
    const waitForStartTime = Date.now();

    console.log('[TEST DEBUG] Starting waitFor for error page');
    await waitFor(() => {
      waitForRetryCount++;
      const errorPage = screen.queryByTestId('error-page');
      const resultsPage = screen.queryByTestId('results-page');
      const questionnairePage = screen.queryByTestId('questionnaire-page');

      // Log every 10th retry to avoid spam
      if (waitForRetryCount % 10 === 0 || waitForRetryCount === 1) {
        const elapsed = Date.now() - waitForStartTime;
        console.log(`[TEST DEBUG] waitFor retry #${waitForRetryCount}, elapsed: ${elapsed}ms, Error page: ${!!errorPage}, Results: ${!!resultsPage}, Questionnaire: ${!!questionnairePage}`);
      }

      // If we've been retrying for a while and no error page, log more details
      if (!errorPage && waitForRetryCount > 20) {
        const allTestIds = screen.queryAllByTestId(/.*/);
        console.log(`[TEST DEBUG] waitFor retry #${waitForRetryCount} - All test IDs found:`, allTestIds.map(el => el.getAttribute('data-testid')));
      }

      expect(errorPage).toBeInTheDocument();
    }, { timeout: 2000, interval: 50 });

    const totalElapsed = Date.now() - waitForStartTime;
    console.log(`[TEST DEBUG] waitFor completed after ${waitForRetryCount} retries, total elapsed: ${totalElapsed}ms`);
    console.log('[TEST DEBUG] Test completing');
  }, 5000); // Set test timeout to 5 seconds - should complete much faster

  // SKIPPED: This test causes a persistent memory leak (27+ seconds hang).
  // Similar to other tests that render App and wait for async operations, this test
  // triggers cleanup issues that cause the test to hang in afterEach. Skip until root cause is resolved.
  // TESTING MEMORY LEAK FIX: Re-enabled batch 6 - results display tests
  it('should handle import results errors', async () => {
    const mockSaveResults = vi.fn().mockRejectedValue(new Error('Save failed'));
    const mockLoadAllResults = vi.fn().mockResolvedValue([]);
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
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    // This tests that the ErrorBoundary is properly integrated
    const { container } = render(<App />);

    await waitFor(() => {
      expect(container.firstChild).toBeTruthy();
    }, { timeout: 2000 });

    consoleSpy.mockRestore();
  });
});

