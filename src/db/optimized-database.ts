/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Optimized Database Configuration
 *
 * Streamlined RxDB setup with minimal plugins for better performance.
 * Removes unnecessary plugins and optimizes bundle size.
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

import { collections } from './collections';
import type {
  AppSetting,
  UserProfileDocument,
  BenefitProgramDocument,
  EligibilityRuleDocument,
  EligibilityResultDocument,
} from './schemas';

/**
 * Optimized database configuration with minimal plugins
 */
let database: BenefitFinderDatabase | null = null;

/**
 * Initialize the optimized RxDB database
 */
export async function initializeOptimizedDatabase(
  encryptionPassword?: string
): Promise<BenefitFinderDatabase> {
  if (database) {
    return database;
  }

  console.log('🔧 [OPTIMIZED DB] Initializing optimized database...');

  // Add only essential plugins for production
  addRxPlugin(RxDBQueryBuilderPlugin);
  addRxPlugin(RxDBUpdatePlugin);

  // Add development plugins only in dev mode
  if (import.meta.env.DEV) {
    const { RxDBDevModePlugin } = await import('rxdb/plugins/dev-mode');
    addRxPlugin(RxDBDevModePlugin);
  }

  // Create database with optimized configuration
  const db = await createRxDatabase(({
    name: 'benefitfinder_optimized',
    storage: wrappedKeyEncryptionCryptoJsStorage(({
      storage: wrappedValidateAjvStorage({
        storage: getRxStorageDexie(),
      }),
      password: encryptionPassword ?? getDefaultEncryptionPassword(),
    } as any)),
    // Optimized settings
    multiInstance: false, // Single instance for better performance
    eventBus: {
      // Minimal event bus configuration
      eventBusOptions: {
        maxAge: 1000,
        maxEvents: 100,
      },
    },
  } as any));

  // Add collections
  await (db as any).addCollections(collections);

  // Narrow the runtime db to our application type via unknown-cast to avoid structural type noise
  database = db as unknown as BenefitFinderDatabase;

  console.log('✅ [OPTIMIZED DB] Database initialized successfully');
  return database;
}

/**
 * Get the current database instance
 */
export function getOptimizedDatabase(): BenefitFinderDatabase | null {
  return database;
}

/**
 * Check if database is initialized
 */
export function isOptimizedDatabaseInitialized(): boolean {
  return database !== null;
}

/**
 * Destroy the database instance
 */
export async function destroyOptimizedDatabase(): Promise<void> {
  if (database) {
    await (database as any).destroy();
    database = null;
    console.log('🗑️ [OPTIMIZED DB] Database destroyed');
  }
}

/**
 * Clear all data from the database
 */
export async function clearOptimizedDatabase(): Promise<void> {
  if (database) {
    await (database as any).remove();
    database = null;
    console.log('🧹 [OPTIMIZED DB] Database cleared');
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

// Export optimized functions as default
export {
  initializeOptimizedDatabase as initializeDatabase,
  getOptimizedDatabase as getDatabase,
  destroyOptimizedDatabase as destroyDatabase,
  isOptimizedDatabaseInitialized as isDatabaseInitialized,
  clearOptimizedDatabase as clearDatabase,
};
