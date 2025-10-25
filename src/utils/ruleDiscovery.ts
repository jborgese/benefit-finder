/**
 * Rule Discovery Utilities
 *
 * Automatically discovers and processes rule files to create benefit programs
 * and import their rules into the database.
 */

import { getDatabase } from '../db';
import { importManager } from '../services/ImportManager';
import type { RuleDefinition } from '../rules/core/schema';
// Removed unused import: BenefitProgram

// Constants
const US_FEDERAL_JURISDICTION = 'US-FEDERAL';
const SNAP_FEDERAL_ID = 'snap-federal';
const SSI_FEDERAL_ID = 'ssi-federal';

/**
 * Rule file discovery configuration
 */
interface RuleDiscoveryConfig {
  /** Base directory to search for rule files */
  baseDir: string;
  /** File pattern to match rule files */
  pattern: RegExp;
  /** Jurisdiction level for discovered programs */
  jurisdictionLevel: 'federal' | 'state' | 'county' | 'city';
  /** Default jurisdiction if not specified in rule metadata */
  defaultJurisdiction: string;
}

/**
 * Discovered rule file information
 */
interface DiscoveredRuleFile {
  /** File path */
  path: string;
  /** Imported rule package */
  rulePackage: Record<string, unknown>;
  /** Program metadata extracted from rule package */
  programInfo: {
    id: string;
    name: string;
    shortName: string;
    description: string;
    category: string;
    jurisdiction: string;
    website?: string;
    phoneNumber?: string;
    applicationUrl?: string;
    tags: string[];
  };
}

/**
 * Default configuration for federal rule discovery
 */
const FEDERAL_RULE_CONFIG: RuleDiscoveryConfig = {
  baseDir: '../rules/federal',
  pattern: /.*-federal-rules\.json$/,
  jurisdictionLevel: 'federal',
  defaultJurisdiction: US_FEDERAL_JURISDICTION,
};

/**
 * Log discovery debug information
 */
function logDiscoveryDebug(ruleFiles: Record<string, () => Promise<Record<string, unknown>>>): void {
  console.log('🔍 [RULE DISCOVERY DEBUG] Starting rule file discovery');
  console.log('🔍 [RULE DISCOVERY DEBUG] Glob pattern: ../rules/federal/**/*-federal-rules.json');
  console.log('🔍 [RULE DISCOVERY DEBUG] Found rule files:', Object.keys(ruleFiles));
  console.log('🔍 [RULE DISCOVERY DEBUG] Total files found:', Object.keys(ruleFiles).length);

  // Enhanced debug logging for SNAP and SSI
  const snapFiles = Object.keys(ruleFiles).filter(f => f.includes('snap'));
  const ssiFiles = Object.keys(ruleFiles).filter(f => f.includes('ssi'));

  console.log('🔍 [SNAP/SSI DISCOVERY DEBUG] SNAP files found:', snapFiles);
  console.log('🔍 [SNAP/SSI DISCOVERY DEBUG] SSI files found:', ssiFiles);

  if (snapFiles.length === 0) {
    console.log('❌ [SNAP/SSI DISCOVERY DEBUG] No SNAP files found! Expected: snap-federal-rules.json');
  }
  if (ssiFiles.length === 0) {
    console.log('❌ [SNAP/SSI DISCOVERY DEBUG] No SSI files found! Expected: ssi-federal-rules.json');
  }

  if (import.meta.env.DEV) {
    console.warn('[DEBUG] Rule Discovery: Found rule files:', Object.keys(ruleFiles));
    console.warn('[DEBUG] Rule Discovery: Federal rule files found:', Object.keys(ruleFiles).filter(f => f.includes('federal')));
  }
}

/**
 * Log SNAP/SSI specific debug information
 */
function logSnapSsiDebug(filePath: string, programId?: string): void {
  if (filePath.includes('snap') || filePath.includes('ssi')) {
    const programType = filePath.includes('snap') ? 'SNAP' : 'SSI';
    console.log(`🔍 [SNAP/SSI DISCOVERY DEBUG] Processing ${programType} file: ${filePath}`);

    if (programId) {
      console.log(`🔍 [SNAP/SSI DISCOVERY DEBUG] Successfully extracted program info for ${programId}`);
    }
  }
}

/**
 * Log SNAP/SSI error information
 */
function logSnapSsiError(filePath: string, error: unknown): void {
  if (filePath.includes('snap') || filePath.includes('ssi')) {
    const programType = filePath.includes('snap') ? 'SNAP' : 'SSI';
    console.log(`❌ [SNAP/SSI DISCOVERY DEBUG] Error processing ${programType} file:`, {
      filePath,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

/**
 * Validate and extract rule package from module
 */
function extractRulePackage(module: Record<string, unknown>, filePath: string): Record<string, unknown> | null {
  const rulePackage = module.default;

  console.log(`🔍 [RULE DISCOVERY DEBUG] Imported module for ${filePath}:`, {
    hasDefault: !!module.default,
    hasMetadata: !!rulePackage?.metadata,
    hasPrograms: !!rulePackage?.metadata?.programs,
    programCount: rulePackage?.metadata?.programs?.length ?? 0,
    programs: rulePackage?.metadata?.programs
  });

  if (!rulePackage?.metadata?.programs?.length) {
    console.warn(`[DEBUG] Rule Discovery: Skipping ${filePath} - no programs defined`);
    return null;
  }

  return rulePackage;
}

/**
 * Process a single rule file
 */
async function processRuleFile(
  filePath: string,
  importFn: () => Promise<Record<string, unknown>>,
  config: RuleDiscoveryConfig
): Promise<DiscoveredRuleFile | null> {
  console.log(`🔍 [RULE DISCOVERY DEBUG] Processing file: ${filePath}`);
  logSnapSsiDebug(filePath);

  try {
    const module = await importFn();
    const rulePackage = extractRulePackage(module, filePath);

    if (!rulePackage) {
      return null;
    }

    const programInfo = extractProgramInfo(rulePackage, config);

    console.log(`🔍 [RULE DISCOVERY DEBUG] Extracted program info for ${filePath}:`, {
      programId: programInfo.id,
      programName: programInfo.name,
      category: programInfo.category,
      jurisdiction: programInfo.jurisdiction
    });

    logSnapSsiDebug(filePath, programInfo.id);

    const discoveredFile: DiscoveredRuleFile = {
      path: filePath,
      rulePackage,
      programInfo,
    };

    if (import.meta.env.DEV) {
      console.warn(`[DEBUG] Rule Discovery: Processed ${filePath} for program ${programInfo.id}`);
    }

    return discoveredFile;
  } catch (error) {
    console.error(`[DEBUG] Rule Discovery: Error processing ${filePath}:`, error);
    logSnapSsiError(filePath, error);
    return null;
  }
}

/**
 * Log final discovery results
 */
function logDiscoveryResults(discoveredFiles: DiscoveredRuleFile[], totalFilesFound: number): void {
  console.log('🔍 [RULE DISCOVERY DEBUG] Discovery complete:', {
    totalFilesFound,
    totalFilesProcessed: discoveredFiles.length,
    discoveredPrograms: discoveredFiles.map(f => f.programInfo.id),
    snapFiles: discoveredFiles.filter(f => f.programInfo.id === SNAP_FEDERAL_ID).length,
    ssiFiles: discoveredFiles.filter(f => f.programInfo.id === SSI_FEDERAL_ID).length
  });

  // Enhanced debug logging for SNAP and SSI final results
  const snapDiscovered = discoveredFiles.filter(f => f.programInfo.id === SNAP_FEDERAL_ID);
  const ssiDiscovered = discoveredFiles.filter(f => f.programInfo.id === SSI_FEDERAL_ID);

  if (snapDiscovered.length === 0) {
    console.log('❌ [SNAP/SSI DISCOVERY DEBUG] SNAP rules not discovered!');
  } else {
    console.log('✅ [SNAP/SSI DISCOVERY DEBUG] SNAP rules discovered:', snapDiscovered.map(f => f.programInfo.id));
  }

  if (ssiDiscovered.length === 0) {
    console.log('❌ [SNAP/SSI DISCOVERY DEBUG] SSI rules not discovered!');
  } else {
    console.log('✅ [SNAP/SSI DISCOVERY DEBUG] SSI rules discovered:', ssiDiscovered.map(f => f.programInfo.id));
  }
}

/**
 * Discover all rule files matching the configuration
 */
async function discoverRuleFiles(config: RuleDiscoveryConfig): Promise<DiscoveredRuleFile[]> {
  const discoveredFiles: DiscoveredRuleFile[] = [];

  try {
    // Use dynamic imports instead of static imports to avoid conflicts with App.tsx
    // This will find all files matching the pattern in the specified directory
    const ruleFiles = import.meta.glob('../rules/federal/**/*-federal-rules.json');

    logDiscoveryDebug(ruleFiles);

    // Process each rule file with dynamic import
    for (const [filePath, importFn] of Object.entries(ruleFiles)) {
      const discoveredFile = await processRuleFile(filePath, importFn, config);
      if (discoveredFile) {
        discoveredFiles.push(discoveredFile);
      }
    }

    logDiscoveryResults(discoveredFiles, Object.keys(ruleFiles).length);

    return discoveredFiles;
  } catch (error) {
    console.error('[DEBUG] Rule Discovery: Error discovering rule files:', error);
    return [];
  }
}

/**
 * Extract program information from rule package metadata
 */
function extractProgramInfo(rulePackage: Record<string, unknown>, config: RuleDiscoveryConfig): {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: string;
  jurisdiction: string;
  website?: string;
  phoneNumber?: string;
  applicationUrl?: string;
  tags: string[];
} {
  const { metadata } = rulePackage;
  const programId = metadata.programs?.[0]; // Use first program ID

  if (!programId) {
    throw new Error('No program ID found in rule package metadata');
  }

  // Extract program name from rule package name or use a default
  const programName = extractProgramName(metadata.name, programId);
  const shortName = extractShortName(programName, programId);
  const description = extractProgramDescription(programId, metadata.description);

  // Determine category based on program type
  const category = determineProgramCategory(programId, metadata.tags);

  // Extract contact information if available
  const website = extractWebsite(programId);
  const phoneNumber = extractPhoneNumber(programId);
  const applicationUrl = extractApplicationUrl(programId);

  return {
    id: programId,
    name: programName,
    shortName,
    description,
    category,
    jurisdiction: (metadata.jurisdiction as string) || config.defaultJurisdiction,
    website,
    phoneNumber,
    applicationUrl,
    tags: Array.isArray(metadata.tags) ? metadata.tags as string[] : [],
  };
}

/**
 * Extract program name from rule package name
 */
function extractProgramName(ruleName: string, programId: string): string {
  // For TANF, SSI, Section 8, LIHTC, we need to map to proper names
  const programNameMap: Record<string, string> = {
    'tanf-federal': 'Temporary Assistance for Needy Families (TANF)',
    [SSI_FEDERAL_ID]: 'Supplemental Security Income (SSI)',
    'section8-federal': 'Section 8 Housing Choice Voucher',
    'lihtc-federal': 'Low-Income Housing Tax Credit (LIHTC)',
    [SNAP_FEDERAL_ID]: 'Supplemental Nutrition Assistance Program (SNAP)',
    'medicaid-federal': 'Medicaid',
    'wic-federal': 'Special Supplemental Nutrition Program for Women, Infants, and Children (WIC)',
  };

  // Check if we have a direct mapping
  if (programId in programNameMap) {
    // eslint-disable-next-line security/detect-object-injection
    return programNameMap[programId];
  }

  // Fallback: try to extract from rule name
  let name = ruleName
    .replace(/Federal Eligibility Rules.*$/i, '')
    .replace(/Rules.*$/i, '')
    .replace(/\(.*\)/g, '')
    .replace(/\s+\(.*\)$/g, '') // Remove parenthetical content at the end
    .trim();

  // If we still don't have a good name, generate one from program ID
  if (!name || name.length < 3) {
    name = programId
      .replace(/-federal$/, '')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return name;
}

/**
 * Extract program description
 */
function extractProgramDescription(programId: string, ruleDescription?: string): string {
  // Map to proper descriptions
  const descriptionMap: Record<string, string> = {
    'tanf-federal': 'Provides temporary cash assistance and support services to low-income families with children',
    [SSI_FEDERAL_ID]: 'Provides monthly cash assistance to disabled, blind, or elderly individuals with limited income and resources',
    'section8-federal': 'Provides rental assistance to help low-income families, elderly, and disabled individuals afford decent housing',
    'lihtc-federal': 'Provides affordable housing options for low-income families through tax credit-financed rental housing',
    [SNAP_FEDERAL_ID]: 'SNAP helps low-income individuals and families buy food',
    'medicaid-federal': 'Health coverage for low-income individuals and families',
    'wic-federal': 'Provides nutrition assistance to pregnant women, new mothers, and young children',
  };

  // Check if we have a direct mapping
  if (programId in descriptionMap) {
    // eslint-disable-next-line security/detect-object-injection
    return descriptionMap[programId];
  }

  // Fallback to rule description or default
  return ruleDescription ?? `Federal ${programId.replace(/-federal$/, '')} program`;
}

/**
 * Extract short name from program name
 */
function extractShortName(programName: string, programId: string): string {
  // Map to proper short names
  const shortNameMap: Record<string, string> = {
    'tanf-federal': 'TANF',
    [SSI_FEDERAL_ID]: 'SSI',
    'section8-federal': 'Section 8',
    'lihtc-federal': 'LIHTC',
    [SNAP_FEDERAL_ID]: 'SNAP',
    'medicaid-federal': 'Medicaid',
    'wic-federal': 'WIC',
  };

  // Check if we have a direct mapping
  if (programId in shortNameMap) {
    // eslint-disable-next-line security/detect-object-injection
    return shortNameMap[programId];
  }

  // Try to extract acronym from program name
  const words = programName.split(' ');
  if (words.length > 1) {
    const acronym = words.map(word => word.charAt(0).toUpperCase()).join('');
    if (acronym.length <= 6) {
      return acronym;
    }
  }

  // Fallback to first word or program ID
  return words[0] || programId.replace(/-federal$/, '').toUpperCase();
}

/**
 * Determine program category based on program ID and tags
 */
function determineProgramCategory(programId: string, tags: string[] = []): string {
  const id = programId.toLowerCase();
  const tagStr = tags.join(' ').toLowerCase();

  // Check for specific program types
  if (id.includes('snap') || id.includes('wic') || tagStr.includes('food') || tagStr.includes('nutrition')) {
    return 'food';
  }
  if (id.includes('medicaid') || tagStr.includes('healthcare') || tagStr.includes('medical')) {
    return 'healthcare';
  }
  if (id.includes('section8') || id.includes('lihtc') || tagStr.includes('housing')) {
    return 'housing';
  }
  if (id.includes('tanf') || id.includes('ssi') || tagStr.includes('cash') || tagStr.includes('assistance')) {
    return 'financial';
  }

  // Default category
  return 'other';
}

/**
 * Extract website URL for a program
 */
function extractWebsite(programId: string): string {
  const websites: Record<string, string> = {
    [SNAP_FEDERAL_ID]: 'https://www.fns.usda.gov/snap',
    'medicaid-federal': 'https://www.medicaid.gov',
    'wic-federal': 'https://www.fns.usda.gov/wic',
    'tanf-federal': 'https://www.acf.hhs.gov/ofa/programs/tanf',
    [SSI_FEDERAL_ID]: 'https://www.ssa.gov/ssi',
    'section8-federal': 'https://www.hud.gov/topics/housing_choice_voucher_program_section_8',
    'lihtc-federal': 'https://www.hud.gov/program_offices/housing/mfh/htsf/lihtc',
  };

  // eslint-disable-next-line security/detect-object-injection
  return websites[programId] ?? 'https://www.benefits.gov';
}

/**
 * Extract phone number for a program
 */
function extractPhoneNumber(programId: string): string {
  const phoneNumbers: Record<string, string> = {
    [SNAP_FEDERAL_ID]: '1-800-221-5689',
    'medicaid-federal': '1-800-318-2596',
    'wic-federal': '1-800-221-5689',
    'tanf-federal': '1-800-318-2596',
    [SSI_FEDERAL_ID]: '1-800-772-1213',
    'section8-federal': '1-800-955-2232',
    'lihtc-federal': '1-800-955-2232',
  };

  // eslint-disable-next-line security/detect-object-injection
  return phoneNumbers[programId] ?? '1-800-318-2596';
}

/**
 * Extract application URL for a program
 */
function extractApplicationUrl(programId: string): string {
  const applicationUrls: Record<string, string> = {
    [SNAP_FEDERAL_ID]: 'https://www.benefits.gov/benefit/361',
    'medicaid-federal': 'https://www.healthcare.gov',
    'wic-federal': 'https://www.fns.usda.gov/wic/wic-contacts',
    'tanf-federal': 'https://www.benefits.gov/benefit/613',
    [SSI_FEDERAL_ID]: 'https://www.ssa.gov/benefits/ssi',
    'section8-federal': 'https://www.hud.gov/program_offices/public_indian_housing/programs/hcv',
    'lihtc-federal': 'https://www.hud.gov/program_offices/housing/mfh/htsf/lihtc',
  };

  // eslint-disable-next-line security/detect-object-injection
  return applicationUrls[programId] ?? 'https://www.benefits.gov';
}

/**
 * Create benefit program from discovered rule file
 */
async function createBenefitProgram(discoveredFile: DiscoveredRuleFile): Promise<void> {
  const db = getDatabase();
  const { programInfo } = discoveredFile;

  console.log('🔍 [PROGRAM CREATION DEBUG] Starting program creation', {
    programId: programInfo.id,
    programName: programInfo.name,
    shortName: programInfo.shortName,
    category: programInfo.category,
    jurisdiction: programInfo.jurisdiction,
    tags: programInfo.tags
  });

  try {
    const programData = {
      id: programInfo.id,
      name: programInfo.name,
      shortName: programInfo.shortName,
      description: programInfo.description,
      category: programInfo.category as 'food' | 'healthcare' | 'housing' | 'financial' | 'other',
      jurisdiction: programInfo.jurisdiction,
      jurisdictionLevel: 'federal',
      website: programInfo.website,
      phoneNumber: programInfo.phoneNumber,
      applicationUrl: programInfo.applicationUrl,
      active: true,
      tags: programInfo.tags,
      lastUpdated: Date.now(),
      createdAt: Date.now(),
    };

    console.log('🔍 [PROGRAM CREATION DEBUG] Prepared program data', {
      programId: programData.id,
      programName: programData.name,
      isActive: programData.active,
      category: programData.category,
      jurisdiction: programData.jurisdiction
    });

    const insertResult = await db.benefit_programs.insert(programData);
    console.log('🔍 [PROGRAM CREATION DEBUG] Program insert result', {
      programId: programInfo.id,
      insertResult,
      insertedId: insertResult.id,
      insertedName: insertResult.name
    });

    // Verify the program was actually saved
    console.log('🔍 [PROGRAM CREATION DEBUG] Verifying program was saved', { programId: programInfo.id });
    const savedProgram = await db.benefit_programs.findOne({ selector: { id: programInfo.id } }).exec();
    console.log('🔍 [PROGRAM CREATION DEBUG] Program verification result', {
      programId: programInfo.id,
      found: !!savedProgram,
      savedProgramId: savedProgram?.id,
      savedProgramName: savedProgram?.name,
      savedProgramActive: savedProgram?.active
    });

    // Also check all programs in database
    const allPrograms = await db.benefit_programs.find({}).exec();
    console.log('🔍 [PROGRAM CREATION DEBUG] All programs in database after creation', {
      totalPrograms: allPrograms.length,
      programIds: allPrograms.map(p => p.id),
      activePrograms: allPrograms.filter(p => p.active).length
    });

    // Re-verify program persistence
    console.log('🔍 [PROGRAM CREATION DEBUG] Re-verifying program persistence', { programId: programInfo.id });
    const recheckProgram = await db.benefit_programs.findOne({ selector: { id: programInfo.id } }).exec();
    console.log('🔍 [PROGRAM CREATION DEBUG] Program re-verification result', {
      programId: programInfo.id,
      found: !!recheckProgram,
      recheckProgramId: recheckProgram?.id,
      recheckProgramActive: recheckProgram?.active
    });

    if (import.meta.env.DEV) {
      console.warn(`[DEBUG] Rule Discovery: Created benefit program ${programInfo.id}`);
    }
  } catch (error) {
    console.log('🔍 [PROGRAM CREATION DEBUG] Error creating program', {
      programId: programInfo.id,
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    });
    console.error(`[DEBUG] Rule Discovery: Error creating program ${programInfo.id}:`, error);
    throw error;
  }
}

/**
 * Log rule import start debug information
 */
function logRuleImportStart(discoveredFile: DiscoveredRuleFile, programId: string): void {
  console.log('🔍 [RULE IMPORT DEBUG] Starting rule import for program', {
    programId,
    rulePackageId: discoveredFile.rulePackage.metadata.id,
    ruleCount: discoveredFile.rulePackage.rules.length,
    ruleIds: discoveredFile.rulePackage.rules.map(r => r.id)
  });

  // Enhanced debug logging for SNAP and SSI
  if (programId === SNAP_FEDERAL_ID || programId === SSI_FEDERAL_ID) {
    console.log(`🔍 [SNAP/SSI DEBUG] Rule discovery import starting for ${programId}:`, {
      programId,
      rulePackageId: discoveredFile.rulePackage.metadata.id,
      ruleCount: discoveredFile.rulePackage.rules.length,
      ruleIds: discoveredFile.rulePackage.rules.map((r: RuleDefinition) => r.id),
      ruleTypes: discoveredFile.rulePackage.rules.map((r: RuleDefinition) => r.ruleType),
      hasTestCases: discoveredFile.rulePackage.rules.some((r: RuleDefinition) => r.testCases && r.testCases.length > 0),
      testCaseCount: discoveredFile.rulePackage.rules.reduce((total: number, r: RuleDefinition) => total + (r.testCases?.length ?? 0), 0)
    });
  }
}

/**
 * Log rule import result debug information
 */
function logRuleImportResult(discoveredFile: DiscoveredRuleFile, importResult: unknown, programId: string): void {
  console.log('🔍 [RULE IMPORT DEBUG] Rule import result', {
    programId: discoveredFile.programInfo.id,
    importResult,
    success: (importResult as { success: boolean }).success,
    imported: (importResult as { imported: number }).imported,
    failed: (importResult as { failed: number }).failed,
    errors: (importResult as { errors: unknown[] }).errors
  });

  // Enhanced debug logging for SNAP and SSI import results
  if (programId === SNAP_FEDERAL_ID || programId === SSI_FEDERAL_ID) {
    console.log(`🔍 [SNAP/SSI DEBUG] Rule discovery import result for ${programId}:`, {
      programId,
      success: (importResult as { success: boolean }).success,
      imported: (importResult as { imported: number }).imported,
      failed: (importResult as { failed: number }).failed,
      skipped: (importResult as { skipped: number }).skipped,
      errorCount: (importResult as { errors: unknown[] }).errors.length,
      warningCount: (importResult as { warnings: unknown[] }).warnings.length,
      errors: (importResult as { errors: { message: string; code: string }[] }).errors.map(e => ({ message: e.message, code: e.code })),
      warnings: (importResult as { warnings: { message: string }[] }).warnings.map(w => ({ message: w.message }))
    });
  }
}

/**
 * Log rule import error debug information
 */
function logRuleImportError(discoveredFile: DiscoveredRuleFile, error: unknown, programId: string): void {
  console.log('🔍 [RULE IMPORT DEBUG] Error importing rules', {
    programId: discoveredFile.programInfo.id,
    error,
    errorMessage: error instanceof Error ? error.message : String(error),
    errorStack: error instanceof Error ? error.stack : undefined
  });

  // Enhanced debug logging for SNAP and SSI errors
  if (programId === SNAP_FEDERAL_ID || programId === SSI_FEDERAL_ID) {
    console.log(`❌ [SNAP/SSI DEBUG] Rule discovery import error for ${programId}:`, {
      programId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ruleCount: discoveredFile.rulePackage.rules.length,
      ruleIds: discoveredFile.rulePackage.rules.map((r: RuleDefinition) => r.id)
    });
  }
}

/**
 * Import rules for a discovered rule file
 */
async function importRulesForProgram(discoveredFile: DiscoveredRuleFile): Promise<void> {
  const programId = discoveredFile.programInfo.id;
  const importKey = `rule-discovery-${programId}`;

  logRuleImportStart(discoveredFile, programId);

  try {
    // Use ImportManager to prevent duplicate imports and handle errors efficiently
    const importResult = await importManager.importRules(
      importKey,
      discoveredFile.rulePackage.rules,
      {
        force: false, // Don't force if recently imported
        retryOnFailure: true, // Retry on failure
        maxRetries: 3, // Maximum 3 retries
        timeout: 30000 // 30 second timeout
      }
    );

    logRuleImportResult(discoveredFile, importResult, programId);

    if (import.meta.env.DEV) {
      console.warn(`[DEBUG] Rule Discovery: Imported rules for program ${discoveredFile.programInfo.id}`);
    }
  } catch (error) {
    logRuleImportError(discoveredFile, error, programId);

    console.error(`[DEBUG] Rule Discovery: Error importing rules for ${discoveredFile.programInfo.id}:`, error);
    throw error;
  }
}

/**
 * Log discovery start debug information
 */
function logDiscoveryStart(): void {
  console.log('🔍 [MAIN DISCOVERY DEBUG] Starting discovery and seeding process');
  if (import.meta.env.DEV) {
    console.warn('[DEBUG] Rule Discovery: Starting discovery and seeding process');
  }
}

/**
 * Log main discovery results debug information
 */
function logMainDiscoveryResults(discoveredFiles: DiscoveredRuleFile[]): void {
  console.log('🔍 [MAIN DISCOVERY DEBUG] Rule discovery results:', {
    totalDiscovered: discoveredFiles.length,
    discoveredPrograms: discoveredFiles.map(f => f.programInfo.id),
    snapDiscovered: discoveredFiles.filter(f => f.programInfo.id === SNAP_FEDERAL_ID).length,
    ssiDiscovered: discoveredFiles.filter(f => f.programInfo.id === SSI_FEDERAL_ID).length
  });

  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] Rule Discovery: Found ${discoveredFiles.length} rule files`);
  }
}

/**
 * Log file processing start debug information
 */
function logFileProcessingStart(discoveredFiles: DiscoveredRuleFile[]): void {
  console.log('🔍 [MAIN DISCOVERY DEBUG] Processing discovered files:', {
    totalFiles: discoveredFiles.length,
    filePaths: discoveredFiles.map(f => f.path),
    programIds: discoveredFiles.map(f => f.programInfo.id)
  });
}

/**
 * Log SNAP/SSI processing debug information
 */
function logSnapSsiProcessing(discoveredFile: DiscoveredRuleFile): void {
  if (discoveredFile.programInfo.id === SNAP_FEDERAL_ID || discoveredFile.programInfo.id === SSI_FEDERAL_ID) {
    console.log(`🔍 [SNAP/SSI MAIN DEBUG] Processing ${discoveredFile.programInfo.id}:`, {
      filePath: discoveredFile.path,
      programId: discoveredFile.programInfo.id,
      programName: discoveredFile.programInfo.name,
      ruleCount: discoveredFile.rulePackage.rules.length,
      ruleIds: discoveredFile.rulePackage.rules.map((r: RuleDefinition) => r.id)
    });
  }
}

/**
 * Log SNAP/SSI success debug information
 */
function logSnapSsiSuccess(discoveredFile: DiscoveredRuleFile): void {
  if (discoveredFile.programInfo.id === SNAP_FEDERAL_ID || discoveredFile.programInfo.id === SSI_FEDERAL_ID) {
    console.log(`✅ [SNAP/SSI MAIN DEBUG] Successfully processed ${discoveredFile.programInfo.id}:`, {
      programId: discoveredFile.programInfo.id,
      programCreated: true,
      rulesImported: true,
      ruleCount: discoveredFile.rulePackage.rules.length
    });
  }
}

/**
 * Log SNAP/SSI processing error debug information
 */
function logSnapSsiProcessingError(discoveredFile: DiscoveredRuleFile, error: unknown): void {
  if (discoveredFile.programInfo.id === SNAP_FEDERAL_ID || discoveredFile.programInfo.id === SSI_FEDERAL_ID) {
    console.log(`❌ [SNAP/SSI MAIN DEBUG] Error processing ${discoveredFile.programInfo.id}:`, {
      programId: discoveredFile.programInfo.id,
      filePath: discoveredFile.path,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

/**
 * Process a single discovered file
 */
async function processDiscoveredFile(discoveredFile: DiscoveredRuleFile): Promise<{ created: boolean; imported: boolean; error?: string }> {
  console.log(`🔍 [MAIN DISCOVERY DEBUG] Processing file: ${discoveredFile.path} for program: ${discoveredFile.programInfo.id}`);

  logSnapSsiProcessing(discoveredFile);

  try {
    // Create benefit program
    console.log(`🔍 [MAIN DISCOVERY DEBUG] Creating benefit program for ${discoveredFile.programInfo.id}`);
    await createBenefitProgram(discoveredFile);
    console.log(`✅ [MAIN DISCOVERY DEBUG] Created benefit program for ${discoveredFile.programInfo.id}`);

    // Import rules
    console.log(`🔍 [MAIN DISCOVERY DEBUG] Importing rules for ${discoveredFile.programInfo.id}`);
    await importRulesForProgram(discoveredFile);
    console.log(`✅ [MAIN DISCOVERY DEBUG] Imported rules for ${discoveredFile.programInfo.id}`);

    logSnapSsiSuccess(discoveredFile);

    return { created: true, imported: true };
  } catch (error) {
    const errorMsg = `Failed to process ${discoveredFile.path}: ${error}`;
    console.error(`[DEBUG] Rule Discovery: ${errorMsg}`);

    logSnapSsiProcessingError(discoveredFile, error);

    return { created: false, imported: false, error: errorMsg };
  }
}

/**
 * Log final discovery results
 */
function logFinalResults(results: { discovered: number; created: number; imported: number; errors: string[] }): void {
  console.log('🔍 [MAIN DISCOVERY DEBUG] Discovery and seeding complete:', {
    totalDiscovered: results.discovered,
    totalCreated: results.created,
    totalImported: results.imported,
    totalErrors: results.errors.length,
    errors: results.errors
  });

  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] Rule Discovery: Completed - ${results.created} programs created, ${results.imported} rule sets imported, ${results.errors.length} errors`);
  }
}

/**
 * Main function to discover and seed all available rule files
 */
export async function discoverAndSeedAllRules(): Promise<{
  discovered: number;
  created: number;
  imported: number;
  errors: string[];
}> {
  const results = {
    discovered: 0,
    created: 0,
    imported: 0,
    errors: [] as string[],
  };

  try {
    logDiscoveryStart();

    // Discover all rule files
    console.log('🔍 [MAIN DISCOVERY DEBUG] Calling discoverRuleFiles with FEDERAL_RULE_CONFIG');
    const discoveredFiles = await discoverRuleFiles(FEDERAL_RULE_CONFIG);
    results.discovered = discoveredFiles.length;

    logMainDiscoveryResults(discoveredFiles);
    logFileProcessingStart(discoveredFiles);

    // Process each discovered file
    for (const discoveredFile of discoveredFiles) {
      const processResult = await processDiscoveredFile(discoveredFile);

      if (processResult.created) {
        results.created++;
      }
      if (processResult.imported) {
        results.imported++;
      }
      if (processResult.error) {
        results.errors.push(processResult.error);
      }
    }

    logFinalResults(results);

    return results;
  } catch (error) {
    console.error('[DEBUG] Rule Discovery: Error in discovery process:', error);
    results.errors.push(`Discovery process failed: ${error}`);
    return results;
  }
}

/**
 * Check if any new rule files have been added since last discovery
 */
export async function checkForNewRuleFiles(): Promise<boolean> {
  try {
    const db = getDatabase();
    const existingPrograms = await db.benefit_programs.find().exec();
    const discoveredFiles = await discoverRuleFiles(FEDERAL_RULE_CONFIG);

    // Check if we have more rule files than programs
    return discoveredFiles.length > existingPrograms.length;
  } catch (error) {
    console.error('[DEBUG] Rule Discovery: Error checking for new rule files:', error);
    return false;
  }
}
