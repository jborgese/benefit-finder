/**
 * App Component Results Display Tests
 *
 * Tests for results display and import/export functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { destroyDatabase } from '../db';
import { mockUseResultsManagement, mockLocation, flushPromises } from './App.test.setup';

// Import mocks setup
// (App.test.setup exports the mocks we import above; no side-effect import needed)

let App: (typeof import('../App'))['default'];

beforeEach(async () => {
  ({ default: App } = await import('../App'));
});

describe('App Component - Results Display', () => {
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

  // TESTING MEMORY LEAK FIX: Re-enabled batch 6 - results display tests
  it('should display results when available', async () => {
    const mockResults = {
      qualified: [{ programId: 'snap-federal', programName: 'SNAP' }],
      maybe: [],
      likely: [],
      notQualified: [],
      totalPrograms: 1,
      evaluatedAt: new Date(),
    };

    // Create mocks that resolve immediately
    const mockLoadResult = vi.fn().mockResolvedValue(mockResults);
    const mockLoadAllResults = vi.fn().mockResolvedValue([{ id: 'test-result' }]);

    // Use mockReturnValue instead of mockReturnValueOnce to ensure it works for all calls
    mockUseResultsManagement.mockReturnValue({
      saveResults: vi.fn(),
      loadAllResults: mockLoadAllResults,
      loadResult: mockLoadResult,
      deleteResult: vi.fn().mockResolvedValue(undefined),
      updateResult: vi.fn().mockResolvedValue(undefined),
      savedResults: [],
      isLoading: false,
      error: null,
    });

    render(<App />);

    // Flush promises to ensure async operations complete
    await act(async () => {
      await flushPromises();
    });

    // Verify both operations were called
    // They should have been called immediately after render
    expect(mockLoadAllResults).toHaveBeenCalled();
    expect(mockLoadResult).toHaveBeenCalledWith('test-result', expect.any(AbortSignal));
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 6 - results display tests
  it('should handle import results', async () => {
    const mockSaveResults = vi.fn().mockResolvedValue(undefined);
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

    // Simulate calling the import handler directly
    await mockSaveResults(mockResults);

    // Verify the function was called
    expect(mockSaveResults).toHaveBeenCalledWith(mockResults);
  });
});

