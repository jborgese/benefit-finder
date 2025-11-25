/** Clearing & reset helpers */
import { getDbInstance, setDbInstance } from './state';
import { registerDevUtilities } from './devUtils';

async function logIndexedDBState(when: 'before' | 'after'): Promise<void> {
  if (!import.meta.env.DEV) return;
  try {
    const databases = await indexedDB.databases();
    console.warn(`[DEBUG] clearDatabase: IndexedDB ${when}:`, databases.map(d => ({ name: d.name, version: d.version })));
  } catch (e) {
    console.warn(`[DEBUG] clearDatabase: Unable to list IndexedDB ${when}`, e);
  }
}

async function deleteIndexedDB(name: string): Promise<'success'|'error'|'blocked'> {
  try {
    if (import.meta.env.DEV) console.warn(`[DEBUG] clearDatabase: deleting ${name}`);
    const req = indexedDB.deleteDatabase(name);
    return await new Promise(r => {
      req.onsuccess = () => r('success');
      req.onerror = () => r('error');
      req.onblocked = () => r('blocked');
    });
  } catch {
    return 'error';
  }
}

async function clearAllIndexedDBs(): Promise<void> {
  await logIndexedDBState('before');
  const existing = await indexedDB.databases();
  const targets = [
    'benefitfinder','DexieDB','rxdb-benefitfinder','benefitfinder_encrypted','rxdb','dexie'
  ];
  existing.forEach(db => { if (db.name && (db.name.includes('benefitfinder') || db.name.startsWith('rxdb-dexie-')) && !targets.includes(db.name)) targets.push(db.name); });
  const results: Record<string,string> = {};
  for (const name of targets) {
    results[name] = await deleteIndexedDB(name);
  }
  if (import.meta.env.DEV) console.warn('[DEBUG] clearDatabase: deletion results', results);
  await new Promise(r=>setTimeout(r,100));
  await logIndexedDBState('after');
}

function clearLocalStorage(): void {
  const cleared: string[] = [];
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith('bf_') || k.includes('benefitfinder')) {
      localStorage.removeItem(k); cleared.push(k);
    }
  });
  if (import.meta.env.DEV) console.warn('[DEBUG] clearDatabase: cleared localStorage keys', cleared);
}

export async function clearDatabase(): Promise<void> {
  if (import.meta.env.DEV) console.warn('[DEBUG] clearDatabase: start, instance exists:', !!getDbInstance());
  const inst = getDbInstance();
  if (inst) {
    try { await inst.remove(); } catch (e) { console.warn('Error destroying instance during clear:', e); }
    setDbInstance(null);
  }
  clearLocalStorage();
  try { await clearAllIndexedDBs(); } catch (e) { console.warn('Error clearing IndexedDB:', e); }
  setDbInstance(null);
  if (import.meta.env.DEV) console.warn('[DEBUG] clearDatabase: complete');
  registerDevUtilities();
}
