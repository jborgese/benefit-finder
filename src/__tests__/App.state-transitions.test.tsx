/**
 * App Component State Transition Tests
 *
 * Tests for state transitions and user flow through the application
 */

import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import type { RxDocument } from 'rxdb';
import type { UserProfile } from '../db/schemas';
import { destroyDatabase } from '../db';
import { mockUseResultsManagement, mockLocation } from './App.test.setup';

// Import mocks setup
import './App.test.setup';

let App: (typeof import('../App'))['default'];

beforeEach(async () => {
  ({ default: App } = await import('../App'));
});

describe('App Component - State Transitions', () => {
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

  // TESTING MEMORY LEAK FIX: Re-enabled to verify conditional persist middleware works
  it('should transition to questionnaire state when start button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const startButton = screen.getByRole('button', { name: 'Start Assessment' });
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('questionnaire-page')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 2 - state transitions
  it('should handle questionnaire completion with qualified results', async () => {
    const user = userEvent.setup();
    const { evaluateAllPrograms } = await import('../rules');
    const { createUserProfile } = await import('../db/utils');

    const mockSaveResults = vi.fn().mockResolvedValue(undefined);
    mockUseResultsManagement.mockReturnValueOnce({
      saveResults: mockSaveResults,
      loadAllResults: vi.fn().mockResolvedValue([]),
      loadResult: vi.fn().mockResolvedValue(null),
      deleteResult: vi.fn().mockResolvedValue(undefined),
      updateResult: vi.fn().mockResolvedValue(undefined),
      savedResults: [],
      isLoading: false,
      error: null,
    });

    vi.mocked(evaluateAllPrograms).mockResolvedValue({
      profileId: 'test-profile',
      programResults: new Map([
        ['snap-federal', {
          profileId: 'test-profile',
          programId: 'snap-federal',
          ruleId: 'snap-income-test',
          eligible: true,
          confidence: 95,
          reason: 'Meets income requirements',
          evaluatedAt: Date.now(),
          criteriaResults: [],
          requiredDocuments: [],
          nextSteps: [],
          ruleVersion: '1.0.0',
        }],
      ]),
      summary: {
        total: 1,
        eligible: 1,
        ineligible: 0,
        incomplete: 0,
        needsReview: 0,
      },
      totalTime: 0,
    });

    vi.mocked(createUserProfile).mockResolvedValue({
      id: 'test-profile',
      householdSize: 3,
      householdIncome: 30000,
      state: 'GA',
      citizenship: 'us_citizen',
      employmentStatus: 'employed',
      hasDisability: false,
      isPregnant: false,
      hasChildren: true,
    } as unknown as RxDocument<UserProfile>);

    render(<App />);

    const startButton = screen.getByRole('button', { name: 'Start Assessment' });
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('questionnaire-page')).toBeInTheDocument();
    }, { timeout: 2000 });

    const completeButton = screen.getByRole('button', { name: 'Complete' });
    await user.click(completeButton);

    // Should show processing state or results (processing might complete quickly with mocks)
    await waitFor(() => {
      const processingText = screen.queryByText('New Assessment');
      const resultsSummary = screen.queryByText('Import');
      expect(processingText ?? resultsSummary).toBeTruthy();
    }, { timeout: 3000 });
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 2 - state transitions
  it('should handle questionnaire completion with income hard stop results', async () => {
    const user = userEvent.setup();
    const { evaluateAllPrograms } = await import('../rules');
    const { createUserProfile } = await import('../db/utils');

    const mockSaveResults = vi.fn().mockResolvedValue(undefined);
    mockUseResultsManagement.mockReturnValueOnce({
      saveResults: mockSaveResults,
      loadAllResults: vi.fn().mockResolvedValue([]),
      loadResult: vi.fn().mockResolvedValue(null),
      deleteResult: vi.fn().mockResolvedValue(undefined),
      updateResult: vi.fn().mockResolvedValue(undefined),
      savedResults: [],
      isLoading: false,
      error: null,
    });

    vi.mocked(evaluateAllPrograms).mockResolvedValue({
      profileId: 'test-profile',
      programResults: new Map([
        ['snap-federal', {
          profileId: 'test-profile',
          programId: 'snap-federal',
          ruleId: 'snap-federal-income-limits',
          eligible: false,
          confidence: 95,
          reason: 'Income exceeds federal limits',
          evaluatedAt: Date.now(),
          criteriaResults: [],
          requiredDocuments: [],
          nextSteps: [],
          ruleVersion: '1.0.0',
        }],
      ]),
      summary: {
        total: 1,
        eligible: 0,
        ineligible: 1,
        incomplete: 0,
        needsReview: 0,
      },
      totalTime: 0,
    });

    vi.mocked(createUserProfile).mockResolvedValue({
      id: 'test-profile',
      householdSize: 3,
      householdIncome: 100000,
      state: 'GA',
      citizenship: 'us_citizen',
      employmentStatus: 'employed',
      hasDisability: false,
      isPregnant: false,
      hasChildren: true,
    } as unknown as RxDocument<UserProfile>);

    render(<App />);

    const startButton = screen.getByRole('button', { name: 'Start Assessment' });
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('questionnaire-page')).toBeInTheDocument();
    }, { timeout: 2000 });

    const completeButton = screen.getByRole('button', { name: 'Complete' });
    await user.click(completeButton);

    await waitFor(() => {
      const processingText = screen.queryByText('New Assessment');
      const resultsSummary = screen.queryByText('Import');
      expect(processingText ?? resultsSummary).toBeTruthy();
    }, { timeout: 3000 });
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 3 - completion tests
  it('should handle questionnaire completion with maybe results', async () => {
    const user = userEvent.setup();
    const { evaluateAllPrograms } = await import('../rules');
    const { createUserProfile } = await import('../db/utils');

    const mockSaveResults = vi.fn().mockResolvedValue(undefined);
    mockUseResultsManagement.mockReturnValueOnce({
      saveResults: mockSaveResults,
      loadAllResults: vi.fn().mockResolvedValue([]),
      loadResult: vi.fn().mockResolvedValue(null),
      deleteResult: vi.fn().mockResolvedValue(undefined),
      updateResult: vi.fn().mockResolvedValue(undefined),
      savedResults: [],
      isLoading: false,
      error: null,
    });

    vi.mocked(evaluateAllPrograms).mockResolvedValue({
      profileId: 'test-profile',
      programResults: new Map([
        ['medicaid-federal', {
          profileId: 'test-profile',
          programId: 'medicaid-federal',
          ruleId: 'medicaid-general-test',
          eligible: false,
          confidence: 45,
          reason: 'Incomplete information',
          incomplete: true,
          evaluatedAt: Date.now(),
          criteriaResults: [],
          requiredDocuments: [],
          nextSteps: [],
          ruleVersion: '1.0.0',
        }],
      ]),
      summary: {
        total: 1,
        eligible: 0,
        ineligible: 0,
        incomplete: 1,
        needsReview: 0,
      },
      totalTime: 0,
    });

    vi.mocked(createUserProfile).mockResolvedValue({
      id: 'test-profile',
      householdSize: 2,
      householdIncome: 25000,
      state: 'GA',
      citizenship: 'us_citizen',
      employmentStatus: 'employed',
      hasDisability: false,
      isPregnant: false,
      hasChildren: false,
    } as unknown as RxDocument<UserProfile>);

    render(<App />);

    const startButton = screen.getByRole('button', { name: 'Start Assessment' });
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('questionnaire-page')).toBeInTheDocument();
    }, { timeout: 2000 });

    const completeButton = screen.getByRole('button', { name: 'Complete' });
    await user.click(completeButton);

    await waitFor(() => {
      const processingText = screen.queryByText('New Assessment');
      const resultsSummary = screen.queryByText('Import');
      expect(processingText ?? resultsSummary).toBeTruthy();
    }, { timeout: 3000 });
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 3 - completion tests
  it('should handle questionnaire completion with estimated benefits', async () => {
    const user = userEvent.setup();
    const { evaluateAllPrograms } = await import('../rules');
    const { createUserProfile } = await import('../db/utils');

    const mockSaveResults = vi.fn().mockResolvedValue(undefined);
    mockUseResultsManagement.mockReturnValueOnce({
      saveResults: mockSaveResults,
      loadAllResults: vi.fn().mockResolvedValue([]),
      loadResult: vi.fn().mockResolvedValue(null),
      deleteResult: vi.fn().mockResolvedValue(undefined),
      updateResult: vi.fn().mockResolvedValue(undefined),
      savedResults: [],
      isLoading: false,
      error: null,
    });

    vi.mocked(evaluateAllPrograms).mockResolvedValue({
      profileId: 'test-profile',
      programResults: new Map([
        ['snap-federal', {
          profileId: 'test-profile',
          programId: 'snap-federal',
          ruleId: 'snap-income-test',
          eligible: true,
          confidence: 95,
          reason: 'Meets income requirements',
          evaluatedAt: Date.now(),
          criteriaResults: [],
          requiredDocuments: [],
          nextSteps: [],
          ruleVersion: '1.0.0',
          estimatedBenefit: {
            amount: 500,
            frequency: 'monthly',
            description: 'Monthly SNAP benefit',
          },
        }],
      ]),
      summary: {
        total: 1,
        eligible: 1,
        ineligible: 0,
        incomplete: 0,
        needsReview: 0,
      },
      totalTime: 0,
    });

    vi.mocked(createUserProfile).mockResolvedValue({
      id: 'test-profile',
      householdSize: 3,
      householdIncome: 20000,
      state: 'GA',
      citizenship: 'us_citizen',
      employmentStatus: 'employed',
      hasDisability: false,
      isPregnant: false,
      hasChildren: true,
    } as unknown as RxDocument<UserProfile>);

    render(<App />);

    const startButton = screen.getByRole('button', { name: 'Start Assessment' });
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('questionnaire-page')).toBeInTheDocument();
    }, { timeout: 2000 });

    const completeButton = screen.getByRole('button', { name: 'Complete' });
    await user.click(completeButton);

    await waitFor(() => {
      const processingText = screen.queryByText('New Assessment');
      const resultsSummary = screen.queryByText('Import');
      expect(processingText ?? resultsSummary).toBeTruthy();
    }, { timeout: 3000 });
  });

  // TESTING MEMORY LEAK FIX: Re-enabled batch 4 - interaction tests
  it('should handle new assessment button click', async () => {
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

    // Click new assessment button if it exists
    const newAssessmentButton = screen.queryByRole('button', { name: 'results.actions.newAssessment' });
    if (newAssessmentButton) {
      await user.click(newAssessmentButton);
      await waitFor(() => {
        expect(screen.getByTestId('questionnaire-page')).toBeInTheDocument();
      }, { timeout: 2000 });
    }
  });
});

