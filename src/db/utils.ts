/**
 * Database Utilities
 *
 * Helper functions for common database operations.
 */

import { nanoid } from 'nanoid';
import type { RxDocument } from 'rxdb';
import { getDatabase } from './database';
import type {
  UserProfile,
  BenefitProgram,
  EligibilityRule,
  EligibilityResult,
} from './schemas';

/**
 * Generate a unique ID for database documents
 *
 * @returns Unique ID string
 */
export function generateId(): string {
  return nanoid();
}

/**
 * Create a new user profile
 *
 * @param data Profile data
 * @returns Created profile document
 */
export function createUserProfile(
  data: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<RxDocument<UserProfile>> {
  const db = getDatabase();

  const profile: UserProfile = {
    id: generateId(),
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth,
    householdSize: data.householdSize,
    householdIncome: data.householdIncome,
    state: data.state,
    zipCode: data.zipCode,
    county: data.county,
    citizenship: data.citizenship,
    employmentStatus: data.employmentStatus,
    hasDisability: data.hasDisability,
    isVeteran: data.isVeteran,
    isPregnant: data.isPregnant,
    hasChildren: data.hasChildren,
    lastAccessedAt: data.lastAccessedAt,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return db.user_profiles.insert(profile);
}

/**
 * Update a user profile
 *
 * @param profileId Profile ID
 * @param data Updated data
 * @returns Updated profile document
 */
export async function updateUserProfile(
  profileId: string,
  data: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<RxDocument<UserProfile>> {
  const db = getDatabase();

  const profile = await db.user_profiles.findOne({
    selector: { id: profileId },
  }).exec();

  if (!profile) {
    throw new Error(`Profile ${profileId} not found`);
  }

  return profile.update({
    $set: {
      ...data,
      updatedAt: Date.now(),
    },
  });
}

/**
 * Delete a user profile
 *
 * @param profileId Profile ID
 */
export async function deleteUserProfile(profileId: string): Promise<void> {
  const db = getDatabase();

  const profile = await db.user_profiles.findOne({
    selector: { id: profileId },
  }).exec();

  if (!profile) {
    throw new Error(`Profile ${profileId} not found`);
  }

  // Also delete associated eligibility results
  const results = await db.eligibility_results.find({
    selector: { userProfileId: profileId },
  }).exec();

  for (const result of results) {
    await result.remove();
  }

  await profile.remove();
}

/**
 * Create a benefit program
 *
 * @param data Program data
 * @returns Created program document
 */
export function createBenefitProgram(
  data: Omit<BenefitProgram, 'id' | 'lastUpdated' | 'createdAt'>
): Promise<RxDocument<BenefitProgram>> {
  const db = getDatabase();

  const program: BenefitProgram = {
    id: generateId(),
    ...data,
    lastUpdated: Date.now(),
    createdAt: Date.now(),
  };

  return db.benefit_programs.insert(program);
}

/**
 * Create an eligibility rule
 *
 * @param data Rule data
 * @returns Created rule document
 */
export function createEligibilityRule(
  data: Omit<EligibilityRule, 'id' | 'createdAt' | 'updatedAt'>
): Promise<RxDocument<EligibilityRule>> {
  const db = getDatabase();

  const rule: EligibilityRule = {
    id: generateId(),
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return db.eligibility_rules.insert(rule);
}

/**
 * Save an eligibility result
 *
 * @param data Result data
 * @param expirationDays Days until result expires (default: 30)
 * @returns Created result document
 */
export function saveEligibilityResult(
  data: Omit<EligibilityResult, 'id' | 'evaluatedAt' | 'expiresAt'>,
  expirationDays = 30
): Promise<RxDocument<EligibilityResult>> {
  const db = getDatabase();

  const now = Date.now();
  const expiresAt = now + (expirationDays * 24 * 60 * 60 * 1000);

  const result: EligibilityResult = {
    id: generateId(),
    ...data,
    evaluatedAt: now,
    expiresAt,
  };

  return db.eligibility_results.insert(result);
}

/**
 * Clear all user data (for privacy/reset)
 *
 * This will delete all user profiles and eligibility results.
 * Benefit programs and rules are preserved.
 */
export async function clearUserData(): Promise<void> {
  const db = getDatabase();

  // Remove all user profiles
  const profiles = await db.user_profiles.find().exec();
  for (const profile of profiles) {
    await profile.remove();
  }

  // Remove all eligibility results
  const results = await db.eligibility_results.find().exec();
  for (const result of results) {
    await result.remove();
  }
}

/**
 * Get database statistics
 *
 * @returns Database stats
 */
export async function getDatabaseStats(): Promise<{
  userProfiles: number;
  benefitPrograms: number;
  eligibilityRules: number;
  eligibilityResults: number;
  total: number;
}> {
  const db = getDatabase();

  const [
    userProfilesCount,
    benefitProgramsCount,
    eligibilityRulesCount,
    eligibilityResultsCount,
  ] = await Promise.all([
    db.user_profiles.count().exec(),
    db.benefit_programs.count().exec(),
    db.eligibility_rules.count().exec(),
    db.eligibility_results.count().exec(),
  ]);

  return {
    userProfiles: userProfilesCount,
    benefitPrograms: benefitProgramsCount,
    eligibilityRules: eligibilityRulesCount,
    eligibilityResults: eligibilityResultsCount,
    total: userProfilesCount + benefitProgramsCount + eligibilityRulesCount + eligibilityResultsCount,
  };
}

/**
 * Validate database health
 *
 * @returns Health check results
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  try {
    const db = getDatabase();

    // Check if collections exist (runtime check for database initialization)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Runtime check for proper database initialization
    if (!db.user_profiles) issues.push('user_profiles collection not found');
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Runtime check for proper database initialization
    if (!db.benefit_programs) issues.push('benefit_programs collection not found');
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Runtime check for proper database initialization
    if (!db.eligibility_rules) issues.push('eligibility_rules collection not found');
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Runtime check for proper database initialization
    if (!db.eligibility_results) issues.push('eligibility_results collection not found');
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Runtime check for proper database initialization
    if (!db.app_settings) issues.push('app_settings collection not found');

    // Try a simple query on each collection
    await Promise.all([
      db.user_profiles.find().limit(1).exec(),
      db.benefit_programs.find().limit(1).exec(),
      db.eligibility_rules.find().limit(1).exec(),
      db.eligibility_results.find().limit(1).exec(),
      db.app_settings.find().limit(1).exec(),
    ]);

  } catch (error) {
    issues.push(`Database error: ${error}`);
  }

  return {
    healthy: issues.length === 0,
    issues,
  };
}

