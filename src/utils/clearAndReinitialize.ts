/**
 * Clear and reinitialize database with proper program names
 *
 * This script clears the existing database and reinitializes it with
 * the improved rule discovery system that provides user-friendly names.
 */

import { clearDatabase } from '../db';
import { discoverAndSeedAllRules } from './ruleDiscovery';

/**
 * Clear database and reinitialize with proper program names
 */
export async function clearAndReinitialize(): Promise<void> {
  try {
    console.warn('[DEBUG] Clearing database and reinitializing with proper program names...');

    // Clear the existing database
    await clearDatabase();
    console.warn('[DEBUG] Database cleared successfully');

    // Reinitialize with the improved discovery system
    const results = await discoverAndSeedAllRules();

    console.warn(`[DEBUG] Reinitialization completed:`);
    console.warn(`  - ${results.discovered} rule files discovered`);
    console.warn(`  - ${results.created} programs created`);
    console.warn(`  - ${results.imported} rule sets imported`);

    if (results.errors.length > 0) {
      console.warn(`  - ${results.errors.length} errors:`);
      results.errors.forEach(error => console.warn(`    - ${error}`));
    }

    console.warn('[DEBUG] Database reinitialized with user-friendly program names');

  } catch (error) {
    console.error('[DEBUG] Error during reinitialization:', error);
    throw error;
  }
}

// Make it available globally in development
if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).clearAndReinitialize = clearAndReinitialize;
}
