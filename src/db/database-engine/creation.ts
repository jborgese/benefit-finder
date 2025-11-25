/** Database creation helpers */
import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { wrappedKeyEncryptionCryptoJsStorage } from 'rxdb/plugins/encryption-crypto-js';
import { collections } from '../collections';
import type { BenefitFinderCollections, BenefitFinderDatabase } from './types';
import { isDevMode, DB_NAME } from './config';
import { destroyDatabase } from './state';

export async function createDatabaseWithConfig(password: string, options: { closeDuplicates?: boolean } = {}): Promise<BenefitFinderDatabase> {
  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] createDatabaseWithConfig: name=${DB_NAME} closeDuplicates=${options.closeDuplicates}`);
  }
  const db = await createRxDatabase<BenefitFinderCollections>({
    name: DB_NAME,
    storage: wrappedValidateAjvStorage({
      storage: wrappedKeyEncryptionCryptoJsStorage({ storage: getRxStorageDexie() })
    }),
    password,
    multiInstance: false,
    eventReduce: true,
    ignoreDuplicate: isDevMode ? !options.closeDuplicates : false,
    closeDuplicates: options.closeDuplicates,
  });
  await db.addCollections(collections);
  return db;
}

export async function handleDuplicateDatabaseError(password: string): Promise<BenefitFinderDatabase> {
  console.warn('Handling duplicate database (DB8)');
  await destroyDatabase(false);
  const db = await createDatabaseWithConfig(password, { closeDuplicates: true });
  return db;
}
