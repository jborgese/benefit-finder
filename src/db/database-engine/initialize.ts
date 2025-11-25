/** Initialization orchestration */
import { getDefaultEncryptionPassword, convertToRxDBPassword } from './encryption';
import { createDatabaseWithConfig } from './creation';
import { handleDatabaseError } from './errorHandling';
import { registerDevUtilities, logInitDebug } from './devUtils';
import { getDbInstance, setDbInstance } from './state';

export async function initializeDatabase(passphrase?: string, forceReinit = false) {
  const existing = getDbInstance();
  logInitDebug(passphrase, forceReinit, !!existing);
  if (existing && !forceReinit) return existing;
  if (forceReinit && existing) {
    try { await existing.remove(); } catch (e) { console.warn('Error destroying existing instance:', e); }
    setDbInstance(null);
  }
  const password = passphrase ? convertToRxDBPassword(passphrase) : getDefaultEncryptionPassword();
  if (import.meta.env.DEV) console.warn(`[DEBUG] initializeDatabase: using password length ${password.length}`);
  try {
    const db = await createDatabaseWithConfig(password);
    setDbInstance(db);
    if (import.meta.env.DEV) console.warn('[DEBUG] initializeDatabase: success');
    registerDevUtilities();
    return db;
  } catch (e) {
    console.error('[DEBUG] initializeDatabase: initial failure', e);
    const db = await handleDatabaseError(e, password);
    setDbInstance(db);
    registerDevUtilities();
    return db;
  }
}
