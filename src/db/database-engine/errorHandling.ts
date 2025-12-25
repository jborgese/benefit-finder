/** Error handling & recovery */
import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { wrappedKeyEncryptionCryptoJsStorage } from 'rxdb/plugins/encryption-crypto-js';
import { collections } from '../collections';
import { DB_NAME } from './config';
import { handleDuplicateDatabaseError } from './creation';
import { isDevMode } from './config';
import { getDefaultEncryptionPassword, clearStoredEncryptionKey } from './encryption';
import type { BenefitFinderCollections, BenefitFinderDatabase } from './types';

export async function logEncryptionMismatchDebug(dbInstance: BenefitFinderDatabase | null): Promise<void> {
  if (!import.meta.env.DEV) return;
  console.warn('[DEBUG] Encryption key mismatch recovery start');
  console.warn(`[DEBUG] Existing instance: ${!!dbInstance}`);
  const currentKey = localStorage.getItem('bf_encryption_key');
  console.warn(`[DEBUG] Stored key present: ${!!currentKey}`);
  if (currentKey) console.warn(`[DEBUG] Key length: ${currentKey.length}, first 8: ${currentKey.substring(0,8)}...`);
  try {
    const databases = await indexedDB.databases();
    console.warn('[DEBUG] IndexedDB databases:', databases.map(d => ({ name: d.name, version: d.version })));
  } catch (e) {
    console.warn('[DEBUG] Could not list IndexedDB databases', e);
  }
}

export async function handleEncryptionKeyMismatch(): Promise<BenefitFinderDatabase> {
  console.warn('Encryption key mismatch detected - resetting');
  await logEncryptionMismatchDebug(null);
  const { clearDatabase } = await import('./clearing');
  await clearDatabase();
  clearStoredEncryptionKey();
  const newPassword = getDefaultEncryptionPassword();
  const newName = `${DB_NAME}_${Date.now()}`;
  const db = await createRxDatabase<BenefitFinderCollections>({
    name: newName,
    storage: wrappedValidateAjvStorage({
      storage: wrappedKeyEncryptionCryptoJsStorage({ storage: getRxStorageDexie() })
    }),
    password: newPassword,
    multiInstance: false,
    eventReduce: true,
    ignoreDuplicate: isDevMode,
    closeDuplicates: false,
  });
  await db.addCollections(collections);
  if (import.meta.env.DEV) console.warn(`[DEBUG] Reinitialized DB with name ${newName}`);
  return db;
}

export function logDatabaseErrorDebug(error: unknown): void {
  if (!import.meta.env.DEV) return;
  console.warn('[DEBUG] Database error:', error);
  if (error && typeof error === 'object' && 'code' in error) {
    const potential = error as { code?: unknown };
    if (typeof potential.code === 'string' || typeof potential.code === 'number') {
      console.warn(`[DEBUG] Error code: ${String(potential.code)}`);
    }
  }
}

export async function handleDatabaseError(error: unknown, password: string): Promise<BenefitFinderDatabase> {
  logDatabaseErrorDebug(error);
  if (!(error && typeof error === 'object' && 'code' in error)) {
    throw new Error(`Database initialization failed: ${error}`);
  }
  const codeValue = (error as { code?: unknown }).code;
  const code = typeof codeValue === 'string' ? codeValue : String(codeValue);
  if (code === 'DB8') {
    if (import.meta.env.DEV) console.warn('[DEBUG] handleDatabaseError: DB8 duplicate');
    return handleDuplicateDatabaseError(password);
  }
  if (code === 'DB1') {
    if (import.meta.env.DEV) console.warn('[DEBUG] handleDatabaseError: DB1 encryption mismatch');
    return handleEncryptionKeyMismatch();
  }
  throw new Error(`Database initialization failed: ${error}`);
}
