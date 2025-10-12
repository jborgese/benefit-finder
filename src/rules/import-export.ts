/**
 * Rule Import/Export System
 *
 * Handles importing and exporting rules with validation,
 * versioning, and error handling.
 */

import { getDatabase } from '../db/database';
import { validateRule } from './validator';
import { runTestSuite, createTestSuite } from './tester';
import {
  validateRuleDefinition,
  validateRulePackage,
  calculateChecksum,
  formatVersion,
  compareVersions,
  type RuleDefinition,
  type RulePackage,
  type RuleImportOptions,
  type RuleImportResult,
  type RuleExportOptions,
  type RuleSchemaValidationResult,
} from './schema';
import type { EligibilityRule } from '../db/schemas';
import type { JsonLogicRule } from './types';

// ============================================================================
// ERROR CODES
// ============================================================================

export const IMPORT_ERROR_CODES = {
  INVALID_FORMAT: 'IMPORT_INVALID_FORMAT',
  VALIDATION_FAILED: 'IMPORT_VALIDATION_FAILED',
  DUPLICATE_ID: 'IMPORT_DUPLICATE_ID',
  MISSING_PROGRAM: 'IMPORT_MISSING_PROGRAM',
  TEST_FAILED: 'IMPORT_TEST_FAILED',
  VERSION_CONFLICT: 'IMPORT_VERSION_CONFLICT',
  CHECKSUM_MISMATCH: 'IMPORT_CHECKSUM_MISMATCH',
  DATABASE_ERROR: 'IMPORT_DATABASE_ERROR',
} as const;

// ============================================================================
// RULE IMPORT
// ============================================================================

/**
 * Import a single rule
 *
 * @param ruleData Rule definition to import
 * @param options Import options
 * @returns Import result
 */
export async function importRule(
  ruleData: unknown,
  options: RuleImportOptions = {}
): Promise<RuleImportResult> {
  const opts = {
    mode: options.mode ?? 'upsert',
    validate: options.validate !== false,
    skipTests: options.skipTests ?? false,
    overwriteExisting: options.overwriteExisting !== false,
    dryRun: options.dryRun ?? false,
  };

  const result: RuleImportResult = {
    success: false,
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    warnings: [],
    dryRun: opts.dryRun,
  };

  try {
    // Validate structure
    const validation = validateRuleDefinition(ruleData);
    if (!validation.success) {
      result.errors.push({
        message: 'Invalid rule structure',
        code: IMPORT_ERROR_CODES.INVALID_FORMAT,
      });
      result.failed = 1;
      return result;
    }

    const rule = validation.data;

    // Validate logic and run tests
    const validationSuccess = await performRuleValidationAndTests(
      rule,
      { validate: opts.validate, skipTests: opts.skipTests },
      result
    );
    if (!validationSuccess) {
      result.failed = 1;
      return result;
    }

    // Check for existing rule and handle conflicts
    const canProceed = await checkExistingRuleConflicts(
      rule,
      { mode: opts.mode, overwriteExisting: opts.overwriteExisting },
      result
    );
    if (!canProceed) {
      result.skipped = 1;
      return result;
    }

    // Import rule (unless dry run)
    if (!opts.dryRun) {
      await saveRuleToDatabase(rule, opts.mode);
      result.imported = 1;
      result.success = true;
    } else {
      result.imported = 1;
      result.success = true;
      result.warnings.push({
        ruleId: rule.id,
        message: 'Dry run - rule not actually imported',
      });
    }

  } catch (error) {
    result.errors.push({
      message: error instanceof Error ? error.message : 'Unknown error',
      code: IMPORT_ERROR_CODES.DATABASE_ERROR,
    });
    result.failed = 1;
  }

  return result;
}

/**
 * Import multiple rules
 *
 * @param rules Array of rule definitions
 * @param options Import options
 * @returns Aggregate import result
 */
export async function importRules(
  rules: unknown[],
  options: RuleImportOptions = {}
): Promise<RuleImportResult> {
  const aggregateResult: RuleImportResult = {
    success: true,
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    warnings: [],
    dryRun: options.dryRun ?? false,
  };

  for (const ruleData of rules) {
    const result = await importRule(ruleData, options);

    aggregateResult.imported += result.imported;
    aggregateResult.skipped += result.skipped;
    aggregateResult.failed += result.failed;
    aggregateResult.errors.push(...result.errors);
    aggregateResult.warnings.push(...result.warnings);

    if (!result.success) {
      aggregateResult.success = false;
    }
  }

  return aggregateResult;
}

/**
 * Import a rule package
 *
 * @param packageData Rule package to import
 * @param options Import options
 * @returns Import result
 */
export async function importRulePackage(
  packageData: unknown,
  options: RuleImportOptions = {}
): Promise<RuleImportResult> {
  const result: RuleImportResult = {
    success: false,
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    warnings: [],
    dryRun: options.dryRun ?? false,
  };

  try {
    // Validate package structure
    const validation = validateRulePackage(packageData);
    if (!validation.success) {
      result.errors.push({
        message: 'Invalid package structure',
        code: IMPORT_ERROR_CODES.INVALID_FORMAT,
      });
      result.failed = 1;
      return result;
    }

    const pkg = validation.data;

    // Verify checksum if present
    if (pkg.checksum) {
      const calculatedChecksum = await calculateChecksum({
        metadata: pkg.metadata,
        rules: pkg.rules,
      });

      if (calculatedChecksum !== pkg.checksum) {
        result.errors.push({
          message: 'Package checksum mismatch - package may be corrupted',
          code: IMPORT_ERROR_CODES.CHECKSUM_MISMATCH,
        });
        result.failed = 1;
        return result;
      }
    }

    // Import all rules in package
    const importResult = await importRules(pkg.rules, options);

    return {
      ...importResult,
      warnings: [
        ...importResult.warnings,
        {
          message: `Imported package: ${pkg.metadata.name} v${formatVersion(pkg.metadata.version)}`,
        },
      ],
    };

  } catch (error) {
    result.errors.push({
      message: error instanceof Error ? error.message : 'Unknown error',
      code: IMPORT_ERROR_CODES.DATABASE_ERROR,
    });
    result.failed = 1;
  }

  return result;
}

// ============================================================================
// RULE EXPORT
// ============================================================================

/**
 * Export a single rule
 *
 * @param ruleId Rule ID to export
 * @param options Export options
 * @returns Rule definition
 */
export async function exportRule(
  ruleId: string,
  options: RuleExportOptions = {}
): Promise<RuleDefinition | null> {
  const db = getDatabase();
  const rule = await db.eligibility_rules.findOne(ruleId).exec();

  if (!rule) {
    return null;
  }

  return convertDatabaseRuleToDefinition(rule, options);
}

/**
 * Export multiple rules
 *
 * @param ruleIds Array of rule IDs
 * @param options Export options
 * @returns Array of rule definitions
 */
export async function exportRules(
  ruleIds: string[],
  options: RuleExportOptions = {}
): Promise<RuleDefinition[]> {
  const rules: RuleDefinition[] = [];

  for (const id of ruleIds) {
    const rule = await exportRule(id, options);
    if (rule) {
      rules.push(rule);
    }
  }

  return rules;
}

/**
 * Export rules as a package
 *
 * @param ruleIds Rule IDs to include
 * @param packageName Package name
 * @param options Export options
 * @returns Rule package
 */
export async function exportRulePackage(
  ruleIds: string[],
  packageName: string,
  options: RuleExportOptions = {}
): Promise<RulePackage> {
  const rules = await exportRules(ruleIds, options);

  const metadata = {
    id: `package-${Date.now()}`,
    name: packageName,
    version: { major: 1, minor: 0, patch: 0 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const pkg: RulePackage = {
    metadata,
    rules,
  };

  // Calculate checksum
  pkg.checksum = await calculateChecksum({
    metadata: pkg.metadata,
    rules: pkg.rules,
  });

  return pkg;
}

/**
 * Export all rules for a program
 *
 * @param programId Program ID
 * @param options Export options
 * @returns Array of rule definitions
 */
export async function exportProgramRules(
  programId: string,
  options: RuleExportOptions = {}
): Promise<RuleDefinition[]> {
  const db = getDatabase();
  const rules = await db.eligibility_rules
    .find({
      selector: { programId },
    })
    .exec();

  return rules.map((rule) => convertDatabaseRuleToDefinition(rule, options));
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Perform validation and testing on a rule
 */
async function performRuleValidationAndTests(
  rule: RuleDefinition,
  opts: { validate: boolean; skipTests: boolean },
  result: RuleImportResult
): Promise<boolean> {
  // Validate logic if requested
  if (opts.validate) {
    const logicValidation = validateRuleLogic(rule);
    if (!logicValidation.valid) {
      result.errors.push(...logicValidation.errors.map((e) => ({
        ruleId: rule.id,
        message: e.message,
        code: e.code,
      })));
      return false;
    }

    if (logicValidation.warnings.length > 0) {
      result.warnings.push(...logicValidation.warnings.map((w) => ({
        ruleId: rule.id,
        message: w.message,
      })));
    }
  }

  // Run tests if included and not skipped
  if (!opts.skipTests && rule.testCases && rule.testCases.length > 0) {
    const testResult = await runRuleTests(rule);
    if (!testResult.success) {
      result.errors.push({
        ruleId: rule.id,
        message: `Tests failed: ${testResult.failed}/${testResult.total}`,
        code: IMPORT_ERROR_CODES.TEST_FAILED,
      });
      result.warnings.push({
        ruleId: rule.id,
        message: 'Continuing import despite test failures',
      });
    }
  }

  return true;
}

/**
 * Check for existing rule and handle conflicts
 */
async function checkExistingRuleConflicts(
  rule: RuleDefinition,
  opts: { mode: string; overwriteExisting: boolean },
  result: RuleImportResult
): Promise<boolean> {
  const db = getDatabase();
  const existing = await db.eligibility_rules.findOne(rule.id).exec();

  if (!existing) {
    return true;
  }

  if (opts.mode === 'create') {
    result.errors.push({
      ruleId: rule.id,
      message: 'Rule already exists and mode is "create"',
      code: IMPORT_ERROR_CODES.DUPLICATE_ID,
    });
    return false;
  }

  if (!opts.overwriteExisting) {
    result.warnings.push({
      ruleId: rule.id,
      message: 'Rule exists and overwrite is disabled',
    });
    return false;
  }

  // Check version conflict
  const existingVersion = existing.version ? JSON.parse(existing.version) : null;
  if (existingVersion && compareVersions(rule.version, existingVersion) <= 0) {
    result.warnings.push({
      ruleId: rule.id,
      message: 'Importing older or same version over newer version',
    });
  }

  return true;
}

/**
 * Validate rule logic
 */
function validateRuleLogic(
  rule: RuleDefinition
): RuleSchemaValidationResult {
  const errors: Array<{
    field?: string;
    message: string;
    code: string;
    severity: 'error' | 'critical';
  }> = [];

  const warnings: Array<{
    field?: string;
    message: string;
    code?: string;
  }> = [];

  // Validate JSON Logic rule
  const logicValidation = validateRule(rule.ruleLogic);

  if (!logicValidation.valid) {
    errors.push(...logicValidation.errors.map((e) => ({
      field: 'ruleLogic',
      message: e.message,
      code: e.code,
      severity: e.severity,
    })));
  }

  warnings.push(...logicValidation.warnings.map((w) => ({
    field: 'ruleLogic',
    message: w.message,
    code: w.code,
  })));

  return {
    valid: errors.length === 0,
    structureValid: true,
    logicValid: errors.length === 0,
    metadataValid: true,
    testsValid: true,
    errors,
    warnings,
  };
}

/**
 * Run rule tests
 */
async function runRuleTests(rule: RuleDefinition): Promise<{
  success: boolean;
  total: number;
  passed: number;
  failed: number;
}> {
  if (!rule.testCases || rule.testCases.length === 0) {
    return { success: true, total: 0, passed: 0, failed: 0 };
  }

  const suite = createTestSuite()
    .name(`Tests for ${rule.name}`)
    .rule(rule.ruleLogic as JsonLogicRule)
    .tests(rule.testCases.map((tc) => ({
      description: tc.description,
      input: tc.input,
      expected: tc.expected,
      tags: tc.tags,
    })))
    .build();

  const result = await runTestSuite(suite);

  return {
    success: result.failed === 0,
    total: result.total,
    passed: result.passed,
    failed: result.failed,
  };
}

/**
 * Save rule to database
 */
async function saveRuleToDatabase(
  rule: RuleDefinition,
  mode: string
): Promise<void> {
  const db = getDatabase();

  const dbRule: Partial<EligibilityRule> = {
    id: rule.id,
    programId: rule.programId,
    name: rule.name,
    description: rule.description,
    ruleType: rule.ruleType,
    ruleLogic: rule.ruleLogic as Record<string, unknown>,
    explanation: rule.explanation,
    requiredDocuments: rule.requiredDocuments?.map((d) => d.name),
    requiredFields: rule.requiredFields,
    version: formatVersion(rule.version),
    effectiveDate: rule.effectiveDate,
    expirationDate: rule.expirationDate,
    source: rule.source,
    sourceDocument: rule.citations?.[0]?.document,
    legalReference: rule.legalReference,
    priority: rule.priority,
    active: rule.active,
    draft: rule.draft,
    testCases: rule.testCases?.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.expected as boolean,
      description: tc.description,
    })),
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
    createdBy: rule.createdBy,
  };

  if (mode === 'create') {
    await db.eligibility_rules.insert(dbRule as EligibilityRule);
  } else {
    await db.eligibility_rules.upsert(dbRule as EligibilityRule);
  }
}

/**
 * Convert database rule to definition
 */
function convertDatabaseRuleToDefinition(
  dbRule: EligibilityRule,
  options: RuleExportOptions
): RuleDefinition {
  const version = dbRule.version
    ? JSON.parse(dbRule.version)
    : { major: 1, minor: 0, patch: 0 };

  const definition: RuleDefinition = {
    id: dbRule.id,
    programId: dbRule.programId,
    name: dbRule.name,
    description: dbRule.description,
    ruleLogic: dbRule.ruleLogic,
    ruleType: dbRule.ruleType,
    explanation: dbRule.explanation,
    requiredFields: dbRule.requiredFields,
    requiredDocuments: dbRule.requiredDocuments?.map((name: string) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      required: true,
    })),
    version,
    effectiveDate: dbRule.effectiveDate,
    expirationDate: dbRule.expirationDate,
    source: dbRule.source,
    legalReference: dbRule.legalReference,
    active: dbRule.active,
    draft: dbRule.draft,
    priority: dbRule.priority,
    createdAt: dbRule.createdAt,
    updatedAt: dbRule.updatedAt,
    createdBy: dbRule.createdBy,
  };

  // Include test cases if requested
  if (options.includeTests !== false && dbRule.testCases) {
    definition.testCases = dbRule.testCases.map((tc) => ({
      id: `test-${Date.now()}-${Math.random()}`,
      description: tc.description,
      input: tc.input,
      expected: tc.expectedOutput,
    }));
  }

  return definition;
}

// ============================================================================
// FILE I/O
// ============================================================================

/**
 * Import rules from JSON string
 */
export async function importFromJSON(
  json: string,
  options: RuleImportOptions = {}
): Promise<RuleImportResult> {
  try {
    const data = JSON.parse(json);

    // Check if it's a package or single rule or array
    if (data.metadata && data.rules) {
      return await importRulePackage(data, options);
    } else if (Array.isArray(data)) {
      return await importRules(data, options);
    } else {
      return await importRule(data, options);
    }
  } catch (error) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      failed: 1,
      errors: [{
        message: error instanceof Error ? error.message : 'Invalid JSON',
        code: IMPORT_ERROR_CODES.INVALID_FORMAT,
      }],
      warnings: [],
    };
  }
}

/**
 * Export rules to JSON string
 */
export async function exportToJSON(
  ruleIds: string[],
  options: RuleExportOptions = {}
): Promise<string> {
  const rules = await exportRules(ruleIds, options);

  const indent = options.pretty ? 2 : undefined;
  return JSON.stringify(rules, null, indent);
}

/**
 * Export package to JSON string
 */
export async function exportPackageToJSON(
  ruleIds: string[],
  packageName: string,
  options: RuleExportOptions = {}
): Promise<string> {
  const pkg = await exportRulePackage(ruleIds, packageName, options);

  const indent = options.pretty ? 2 : undefined;
  return JSON.stringify(pkg, null, indent);
}

