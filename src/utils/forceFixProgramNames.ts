/**
 * Force fix program names - clears database and reinitializes with proper names
 *
 * This is a more aggressive approach that ensures the database is completely
 * cleared and reinitialized with user-friendly program names.
 */

import { clearDatabase } from '../db';
import { discoverAndSeedAllRules } from './ruleDiscovery';

/**
 * Force fix program names by clearing database and reinitializing
 */
export async function forceFixProgramNames(): Promise<void> {
  try {
    console.warn('[DEBUG] Force fixing program names...');

    // Step 1: Clear the database completely
    console.warn('[DEBUG] Clearing database...');
    await clearDatabase();
    console.warn('[DEBUG] Database cleared successfully');

    // Step 2: Wait a moment for the database to fully clear
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Reinitialize with proper program names
    console.warn('[DEBUG] Reinitializing with proper program names...');
    const results = await discoverAndSeedAllRules();

    console.warn(`[DEBUG] Force fix completed:`);
    console.warn(`  - ${results.discovered} rule files discovered`);
    console.warn(`  - ${results.created} programs created`);
    console.warn(`  - ${results.imported} rule sets imported`);

    if (results.errors.length > 0) {
      console.warn(`  - ${results.errors.length} errors:`);
      results.errors.forEach(error => console.warn(`    - ${error}`));
    }

    console.warn('[DEBUG] Program names have been fixed! Please refresh the page.');

    return;
  } catch (error) {
    console.error('[DEBUG] Error during force fix:', error);
    throw error;
  }
}

// Make it available globally in development
if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).forceFixProgramNames = forceFixProgramNames;
}
