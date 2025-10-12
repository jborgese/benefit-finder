/**
 * Eligibility Evaluation Tests
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { initializeDatabase, destroyDatabase } from '../../db/database';
import {
  evaluateEligibility,
  evaluateMultiplePrograms,
  clearCachedResults,
  getCachedResults,
} from '../eligibility';
import {
  createUserProfile,
  createBenefitProgram,
  createEligibilityRule,
} from '../../db/utils';

describe('Eligibility Evaluation', () => {
  beforeAll(async () => {
    await initializeDatabase('test-password-123');
  });

  afterAll(async () => {
    await destroyDatabase();
  });

  beforeEach(async () => {
    // Clear test data
    const { clearUserData } = await import('../../db/utils');
    await clearUserData();
  });

  describe('evaluateEligibility', () => {
    it('should evaluate eligibility successfully', async () => {
      // Create test data
      const profile = await createUserProfile({
        firstName: 'Test',
        lastName: 'User',
        householdIncome: 3000,
        householdSize: 3,
      });

      const program = await createBenefitProgram({
        name: 'Test Program',
        shortName: 'TEST',
        description: 'Test program',
        category: 'food',
        jurisdiction: 'US-TEST',
        active: true,
      });

      await createEligibilityRule({
        programId: program.id,
        name: 'Income Test',
        description: 'Test income eligibility',
        ruleLogic: {
          '<': [{ var: 'householdIncome' }, { '*': [{ var: 'householdSize' }, 1500] }],
        },
        version: '1.0.0',
        active: true,
        requiredFields: ['householdIncome', 'householdSize'],
      });

      // Evaluate
      const result = await evaluateEligibility(profile.id, program.id);

      expect(result).toBeDefined();
      expect(result.profileId).toBe(profile.id);
      expect(result.programId).toBe(program.id);
      expect(result.eligible).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.executionTime).toBeDefined();
    });

    it('should detect missing fields', async () => {
      const profile = await createUserProfile({
        firstName: 'Test',
        lastName: 'User',
        // Missing householdIncome and householdSize
      });

      const program = await createBenefitProgram({
        name: 'Test Program',
        shortName: 'TEST',
        description: 'Test',
        category: 'food',
        jurisdiction: 'US-TEST',
        active: true,
      });

      await createEligibilityRule({
        programId: program.id,
        name: 'Income Test',
        ruleLogic: { '<': [{ var: 'householdIncome' }, 50000] },
        version: '1.0.0',
        active: true,
        requiredFields: ['householdIncome', 'householdSize'],
      });

      const result = await evaluateEligibility(profile.id, program.id);

      expect(result.incomplete).toBe(true);
      expect(result.missingFields).toContain('householdIncome');
      expect(result.missingFields).toContain('householdSize');
    });

    it('should cache results', async () => {
      const profile = await createUserProfile({
        firstName: 'Test',
        householdIncome: 3000,
        householdSize: 2,
      });

      const program = await createBenefitProgram({
        name: 'Test Program',
        shortName: 'TEST',
        description: 'Test',
        category: 'food',
        jurisdiction: 'US-TEST',
        active: true,
      });

      await createEligibilityRule({
        programId: program.id,
        name: 'Test Rule',
        ruleLogic: { '<': [{ var: 'householdIncome' }, 5000] },
        version: '1.0.0',
        active: true,
      });

      // First evaluation
      const result1 = await evaluateEligibility(profile.id, program.id, {
        cacheResult: true,
      });

      // Get cached results
      const cached = await getCachedResults(profile.id);
      expect(cached.length).toBe(1);

      // Second evaluation should use cache
      const result2 = await evaluateEligibility(profile.id, program.id);

      // Results should be the same
      expect(result2.eligible).toBe(result1.eligible);
    });
  });

  describe('evaluateMultiplePrograms', () => {
    it('should evaluate multiple programs', async () => {
      const profile = await createUserProfile({
        firstName: 'Test',
        householdIncome: 3000,
        householdSize: 2,
      });

      const program1 = await createBenefitProgram({
        name: 'Program 1',
        shortName: 'P1',
        description: 'Test',
        category: 'food',
        jurisdiction: 'US-TEST',
        active: true,
      });

      const program2 = await createBenefitProgram({
        name: 'Program 2',
        shortName: 'P2',
        description: 'Test',
        category: 'healthcare',
        jurisdiction: 'US-TEST',
        active: true,
      });

      await createEligibilityRule({
        programId: program1.id,
        name: 'Rule 1',
        ruleLogic: { '<': [{ var: 'householdIncome' }, 5000] },
        version: '1.0.0',
        active: true,
      });

      await createEligibilityRule({
        programId: program2.id,
        name: 'Rule 2',
        ruleLogic: { '<': [{ var: 'householdIncome' }, 10000] },
        version: '1.0.0',
        active: true,
      });

      const result = await evaluateMultiplePrograms(profile.id, [
        program1.id,
        program2.id,
      ]);

      expect(result.profileId).toBe(profile.id);
      expect(result.programResults.size).toBe(2);
      expect(result.summary.total).toBe(2);
      expect(result.totalTime).toBeGreaterThan(0);
    });
  });

  describe('clearCachedResults', () => {
    it('should clear cached results', async () => {
      const profile = await createUserProfile({
        firstName: 'Test',
        householdIncome: 3000,
      });

      const program = await createBenefitProgram({
        name: 'Test Program',
        shortName: 'TEST',
        description: 'Test',
        category: 'food',
        jurisdiction: 'US-TEST',
        active: true,
      });

      await createEligibilityRule({
        programId: program.id,
        name: 'Test Rule',
        ruleLogic: { '<': [{ var: 'householdIncome' }, 5000] },
        version: '1.0.0',
        active: true,
      });

      // Evaluate and cache
      await evaluateEligibility(profile.id, program.id, { cacheResult: true });

      const cached = await getCachedResults(profile.id);
      expect(cached.length).toBe(1);

      // Clear cache
      const cleared = await clearCachedResults(profile.id);
      expect(cleared).toBe(1);

      const afterClear = await getCachedResults(profile.id);
      expect(afterClear.length).toBe(0);
    });
  });
});

