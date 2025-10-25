/**
 * Rule Discovery Utilities
 *
 * Automatically discovers and processes rule files to create benefit programs
 * and import their rules into the database.
 */

import { getDatabase } from '../db';
import { importRulePackage } from '../rules/core/import-export';
import type { BenefitProgram } from '../db/schemas';

// Constants
const US_FEDERAL_JURISDICTION = 'US-FEDERAL';

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
  rulePackage: any;
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
 * Discover all rule files matching the configuration
 */
async function discoverRuleFiles(config: RuleDiscoveryConfig): Promise<DiscoveredRuleFile[]> {
  const discoveredFiles: DiscoveredRuleFile[] = [];

  try {
    // Get all rule files dynamically using import.meta.glob
    // This will find all files matching the pattern in the specified directory
    const ruleFiles = import.meta.glob('../rules/federal/**/*-federal-rules.json', { eager: true });

    if (import.meta.env.DEV) {
      console.warn('[DEBUG] Rule Discovery: Found rule files:', Object.keys(ruleFiles));
      console.warn('[DEBUG] Rule Discovery: Federal rule files found:', Object.keys(ruleFiles).filter(f => f.includes('federal')));
    }

    for (const [filePath, module] of Object.entries(ruleFiles)) {
      try {
        const rulePackage = (module as any).default;

        if (!rulePackage?.metadata?.programs?.length) {
          console.warn(`[DEBUG] Rule Discovery: Skipping ${filePath} - no programs defined`);
          continue;
        }

        // Extract program information from rule metadata
        const programInfo = extractProgramInfo(rulePackage, config);

        discoveredFiles.push({
          path: filePath,
          rulePackage,
          programInfo,
        });

        if (import.meta.env.DEV) {
          console.warn(`[DEBUG] Rule Discovery: Processed ${filePath} for program ${programInfo.id}`);
        }
      } catch (error) {
        console.error(`[DEBUG] Rule Discovery: Error processing ${filePath}:`, error);
      }
    }

    return discoveredFiles;
  } catch (error) {
    console.error('[DEBUG] Rule Discovery: Error discovering rule files:', error);
    return [];
  }
}

/**
 * Extract program information from rule package metadata
 */
function extractProgramInfo(rulePackage: any, config: RuleDiscoveryConfig) {
  const metadata = rulePackage.metadata;
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
    jurisdiction: metadata.jurisdiction || config.defaultJurisdiction,
    website,
    phoneNumber,
    applicationUrl,
    tags: metadata.tags || [],
  };
}

/**
 * Extract program name from rule package name
 */
function extractProgramName(ruleName: string, programId: string): string {
  // For TANF, SSI, Section 8, LIHTC, we need to map to proper names
  const programNameMap: Record<string, string> = {
    'tanf-federal': 'Temporary Assistance for Needy Families (TANF)',
    'ssi-federal': 'Supplemental Security Income (SSI)',
    'section8-federal': 'Section 8 Housing Choice Voucher',
    'lihtc-federal': 'Low-Income Housing Tax Credit (LIHTC)',
    'snap-federal': 'Supplemental Nutrition Assistance Program (SNAP)',
    'medicaid-federal': 'Medicaid',
    'wic-federal': 'Special Supplemental Nutrition Program for Women, Infants, and Children (WIC)',
  };

  // Check if we have a direct mapping
  if (programNameMap[programId]) {
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
    'ssi-federal': 'Provides monthly cash assistance to disabled, blind, or elderly individuals with limited income and resources',
    'section8-federal': 'Provides rental assistance to help low-income families, elderly, and disabled individuals afford decent housing',
    'lihtc-federal': 'Provides affordable housing options for low-income families through tax credit-financed rental housing',
    'snap-federal': 'SNAP helps low-income individuals and families buy food',
    'medicaid-federal': 'Health coverage for low-income individuals and families',
    'wic-federal': 'Provides nutrition assistance to pregnant women, new mothers, and young children',
  };

  // Check if we have a direct mapping
  if (descriptionMap[programId]) {
    return descriptionMap[programId];
  }

  // Fallback to rule description or default
  return ruleDescription || `Federal ${programId.replace(/-federal$/, '')} program`;
}

/**
 * Extract short name from program name
 */
function extractShortName(programName: string, programId: string): string {
  // Map to proper short names
  const shortNameMap: Record<string, string> = {
    'tanf-federal': 'TANF',
    'ssi-federal': 'SSI',
    'section8-federal': 'Section 8',
    'lihtc-federal': 'LIHTC',
    'snap-federal': 'SNAP',
    'medicaid-federal': 'Medicaid',
    'wic-federal': 'WIC',
  };

  // Check if we have a direct mapping
  if (shortNameMap[programId]) {
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
    'snap-federal': 'https://www.fns.usda.gov/snap',
    'medicaid-federal': 'https://www.medicaid.gov',
    'wic-federal': 'https://www.fns.usda.gov/wic',
    'tanf-federal': 'https://www.acf.hhs.gov/ofa/programs/tanf',
    'ssi-federal': 'https://www.ssa.gov/ssi',
    'section8-federal': 'https://www.hud.gov/topics/housing_choice_voucher_program_section_8',
    'lihtc-federal': 'https://www.hud.gov/program_offices/housing/mfh/htsf/lihtc',
  };

  return websites[programId] || 'https://www.benefits.gov';
}

/**
 * Extract phone number for a program
 */
function extractPhoneNumber(programId: string): string {
  const phoneNumbers: Record<string, string> = {
    'snap-federal': '1-800-221-5689',
    'medicaid-federal': '1-800-318-2596',
    'wic-federal': '1-800-221-5689',
    'tanf-federal': '1-800-318-2596',
    'ssi-federal': '1-800-772-1213',
    'section8-federal': '1-800-955-2232',
    'lihtc-federal': '1-800-955-2232',
  };

  return phoneNumbers[programId] || '1-800-318-2596';
}

/**
 * Extract application URL for a program
 */
function extractApplicationUrl(programId: string): string {
  const applicationUrls: Record<string, string> = {
    'snap-federal': 'https://www.benefits.gov/benefit/361',
    'medicaid-federal': 'https://www.healthcare.gov',
    'wic-federal': 'https://www.fns.usda.gov/wic/wic-contacts',
    'tanf-federal': 'https://www.benefits.gov/benefit/613',
    'ssi-federal': 'https://www.ssa.gov/benefits/ssi',
    'section8-federal': 'https://www.hud.gov/program_offices/public_indian_housing/programs/hcv',
    'lihtc-federal': 'https://www.hud.gov/program_offices/housing/mfh/htsf/lihtc',
  };

  return applicationUrls[programId] || 'https://www.benefits.gov';
}

/**
 * Create benefit program from discovered rule file
 */
async function createBenefitProgram(discoveredFile: DiscoveredRuleFile): Promise<void> {
  const db = getDatabase();
  const { programInfo } = discoveredFile;

  try {
    await db.benefit_programs.insert({
      id: programInfo.id,
      name: programInfo.name,
      shortName: programInfo.shortName,
      description: programInfo.description,
      category: programInfo.category as any,
      jurisdiction: programInfo.jurisdiction,
      jurisdictionLevel: 'federal',
      website: programInfo.website,
      phoneNumber: programInfo.phoneNumber,
      applicationUrl: programInfo.applicationUrl,
      active: true,
      tags: programInfo.tags,
      lastUpdated: Date.now(),
      createdAt: Date.now(),
    });

    if (import.meta.env.DEV) {
      console.warn(`[DEBUG] Rule Discovery: Created benefit program ${programInfo.id}`);
    }
  } catch (error) {
    console.error(`[DEBUG] Rule Discovery: Error creating program ${programInfo.id}:`, error);
    throw error;
  }
}

/**
 * Import rules for a discovered rule file
 */
async function importRulesForProgram(discoveredFile: DiscoveredRuleFile): Promise<void> {
  try {
    await importRulePackage(discoveredFile.rulePackage);

    if (import.meta.env.DEV) {
      console.warn(`[DEBUG] Rule Discovery: Imported rules for program ${discoveredFile.programInfo.id}`);
    }
  } catch (error) {
    console.error(`[DEBUG] Rule Discovery: Error importing rules for ${discoveredFile.programInfo.id}:`, error);
    throw error;
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
    if (import.meta.env.DEV) {
      console.warn('[DEBUG] Rule Discovery: Starting discovery and seeding process');
    }

    // Discover all rule files
    const discoveredFiles = await discoverRuleFiles(FEDERAL_RULE_CONFIG);
    results.discovered = discoveredFiles.length;

    if (import.meta.env.DEV) {
      console.warn(`[DEBUG] Rule Discovery: Found ${discoveredFiles.length} rule files`);
    }

    // Process each discovered file
    for (const discoveredFile of discoveredFiles) {
      try {
        // Create benefit program
        await createBenefitProgram(discoveredFile);
        results.created++;

        // Import rules
        await importRulesForProgram(discoveredFile);
        results.imported++;

      } catch (error) {
        const errorMsg = `Failed to process ${discoveredFile.path}: ${error}`;
        results.errors.push(errorMsg);
        console.error(`[DEBUG] Rule Discovery: ${errorMsg}`);
      }
    }

    if (import.meta.env.DEV) {
      console.warn(`[DEBUG] Rule Discovery: Completed - ${results.created} programs created, ${results.imported} rule sets imported, ${results.errors.length} errors`);
    }

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
