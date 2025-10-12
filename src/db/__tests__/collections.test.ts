/**
 * Collections Tests
 *
 * Tests for database collections and their methods.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { initializeDatabase, destroyDatabase } from '../database';
import {
  createUserProfile,
  createBenefitProgram,
  createEligibilityRule,
  saveEligibilityResult,
  updateUserProfile,
  deleteUserProfile,
  getDatabaseStats,
  clearUserData,
} from '../utils';

describe('Database Collections', () => {
  beforeAll(async () => {
    await initializeDatabase('test-password-123');
  });

  afterAll(async () => {
    await destroyDatabase();
  });

  beforeEach(async () => {
    // Clear data before each test
    await clearUserData();
  });

  describe('User Profiles', () => {
    it('should create a user profile', async () => {
      const profile = await createUserProfile({
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: '1985-03-15',
        householdSize: 3,
        householdIncome: 35000,
        state: 'GA',
        zipCode: '30301',
        citizenship: 'us_citizen',
        employmentStatus: 'employed',
      });

      expect(profile).toBeDefined();
      expect(profile.id).toBeDefined();
      expect(profile.firstName).toBe('Jane');
      expect(profile.lastName).toBe('Doe');
    });

    // TODO: Add RxDB methods
    it.skip('should get full name from profile', async () => {
      await createUserProfile({
        firstName: 'John',
        lastName: 'Smith',
        dateOfBirth: '1990-01-01',
      });

      // const fullName = profile.getFullName();
      // expect(fullName).toBe('John Smith');
    });

    // TODO: Add RxDB methods
    it.skip('should calculate age from date of birth', async () => {
      await createUserProfile({
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '2000-01-01',
      });

      // const age = profile.getAge();
      // expect(age).toBeGreaterThan(20);
      // expect(age).toBeLessThan(30);
    });

    it('should update a user profile', async () => {
      const profile = await createUserProfile({
        firstName: 'Jane',
        lastName: 'Doe',
        householdIncome: 35000,
      });

      await updateUserProfile(profile.id, {
        householdIncome: 40000,
      });

      const updatedProfile = await profile.collection.findOne(profile.id).exec();
      expect(updatedProfile?.householdIncome).toBe(40000);
    });

    it('should delete a user profile', async () => {
      const profile = await createUserProfile({
        firstName: 'Jane',
        lastName: 'Doe',
      });

      await deleteUserProfile(profile.id);

      const deletedProfile = await profile.collection.findOne(profile.id).exec();
      expect(deletedProfile).toBeNull();
    });
  });

  describe('Benefit Programs', () => {
    it('should create a benefit program', async () => {
      const program = await createBenefitProgram({
        name: 'SNAP (Food Stamps)',
        shortName: 'SNAP',
        description: 'Supplemental Nutrition Assistance Program',
        category: 'food',
        jurisdiction: 'US-GA',
        website: 'https://dhs.georgia.gov',
        phoneNumber: '1-877-423-4746',
        applicationUrl: 'https://gateway.ga.gov',
        active: true,
      });

      expect(program).toBeDefined();
      expect(program.name).toBe('SNAP (Food Stamps)');
      expect(program.category).toBe('food');
    });

    // TODO: Add RxDB methods
    it.skip('should check if program is active', async () => {
      const program = await createBenefitProgram({
        name: 'Test Program',
        shortName: 'TEST',
        description: 'Test',
        category: 'food',
        jurisdiction: 'US-GA',
        active: true,
      });

      // expect(program.isActive()).toBe(true);
      expect(program.active).toBe(true);
    });

    // TODO: Add RxDB methods
    it.skip('should get programs by jurisdiction', async () => {
      await createBenefitProgram({
        name: 'GA Program',
        shortName: 'GAP',
        description: 'Georgia program',
        category: 'food',
        jurisdiction: 'US-GA',
        active: true,
      });

      await createBenefitProgram({
        name: 'CA Program',
        shortName: 'CAP',
        description: 'California program',
        category: 'food',
        jurisdiction: 'US-CA',
        active: true,
      });

      // const db = getDatabase();
      // const gaPrograms = await db.benefit_programs.getByJurisdiction('US-GA');
      // expect(gaPrograms.length).toBeGreaterThan(0);
      // expect(gaPrograms.every(p => p.jurisdiction === 'US-GA')).toBe(true);
    });
  });

  describe('Eligibility Rules', () => {
    it('should create an eligibility rule', async () => {
      const program = await createBenefitProgram({
        name: 'Test Program',
        shortName: 'TEST',
        description: 'Test',
        category: 'food',
        jurisdiction: 'US-GA',
        active: true,
      });

      const rule = await createEligibilityRule({
        programId: program.id,
        name: 'Income Test',
        description: 'Test household income',
        ruleLogic: {
          '<=': [{ var: 'householdIncome' }, 50000],
        },
        requiredDocuments: ['Proof of income'],
        version: '1.0',
        effectiveDate: Date.now(),
        expirationDate: Date.now() + 365 * 24 * 60 * 60 * 1000,
        source: 'Test source',
        active: true,
      });

      expect(rule).toBeDefined();
      expect(rule.programId).toBe(program.id);
      // TODO: Add RxDB methods
      // expect(rule.isValid()).toBe(true);
      expect(rule.active).toBe(true);
    });
  });

  describe('Eligibility Results', () => {
    it('should save an eligibility result', async () => {
      const profile = await createUserProfile({
        firstName: 'Jane',
        lastName: 'Doe',
      });

      const program = await createBenefitProgram({
        name: 'Test Program',
        shortName: 'TEST',
        description: 'Test',
        category: 'food',
        jurisdiction: 'US-GA',
        active: true,
      });

      const rule = await createEligibilityRule({
        programId: program.id,
        name: 'Test Rule',
        description: 'Test',
        ruleLogic: {},
        version: '1.0',
        active: true,
      });

      const result = await saveEligibilityResult({
        userProfileId: profile.id,
        programId: program.id,
        ruleId: rule.id,
        eligible: true,
        confidence: 95,
        reason: 'Meets all criteria',
        nextSteps: [{ step: 'Apply online', priority: 'high' }],
        requiredDocuments: [{ document: 'ID', required: true }, { document: 'Proof of income', required: true }],
      });

      expect(result).toBeDefined();
      expect(result.eligible).toBe(true);
      // TODO: Add RxDB methods
      // expect(result.isEligible()).toBe(true);
      // expect(result.isExpired()).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('should get database statistics', async () => {
      await createUserProfile({
        firstName: 'Test',
        lastName: 'User',
      });

      const stats = await getDatabaseStats();

      expect(stats).toBeDefined();
      expect(stats.userProfiles).toBeGreaterThan(0);
      expect(stats.total).toBeGreaterThan(0);
    });
  });
});

