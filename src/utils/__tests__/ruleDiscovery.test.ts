/**
 * Rule Discovery Tests
 *
 * Tests for the dynamic rule file discovery system
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { discoverAndSeedAllRules, checkForNewRuleFiles } from '../ruleDiscovery';
import { initializeDatabase, destroyDatabase, getDatabase } from '../../db/database';

describe('Rule Discovery', () => {
  beforeEach(async () => {
    await initializeDatabase('test-password-123');
  });

  afterEach(async () => {
    await destroyDatabase();
  });

  describe('discoverAndSeedAllRules', () => {
    it('should discover and seed all available rule files', async () => {
      const results = await discoverAndSeedAllRules();

      expect(results.discovered).toBeGreaterThan(0);
      expect(results.created).toBeGreaterThan(0);
      expect(results.imported).toBeGreaterThan(0);
      expect(results.errors).toHaveLength(0);

      // Verify programs were created in database
      const db = getDatabase()!;
      const programs = await db.benefit_programs.find().exec();
      expect(programs.length).toBeGreaterThan(0);

      // Verify we have the expected programs
      const programIds = programs.map(p => p.id);
      expect(programIds).toContain('snap-federal');
      expect(programIds).toContain('medicaid-federal');
      expect(programIds).toContain('wic-federal');
    });

    it('should handle errors gracefully', async () => {
      // This test would need to mock a scenario with invalid rule files
      // For now, we'll just verify the function doesn't throw
      const results = await discoverAndSeedAllRules();
      expect(results).toHaveProperty('discovered');
      expect(results).toHaveProperty('created');
      expect(results).toHaveProperty('imported');
      expect(results).toHaveProperty('errors');
    });
  });

  describe('checkForNewRuleFiles', () => {
    it('should return true when no programs exist', async () => {
      const hasNew = await checkForNewRuleFiles();
      expect(hasNew).toBe(true);
    });

    it('should return false when all rule files are already seeded', async () => {
      // First, seed all available rule files
      await discoverAndSeedAllRules();

      // Then check for new files
      const hasNew = await checkForNewRuleFiles();
      expect(hasNew).toBe(false);
    });
  });
});
