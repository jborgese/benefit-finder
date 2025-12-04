/**
 * Rule Schema Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateRuleDefinition,
  validateRulePackage,
  parseVersion,
  formatVersion,
  compareVersions,
  isNewerVersion,
  incrementVersion,
  createRuleTemplate,
  calculateChecksum,
  RuleDefinitionSchema,
  type RuleDefinition,
  type RuleVersion,
} from '../core/schema';

describe('Rule Schema', () => {
  describe('RuleVersion', () => {
    it('should parse version string', () => {
      const version = parseVersion('1.2.3');

      expect(version.major).toBe(1);
      expect(version.minor).toBe(2);
      expect(version.patch).toBe(3);
    });

    it('should parse version with label', () => {
      const version = parseVersion('2.0.0.beta');

      expect(version.major).toBe(2);
      expect(version.minor).toBe(0);
      expect(version.patch).toBe(0);
      expect(version.label).toBe('beta');
    });

    it('should format version to string', () => {
      const version: RuleVersion = { major: 1, minor: 2, patch: 3 };

      expect(formatVersion(version)).toBe('1.2.3');
    });

    it('should format version with label', () => {
      const version: RuleVersion = { major: 1, minor: 0, patch: 0, label: 'alpha' };

      expect(formatVersion(version)).toBe('1.0.0-alpha');
    });

    it('should compare versions', () => {
      const v1: RuleVersion = { major: 1, minor: 0, patch: 0 };
      const v2: RuleVersion = { major: 2, minor: 0, patch: 0 };
      const v3: RuleVersion = { major: 1, minor: 5, patch: 0 };

      expect(compareVersions(v1, v2)).toBe(-1);
      expect(compareVersions(v2, v1)).toBe(1);
      expect(compareVersions(v1, v1)).toBe(0);
      expect(compareVersions(v1, v3)).toBe(-1);
    });

    it('should check if version is newer', () => {
      const v1: RuleVersion = { major: 1, minor: 0, patch: 0 };
      const v2: RuleVersion = { major: 2, minor: 0, patch: 0 };

      expect(isNewerVersion(v2, v1)).toBe(true);
      expect(isNewerVersion(v1, v2)).toBe(false);
      expect(isNewerVersion(v1, v1)).toBe(false);
    });

    it('should increment version', () => {
      const v: RuleVersion = { major: 1, minor: 2, patch: 3 };

      const major = incrementVersion(v, 'major');
      expect(major).toEqual({ major: 2, minor: 0, patch: 0 });

      const minor = incrementVersion(v, 'minor');
      expect(minor).toEqual({ major: 1, minor: 3, patch: 0 });

      const patch = incrementVersion(v, 'patch');
      expect(patch).toEqual({ major: 1, minor: 2, patch: 4 });
    });
  });

  describe('RuleDefinition', () => {
    it('should validate a complete rule definition', () => {
      const rule: RuleDefinition = {
        id: 'test-rule-1',
        programId: 'snap-ga',
        name: 'Income Test',
        description: 'Test household income',
        ruleLogic: { '<': [{ var: 'income' }, 50000] },
        version: { major: 1, minor: 0, patch: 0 },
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        citations: [{ title: 'Test Citation' }],
      };

      const result = validateRuleDefinition(rule);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('test-rule-1');
      }
    });

    it('should reject invalid rule definition', () => {
      const invalidRule = {
        // Missing required fields
        name: 'Invalid Rule',
      };

      const result = validateRuleDefinition(invalidRule);

      expect(result.success).toBe(false);
    });

    it('should validate rule with full metadata', () => {
      const rule: RuleDefinition = {
        id: 'test-rule-2',
        programId: 'snap-ga',
        name: 'Complex Rule',
        description: 'Rule with full metadata',
        ruleLogic: { and: [{ '>': [{ var: 'age' }, 18] }, { '<': [{ var: 'income' }, 50000] }] },
        ruleType: 'eligibility',
        explanation: 'Must be over 18 and income below $50,000',
        requiredFields: ['age', 'income'],
        requiredDocuments: [
          {
            id: 'proof-income',
            name: 'Proof of Income',
            required: true,
          },
        ],
        nextSteps: [
          {
            step: 'Apply online',
            url: 'https://example.com/apply',
            priority: 'high',
          },
        ],
        version: { major: 1, minor: 0, patch: 0 },
        author: {
          name: 'Test Author',
          email: 'test@example.com',
        },
        citations: [
          {
            title: 'SNAP Rules',
            url: 'https://example.com/rules',
          },
        ],
        active: true,
        draft: false,
        testCases: [
          {
            id: 'test-1',
            description: 'Eligible case',
            input: { age: 25, income: 30000 },
            expected: true,
          },
        ],
        changelog: [
          {
            version: { major: 1, minor: 0, patch: 0 },
            date: Date.now(),
            author: 'Test Author',
            description: 'Initial version',
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: ['income', 'age'],
      };

      const result = RuleDefinitionSchema.safeParse(rule);

      expect(result.success).toBe(true);
    });
  });

  describe('RulePackage', () => {
    it('should validate a rule package', () => {
      const pkg = {
        metadata: {
          id: 'package-1',
          name: 'SNAP Rules Package',
          description: 'Federal SNAP eligibility rules',
          version: { major: 1, minor: 0, patch: 0 },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        rules: [
          {
            id: 'rule-1',
            programId: 'snap-federal',
            name: 'Test Rule',
            ruleLogic: { '>': [{ var: 'age' }, 18] },
            version: { major: 1, minor: 0, patch: 0 },
            active: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            citations: [
              {
                title: 'SNAP Eligibility Requirements',
                url: 'https://example.gov/snap-rules',
              },
            ],
          },
        ],
      };

      const result = validateRulePackage(pkg);

      expect(result.success).toBe(true);
    });

    it('should reject invalid package', () => {
      const invalidPackage = {
        metadata: {
          // Missing required fields
          name: 'Invalid Package',
        },
        rules: [],
      };

      const result = validateRulePackage(invalidPackage);

      expect(result.success).toBe(false);
    });
  });

  describe('createRuleTemplate', () => {
    it('should create a rule template', () => {
      const template = createRuleTemplate('snap-ga', 'New Rule');

      expect(template.programId).toBe('snap-ga');
      expect(template.name).toBe('New Rule');
      expect(template.active).toBe(false);
      expect(template.draft).toBe(true);
      expect(template.version).toEqual({ major: 0, minor: 1, patch: 0, label: 'draft' });
    });
  });

  describe('calculateChecksum', () => {
    it('should calculate consistent checksum', async () => {
      const data = { test: 'data', value: 123 };

      const checksum1 = await calculateChecksum(data);
      const checksum2 = await calculateChecksum(data);

      expect(checksum1).toBe(checksum2);
      expect(typeof checksum1).toBe('string');
      expect(checksum1.length).toBeGreaterThan(0);
    });

    it('should produce different checksums for different data', async () => {
      const data1 = { test: 'data1' };
      const data2 = { test: 'data2' };

      const checksum1 = await calculateChecksum(data1);
      const checksum2 = await calculateChecksum(data2);

      expect(checksum1).not.toBe(checksum2);
    });
  });
});

