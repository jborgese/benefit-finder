/**
 * Database Utilities
 *
 * Helper functions for common database operations.
 */

import { nanoid } from 'nanoid';
import type { RxDocument, RxCollection } from 'rxdb';
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
 * Type-safe helper to check if an object has a callable method
 *
 * @param obj Object to check
 * @param methodName Name of the method to check for
 * @returns True if the method exists and is callable
 */
function hasCallableMethod(obj: unknown, methodName: string): boolean {
  // Validate methodName is a safe property name (alphanumeric and underscore only)
  if (!/^[a-zA-Z0-9_]+$/.test(methodName)) {
    return false;
  }

  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  // Check if method exists using 'in' operator (checks prototype chain)
  if (!(methodName in obj)) {
    return false;
  }

  // Safe: methodName is validated to contain only alphanumeric and underscore characters
  // eslint-disable-next-line security/detect-object-injection
  const method = (obj as Record<string, unknown>)[methodName];

  // Check if it's a function
  return typeof method === 'function';
}

/**
 * Type guard to check if a collection is ready (has required methods)
 *
 * @param collection Collection to check
 * @returns True if collection has all required methods
 */
function isCollectionReady<T>(collection: RxCollection<T> | undefined): collection is RxCollection<T> {
  if (!collection) {
    return false;
  }

  // Check for core required methods (count may not be immediately available but isn't critical)
  const requiredMethods = ['insert', 'find', 'findOne'];

  for (const method of requiredMethods) {
    if (!hasCallableMethod(collection, method)) {
      return false;
    }
  }

  return true;
}

/**
 * Create a new user profile
 *
 * @param data Profile data
 * @returns Created profile document
 */
export async function createUserProfile(
  data: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<RxDocument<UserProfile>> {
  const db = getDatabase();

  // Wait for collection to be fully initialized
  const collection = await waitForCollectionReady(db.user_profiles, 'user_profiles');

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

  return collection.insert(profile);
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
export async function createBenefitProgram(
  data: Omit<BenefitProgram, 'id' | 'lastUpdated' | 'createdAt'>
): Promise<RxDocument<BenefitProgram>> {
  const db = getDatabase();

  // Wait for collection to be fully initialized
  const collection = await waitForCollectionReady(db.benefit_programs, 'benefit_programs');

  const program: BenefitProgram = {
    id: generateId(),
    ...data,
    lastUpdated: Date.now(),
    createdAt: Date.now(),
  };

  return collection.insert(program);
}

/**
 * Try to refresh collection reference from database
 *
 * @param collectionName Name of the collection to refresh
 * @returns Refreshed collection if found and ready, null otherwise
 */
function tryRefreshCollection<T>(collectionName: string): RxCollection<T> | null {
  // Validate collectionName is a safe property name (alphanumeric and underscore only)
  if (!/^[a-zA-Z0-9_]+$/.test(collectionName)) {
    return null;
  }

  const db = getDatabase();
  const dbAny = db as unknown as Record<string, unknown>;
  // Safe: collectionName is validated to contain only alphanumeric and underscore characters
  // eslint-disable-next-line security/detect-object-injection
  if (!dbAny[collectionName]) {
    return null;
  }

  // Safe: collectionName is validated to contain only alphanumeric and underscore characters
  // eslint-disable-next-line security/detect-object-injection
  const refreshed = dbAny[collectionName] as RxCollection<T>;
  return isCollectionReady(refreshed) ? refreshed : null;
}

/**
 * Verify collection insert method is callable
 */
function verifyInsertMethod<T>(collection: RxCollection<T>): boolean {
  try {
    // Check if insert is actually callable (it should be a function)
    // Safe: we've verified insert exists in isCollectionReady
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertMethod = (collection as any).insert;
    return typeof insertMethod === 'function';
  } catch {
    return false;
  }
}

/**
 * Collect method availability information for error reporting
 */
function collectMethodInfo<T>(collection: RxCollection<T>): {
  availableMethods: string[];
  missingMethods: string[];
} {
  const requiredMethods = ['insert', 'find', 'findOne'];
  const optionalMethods = ['count'];
  const otherMethods = ['remove', 'update', 'upsert', 'bulkInsert', 'bulkUpsert'];
  const availableMethods: string[] = [];
  const missingMethods: string[] = [];

  // Check all required methods
  for (const method of requiredMethods) {
    if (hasCallableMethod(collection, method)) {
      availableMethods.push(method);
    } else {
      missingMethods.push(method);
    }
  }

  // Check optional and other methods (for debugging)
  for (const method of [...optionalMethods, ...otherMethods]) {
    if (hasCallableMethod(collection, method)) {
      availableMethods.push(method);
    }
  }

  return { availableMethods, missingMethods };
}

/**
 * Wait for collection to be fully initialized by testing actual usage
 */
async function waitForCollectionReady<T>(
  collection: RxCollection<T> | undefined,
  collectionName: string,
  maxRetries = 20,
  delayMs = 100
): Promise<RxCollection<T>> {
  if (!collection) {
    throw new Error(`${collectionName} collection is not initialized`);
  }

  let currentCollection = collection;

  for (let i = 0; i < maxRetries; i++) {
    // Check if core methods are available
    if (isCollectionReady(currentCollection) && verifyInsertMethod(currentCollection)) {
      return currentCollection;
    }

    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, delayMs));

    // Refresh collection reference from database periodically
    if (i > 2 && i % 3 === 0) {
      const refreshed = tryRefreshCollection<T>(collectionName);
      if (refreshed) {
        currentCollection = refreshed;
      }
    }
  }

  // Final attempt with detailed error message
  const { availableMethods, missingMethods } = collectMethodInfo(currentCollection);

  throw new Error(
    `${collectionName} collection does not have required methods after ${maxRetries} retries. ` +
    `Missing methods: ${missingMethods.join(', ')}. ` +
    `Available methods: ${availableMethods.join(', ')}. ` +
    `Collection may not be fully initialized. Try increasing wait time or checking database initialization.`
  );
}

export async function createEligibilityRule(
  data: Omit<EligibilityRule, 'id' | 'createdAt' | 'updatedAt'>
): Promise<RxDocument<EligibilityRule>> {
  const db = getDatabase();

  // Try to get the collection - check multiple possible access patterns
  let collection: RxCollection<EligibilityRule> | undefined = db.eligibility_rules;

  // If direct access doesn't work, try accessing through collections property
  const dbAny = db as unknown as Record<string, unknown>;
  if (!isCollectionReady(collection) && dbAny.collections && typeof dbAny.collections === 'object') {
    // Try accessing through collections property (RxDB internal structure)
    const collections = dbAny.collections as Record<string, unknown>;
    if (collections.eligibility_rules) {
      collection = collections.eligibility_rules as RxCollection<EligibilityRule>;
    }
  }

  // Wait for collection to be fully initialized
  collection = await waitForCollectionReady(collection, 'eligibility_rules');

  const rule: EligibilityRule = {
    id: generateId(),
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Try to insert - if it fails, provide better error message
  try {
    return await collection.insert(rule);
  } catch (error) {
    // If insert fails, check if collection is actually ready
    if (!hasCallableMethod(collection, 'insert')) {
      const availableMethods = Object.keys(collection).filter(
        key => hasCallableMethod(collection, key)
      );
      throw new Error(
        `Cannot insert into eligibility_rules collection. ` +
        `Collection appears incomplete. Available methods: ${availableMethods.join(', ')}. ` +
        `Original error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    throw error;
  }
}

/**
 * Insert an eligibility rule into the database
 *
 * @param rule Rule data to insert (must include id, createdAt, updatedAt)
 * @returns Created rule document
 */
export async function insertEligibilityRule(
  rule: EligibilityRule
): Promise<RxDocument<EligibilityRule>> {
  const db = getDatabase();

  // Wait for collection to be fully initialized
  const collection = await waitForCollectionReady(db.eligibility_rules, 'eligibility_rules');

  return collection.insert(rule);
}

/**
 * Find a single eligibility rule by selector
 *
 * @param selector Query selector (e.g., { id: 'rule-id' } or { programId: 'program-id' })
 * @returns Found rule document or null if not found
 */
export async function findOneEligibilityRule(
  selector: Record<string, unknown>
): Promise<RxDocument<EligibilityRule> | null> {
  const db = getDatabase();

  // Wait for collection to be fully initialized
  const collection = await waitForCollectionReady(db.eligibility_rules, 'eligibility_rules');

  return collection.findOne({
    selector,
  }).exec();
}

/**
 * Count eligibility rules matching a selector
 *
 * @param selector Optional query selector (defaults to all rules)
 * @returns Number of matching rules
 */
export async function countEligibilityRules(
  selector?: Record<string, unknown>
): Promise<number> {
  const db = getDatabase();

  // Wait for collection to be fully initialized
  const collection = await waitForCollectionReady(db.eligibility_rules, 'eligibility_rules');

  if (selector) {
    const results = await collection.find({
      selector,
    }).exec();
    return results.length;
  }

  return collection.count().exec();
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

  // Verify collections exist and are properly initialized
  const collections = {
    user_profiles: db.user_profiles,
    benefit_programs: db.benefit_programs,
    eligibility_rules: db.eligibility_rules,
    eligibility_results: db.eligibility_results,
  };

  for (const [name, collection] of Object.entries(collections)) {
    // Runtime check: TypeScript types guarantee these exist, but verify at runtime for safety
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Runtime safety check
    if (!collection) {
      throw new Error(`${name} collection is not initialized`);
    }
    if (typeof collection.count !== 'function') {
      throw new Error(`${name} collection does not have count method. Collection may not be fully initialized.`);
    }
  }

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

