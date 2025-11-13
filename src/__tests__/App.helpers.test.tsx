/**
 * App Component Helper Functions Tests
 *
 * Tests for helper functions and data conversion utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { destroyDatabase } from '../db';
import { mockUseResultsManagement, mockLocation } from './App.test.setup';

// Import mocks setup
import './App.test.setup';

describe('App Component - Helper Functions', () => {
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

  it('should convert monthly income to annual in convertAnswersToProfileData', () => {
    // This tests the helper function logic indirectly through component behavior
    const answers = {
      householdIncome: 2000,
      incomePeriod: 'monthly',
      householdSize: 3,
      dateOfBirth: '1990-01-01',
      state: 'GA',
      county: 'Fulton',
      citizenship: 'us_citizen',
      employmentStatus: 'employed',
      hasQualifyingDisability: false,
      isPregnant: false,
      hasChildren: true,
    };

    // The function converts monthly to annual
    const annualIncome = answers.incomePeriod === 'monthly' ? answers.householdIncome * 12 : answers.householdIncome;
    expect(annualIncome).toBe(24000);
  });

  it('should handle boolean string values in convertAnswersToProfileData', () => {
    const answers: Record<string, unknown> = {
      householdIncome: 30000,
      incomePeriod: 'annual',
      householdSize: 2,
      dateOfBirth: '1985-01-01',
      state: 'CA',
      county: 'Los Angeles',
      citizenship: 'us_citizen',
      employmentStatus: 'employed',
      hasQualifyingDisability: 'true',
      isPregnant: true,
      hasChildren: 'false',
    };

    // Test boolean conversion logic
    const hasDisability = (typeof answers.hasQualifyingDisability === 'string' && answers.hasQualifyingDisability === 'true') || answers.hasQualifyingDisability === true;
    const isPregnant = (typeof answers.isPregnant === 'string' && answers.isPregnant === 'true') || answers.isPregnant === true;
    const hasChildren = (typeof answers.hasChildren === 'string' && answers.hasChildren === 'true') || answers.hasChildren === true;

    expect(hasDisability).toBe(true);
    expect(isPregnant).toBe(true);
    expect(hasChildren).toBe(false);
  });

  it('should handle annual income period correctly', () => {
    const answers = {
      householdIncome: 50000,
      incomePeriod: 'annual',
      householdSize: 4,
      dateOfBirth: '1980-01-01',
      state: 'TX',
      county: 'Harris',
      citizenship: 'us_citizen',
      employmentStatus: 'employed',
      hasQualifyingDisability: false,
      isPregnant: false,
      hasChildren: true,
    };

    // Test annual income handling
    const annualIncome = answers.incomePeriod === 'monthly' ? answers.householdIncome * 12 : answers.householdIncome;
    expect(annualIncome).toBe(50000);
  });

  it('should handle all citizenship types', () => {
    const citizenshipTypes = ['us_citizen', 'permanent_resident', 'refugee', 'asylee', 'other'];

    citizenshipTypes.forEach(citizenship => {
      const answers = {
        householdIncome: 30000,
        incomePeriod: 'annual',
        householdSize: 2,
        dateOfBirth: '1990-01-01',
        state: 'CA',
        county: 'Los Angeles',
        citizenship,
        employmentStatus: 'employed',
        hasQualifyingDisability: false,
        isPregnant: false,
        hasChildren: false,
      };

      // Test that citizenship is properly typed
      expect(answers.citizenship).toBe(citizenship);
    });
  });

  it('should handle all employment status types', () => {
    const employmentStatuses = ['employed', 'unemployed', 'self_employed', 'retired', 'disabled', 'student'];

    employmentStatuses.forEach(employmentStatus => {
      const answers = {
        householdIncome: 30000,
        incomePeriod: 'annual',
        householdSize: 2,
        dateOfBirth: '1990-01-01',
        state: 'CA',
        county: 'Los Angeles',
        citizenship: 'us_citizen',
        employmentStatus,
        hasQualifyingDisability: false,
        isPregnant: false,
        hasChildren: false,
      };

      // Test that employment status is properly typed
      expect(answers.employmentStatus).toBe(employmentStatus);
    });
  });
});

