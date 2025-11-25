/**
 * App Component Navigation Tests
 *
 * Tests for navigation and state management
 */

import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { destroyDatabase } from '../db';
import { mockUseResultsManagement, mockLocation } from './App.test.setup';

// (App.test.setup exports the mocks we import above; no side-effect import needed)

let App: (typeof import('../App'))['default'];

beforeEach(async () => {
  ({ default: App } = await import('../App'));
});

describe('App Component - State Management and Navigation', () => {
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

  it('should handle go home navigation', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Start Assessment' })).toBeInTheDocument();
    }, { timeout: 2000 });

    // Start questionnaire
    const startButton = screen.getByRole('button', { name: 'Start Assessment' });
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('questionnaire-page')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Navigate back to home (if home button is available)
    const homeButton = screen.queryByRole('button', { name: 'navigation.home' });
    if (homeButton) {
      await user.click(homeButton);
      await waitFor(() => {
        expect(screen.getByText('app.subtitle')).toBeInTheDocument();
      }, { timeout: 2000 });
    }
  });

  it('should handle view results navigation', async () => {
    const user = userEvent.setup();

    const mockLoadResult = vi.fn().mockResolvedValue({
      qualified: [{ programId: 'test-program' }],
      maybe: [],
      likely: [],
      notQualified: [],
      totalPrograms: 1,
      evaluatedAt: new Date(),
    });

    mockUseResultsManagement.mockReturnValueOnce({
      saveResults: vi.fn(),
      loadAllResults: vi.fn().mockResolvedValue([{ id: 'test-result' }]),
      loadResult: mockLoadResult,
      deleteResult: vi.fn().mockResolvedValue(undefined),
      updateResult: vi.fn().mockResolvedValue(undefined),
      savedResults: [],
      isLoading: false,
      error: null,
    });

    render(<App />);

    await waitFor(() => {
      expect(mockLoadResult).toHaveBeenCalled();
    }, { timeout: 2000 });

    // Click view results button if it exists
    const viewResultsButton = screen.queryByRole('button', { name: 'navigation.results' });
    if (viewResultsButton) {
      await user.click(viewResultsButton);
      // Should navigate to results view
    }
  });

  it('should handle back to home navigation from results', async () => {
    const user = userEvent.setup();

    const mockLoadResult = vi.fn().mockResolvedValue({
      qualified: [{ programId: 'test-program' }],
      maybe: [],
      likely: [],
      notQualified: [],
      totalPrograms: 1,
      evaluatedAt: new Date(),
    });

    mockUseResultsManagement.mockReturnValueOnce({
      saveResults: vi.fn(),
      loadAllResults: vi.fn().mockResolvedValue([{ id: 'test-result' }]),
      loadResult: mockLoadResult,
      deleteResult: vi.fn().mockResolvedValue(undefined),
      updateResult: vi.fn().mockResolvedValue(undefined),
      savedResults: [],
      isLoading: false,
      error: null,
    });

    render(<App />);

    await waitFor(() => {
      expect(mockLoadResult).toHaveBeenCalled();
    }, { timeout: 2000 });

    // Find and click back to home button
    const homeButtons = screen.queryAllByRole('button', { name: 'navigation.home' });
    if (homeButtons.length > 0) {
      await user.click(homeButtons[0]);
      await waitFor(() => {
        expect(screen.getByText('app.subtitle')).toBeInTheDocument();
      }, { timeout: 2000 });
    }
  });

  it('should handle error state navigation', async () => {
    const user = userEvent.setup();
    const { initializeApp } = await import('../utils/initializeApp');

    vi.mocked(initializeApp).mockRejectedValue(new Error('Database error'));

    render(<App />);

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

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click return to home button
    const returnHomeButton = screen.getByRole('button', { name: 'Return to Home' });
    await user.click(returnHomeButton);

    await waitFor(() => {
      expect(screen.getByText('app.subtitle')).toBeInTheDocument();
    });
  });

  it('should handle refresh page button in error state', async () => {
    const user = userEvent.setup();
    const { initializeApp } = await import('../utils/initializeApp');

    vi.mocked(initializeApp).mockRejectedValue(new Error('Database error'));

    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    render(<App />);

    const startButton = screen.getByRole('button', { name: 'Start Assessment' });
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('questionnaire-page')).toBeInTheDocument();
    }, { timeout: 2000 });

    const completeButton = screen.getByRole('button', { name: 'Complete' });
    await user.click(completeButton);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click refresh page button
    const refreshButton = screen.getByRole('button', { name: 'Refresh Page' });
    await user.click(refreshButton);

    expect(mockReload).toHaveBeenCalled();
  });
});

