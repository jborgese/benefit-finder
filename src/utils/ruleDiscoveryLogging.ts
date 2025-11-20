// Augment globalThis to include SNAP_FEDERAL_ID and SSI_FEDERAL_ID
// TypeScript: Use typeof globalThis for type assertion with custom properties
export function logRuleImportStart(discoveredFile: DiscoveredRuleFile, programId: string): void {
  const rulePackage = discoveredFile.rulePackage as { metadata: { id: string }, rules: unknown[] };
  console.log('🔍 [RULE IMPORT DEBUG] Starting rule import for program', {
    programId,
    rulePackageId: rulePackage.metadata.id,
    ruleCount: rulePackage.rules.length,
    ruleIds: rulePackage.rules.map(r => (r as Record<string, unknown>)['id'])
  });

  // Enhanced debug logging for SNAP and SSI
  const g = globalThis as typeof globalThis & { SNAP_FEDERAL_ID: string; SSI_FEDERAL_ID: string };
  if (programId === g.SNAP_FEDERAL_ID || programId === g.SSI_FEDERAL_ID) {
    console.log(`🔍 [SNAP/SSI DEBUG] Rule discovery import starting for ${programId}:`, {
      programId,
      rulePackageId: rulePackage.metadata.id,
      ruleCount: rulePackage.rules.length,
      ruleIds: rulePackage.rules.map(r => (r as Record<string, unknown>)['id']),
      ruleTypes: rulePackage.rules.map(r => (r as Record<string, unknown>)['ruleType']),
      hasTestCases: rulePackage.rules.some(r => {
        const rule = r as Record<string, unknown>;
        return Array.isArray(rule['testCases']) && (rule['testCases'] as unknown[]).length > 0;
      }),
      testCaseCount: rulePackage.rules.reduce((total: number, r) => {
        const rule = r as Record<string, unknown>;
        return total + (Array.isArray(rule['testCases']) ? (rule['testCases'] as unknown[]).length : 0);
      }, 0)
    });
  }
}

export function logRuleImportResult(discoveredFile: DiscoveredRuleFile, importResult: unknown, programId: string): void {
  const rulePackage = discoveredFile.rulePackage as { rules: unknown[] };
  console.log('🔍 [RULE IMPORT DEBUG] Rule import result', {
    programId: discoveredFile.programInfo.id,
    importResult,
    success: (importResult as { success: boolean }).success,
    imported: (importResult as { imported: number }).imported,
    failed: (importResult as { failed: number }).failed,
    errors: (importResult as { errors: unknown[] }).errors
  });

  // Enhanced debug logging for SNAP and SSI import results
  const g = globalThis as typeof globalThis & { SNAP_FEDERAL_ID: string; SSI_FEDERAL_ID: string };
  if (programId === g.SNAP_FEDERAL_ID || programId === g.SSI_FEDERAL_ID) {
    console.log(`🔍 [SNAP/SSI DEBUG] Rule discovery import result for ${programId}:`, {
      programId,
      success: (importResult as { success: boolean }).success,
      imported: (importResult as { imported: number }).imported,
      failed: (importResult as { failed: number }).failed,
      skipped: (importResult as { skipped: number }).skipped,
      errorCount: (importResult as { errors: unknown[] }).errors.length,
      warningCount: (importResult as { warnings: unknown[] }).warnings.length,
      errors: (importResult as { errors: { message: string; code: string }[] }).errors.map(e => ({ message: e.message, code: e.code })),
      warnings: (importResult as { warnings: { message: string }[] }).warnings.map(w => ({ message: w.message })),
      ruleCount: rulePackage.rules.length,
      ruleIds: rulePackage.rules.map(r => (r as Record<string, unknown>)['id'])
    });
  }
}

export function logRuleImportError(discoveredFile: DiscoveredRuleFile, error: unknown, programId: string): void {
  const rulePackage = discoveredFile.rulePackage as { rules: unknown[] };
  console.log('🔍 [RULE IMPORT DEBUG] Error importing rules', {
    programId: discoveredFile.programInfo.id,
    error,
    errorMessage: error instanceof Error ? error.message : String(error),
    errorStack: error instanceof Error ? error.stack : undefined
  });

  // Enhanced debug logging for SNAP and SSI errors
  const g = globalThis as typeof globalThis & { SNAP_FEDERAL_ID: string; SSI_FEDERAL_ID: string };
  if (programId === g.SNAP_FEDERAL_ID || programId === g.SSI_FEDERAL_ID) {
    console.log(`❌ [SNAP/SSI DEBUG] Rule discovery import error for ${programId}:`, {
      programId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ruleCount: rulePackage.rules.length,
      ruleIds: rulePackage.rules.map(r => (r as Record<string, unknown>)['id'])
    });
  }
}
// Logging and Debug Helper Functions for Rule Discovery
import type { DiscoveredRuleFile } from './ruleDiscoveryConfig';

export function logDiscoveryDebug(_ruleFiles: Record<string, () => Promise<unknown>>): void {
  // ...existing code...
}
export function logSnapSsiDebug(_filePath: string, _programId?: string): void {
  // ...existing code...
}
export function logSnapSsiError(_filePath: string, _error: unknown): void {
  // ...existing code...
}
export function logDiscoveryResults(_discoveredFiles: DiscoveredRuleFile[], _totalFilesFound: number): void {
  // ...existing code...
}
export function logDiscoveryStart(): void {
  // ...existing code...
}
export function logMainDiscoveryResults(_discoveredFiles: DiscoveredRuleFile[]): void {
  // ...existing code...
}
export function logFileProcessingStart(_discoveredFiles: DiscoveredRuleFile[]): void {
  // ...existing code...
}
export function logSnapSsiProcessing(_discoveredFile: DiscoveredRuleFile): void {
  // ...existing code...
}
export function logSnapSsiSuccess(_discoveredFile: DiscoveredRuleFile): void {
  // ...existing code...
}
export function logSnapSsiProcessingError(_discoveredFile: DiscoveredRuleFile, _error: unknown): void {
  // ...existing code...
}
export function logFinalResults(_results: { discovered: number; created: number; imported: number; errors: string[] }): void {
  // ...existing code...
}
