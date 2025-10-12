/**
 * Playwright Global Setup
 *
 * Runs once before all tests.
 * Use for global initialization like seeding database, etc.
 */

import { FullConfig } from '@playwright/test';

function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright tests...');
  console.log(`Base URL: ${config.projects[0].use.baseURL}`);

  // Add any global setup here
  // For example: seed database, start services, etc.

  return () => {
    // Global teardown
    console.log('✅ Playwright tests completed');
  };
}

export default globalSetup;

