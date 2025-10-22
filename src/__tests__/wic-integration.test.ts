/**
 * WIC Integration Test
 *
 * Tests that WIC program is properly integrated with benefit calculations
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { initializeApp } from '../utils/initializeApp';
import { getDatabase, clearDatabase } from '../db';
import { evaluateAllPrograms } from '../rules';

describe('WIC Integration', () => {
  beforeAll(async () => {
    // Clear database and re-initialize to ensure fresh import
    console.log('🔍 [DEBUG] beforeAll: Starting database clear and re-initialization');
    await clearDatabase();
    console.log('🔍 [DEBUG] beforeAll: Database cleared, now initializing app');
    await initializeApp();
    console.log('🔍 [DEBUG] beforeAll: App initialization complete');
  });

  it('should have WIC program in database', async () => {
    const db = getDatabase();
    const wicProgram = await db.benefit_programs.findOne({
      selector: { id: 'wic-federal' }
    }).exec();

    expect(wicProgram).toBeTruthy();
    expect(wicProgram?.name).toBe('Special Supplemental Nutrition Program for Women, Infants, and Children (WIC)');
    expect(wicProgram?.shortName).toBe('WIC');
    expect(wicProgram?.category).toBe('food');
  });

  it('should have WIC rules loaded', async () => {
    const db = getDatabase();
    const wicRules = await db.eligibility_rules.find({
      selector: { programId: 'wic-federal' }
    }).exec();

    console.log('WIC rules found:', wicRules.length);
    console.log('WIC rules:', wicRules.map(r => ({ id: r.id, ruleType: r.ruleType, name: r.name })));

    expect(wicRules.length).toBeGreaterThan(0);

    // Check for benefit calculation rules
    const benefitRules = wicRules.filter(rule => rule.ruleType === 'benefit_amount');
    console.log('Benefit rules found:', benefitRules.length);
    console.log('Benefit rules:', benefitRules.map(r => ({ id: r.id, ruleType: r.ruleType, name: r.name })));
    expect(benefitRules.length).toBeGreaterThan(0);
  });

  it('should debug WIC rules in database', async () => {
    const db = getDatabase();
    const wicRules = await db.eligibility_rules.find({
      selector: { programId: 'wic-federal' }
    }).exec();

    console.log('\n=== DEBUG: All WIC Rules in Database ===');
    console.log('Total rules found:', wicRules.length);

    wicRules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.id}`);
      console.log(`   Type: ${rule.ruleType}`);
      console.log(`   Name: ${rule.name}`);
      console.log(`   Active: ${rule.active}`);
      console.log(`   Priority: ${rule.priority}`);
      console.log('');
    });

    const benefitRules = wicRules.filter(rule => rule.ruleType === 'benefit_amount');
    console.log('Benefit amount rules:', benefitRules.length);

    const eligibilityRules = wicRules.filter(rule => rule.ruleType === 'eligibility');
    console.log('Eligibility rules:', eligibilityRules.length);

    // This test always passes - it's just for debugging
    expect(true).toBe(true);
  });

  it('should evaluate WIC eligibility for pregnant woman', async () => {
    // Create a test profile for a pregnant woman using existing schema fields
    const db = getDatabase();
    const profile = await db.user_profiles.insert({
      id: 'test-pregnant-woman',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      householdSize: 2,
      householdIncome: 3000, // Below 185% FPL for 2 people
      state: 'GA',
      citizenship: 'us_citizen',
      isPregnant: true,
      hasChildren: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Evaluate all programs
    const results = await evaluateAllPrograms(profile.id);

    // Check that WIC is included in results
    const wicResult = results.programResults.get('wic-federal');
    expect(wicResult).toBeTruthy();

    if (wicResult) {
      expect(wicResult.eligible).toBe(true);
      expect(wicResult.estimatedBenefit).toBeTruthy();
      expect(wicResult.estimatedBenefit?.amount).toBe(45);
      expect(wicResult.estimatedBenefit?.frequency).toBe('monthly');
    }

    // Clean up
    await profile.remove();
  });

  it('should evaluate WIC eligibility for breastfeeding woman', async () => {
    const db = getDatabase();
    const profile = await db.user_profiles.insert({
      id: 'test-breastfeeding-woman',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      householdSize: 3,
      householdIncome: 4000, // Below 185% FPL for 3 people
      state: 'GA',
      citizenship: 'us_citizen',
      isPregnant: false,
      hasChildren: true, // Has children (could be breastfeeding)
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const results = await evaluateAllPrograms(profile.id);
    const wicResult = results.programResults.get('wic-federal');

    expect(wicResult).toBeTruthy();
    if (wicResult) {
      expect(wicResult.eligible).toBe(true);
      expect(wicResult.estimatedBenefit?.amount).toBe(55); // Higher benefit for breastfeeding
      expect(wicResult.estimatedBenefit?.frequency).toBe('monthly');
    }

    await profile.remove();
  });

  it('should evaluate WIC eligibility for child', async () => {
    const db = getDatabase();
    const profile = await db.user_profiles.insert({
      id: 'test-child',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '2020-01-01',
      householdSize: 3,
      householdIncome: 4000,
      state: 'GA',
      citizenship: 'us_citizen',
      isPregnant: false,
      hasChildren: true, // Has children under 18
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const results = await evaluateAllPrograms(profile.id);
    const wicResult = results.programResults.get('wic-federal');

    expect(wicResult).toBeTruthy();
    if (wicResult) {
      expect(wicResult.eligible).toBe(true);
      expect(wicResult.estimatedBenefit?.amount).toBe(35); // Child benefit amount
      expect(wicResult.estimatedBenefit?.frequency).toBe('monthly');
    }

    await profile.remove();
  });
});
