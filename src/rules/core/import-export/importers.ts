/**
 * Rule Import Functions
 */

import { validateRuleDefinition, validateRulePackage, calculateChecksum, formatVersion, type RuleImportOptions, type RuleImportResult } from '../schema';
import { IMPORT_ERROR_CODES } from './constants';
import {
  extractRuleMetadata,
  logSnapSsiDebugInfo,
  logSnapSsiValidationResult,
  logSnapSsiDatabaseOperation,
  logSnapSsiError,
  logSnapSsiBatchImport,
} from './logging';
import { performRuleValidationAndTests, handleSchemaValidationFailure } from './validation';
import { checkExistingRuleConflicts, saveRuleToDatabase } from './database';

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

  const { ruleId, programId } = extractRuleMetadata(ruleData);

  try {
    logSnapSsiDebugInfo(programId, ruleId, ruleData);

    const validation = validateRuleDefinition(ruleData);

    if (!validation.success) {
      return handleSchemaValidationFailure(validation, programId, ruleId, result);
    }

    const rule = validation.data;
    console.log(`🔍 [VALIDATE] ${rule.id} (${rule.ruleType})`);

    const validationSuccess = await performRuleValidationAndTests(
      rule,
      { validate: opts.validate, skipTests: opts.skipTests },
      result
    );

    logSnapSsiValidationResult(programId, ruleId, validationSuccess, result);

    if (!validationSuccess) {
      result.failed = 1;
      return result;
    }

    const canProceed = await checkExistingRuleConflicts(
      rule,
      { mode: opts.mode, overwriteExisting: opts.overwriteExisting },
      result
    );
    if (!canProceed) {
      result.skipped = 1;
      return result;
    }

    if (!opts.dryRun) {
      console.log(`💾 [SAVE] ${rule.id}`);
      logSnapSsiDatabaseOperation(programId, ruleId, 'saving', {
        ruleId: rule.id,
        programId: rule.programId,
        ruleType: rule.ruleType,
        version: rule.version,
        active: rule.active,
        mode: opts.mode
      });

      await saveRuleToDatabase(rule, opts.mode);
      result.imported = 1;
      result.success = true;
      console.log(`✅ [SAVE] ${rule.id} completed`);
      logSnapSsiDatabaseOperation(programId, ruleId, 'saved');
    } else {
      result.imported = 1;
      result.success = true;
      result.warnings.push({
        ruleId: rule.id,
        message: 'Dry run - rule not actually imported',
      });
      logSnapSsiDatabaseOperation(programId, ruleId, 'dry-run');
    }

  } catch (error) {
    logSnapSsiError(programId, ruleId, error);
    result.errors.push({
      message: error instanceof Error ? error.message : 'Unknown error',
      code: IMPORT_ERROR_CODES.DATABASE_ERROR,
    });
    result.failed = 1;
  }

  return result;
}

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

  console.log(`🔍 [IMPORT] Starting import of ${rules.length} rules`);

  logSnapSsiBatchImport(rules, 'start');

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

  console.log(`📊 [IMPORT] Complete: ${aggregateResult.imported} imported, ${aggregateResult.failed} failed, ${aggregateResult.errors.length} errors`);

  logSnapSsiBatchImport(rules, 'complete', {
    imported: aggregateResult.imported,
    failed: aggregateResult.failed,
    errors: aggregateResult.errors.length,
    success: aggregateResult.success
  });

  return aggregateResult;
}

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

    console.log(`🔍 [DEBUG] importRulePackage: Importing ${pkg.rules.length} rules from package: ${pkg.metadata.name}`);
    pkg.rules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.id} (${rule.ruleType})`);
    });

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

export async function importFromJSON(
  json: string,
  options: RuleImportOptions = {}
): Promise<RuleImportResult> {
  try {
    const data = JSON.parse(json);

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
