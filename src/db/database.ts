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
import { RxDBDevModePlugin, disableWarnings } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration-schema';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { wrappedKeyEncryptionCryptoJsStorage } from 'rxdb/plugins/encryption-crypto-js';

import { collections } from './collections';
import type {
  UserProfile,
  BenefitProgram,
  EligibilityRule,
  EligibilityResult,
  AppSetting,
  UserProfileDocument,
  BenefitProgramDocument,
  EligibilityRuleDocument,
  EligibilityResultDocument,
} from './schemas';

/**
 * Extended Window interface for development utilities
 */
interface WindowWithDevUtils extends Window {
  clearBenefitFinderDatabase?: () => Promise<void>;
}

// Add RxDB plugins
// Note: Encryption is handled by wrappedKeyEncryptionCryptoJsStorage wrapper
// which is configured when creating the database with a password
if (import.meta.env.DEV) {
  addRxPlugin(RxDBDevModePlugin);
  // Disable verbose dev-mode warnings to keep console clean
  // The plugin will still perform validation checks
  disableWarnings();
}
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBMigrationPlugin);

/**
 * Extended collection types with custom statics
 */
export interface UserProfilesCollection extends RxCollection<UserProfile> {
  findLatest: () => Promise<UserProfileDocument | null>;
}

export interface BenefitProgramsCollection extends RxCollection<BenefitProgram> {
  findActivePrograms: () => Promise<BenefitProgramDocument[]>;
  findProgramsByJurisdiction: (jurisdiction: string) => Promise<BenefitProgramDocument[]>;
  findProgramsByCategory: (category: string) => Promise<BenefitProgramDocument[]>;
}

export interface EligibilityRulesCollection extends RxCollection<EligibilityRule> {
  findRulesByProgram: (programId: string) => Promise<EligibilityRuleDocument[]>;
}

export interface EligibilityResultsCollection extends RxCollection<EligibilityResult> {
  findResultsByUserProfile: (userProfileId: string) => Promise<EligibilityResultDocument[]>;
  findValidResultsByUser: (userProfileId: string) => Promise<EligibilityResultDocument[]>;
  clearExpired: () => Promise<number>;
}

export interface AppSettingsCollection extends RxCollection<AppSetting> {
  findSettingByKey: (key: string) => Promise<unknown>;
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
 * Register development utilities on window object
 */
function registerDevUtilities(): void {
  if (import.meta.env.DEV) {
    (window as WindowWithDevUtils).clearBenefitFinderDatabase = clearDatabase;
  }
}

/**
 * Create database with given configuration
 */
async function createDatabaseWithConfig(
  encryptionPassword: string,
  options: { closeDuplicates?: boolean } = {}
): Promise<BenefitFinderDatabase> {
  const db = await createRxDatabase<BenefitFinderCollections>({
    name: DB_NAME,
    storage: wrappedValidateAjvStorage({
      storage: wrappedKeyEncryptionCryptoJsStorage({
        storage: getRxStorageDexie(),
      }),
    }),
    password: encryptionPassword,
    multiInstance: false,
    eventReduce: true,
    ignoreDuplicate: !options.closeDuplicates,
    closeDuplicates: options.closeDuplicates,
    cleanupPolicy: {
      minimumDeletedTime: 1000 * 60 * 60 * 24 * 7, // 7 days
      minimumCollectionAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      runEach: 1000 * 60 * 5, // Run every 5 minutes
      awaitReplicationsInSync: false,
      waitForLeadership: false,
    },
  });

  await db.addCollections(collections);
  return db;
}

/**
 * Handle duplicate database error (DB8)
 */
async function handleDuplicateDatabaseError(
  encryptionPassword: string
): Promise<BenefitFinderDatabase> {
  console.warn('Attempting to close duplicate database instances...');

  // Force close any existing instances
  await destroyDatabase(false);

  // Try again with closeDuplicates
  const db = await createDatabaseWithConfig(encryptionPassword, { closeDuplicates: true });

  if (import.meta.env.DEV) {
    console.warn('RxDB initialized successfully after closing duplicates');
  }

  return db;
}

/**
 * Handle encryption key mismatch error (DB1)
 */
async function handleEncryptionKeyMismatch(): Promise<BenefitFinderDatabase> {
  console.warn('Encryption key mismatch detected, clearing database and retrying...');

  // First, destroy any existing database instance completely
  if (dbInstance) {
    try {
      await dbInstance.destroy();
    } catch (error) {
      console.warn('Error destroying existing database instance:', error);
    }
    dbInstance = null;
  }

  // Clear all database data completely
  await clearDatabase();

  // Add a small delay to ensure all cleanup is complete
  await new Promise(resolve => setTimeout(resolve, 100));

  // Use a fresh encryption key by clearing the stored key first
  const storageKey = 'bf_encryption_key';
  localStorage.removeItem(storageKey);

  // Generate a completely new encryption key
  const newEncryptionPassword = getDefaultEncryptionPassword();

  // Create new database with fresh key
  const db = await createDatabaseWithConfig(newEncryptionPassword);

  if (import.meta.env.DEV) {
    console.warn('RxDB initialized successfully with new encryption key');
  }

  return db;
}

/**
 * Handle database initialization errors
 */
async function handleDatabaseError(
  error: unknown,
  encryptionPassword: string
): Promise<BenefitFinderDatabase> {
  if (error && typeof error === 'object' && 'code' in error) {
    const errorCode = error.code as string;

    if (errorCode === 'DB8') {
      try {
        return await handleDuplicateDatabaseError(encryptionPassword);
      } catch (retryError) {
        console.error('Failed to initialize RxDB after retry:', retryError);
        throw new Error(`Database initialization failed: ${retryError}`);
      }
    } else if (errorCode === 'DB1') {
      try {
        return await handleEncryptionKeyMismatch();
      } catch (retryError) {
        console.error('Failed to initialize RxDB after encryption key reset:', retryError);
        throw new Error(`Database initialization failed: ${retryError}`);
      }
    }
  }

  throw new Error(`Database initialization failed: ${error}`);
}

/**
 * Initialize RxDB database with encryption
 *
 * @param passphrase Optional user passphrase for encryption
 *                   If not provided, uses a randomly generated key
 * @param forceReinit Force reinitialization even if instance exists
 * @returns Initialized database instance
 *
 * @example
 * ```typescript
 * // With user passphrase
 * const db = await initializeDatabase('my-secure-passphrase');
 *
 * // With auto-generated key
 * const db = await initializeDatabase();
 *
 * // Force reinitialization
 * const db = await initializeDatabase(undefined, true);
 * ```
 */
export async function initializeDatabase(
  passphrase?: string,
  forceReinit: boolean = false
): Promise<BenefitFinderDatabase> {
  // Return existing instance if already initialized and not forcing reinit
  if (dbInstance && !forceReinit) {
    return dbInstance;
  }

  // If forcing reinit, clear existing instance first
  if (forceReinit && dbInstance) {
    try {
      await dbInstance.destroy();
    } catch (error) {
      console.warn('Error destroying existing instance during force reinit:', error);
    }
    dbInstance = null;
  }

  // Use provided passphrase or generate a default key
  const encryptionPassword = passphrase
    ? convertToRxDBPassword(passphrase)
    : getDefaultEncryptionPassword();

  try {
    // Create RxDB database with Dexie storage, encryption, and AJV validation
    const db = await createDatabaseWithConfig(encryptionPassword);

    // Store instance
    dbInstance = db;

    if (import.meta.env.DEV) {
      console.warn('RxDB initialized successfully with encryption');
      registerDevUtilities();
    }

    return db;
  } catch (error) {
    console.error('Failed to initialize RxDB:', error);

    // Handle specific RxDB errors and retry
    const db = await handleDatabaseError(error, encryptionPassword);
    dbInstance = db;
    registerDevUtilities();
    return db;
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

    if (import.meta.env.DEV) {
      console.warn('Database destroyed successfully');
    }
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
 * Clear all database data and reset
 * This is useful for development and testing
 *
 * @returns Promise that resolves when database is cleared
 */
export async function clearDatabase(): Promise<void> {
  // First, properly destroy the database instance if it exists
  if (dbInstance) {
    try {
      await dbInstance.destroy();
    } catch (error) {
      console.warn('Error destroying database instance during clear:', error);
    }
    dbInstance = null;
  }

  // Clear any remaining localStorage data
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('bf_') || key.includes('benefitfinder')) {
      localStorage.removeItem(key);
    }
  });

  // Clear IndexedDB completely
  try {
    // Delete the entire IndexedDB database
    const deleteReq = indexedDB.deleteDatabase(DB_NAME);
    await new Promise<void>((resolve, reject) => {
      deleteReq.onsuccess = () => resolve();
      deleteReq.onerror = () => reject(deleteReq.error);
      deleteReq.onblocked = () => {
        console.warn('Database deletion blocked, trying again...');
        setTimeout(() => {
          indexedDB.deleteDatabase(DB_NAME);
          resolve();
        }, 100);
      };
    });

    // Also try to delete any Dexie-related databases
    const dexieDeleteReq = indexedDB.deleteDatabase('DexieDB');
    await new Promise<void>((resolve, _reject) => {
      dexieDeleteReq.onsuccess = () => resolve();
      dexieDeleteReq.onerror = () => resolve(); // Ignore errors for Dexie cleanup
      dexieDeleteReq.onblocked = () => resolve(); // Ignore blocked for Dexie cleanup
    });

  } catch (error) {
    console.warn('Error clearing IndexedDB:', error);
  }

  // Reset instance (should already be null, but ensure it)
  dbInstance = null;

  if (import.meta.env.DEV) {
    console.warn('Database cleared successfully');
    registerDevUtilities();
  }
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
  const collectionEntries = Object.keys(collections) as Array<keyof BenefitFinderCollections>;
  for (const collectionName of collectionEntries) {
    // Safe: collectionName is type-checked as keyof BenefitFinderCollections
    // eslint-disable-next-line security/detect-object-injection
    const collection = db[collectionName];
    const docs = await collection.find().exec();
    const collectionKey = collectionName as string;
    // Safe: collectionKey is derived from typed collection name
    // eslint-disable-next-line security/detect-object-injection
    exportData.collections[collectionKey] = docs.map((doc) => doc.toJSON());
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
    // Check if collection exists in database
    if (!(collectionName in db)) {
      console.warn(`Collection ${collectionName} not found, skipping...`);
      continue;
    }

    const collection = db[collectionName as keyof BenefitFinderCollections];

    // Bulk insert documents
    // Note: RxDB's bulkInsert accepts documents as plain objects
    // Type assertion needed as we're importing generic data that matches collection schema
    await collection.bulkInsert(docs as never);
  }

  if (import.meta.env.DEV) {
    console.warn('Database import completed successfully');
  }
}

