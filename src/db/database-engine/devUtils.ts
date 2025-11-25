/** Development & inspection utilities */
import type { WindowWithDevUtils } from './types';
import { getDbInstance } from './state';

export async function inspectStorageState(): Promise<void> {
  if (!import.meta.env.DEV) return;
  console.warn('=== STORAGE STATE INSPECTION ===');

  console.warn('localStorage keys:');
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('bf_') || key.includes('benefitfinder')) {
      const value = localStorage.getItem(key);
      console.warn(`  ${key}: ${value ? value.substring(0,50)+'...' : 'null'}`);
    }
  });

  console.warn('IndexedDB databases:');
  try {
    const databases = await indexedDB.databases();
    databases.forEach(db => console.warn(`  ${db.name} (v${db.version})`));
  } catch (e) {
    console.warn('  Unable to list databases', e);
  }

  console.warn(`Current dbInstance: ${getDbInstance() ? 'EXISTS' : 'NULL'}`);
  console.warn('=== END STORAGE STATE INSPECTION ===');
}

export function registerDevUtilities(): void {
  if (!import.meta.env.DEV) return;
  (window as WindowWithDevUtils).clearBenefitFinderDatabase = async () => {
    const { clearDatabase } = await import('./clearing');
    await clearDatabase();
  };
  (window as WindowWithDevUtils).inspectBenefitFinderStorage = inspectStorageState;
  console.warn('[DEBUG] Dev utilities registered: clearBenefitFinderDatabase(), inspectBenefitFinderStorage()');
}

export function logInitDebug(passphrase: string | undefined, forceReinit: boolean, exists: boolean): void {
  if (!import.meta.env.DEV) return;
  console.warn('[DEBUG] initializeDatabase: start');
  console.warn(`[DEBUG] params passphrase:${passphrase?'PROVIDED':'NONE'} forceReinit:${forceReinit}`);
  console.warn(`[DEBUG] existing instance: ${exists}`);
}
