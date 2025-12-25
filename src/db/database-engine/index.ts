/** Public database engine API */
export * from './types';
export { initializeDatabase } from './initialize';
export { getDbInstance as getDatabase, isDatabaseInitialized, destroyDatabase } from './state';
export const clearDatabase = async (): Promise<void> => {
	const m = await import('./clearing');
	return m.clearDatabase();
};
export { exportDatabase, importDatabase } from './exportImport';
