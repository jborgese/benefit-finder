import { initializeDatabase, getDatabase, clearDatabase } from '../db';
import { importRulePackage } from '../rules/core/import-export';

// Constants
const US_FEDERAL_JURISDICTION = 'US-FEDERAL';

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
      if (existingPrograms.length > 0) {
        console.warn('[DEBUG] initializeApp: Database already initialized, skipping import');
      }
    }
    if (existingPrograms.length > 0) {
      isInitializing = false;
      return; // Already initialized
    }

    // Load sample benefit programs

    // Create SNAP program with explicit ID to match rules
    await db.benefit_programs.insert({
      id: 'snap-federal',
      name: 'Supplemental Nutrition Assistance Program (SNAP)',
      shortName: 'SNAP',
      description: 'SNAP helps low-income individuals and families buy food',
      category: 'food',
      jurisdiction: US_FEDERAL_JURISDICTION,
      jurisdictionLevel: 'federal',
      website: 'https://www.fns.usda.gov/snap',
      phoneNumber: '1-800-221-5689',
      applicationUrl: 'https://www.benefits.gov/benefit/361',
      active: true,
      tags: ['food', 'nutrition', 'ebt'],
      lastUpdated: Date.now(),
      createdAt: Date.now(),
    });

    // Create Medicaid program with explicit ID to match rules
    await db.benefit_programs.insert({
      id: 'medicaid-federal',
      name: 'Medicaid',
      shortName: 'Medicaid',
      description: 'Health coverage for low-income individuals and families',
      category: 'healthcare',
      jurisdiction: US_FEDERAL_JURISDICTION,
      jurisdictionLevel: 'federal',
      website: 'https://www.medicaid.gov',
      phoneNumber: '1-800-318-2596',
      applicationUrl: 'https://www.healthcare.gov',
      active: true,
      tags: ['healthcare', 'insurance', 'medical'],
      lastUpdated: Date.now(),
      createdAt: Date.now(),
    });

    // Create WIC program with explicit ID to match rules
    await db.benefit_programs.insert({
      id: 'wic-federal',
      name: 'Special Supplemental Nutrition Program for Women, Infants, and Children (WIC)',
      shortName: 'WIC',
      description: 'Provides nutrition assistance to pregnant women, new mothers, and young children',
      category: 'food',
      jurisdiction: US_FEDERAL_JURISDICTION,
      jurisdictionLevel: 'federal',
      website: 'https://www.fns.usda.gov/wic',
      phoneNumber: '1-800-221-5689',
      applicationUrl: 'https://www.fns.usda.gov/wic/wic-contacts',
      active: true,
      tags: ['food', 'nutrition', 'maternal-health', 'children', 'infants'],
      lastUpdated: Date.now(),
      createdAt: Date.now(),
    });

    // Load sample rules

    // Import SNAP rules
    const snapRules = await import('../rules/federal/snap/snap-rules.json');
    await importRulePackage(snapRules.default);

    // Import Medicaid rules
    const medicaidRules = await import('../rules/federal/medicaid/medicaid-federal-rules.json');
    await importRulePackage(medicaidRules.default);

    // Import WIC rules
    const wicRules = await import('../rules/federal/wic/wic-federal-rules.json');
    await importRulePackage(wicRules.default);

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

        // Load sample data after successful initialization
        const retryDb = getDatabase();
        await retryDb.benefit_programs.insert({
          id: 'snap-federal',
          name: 'Supplemental Nutrition Assistance Program (SNAP)',
          shortName: 'SNAP',
          description: 'SNAP helps low-income individuals and families buy food',
          category: 'food',
          jurisdiction: US_FEDERAL_JURISDICTION,
          jurisdictionLevel: 'federal',
          website: 'https://www.fns.usda.gov/snap',
          phoneNumber: '1-800-221-5689',
          applicationUrl: 'https://www.benefits.gov/benefit/361',
          active: true,
          tags: ['food', 'nutrition', 'ebt'],
          lastUpdated: Date.now(),
          createdAt: Date.now(),
        });

        await retryDb.benefit_programs.insert({
          id: 'medicaid-federal',
          name: 'Medicaid',
          shortName: 'Medicaid',
          description: 'Health coverage for low-income individuals and families',
          category: 'healthcare',
          jurisdiction: US_FEDERAL_JURISDICTION,
          jurisdictionLevel: 'federal',
          website: 'https://www.medicaid.gov',
          phoneNumber: '1-800-318-2596',
          applicationUrl: 'https://www.healthcare.gov',
          active: true,
          tags: ['healthcare', 'insurance', 'medical'],
          lastUpdated: Date.now(),
          createdAt: Date.now(),
        });

        await retryDb.benefit_programs.insert({
          id: 'wic-federal',
          name: 'Special Supplemental Nutrition Program for Women, Infants, and Children (WIC)',
          shortName: 'WIC',
          description: 'Provides nutrition assistance to pregnant women, new mothers, and young children',
          category: 'food',
          jurisdiction: US_FEDERAL_JURISDICTION,
          jurisdictionLevel: 'federal',
          website: 'https://www.fns.usda.gov/wic',
          phoneNumber: '1-800-221-5689',
          applicationUrl: 'https://www.fns.usda.gov/wic/wic-contacts',
          active: true,
          tags: ['food', 'nutrition', 'maternal-health', 'children', 'infants'],
          lastUpdated: Date.now(),
          createdAt: Date.now(),
        });

        // Load sample rules
        const snapRules = await import('../rules/federal/snap/snap-rules.json');
        await importRulePackage(snapRules.default);

        const medicaidRules = await import('../rules/federal/medicaid/medicaid-federal-rules.json');
        await importRulePackage(medicaidRules.default);

        const wicRules = await import('../rules/federal/wic/wic-federal-rules.json');
        await importRulePackage(wicRules.default);

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

