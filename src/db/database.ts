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
import { RxDBEncryptionPlugin } from 'rxdb/plugins/encryption';
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
if (import.meta.env.DEV) {
  addRxPlugin(RxDBDevModePlugin);
}
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBEncryptionPlugin);
addRxPlugin(RxDBMigrationPlugin);

/**
 * Database Collections Type Definition
 */
export interface BenefitFinderCollections {
  user_profiles: RxCollection<UserProfile>;
  benefit_programs: RxCollection<BenefitProgram>;
  eligibility_rules: RxCollection<EligibilityRule>;
  eligibility_results: RxCollection<EligibilityResult>;
  app_settings: RxCollection<AppSetting>;
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
 * Generate or retrieve encryption password
 * 
 * In production, this should be derived from a user passphrase
 * or securely stored. For now, we use a default key.
 * 
 * @returns Encryption password for the database
 */
function getEncryptionPassword(): string {
  const storageKey = 'bf_encryption_key';
  
  // Check if key exists in localStorage
  let key = localStorage.getItem(storageKey);
  
  if (!key) {
    // Generate a new random key (32 characters for AES-256)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    key = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    
    // Store the key (in production, this should be more secure)
    localStorage.setItem(storageKey, key);
  }
  
  return key;
}

/**
 * Initialize RxDB database with encryption
 * 
 * @param password Optional encryption password (uses generated key if not provided)
 * @returns Initialized database instance
 */
export async function initializeDatabase(
  password?: string
): Promise<BenefitFinderDatabase> {
  // Return existing instance if already initialized
  if (dbInstance) {
    return dbInstance;
  }
  
  const encryptionPassword = password || getEncryptionPassword();
  
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
 * @returns Promise that resolves when database is destroyed
 */
export async function destroyDatabase(): Promise<void> {
  if (!dbInstance) {
    return;
  }
  
  try {
    await dbInstance.destroy();
    dbInstance = null;
    
    // Clear encryption key
    localStorage.removeItem('bf_encryption_key');
    
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
  
  const exportData: Record<string, unknown> = {
    version: DB_VERSION,
    timestamp: Date.now(),
    collections: {},
  };
  
  // Export each collection
  for (const collectionName of Object.keys(collections)) {
    const collection = db[collectionName as keyof BenefitFinderCollections];
    const docs = await collection.find().exec();
    exportData.collections = {
      ...exportData.collections,
      [collectionName]: docs.map((doc) => doc.toJSON()),
    };
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
    await collection.bulkInsert(docs);
  }
  
  console.log('Database import completed successfully');
}

