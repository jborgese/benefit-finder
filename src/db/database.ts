/**
 * RxDB Database Initialization
 *
 * Creates and configures the RxDB database with encryption.
 * Implements privacy-first, offline-first architecture.
 */

import {
  createRxDatabase,
  addRxPlugin,
  RxDatabase,
  RxCollection,
} from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration-schema';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

import { collections } from './collections';
import type {
  UserProfile,
  BenefitProgram,
  EligibilityRule,
  EligibilityResult,
  AppSetting,
} from './schemas';

// Add RxDB plugins
// Note: Encryption is built into RxDB and enabled via the 'password' parameter
// No separate encryption plugin is needed
if (import.meta.env.DEV) {
  addRxPlugin(RxDBDevModePlugin);
}
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBMigrationPlugin);

/**
 * Extended collection types with custom statics
 */
export interface UserProfilesCollection extends RxCollection<UserProfile> {
  getLatest: () => Promise<UserProfile | null>;
}

export interface BenefitProgramsCollection extends RxCollection<BenefitProgram> {
  getActivePrograms: () => Promise<BenefitProgram[]>;
  getByJurisdiction: (jurisdiction: string) => Promise<BenefitProgram[]>;
  getByCategory: (category: string) => Promise<BenefitProgram[]>;
}

export interface EligibilityRulesCollection extends RxCollection<EligibilityRule> {
  getByProgram: (programId: string) => Promise<EligibilityRule[]>;
}

export interface EligibilityResultsCollection extends RxCollection<EligibilityResult> {
  getByUserProfile: (userProfileId: string) => Promise<EligibilityResult[]>;
  getValidResults: (userProfileId: string) => Promise<EligibilityResult[]>;
  clearExpired: () => Promise<number>;
}

export interface AppSettingsCollection extends RxCollection<AppSetting> {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown, encrypted?: boolean) => Promise<void>;
}

/**
 * Database Collections Type Definition
 */
export interface BenefitFinderCollections {
  user_profiles: UserProfilesCollection;
  benefit_programs: BenefitProgramsCollection;
  eligibility_rules: EligibilityRulesCollection;
  eligibility_results: EligibilityResultsCollection;
  app_settings: AppSettingsCollection;
}

/**
 * Main Database Type
 */
export type BenefitFinderDatabase = RxDatabase<BenefitFinderCollections>;

/**
 * Global database instance
 */
let dbInstance: BenefitFinderDatabase | null = null;

/**
 * Database configuration
 */
const DB_NAME = 'benefitfinder';
const DB_VERSION = 1;

/**
 * Default encryption password for auto-generated keys
 *
 * This is used when the user doesn't provide a passphrase.
 * The key is randomly generated and stored in localStorage.
 *
 * @returns Encryption password for the database
 */
function getDefaultEncryptionPassword(): string {
  const storageKey = 'bf_encryption_key';

  // Check if key exists in localStorage
  let key = localStorage.getItem(storageKey);

  if (!key) {
    // Generate a new random key (64 characters for strong entropy)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    key = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');

    // Store the key
    localStorage.setItem(storageKey, key);
  }

  return key;
}

/**
 * Convert CryptoKey to password string for RxDB
 *
 * RxDB requires a password string, but we use CryptoKey internally.
 * This function extracts a deterministic string from the key material.
 *
 * Note: This is a workaround since RxDB's encryption plugin expects
 * a password string rather than a CryptoKey.
 *
 * @param passphrase Original passphrase (used directly as RxDB password)
 * @returns Password string for RxDB
 */
function convertToRxDBPassword(passphrase: string): string {
  // RxDB will internally derive a key from this password
  // We use the passphrase directly since RxDB handles key derivation
  return passphrase;
}

/**
 * Initialize RxDB database with encryption
 *
 * @param passphrase Optional user passphrase for encryption
 *                   If not provided, uses a randomly generated key
 * @returns Initialized database instance
 *
 * @example
 * ```typescript
 * // With user passphrase
 * const db = await initializeDatabase('my-secure-passphrase');
 *
 * // With auto-generated key
 * const db = await initializeDatabase();
 * ```
 */
export async function initializeDatabase(
  passphrase?: string
): Promise<BenefitFinderDatabase> {
  // Return existing instance if already initialized
  if (dbInstance) {
    return dbInstance;
  }

  // Use provided passphrase or generate a default key
  const encryptionPassword = passphrase
    ? convertToRxDBPassword(passphrase)
    : getDefaultEncryptionPassword();

  try {
    // Create RxDB database with Dexie storage and AJV validation
    const db = await createRxDatabase<BenefitFinderCollections>({
      name: DB_NAME,
      storage: wrappedValidateAjvStorage({
        storage: getRxStorageDexie(),
      }),
      password: encryptionPassword,
      multiInstance: false, // Disable multi-tab support for better performance
      eventReduce: true, // Enable event reduce for better performance
      cleanupPolicy: {
        // Automatic cleanup configuration
        minimumDeletedTime: 1000 * 60 * 60 * 24 * 7, // 7 days
        minimumCollectionAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        runEach: 1000 * 60 * 5, // Run every 5 minutes
        awaitReplicationsInSync: false,
        waitForLeadership: false,
      },
    });

    // Add collections to the database
    await db.addCollections(collections);

    // Store instance
    dbInstance = db;

    console.log('RxDB initialized successfully with encryption');

    return db;
  } catch (error) {
    console.error('Failed to initialize RxDB:', error);
    throw new Error(`Database initialization failed: ${error}`);
  }
}

/**
 * Get the current database instance
 *
 * @throws Error if database is not initialized
 * @returns Database instance
 */
export function getDatabase(): BenefitFinderDatabase {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }

  return dbInstance;
}

/**
 * Destroy the database and remove all data
 *
 * This will permanently delete all local data.
 * Use with caution!
 *
 * @param clearEncryptionKey Whether to clear the stored encryption key
 * @returns Promise that resolves when database is destroyed
 */
export async function destroyDatabase(
  clearEncryptionKey: boolean = true
): Promise<void> {
  if (!dbInstance) {
    return;
  }

  try {
    await dbInstance.remove();
    dbInstance = null;

    // Optionally clear encryption key
    if (clearEncryptionKey) {
      localStorage.removeItem('bf_encryption_key');
    }

    console.log('Database destroyed successfully');
  } catch (error) {
    console.error('Failed to destroy database:', error);
    throw new Error(`Database destruction failed: ${error}`);
  }
}

/**
 * Check if database is initialized
 *
 * @returns True if database is initialized
 */
export function isDatabaseInitialized(): boolean {
  return dbInstance !== null;
}

/**
 * Export database for backup
 *
 * Exports all collections to JSON format.
 * The export is NOT encrypted and should be handled securely.
 *
 * @returns Database export as JSON
 */
export async function exportDatabase(): Promise<Record<string, unknown>> {
  const db = getDatabase();

  const exportData = {
    version: DB_VERSION,
    timestamp: Date.now(),
    collections: {} as Record<string, unknown>,
  };

  // Export each collection
  for (const collectionName of Object.keys(collections)) {
    const collection = db[collectionName as keyof BenefitFinderCollections];
    const docs = await collection.find().exec();
    exportData.collections[collectionName] = docs.map((doc) => doc.toJSON());
  }

  return exportData;
}

/**
 * Import database from backup
 *
 * Imports data into collections. This will NOT delete existing data,
 * but may update documents with matching IDs.
 *
 * @param data Database export data
 */
export async function importDatabase(
  data: Record<string, unknown>
): Promise<void> {
  const db = getDatabase();

  if (!data.collections || typeof data.collections !== 'object') {
    throw new Error('Invalid import data format');
  }

  const collections = data.collections as Record<string, unknown[]>;

  // Import each collection
  for (const [collectionName, docs] of Object.entries(collections)) {
    const collection = db[collectionName as keyof BenefitFinderCollections];

    if (!collection) {
      console.warn(`Collection ${collectionName} not found, skipping...`);
      continue;
    }

    // Bulk insert documents
    await collection.bulkInsert(docs as any[]);
  }

  console.log('Database import completed successfully');
}

