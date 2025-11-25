/**
 * App initialization utilities
 */

import { initializeDatabase, getDatabase, clearDatabase } from '../db';
import { importRulePackage } from '../rules/core/import-export';

// Constants
const US_FEDERAL_JURISDICTION = 'US-FEDERAL';

// Flag to prevent multiple simultaneous initializations
let isInitializing = false;

/**
 * Initialize database and load sample data
 * @throws {Error} If database initialization fails after retry
 */
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

    const db = getDatabase()!;

    // Check if we already have programs loaded
    const existingPrograms = await db.benefit_programs.find().exec();
    if (existingPrograms.length > 0) {
      isInitializing = false;
      return; // Already initialized
    }

    // Load sample benefit programs
    await loadSamplePrograms(db);

    // Load sample rules
    await loadSampleRules();

  } catch (error) {
    console.error('[DEBUG] initializeApp: Error initializing app:', error);

    // If it's a database initialization error, try clearing and retrying once
    if (error instanceof Error && error.message.includes('Database initialization failed')) {
      console.warn('[DEBUG] initializeApp: Attempting to clear database and retry initialization...');
      try {
        await retryInitialization();
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

/**
 * Load sample benefit programs into the database
 */
async function loadSamplePrograms(db: NonNullable<ReturnType<typeof getDatabase>>): Promise<void> {
  // Create SNAP program with explicit ID to match rules
  await db!.benefit_programs.insert({
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
  await db!.benefit_programs.insert({
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
  await db!.benefit_programs.insert({
    id: 'wic-federal',
    name: 'Special Supplemental Nutrition Program for Women, Infants, and Children (WIC)',
    shortName: 'WIC',
    description: 'Provides nutrition assistance to pregnant women, new mothers, and young children',
    category: 'food',
    jurisdiction: US_FEDERAL_JURISDICTION,
    jurisdictionLevel: 'federal',
    website: 'https://www.fns.usda.gov/wic',
    phoneNumber: '1-800-942-3678',
    applicationUrl: 'https://www.fns.usda.gov/wic/how-apply',
    active: true,
    tags: ['food', 'nutrition', 'women', 'children', 'infants'],
    lastUpdated: Date.now(),
    createdAt: Date.now(),
  });

  // Create TANF program with explicit ID to match rules
  await db.benefit_programs.insert({
    id: 'tanf-federal',
    name: 'Temporary Assistance for Needy Families (TANF)',
    shortName: 'TANF',
    description: 'Provides temporary cash assistance and support services to low-income families with children',
    category: 'financial',
    jurisdiction: US_FEDERAL_JURISDICTION,
    jurisdictionLevel: 'federal',
    website: 'https://www.acf.hhs.gov/ofa/programs/tanf',
    phoneNumber: '1-800-358-8837',
    applicationUrl: 'https://www.benefits.gov/benefit/1081',
    active: true,
    tags: ['cash', 'assistance', 'families', 'children'],
    lastUpdated: Date.now(),
    createdAt: Date.now(),
  });

  // Create SSI program with explicit ID to match rules
  await db!.benefit_programs.insert({
    id: 'ssi-federal',
    name: 'Supplemental Security Income (SSI)',
    shortName: 'SSI',
    description: 'Monthly cash assistance for disabled, blind, or elderly individuals with limited income and resources',
    category: 'financial',
    jurisdiction: US_FEDERAL_JURISDICTION,
    jurisdictionLevel: 'federal',
    website: 'https://www.ssa.gov/ssi',
    phoneNumber: '1-800-772-1213',
    applicationUrl: 'https://www.ssa.gov/benefits/ssi/',
    active: true,
    tags: ['cash', 'disability', 'elderly', 'blind'],
    lastUpdated: Date.now(),
    createdAt: Date.now(),
  });
}

/**
 * Load sample rules into the database
 */
async function loadSampleRules(): Promise<void> {
  // Import SNAP rules
  const snapRules = await import('../rules/federal/snap/snap-rules.json');
  await importRulePackage(snapRules.default);

  // Import Medicaid rules
  const medicaidRules = await import('../rules/federal/medicaid/medicaid-federal-rules.json');
  await importRulePackage(medicaidRules.default);

  // Import WIC rules
  const wicRules = await import('../rules/federal/wic/wic-federal-rules.json');
  await importRulePackage(wicRules.default);

  // Import TANF rules
  const tanfRules = await import('../rules/federal/tanf/tanf-federal-rules.json');
  await importRulePackage(tanfRules.default);

  // Import SSI rules
  const ssiRules = await import('../rules/federal/ssi/ssi-federal-rules.json');
  await importRulePackage(ssiRules.default);
}

/**
 * Retry initialization after clearing the database
 */
async function retryInitialization(): Promise<void> {
  if (import.meta.env.DEV) {
    console.warn('[DEBUG] initializeApp: Clearing database...');
  }
  await clearDatabase();

  if (import.meta.env.DEV) {
    console.warn('[DEBUG] initializeApp: Re-initializing database...');
  }
  await initializeDatabase();

  const db = getDatabase()!;
  const existingPrograms = await db.benefit_programs.find().exec();
  if (existingPrograms.length > 0) {
    return; // Already initialized
  }

  // Load sample data after successful initialization
  const retryDb = getDatabase()!;
  await loadSamplePrograms(retryDb);
  await loadSampleRules();
}

