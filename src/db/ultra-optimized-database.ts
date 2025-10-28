/**
 * Ultra-Optimized Database Configuration
 *
 * Minimal RxDB setup with only essential plugins for maximum performance.
 * Removes all non-essential features to minimize bundle size.
 */

import {
  createRxDatabase,
  addRxPlugin,
  RxDatabase,
  RxCollection,
} from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { wrappedKeyEncryptionCryptoJsStorage } from 'rxdb/plugins/encryption-crypto-js';

import { collections } from '../db/collections';
import type {
  AppSetting,
  UserProfileDocument,
  BenefitProgramDocument,
  EligibilityRuleDocument,
  EligibilityResultDocument,
} from '../db/schemas';

/**
 * Ultra-optimized database configuration
 */
let database: BenefitFinderDatabase | null = null;

/**
 * Initialize the ultra-optimized RxDB database
 */
export async function initializeUltraOptimizedDatabase(
  encryptionPassword?: string
): Promise<BenefitFinderDatabase> {
  if (database) {
    return database;
  }

  console.log('🚀 [ULTRA-OPTIMIZED DB] Initializing ultra-optimized database...');

  // Add only absolutely essential plugins
  addRxPlugin(RxDBQueryBuilderPlugin);
  addRxPlugin(RxDBUpdatePlugin);

  // Skip development plugins entirely for production builds
  if (import.meta.env.DEV) {
    try {
      const { RxDBDevModePlugin } = await import('rxdb/plugins/dev-mode');
      addRxPlugin(RxDBDevModePlugin);
    } catch (error) {
      console.warn('Dev mode plugin not available:', error);
    }
  }

  // Create database with ultra-optimized configuration
  const db = await createRxDatabase({
    name: 'benefitfinder_ultra_optimized',
    storage: wrappedKeyEncryptionCryptoJsStorage({
      storage: wrappedValidateAjvStorage({
        storage: getRxStorageDexie(),
      }),
      password: encryptionPassword ?? getDefaultEncryptionPassword(),
    }),
    // Ultra-optimized settings
    multiInstance: false, // Single instance for better performance
    eventBus: {
      // Minimal event bus configuration
      eventBusOptions: {
        maxAge: 500, // Reduced from 1000
        maxEvents: 50, // Reduced from 100
      },
    },
    // Disable non-essential features
    ignoreDuplicate: true,
    cleanupPolicy: {
      minimumDeletedTime: 1000 * 60 * 60 * 24, // 24 hours
      minimumCollectionAge: 1000 * 60 * 60 * 24, // 24 hours
      runEach: 1000 * 60 * 60, // 1 hour
    },
  });

  // Add collections
  await db.addCollections(collections);

  database = db as BenefitFinderDatabase;

  console.log('✅ [ULTRA-OPTIMIZED DB] Database initialized successfully');
  return database;
}

/**
 * Get the current database instance
 */
export function getUltraOptimizedDatabase(): BenefitFinderDatabase | null {
  return database;
}

/**
 * Check if database is initialized
 */
export function isUltraOptimizedDatabaseInitialized(): boolean {
  return database !== null;
}

/**
 * Destroy the database instance
 */
export async function destroyUltraOptimizedDatabase(): Promise<void> {
  if (database) {
    await database.destroy();
    database = null;
    console.log('🗑️ [ULTRA-OPTIMIZED DB] Database destroyed');
  }
}

/**
 * Clear all data from the database
 */
export async function clearUltraOptimizedDatabase(): Promise<void> {
  if (database) {
    await database.remove();
    database = null;
    console.log('🧹 [ULTRA-OPTIMIZED DB] Database cleared');
  }
}

/**
 * Get default encryption password
 */
function getDefaultEncryptionPassword(): string {
  const storageKey = 'bf_encryption_key';
  let key = localStorage.getItem(storageKey);

  if (!key) {
    // Generate a new random key (64 characters for strong entropy)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    key = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(storageKey, key);
  }

  return key;
}

/**
 * Database type definition
 */
export type BenefitFinderDatabase = RxDatabase<{
  user_profiles: RxCollection<UserProfileDocument>;
  benefit_programs: RxCollection<BenefitProgramDocument>;
  eligibility_rules: RxCollection<EligibilityRuleDocument>;
  eligibility_results: RxCollection<EligibilityResultDocument>;
  app_settings: RxCollection<AppSetting>;
}>;

// Export ultra-optimized functions as default
export {
  initializeUltraOptimizedDatabase as initializeDatabase,
  getUltraOptimizedDatabase as getDatabase,
  destroyUltraOptimizedDatabase as destroyDatabase,
  isUltraOptimizedDatabaseInitialized as isDatabaseInitialized,
  clearUltraOptimizedDatabase as clearDatabase,
};
