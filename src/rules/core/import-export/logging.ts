/**
 * Logging utilities for Rule Import/Export
 *
 * Enhanced debugging for SNAP and SSI rules
 */

import { PROGRAM_IDS } from './constants';
import type { UnknownRuleData, RuleMetadata } from './types';
import type { RuleImportResult } from '../schema';

export function extractRuleMetadata(ruleData: unknown): RuleMetadata {
  if (ruleData && typeof ruleData === 'object') {
    const rd = ruleData as UnknownRuleData;
    const ruleId = typeof rd.id === 'string' ? rd.id : String(rd.id ?? 'unknown');
    const programId = typeof rd.programId === 'string' ? rd.programId : String(rd.programId ?? 'unknown');
    return { ruleId, programId };
  }

  return { ruleId: 'unknown', programId: 'unknown' };
}

export function logSnapSsiDebugInfo(programId: string, ruleId: string, ruleData: unknown): void {
  if (programId === PROGRAM_IDS.SNAP_FEDERAL || programId === PROGRAM_IDS.SSI_FEDERAL) {
    console.log(`🔍 [SNAP/SSI DEBUG] Starting import for ${ruleId} in program ${programId}`);
    console.log(`🔍 [SNAP/SSI DEBUG] Rule data structure:`, {
      hasId: 'id' in (ruleData as UnknownRuleData),
      hasProgramId: 'programId' in (ruleData as UnknownRuleData),
      hasRuleLogic: 'ruleLogic' in (ruleData as UnknownRuleData),
      hasVersion: 'version' in (ruleData as UnknownRuleData),
      hasActive: 'active' in (ruleData as UnknownRuleData),
      hasCreatedAt: 'createdAt' in (ruleData as UnknownRuleData),
      hasUpdatedAt: 'updatedAt' in (ruleData as UnknownRuleData),
      hasTestCases: 'testCases' in (ruleData as UnknownRuleData),
      testCaseCount: Array.isArray((ruleData as UnknownRuleData).testCases) ? ((ruleData as UnknownRuleData).testCases as unknown[]).length : 0
    });
  }
}

export function logSnapSsiValidationResult(
  programId: string,
  ruleId: string,
  success: boolean,
  result: RuleImportResult
): void {
  if (programId === PROGRAM_IDS.SNAP_FEDERAL || programId === PROGRAM_IDS.SSI_FEDERAL) {
    if (success) {
      console.log(`✅ [SNAP/SSI DEBUG] Validation passed for ${ruleId}`);
    } else {
      console.log(`❌ [SNAP/SSI DEBUG] Validation failed for ${ruleId}:`, {
        errorCount: result.errors.length,
        errors: result.errors.map(e => ({ message: e.message, code: e.code }))
      });
    }
  }
}

export function logSnapSsiDatabaseOperation(
  programId: string,
  ruleId: string,
  operation: string,
  data?: Record<string, unknown>
): void {
  if (programId === PROGRAM_IDS.SNAP_FEDERAL || programId === PROGRAM_IDS.SSI_FEDERAL) {
    if (operation === 'saving') {
      console.log(`🔍 [SNAP/SSI DEBUG] Saving ${ruleId} to database:`, data);
    } else if (operation === 'saved') {
      console.log(`✅ [SNAP/SSI DEBUG] Successfully saved ${ruleId} to database`);
    } else if (operation === 'dry-run') {
      console.log(`🔍 [SNAP/SSI DEBUG] Dry run - ${ruleId} would be imported`);
    }
  }
}

export function logSnapSsiError(programId: string, ruleId: string, error: unknown): void {
  if (programId === PROGRAM_IDS.SNAP_FEDERAL || programId === PROGRAM_IDS.SSI_FEDERAL) {
    console.log(`❌ [SNAP/SSI DEBUG] Error importing ${ruleId}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      programId,
      ruleId
    });
  }
}

export function logSnapSsiBatchImport(
  rules: unknown[],
  operation: 'start' | 'complete',
  result?: {
    imported: number;
    failed: number;
    errors: number;
    success: boolean;
  }
): void {
  const snapRules = rules.filter((rule: unknown) => (rule as UnknownRuleData).programId === PROGRAM_IDS.SNAP_FEDERAL);
  const ssiRules = rules.filter((rule: unknown) => (rule as UnknownRuleData).programId === PROGRAM_IDS.SSI_FEDERAL);

  if (snapRules.length > 0 || ssiRules.length > 0) {
    if (operation === 'start') {
      if (snapRules.length > 0) {
        console.log(`🔍 [SNAP/SSI DEBUG] Batch import starting for SNAP: ${snapRules.length} rules`);
      }
      if (ssiRules.length > 0) {
        console.log(`🔍 [SNAP/SSI DEBUG] Batch import starting for SSI: ${ssiRules.length} rules`);
      }
    } else if (operation === 'complete' && result) {
      console.log(`🔍 [SNAP/SSI DEBUG] Batch import complete:`, {
        snapRules: snapRules.length,
        ssiRules: ssiRules.length,
        totalImported: result.imported,
        totalFailed: result.failed,
        totalErrors: result.errors,
        success: result.success
      });
    }
  }
}
