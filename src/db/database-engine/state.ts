/** Database instance state management */
import type { BenefitFinderDatabase } from './types';
import { clearStoredEncryptionKey } from './encryption';

let dbInstance: BenefitFinderDatabase | null = null;

export function getDbInstance(): BenefitFinderDatabase | null {
  return dbInstance;
}
export function setDbInstance(db: BenefitFinderDatabase | null): void {
  dbInstance = db;
}

export function isDatabaseInitialized(): boolean {
  return dbInstance !== null;
}

export async function destroyDatabase(clearEncryptionKey: boolean = true): Promise<void> {
  if (!dbInstance) return;
  try {
    await dbInstance.remove();
    dbInstance = null;
    if (clearEncryptionKey) clearStoredEncryptionKey();
    if (import.meta.env.DEV) console.warn('[DEBUG] Database destroyed');
  } catch (e) {
    console.error('Failed to destroy database:', e);
    throw new Error(`Database destruction failed: ${e}`);
  }
}
