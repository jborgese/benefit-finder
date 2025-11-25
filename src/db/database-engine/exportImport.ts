/** Export / Import utilities */
import type { BenefitFinderCollections } from './types';
import { DB_VERSION } from './config';
import { getDbInstance } from './state';
import { collections } from '../collections';

export interface ExportedDatabaseData extends Record<string, unknown> {
  version: number;
  timestamp: number;
  collections: Partial<Record<keyof BenefitFinderCollections, unknown[]>>;
}

export async function exportDatabase(): Promise<ExportedDatabaseData> {
  const db = getDbInstance();
  if (!db) throw new Error('Database not initialized');
  const data: ExportedDatabaseData = {
    version: DB_VERSION,
    timestamp: Date.now(),
    collections: {}
  };
  const entries = Object.keys(collections) as Array<keyof BenefitFinderCollections>;
  for (const name of entries) {
    const coll = db[name];
    const docs = await coll.find().exec();
    data.collections[name] = docs.map(d => d.toJSON());
  }
  return data;
}

export async function importDatabase(data: Record<string, unknown>): Promise<void> {
  const db = getDbInstance();
  if (!db) throw new Error('Database not initialized');
  if (!data.collections || typeof data.collections !== 'object') throw new Error('Invalid import format');
  const collectionsData = data.collections as Record<string, unknown[]>;
  for (const [name, docs] of Object.entries(collectionsData)) {
    if (!(name in db)) { console.warn(`Collection ${name} missing, skipping`); continue; }
    const coll = db[name as keyof BenefitFinderCollections];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await coll.bulkInsert(docs as any);
  }
  if (import.meta.env.DEV) console.warn('Import completed');
}
