/**
 * Validation utilities for Rule Import/Export
 */

import { validateRule } from '../validator';
import { runTestSuite, createTestSuite } from '../tester';
import type { RuleDefinition, RuleSchemaValidationResult, RuleImportResult } from '../schema';
import type { JsonLogicRule } from '../types';
import { IMPORT_ERROR_CODES, PROGRAM_IDS } from './constants';

export function validateRuleLogic(rule: RuleDefinition): RuleSchemaValidationResult {
  console.log('🔍 [RULE LOGIC VALIDATION DEBUG] Starting rule logic validation', {
    ruleId: rule.id,
    programId: rule.programId,
    ruleName: rule.name,
    ruleType: rule.ruleType,
    hasRuleLogic: !!rule.ruleLogic,
    ruleLogicType: typeof rule.ruleLogic,
    ruleLogicKeys: rule.ruleLogic && typeof rule.ruleLogic === 'object' ? Object.keys(rule.ruleLogic) : 'not an object',
    requiredFields: rule.requiredFields,
    requiredFieldsType: typeof rule.requiredFields,
    requiredFieldsLength: Array.isArray(rule.requiredFields) ? rule.requiredFields.length : 'not an array'
  });

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

  console.log('🔍 [RULE LOGIC VALIDATION DEBUG] Validating JSON Logic rule', {
    ruleId: rule.id,
    ruleLogic: rule.ruleLogic,
    ruleLogicStringified: JSON.stringify(rule.ruleLogic, null, 2)
  });

  const logicValidation = validateRule(rule.ruleLogic);

  console.log('🔍 [RULE LOGIC VALIDATION DEBUG] JSON Logic validation result', {
    ruleId: rule.id,
    valid: logicValidation.valid,
    errorCount: logicValidation.errors.length,
    warningCount: logicValidation.warnings.length,
    errors: logicValidation.errors.map(e => ({
      message: e.message,
      code: e.code,
      severity: e.severity
    })),
    warnings: logicValidation.warnings.map(w => ({
      message: w.message,
      code: w.code
    }))
  });

  if (!logicValidation.valid) {
    console.log('🔍 [RULE LOGIC VALIDATION DEBUG] JSON Logic validation failed - detailed error analysis', {
      ruleId: rule.id,
      ruleLogic: rule.ruleLogic,
      errors: logicValidation.errors,
      errorDetails: logicValidation.errors.map(e => ({
        message: e.message,
        code: e.code,
        severity: e.severity,
        field: (e as { field?: string }).field
      }))
    });

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

export async function runRuleTests(rule: RuleDefinition): Promise<{
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

export async function performRuleValidationAndTests(
  rule: RuleDefinition,
  options: { validate: boolean; skipTests: boolean },
  result: RuleImportResult
): Promise<boolean> {
  if (!options.validate) {
    return true;
  }

  const logicValidation = validateRuleLogic(rule);

  if (!logicValidation.valid) {
    result.errors.push(...logicValidation.errors.map((e) => ({
      ruleId: rule.id,
      message: e.message,
      code: e.code,
    })));
  }

  if (logicValidation.warnings.length > 0) {
    result.warnings.push(...logicValidation.warnings.map((w) => ({
      ruleId: rule.id,
      message: w.message,
    })));
  }

  if (!options.skipTests && rule.testCases && rule.testCases.length > 0) {
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

  return logicValidation.valid;
}

export function handleSchemaValidationFailure(
  validation: unknown,
  programId: string,
  ruleId: string,
  result: RuleImportResult
): RuleImportResult {
  const issues: Array<{ path: string[]; message: string; expected?: unknown; received?: unknown }> = [];

  try {
    const err = (validation as { error?: { issues?: unknown[] } })?.error ?? validation;
    const rawIssues = (err && Array.isArray((err as { issues?: unknown[] }).issues)) ? (err as { issues: unknown[] }).issues : [];

    for (const i of rawIssues) {
      const issue = i as { path?: unknown; message?: string; expected?: unknown; received?: unknown };
      const rawPath = Array.isArray(issue.path) ? issue.path.map((p: unknown) => String(p)) : [];
      issues.push({
        path: rawPath,
        message: String(issue.message ?? 'Validation error'),
        expected: issue.expected,
        received: issue.received
      });
    }
  } catch {
    // Fall back to empty issues
  }

  if (programId === PROGRAM_IDS.SNAP_FEDERAL || programId === PROGRAM_IDS.SSI_FEDERAL) {
    console.log(`❌ [SNAP/SSI DEBUG] Schema validation failed for ${ruleId}:`, {
      errorCount: issues.length,
      errors: issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        expected: issue.expected,
        received: issue.received
      }))
    });
  }

  console.log('❌ [IMPORT] Schema validation failed:', issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message
  })));

  return {
    ...result,
    errors: [...result.errors, {
      message: 'Invalid rule structure',
      code: IMPORT_ERROR_CODES.INVALID_FORMAT,
    }],
    failed: 1,
  };
}
