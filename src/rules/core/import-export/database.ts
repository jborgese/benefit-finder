/**
 * Database operations for Rule Import/Export
 */

import { getDatabase } from '../../../db/database';
import { formatVersion, compareVersions, type RuleDefinition, type RuleImportResult, type RuleExportOptions } from '../schema';
import type { EligibilityRule } from '../../../db/schemas';
import { IMPORT_ERROR_CODES } from './constants';

export async function checkExistingRuleConflicts(
  rule: RuleDefinition,
  opts: { mode: string; overwriteExisting: boolean },
  result: RuleImportResult
): Promise<boolean> {
  const db = getDatabase()!;
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

  const existingVersion = existing.version ? JSON.parse(existing.version) : null;
  if (existingVersion && compareVersions(rule.version, existingVersion) <= 0) {
    result.warnings.push({
      ruleId: rule.id,
      message: 'Importing older or same version over newer version',
    });
  }

  return true;
}

export async function saveRuleToDatabase(
  rule: RuleDefinition,
  mode: string
): Promise<void> {
  const db = getDatabase()!;

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
      input: (tc as { input: Record<string, unknown> }).input,
      expectedOutput: (tc as { expectedOutput?: boolean | Record<string, unknown>; expected?: boolean | Record<string, unknown> }).expectedOutput ?? (tc as { expected?: boolean | Record<string, unknown> }).expected ?? true,
      description: (tc as { description?: string }).description ?? '',
    })),
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
    createdBy: rule.createdBy,
  };

  try {
    if (mode === 'create') {
      await db.eligibility_rules.insert(dbRule as EligibilityRule);
    } else {
      await db.eligibility_rules.upsert(dbRule as EligibilityRule);
    }
  } catch (dbError) {
    console.log(`❌ [SAVE] Database error for ${rule.id}:`, dbError instanceof Error ? dbError.message : 'Unknown error');
    throw dbError;
  }
}

export function convertDatabaseRuleToDefinition(
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
