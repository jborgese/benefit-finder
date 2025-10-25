import { initializeDatabase, getDatabase, clearDatabase } from '../db';
import { discoverAndSeedAllRules, checkForNewRuleFiles } from './ruleDiscovery';

// Flag to prevent multiple simultaneous initializations
let isInitializing = false;

/**
 * Initialize database and load sample data
 */
// eslint-disable-next-line sonarjs/cognitive-complexity -- Complex initialization logic needed for error handling
export async function initializeApp(): Promise<void> {
  if (import.meta.env.DEV) {
    console.warn('[DEBUG] initializeApp: Starting app initialization');
  }

  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    console.warn('[DEBUG] initializeApp: App initialization already in progress, waiting...');
    // Wait for the current initialization to complete
    // Poll until the flag is cleared by the other initialization
    const maxAttempts = 100; // 10 seconds max wait (100ms * 100)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- isInitializing is modified asynchronously
    for (let attempt = 0; attempt < maxAttempts && isInitializing; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }

  isInitializing = true;
  try {
    if (import.meta.env.DEV) {
      console.warn('[DEBUG] initializeApp: Initializing database...');
    }
    // Initialize database
    await initializeDatabase();

    const db = getDatabase();

    // Check if we already have programs loaded
    const existingPrograms = await db.benefit_programs.find().exec();
    if (import.meta.env.DEV) {
      console.warn(`[DEBUG] initializeApp: Found ${existingPrograms.length} existing programs`);
    }

    // Check if we have programs with technical names that need fixing
    const hasTechnicalNames = existingPrograms.some(p => p.id.startsWith('benefits.') || p.name.includes('benefits.'));

    if (hasTechnicalNames) {
      if (import.meta.env.DEV) {
        console.warn('[DEBUG] initializeApp: Found programs with technical names, clearing and reinitializing...');
      }
      // Clear the database to fix technical names
      await clearDatabase();
      // Wait a moment for the database to fully clear
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      // Check if we need to discover and seed new rule files
      const hasNewRuleFiles = await checkForNewRuleFiles();
      if (existingPrograms.length > 0 && !hasNewRuleFiles) {
        if (import.meta.env.DEV) {
          console.warn('[DEBUG] initializeApp: Database already initialized with all available programs, skipping import');
        }
        isInitializing = false;
        return; // Already initialized with all available programs
      }
    }

    if (import.meta.env.DEV) {
      console.warn('[DEBUG] initializeApp: Discovering and seeding rule files...');
    }

    // Dynamically discover and seed all available rule files
    const discoveryResults = await discoverAndSeedAllRules();

    if (import.meta.env.DEV) {
      console.warn(`[DEBUG] initializeApp: Discovery completed - ${discoveryResults.created} programs created, ${discoveryResults.imported} rule sets imported`);
      if (discoveryResults.errors.length > 0) {
        console.warn(`[DEBUG] initializeApp: ${discoveryResults.errors.length} errors during discovery:`, discoveryResults.errors);
      }
    }

  } catch (error) {
    console.error('[DEBUG] initializeApp: Error initializing app:', error);

    // If it's a database initialization error, try clearing and retrying once
    if (error instanceof Error && error.message.includes('Database initialization failed')) {
      console.warn('[DEBUG] initializeApp: Attempting to clear database and retry initialization...');
      try {
        if (import.meta.env.DEV) {
          console.warn('[DEBUG] initializeApp: Clearing database...');
        }
        await clearDatabase();

        if (import.meta.env.DEV) {
          console.warn('[DEBUG] initializeApp: Re-initializing database...');
        }
        await initializeDatabase();

        const db = getDatabase();
        const existingPrograms = await db.benefit_programs.find().exec();
        if (existingPrograms.length > 0) {
          return; // Already initialized
        }

        // Dynamically discover and seed all available rule files after retry
        const retryDiscoveryResults = await discoverAndSeedAllRules();

        if (import.meta.env.DEV) {
          console.warn(`[DEBUG] initializeApp: Retry discovery completed - ${retryDiscoveryResults.created} programs created, ${retryDiscoveryResults.imported} rule sets imported`);
          if (retryDiscoveryResults.errors.length > 0) {
            console.warn(`[DEBUG] initializeApp: ${retryDiscoveryResults.errors.length} errors during retry discovery:`, retryDiscoveryResults.errors);
          }
        }

        console.warn('Database initialized successfully after clearing');
        isInitializing = false;
        return;
      } catch (retryError) {
        console.error('Failed to initialize database after clearing:', retryError);
        isInitializing = false;
        throw retryError;
      }
    }

    throw error;
  } finally {
    // Always reset the initialization flag
    isInitializing = false;
  }
}

