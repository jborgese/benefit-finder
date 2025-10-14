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
  inspectBenefitFinderStorage?: () => Promise<void>;
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

  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] getDefaultEncryptionPassword: Looking for key in localStorage with key "${storageKey}"`);
    console.warn(`[DEBUG] getDefaultEncryptionPassword: Found key: ${key ? 'YES' : 'NO'}`);
    if (key) {
      console.warn(`[DEBUG] getDefaultEncryptionPassword: Key length: ${key.length}, first 8 chars: ${key.substring(0, 8)}...`);
    }
  }

  if (!key) {
    // Generate a new random key (64 characters for strong entropy)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    key = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');

    // Store the key
    localStorage.setItem(storageKey, key);

    if (import.meta.env.DEV) {
      console.warn(`[DEBUG] getDefaultEncryptionPassword: Generated new key with length ${key.length}, first 8 chars: ${key.substring(0, 8)}...`);
    }
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
 * Debug utility to inspect current storage state
 */
async function inspectStorageState(): Promise<void> {
  if (!import.meta.env.DEV) return;

  console.warn('=== STORAGE STATE INSPECTION ===');

  // Check localStorage
  console.warn('localStorage contents:');
  const localStorageKeys = Object.keys(localStorage);
  localStorageKeys.forEach(key => {
    if (key.startsWith('bf_') || key.includes('benefitfinder')) {
      const value = localStorage.getItem(key);
      console.warn(`  ${key}: ${value ? `${value.substring(0, 50)}...` : 'null'}`);
    }
  });

  // Check IndexedDB
  console.warn('IndexedDB databases:');
  try {
    const databases = await indexedDB.databases();
    databases.forEach(db => {
      console.warn(`  ${db.name} (version: ${db.version})`);
    });
  } catch (error) {
    console.warn('  Could not list databases:', error);
  }

  // Check current database instance
  console.warn(`Current dbInstance: ${dbInstance ? 'EXISTS' : 'NULL'}`);

  console.warn('=== END STORAGE STATE INSPECTION ===');
}

/**
 * Register development utilities on window object
 */
function registerDevUtilities(): void {
  if (import.meta.env.DEV) {
    (window as WindowWithDevUtils).clearBenefitFinderDatabase = clearDatabase;

    // Add inspection utility to window for debugging
    (window as WindowWithDevUtils).inspectBenefitFinderStorage = inspectStorageState;

    console.warn('[DEBUG] Development utilities registered:');
    console.warn('  - window.clearBenefitFinderDatabase() - Clear database');
    console.warn('  - window.inspectBenefitFinderStorage() - Inspect storage state');
  }
}

/**
 * Create database with given configuration
 */
async function createDatabaseWithConfig(
  encryptionPassword: string,
  options: { closeDuplicates?: boolean } = {}
): Promise<BenefitFinderDatabase> {
  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] createDatabaseWithConfig: Creating database with name "${DB_NAME}"`);
    console.warn(`[DEBUG] createDatabaseWithConfig: Password length: ${encryptionPassword.length}, first 8 chars: ${encryptionPassword.substring(0, 8)}...`);
    console.warn(`[DEBUG] createDatabaseWithConfig: Options:`, options);
  }

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

  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] createDatabaseWithConfig: Database created successfully, adding collections...`);
  }

  await db.addCollections(collections);

  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] createDatabaseWithConfig: Collections added successfully`);
  }

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
 * Log encryption key mismatch debug info
 */
async function logEncryptionMismatchDebug(): Promise<void> {
  if (!import.meta.env.DEV) return;

  console.warn(`[DEBUG] handleEncryptionKeyMismatch: Starting encryption key mismatch recovery`);
  console.warn(`[DEBUG] handleEncryptionKeyMismatch: Current dbInstance exists: ${dbInstance !== null}`);

  const storageKey = 'bf_encryption_key';
  const currentKey = localStorage.getItem(storageKey);
  console.warn(`[DEBUG] handleEncryptionKeyMismatch: Current key in localStorage: ${currentKey ? 'EXISTS' : 'NOT FOUND'}`);

  if (currentKey) {
    console.warn(`[DEBUG] handleEncryptionKeyMismatch: Current key length: ${currentKey.length}, first 8 chars: ${currentKey.substring(0, 8)}...`);
  }

  try {
    const databases = await indexedDB.databases();
    console.warn(`[DEBUG] handleEncryptionKeyMismatch: Current IndexedDB databases:`, databases.map(db => ({ name: db.name, version: db.version })));
  } catch (error) {
    console.warn(`[DEBUG] handleEncryptionKeyMismatch: Could not list IndexedDB databases:`, error);
  }
}

/**
 * Handle encryption key mismatch error (DB1)
 */
async function handleEncryptionKeyMismatch(): Promise<BenefitFinderDatabase> {
  console.warn('Encryption key mismatch detected, clearing database and retrying...');
  await logEncryptionMismatchDebug();

  // First, destroy any existing database instance completely
  if (dbInstance) {
    try {
      if (import.meta.env.DEV) {
        console.warn(`[DEBUG] handleEncryptionKeyMismatch: Destroying existing database instance`);
      }
      await dbInstance.remove();
    } catch (error) {
      console.warn('Error destroying existing database instance:', error);
    }
    dbInstance = null;
  }

  await clearDatabase();
  await new Promise(resolve => setTimeout(resolve, 500));

  const storageKey = 'bf_encryption_key';
  localStorage.removeItem(storageKey);

  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] handleEncryptionKeyMismatch: Cleared encryption key from localStorage`);
  }

  const newEncryptionPassword = getDefaultEncryptionPassword();

  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] handleEncryptionKeyMismatch: Generated new encryption password, length: ${newEncryptionPassword.length}, first 8 chars: ${newEncryptionPassword.substring(0, 8)}...`);
  }

  const timestamp = Date.now();
  const newDbName = `${DB_NAME}_${timestamp}`;

  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] handleEncryptionKeyMismatch: Creating new database with name: ${newDbName}`);
  }

  const db = await createRxDatabase<BenefitFinderCollections>({
    name: newDbName,
    storage: wrappedValidateAjvStorage({
      storage: wrappedKeyEncryptionCryptoJsStorage({
        storage: getRxStorageDexie(),
      }),
    }),
    password: newEncryptionPassword,
    multiInstance: false,
    eventReduce: true,
    ignoreDuplicate: true,
    closeDuplicates: false,
    cleanupPolicy: {
      minimumDeletedTime: 1000 * 60 * 60 * 24 * 7, // 7 days
      minimumCollectionAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      runEach: 1000 * 60 * 5, // Run every 5 minutes
      awaitReplicationsInSync: false,
      waitForLeadership: false,
    },
  });

  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] handleEncryptionKeyMismatch: Database created successfully, adding collections...`);
  }

  await db.addCollections(collections);

  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] handleEncryptionKeyMismatch: RxDB initialized successfully with new encryption key and database name: ${newDbName}`);
  }

  return db;
}

/**
 * Log database error debug info
 */
function logDatabaseErrorDebug(error: unknown): void {
  if (!import.meta.env.DEV) return;

  console.warn(`[DEBUG] handleDatabaseError: Handling database error`);
  console.warn(`[DEBUG] handleDatabaseError: Error object:`, error);

  if (error && typeof error === 'object' && 'code' in error) {
    console.warn(`[DEBUG] handleDatabaseError: Error code: ${error.code}`);
  }
}

/**
 * Handle database initialization errors
 */
async function handleDatabaseError(
  error: unknown,
  encryptionPassword: string
): Promise<BenefitFinderDatabase> {
  logDatabaseErrorDebug(error);

  if (!(error && typeof error === 'object' && 'code' in error)) {
    if (import.meta.env.DEV) {
      console.warn(`[DEBUG] handleDatabaseError: Unhandled error, throwing`);
    }
    throw new Error(`Database initialization failed: ${error}`);
  }

  const errorCode = error.code as string;

  if (errorCode === 'DB8') {
    if (import.meta.env.DEV) {
      console.warn(`[DEBUG] handleDatabaseError: Handling DB8 error (duplicate database)`);
    }
    try {
      return await handleDuplicateDatabaseError(encryptionPassword);
    } catch (retryError) {
      console.error('[DEBUG] handleDatabaseError: Failed to initialize RxDB after retry:', retryError);
      throw new Error(`Database initialization failed: ${retryError}`);
    }
  }

  if (errorCode === 'DB1') {
    if (import.meta.env.DEV) {
      console.warn(`[DEBUG] handleDatabaseError: Handling DB1 error (encryption key mismatch)`);
    }
    try {
      return await handleEncryptionKeyMismatch();
    } catch (retryError) {
      console.error('[DEBUG] handleDatabaseError: Failed to initialize RxDB after encryption key reset:', retryError);
      throw new Error(`Database initialization failed: ${retryError}`);
    }
  }

  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] handleDatabaseError: Unhandled error, throwing`);
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
/**
 * Log database initialization debug info
 */
function logInitDebug(passphrase: string | undefined, forceReinit: boolean): void {
  if (!import.meta.env.DEV) return;

  console.warn(`[DEBUG] initializeDatabase: Starting initialization`);
  console.warn(`[DEBUG] initializeDatabase: Parameters - passphrase: ${passphrase ? 'PROVIDED' : 'NOT PROVIDED'}, forceReinit: ${forceReinit}`);
  console.warn(`[DEBUG] initializeDatabase: Current dbInstance exists: ${dbInstance !== null}`);
}

export async function initializeDatabase(
  passphrase?: string,
  forceReinit: boolean = false
): Promise<BenefitFinderDatabase> {
  logInitDebug(passphrase, forceReinit);

  if (dbInstance && !forceReinit) {
    if (import.meta.env.DEV) {
      console.warn(`[DEBUG] initializeDatabase: Returning existing database instance`);
    }
    return dbInstance;
  }

  if (forceReinit && dbInstance) {
    try {
      if (import.meta.env.DEV) {
        console.warn(`[DEBUG] initializeDatabase: Force reinit - destroying existing instance`);
      }
      await dbInstance.remove();
    } catch (error) {
      console.warn('Error destroying existing instance during force reinit:', error);
    }
    dbInstance = null;
  }

  const encryptionPassword = passphrase
    ? convertToRxDBPassword(passphrase)
    : getDefaultEncryptionPassword();

  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] initializeDatabase: Using encryption password, length: ${encryptionPassword.length}, first 8 chars: ${encryptionPassword.substring(0, 8)}...`);
  }

  try {
    const db = await createDatabaseWithConfig(encryptionPassword);
    dbInstance = db;

    if (import.meta.env.DEV) {
      console.warn('[DEBUG] initializeDatabase: RxDB initialized successfully with encryption');
      registerDevUtilities();
    }

    return db;
  } catch (error) {
    console.error('[DEBUG] initializeDatabase: Failed to initialize RxDB:', error);
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
 * Log IndexedDB state for debugging
 */
async function logIndexedDBState(when: 'before' | 'after'): Promise<void> {
  if (!import.meta.env.DEV) return;

  try {
    const databases = await indexedDB.databases();
    console.warn(`[DEBUG] clearDatabase: Current IndexedDB databases ${when} clearing:`, databases.map(db => ({ name: db.name, version: db.version })));
  } catch (error) {
    console.warn(`[DEBUG] clearDatabase: Could not list IndexedDB databases ${when} clearing:`, error);
  }
}

/**
 * Delete a single IndexedDB database
 */
async function deleteIndexedDB(dbName: string): Promise<'success' | 'error' | 'blocked'> {
  try {
    if (import.meta.env.DEV) {
      console.warn(`[DEBUG] clearDatabase: Attempting to delete database: ${dbName}`);
    }

    const req = indexedDB.deleteDatabase(dbName);
    return await new Promise<'success' | 'error' | 'blocked'>((resolve) => {
      req.onsuccess = () => resolve('success');
      req.onerror = () => resolve('error');
      req.onblocked = () => resolve('blocked');
    });
  } catch {
    return 'error';
  }
}

/**
 * Clear all IndexedDB databases
 */
async function clearAllIndexedDBs(): Promise<void> {
  await logIndexedDBState('before');

  const databasesToDelete = [
    DB_NAME, 'DexieDB', 'rxdb-benefitfinder', 'benefitfinder',
    'benefitfinder_encrypted', 'rxdb', 'dexie'
  ];

  const deletionResults: { [key: string]: 'success' | 'error' | 'blocked' } = {};

  for (const dbName of databasesToDelete) {
    // eslint-disable-next-line security/detect-object-injection -- dbName is from predefined array
    deletionResults[dbName] = await deleteIndexedDB(dbName);
  }

  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] clearDatabase: Database deletion results:`, deletionResults);
  }

  await new Promise(resolve => setTimeout(resolve, 100));
  await logIndexedDBState('after');
}

/**
 * Clear localStorage data
 */
function clearLocalStorage(): void {
  const keys = Object.keys(localStorage);
  const clearedKeys: string[] = [];

  keys.forEach(key => {
    if (key.startsWith('bf_') || key.includes('benefitfinder')) {
      localStorage.removeItem(key);
      clearedKeys.push(key);
    }
  });

  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] clearDatabase: Cleared localStorage keys:`, clearedKeys);
  }
}

/**
 * Clear all database data and reset
 * This is useful for development and testing
 *
 * @returns Promise that resolves when database is cleared
 */
export async function clearDatabase(): Promise<void> {
  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] clearDatabase: Starting database cleanup`);
    console.warn(`[DEBUG] clearDatabase: Current dbInstance exists: ${dbInstance !== null}`);
  }

  if (dbInstance) {
    try {
      if (import.meta.env.DEV) {
        console.warn(`[DEBUG] clearDatabase: Destroying database instance`);
      }
      await dbInstance.remove();
    } catch (error) {
      console.warn('Error destroying database instance during clear:', error);
    }
    dbInstance = null;
  }

  clearLocalStorage();

  try {
    await clearAllIndexedDBs();
  } catch (error) {
    console.warn('Error clearing IndexedDB:', error);
  }

  dbInstance = null;

  if (import.meta.env.DEV) {
    console.warn('[DEBUG] clearDatabase: Database cleared successfully');
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

