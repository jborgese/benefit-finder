/**
 * Configuration & plugin registration
 */
import { addRxPlugin } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration-schema';

type NavigatorWithWebDriver = Navigator & { webdriver?: boolean };

export const DB_NAME = 'benefitfinder';
export const DB_VERSION = 1;

// Environment flags
export const isE2ETest = typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
  window.navigator.userAgent.includes('HeadlessChrome') ||
  window.navigator.userAgent.includes('Firefox') ||
  ((window.navigator as NavigatorWithWebDriver).webdriver === true)
);

export const isTestEnvironment = typeof process !== 'undefined' && (
  process.env.NODE_ENV === 'test' ||
  process.env.VITEST === 'true' ||
  typeof import.meta.env.VITEST !== 'undefined'
);

export const isDevMode = import.meta.env.DEV && !isE2ETest && !isTestEnvironment;

// Register core plugins immediately (side-effect on import)
if (isDevMode) {
  addRxPlugin(RxDBDevModePlugin);
}
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBMigrationPlugin);
