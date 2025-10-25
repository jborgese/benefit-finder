/**
 * Import Manager - Centralized import state management and safeguards
 *
 * This service provides:
 * - Import state tracking to prevent duplicate imports
 * - Resource-efficient import operations
 * - Error handling and retry logic
 * - Import caching and optimization
 */

import { importRules } from '../rules/core/import-export';
import type { RuleImportResult } from '../rules/core/import-export';
import { resourceMonitor } from './ResourceMonitor';

export interface ImportState {
  isImporting: boolean;
  lastImportTime: number;
  importCount: number;
  failedImports: Set<string>;
  successfulImports: Set<string>;
}

export interface ImportOptions {
  force?: boolean;
  retryOnFailure?: boolean;
  maxRetries?: number;
  timeout?: number;
}

export class ImportManager {
  private static instance: ImportManager;
  private importStates: Map<string, ImportState> = new Map();
  private importPromises: Map<string, Promise<RuleImportResult>> = new Map();
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly DEFAULT_MAX_RETRIES = 3;

  private constructor() {}

  public static getInstance(): ImportManager {
    if (ImportManager.instance === undefined) {
      ImportManager.instance = new ImportManager();
    }
    return ImportManager.instance;
  }

  /**
   * Check if an import is currently in progress
   */
  public isImporting(importKey: string): boolean {
    const state = this.importStates.get(importKey);
    return state?.isImporting ?? false;
  }

  /**
   * Check if an import was recently completed successfully
   */
  public wasRecentlyImported(importKey: string, maxAge: number = 60000): boolean {
    const state = this.importStates.get(importKey);
    if (!state) return false;

    const timeSinceLastImport = Date.now() - state.lastImportTime;
    return timeSinceLastImport < maxAge;
  }

  /**
   * Check if an import previously failed
   */
  public hasFailedImport(importKey: string): boolean {
    const state = this.importStates.get(importKey);
    return state?.failedImports.has(importKey) ?? false;
  }

  /**
   * Get import statistics for monitoring
   */
  public getImportStats(importKey: string): ImportState | null {
    return this.importStates.get(importKey) ?? null;
  }

  /**
   * Safely import rules with safeguards
   */
  public async importRules(
    importKey: string,
    rules: unknown[],
    options: ImportOptions = {}
  ): Promise<RuleImportResult> {
    // Start resource monitoring
    resourceMonitor.startImportMonitoring(importKey);
    const {
      force = false,
      retryOnFailure = true,
      maxRetries = this.DEFAULT_MAX_RETRIES,
      timeout = this.DEFAULT_TIMEOUT
    } = options;

    // Check resource health before starting import
    if (resourceMonitor.isUnderResourcePressure()) {
      console.warn(`⚠️ [IMPORT MANAGER] System under resource pressure, delaying import for ${importKey}`);
      // Wait a bit for resources to free up
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Check if import is already in progress
    if (this.isImporting(importKey) && !force) {
      console.log(`🔄 [IMPORT MANAGER] Import already in progress for ${importKey}, waiting...`);
      const existingPromise = this.importPromises.get(importKey);
      if (existingPromise) {
        return existingPromise;
      }
    }

    // Check if import was recently completed successfully
    if (this.wasRecentlyImported(importKey) && !force) {
      console.log(`✅ [IMPORT MANAGER] Import recently completed for ${importKey}, skipping`);
      return {
        success: true,
        imported: 0,
        skipped: rules.length,
        failed: 0,
        errors: [],
        warnings: [],
        dryRun: false
      };
    }

    // Check if import previously failed and retry is disabled
    if (this.hasFailedImport(importKey) && !retryOnFailure && !force) {
      console.log(`❌ [IMPORT MANAGER] Import previously failed for ${importKey}, skipping`);
      return {
        success: false,
        imported: 0,
        skipped: 0,
        failed: rules.length,
        errors: [{ ruleId: importKey, message: 'Previous import failed', code: 'PREVIOUS_FAILURE' }],
        warnings: [],
        dryRun: false
      };
    }

    // Initialize import state
    this.initializeImportState(importKey);

    // Create import promise with timeout and retry logic
    const importPromise = this.executeImportWithSafeguards(
      importKey,
      rules,
      maxRetries,
      timeout
    );

    // Store the promise to prevent duplicate imports
    this.importPromises.set(importKey, importPromise);

    try {
      const result = await importPromise;
      this.handleImportSuccess(importKey, result);
      resourceMonitor.endImportMonitoring(importKey, true);
      return result;
    } catch (error) {
      this.handleImportFailure(importKey, error);
      resourceMonitor.endImportMonitoring(importKey, false, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      // Clean up the promise
      this.importPromises.delete(importKey);
    }
  }

  /**
   * Initialize import state for a given key
   */
  private initializeImportState(importKey: string): void {
    const existingState = this.importStates.get(importKey);
    this.importStates.set(importKey, {
      isImporting: true,
      lastImportTime: existingState?.lastImportTime ?? 0,
      importCount: (existingState?.importCount ?? 0) + 1,
      failedImports: existingState?.failedImports ?? new Set(),
      successfulImports: existingState?.successfulImports ?? new Set()
    });
  }

  /**
   * Execute import with timeout and retry logic
   */
  private async executeImportWithSafeguards(
    importKey: string,
    rules: unknown[],
    maxRetries: number,
    timeout: number
  ): Promise<RuleImportResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [IMPORT MANAGER] Attempt ${attempt}/${maxRetries} for ${importKey}`);

        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Import timeout after ${timeout}ms`)), timeout);
        });

        // Create import promise
        const importPromise = importRules(rules, {
          validate: true,
          skipTests: false,
          mode: 'upsert',
          overwriteExisting: true
        });

        // Race between import and timeout
        const result = await Promise.race([importPromise, timeoutPromise]);

        console.log(`✅ [IMPORT MANAGER] Import successful for ${importKey} on attempt ${attempt}`);
        return result;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown import error');
        console.warn(`⚠️ [IMPORT MANAGER] Import attempt ${attempt} failed for ${importKey}:`, lastError.message);

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * (2 ** (attempt - 1)), 10000);
          console.log(`⏳ [IMPORT MANAGER] Waiting ${delay}ms before retry for ${importKey}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError ?? new Error(`Import failed after ${maxRetries} attempts`);
  }

  /**
   * Handle successful import
   */
  private handleImportSuccess(importKey: string, result: RuleImportResult): void {
    const state = this.importStates.get(importKey);
    if (state) {
      state.isImporting = false;
      state.lastImportTime = Date.now();
      state.successfulImports.add(importKey);
      state.failedImports.delete(importKey);
    }

    console.log(`✅ [IMPORT MANAGER] Import completed successfully for ${importKey}:`, {
      imported: result.imported,
      failed: result.failed,
      errors: result.errors.length
    });
  }

  /**
   * Handle failed import
   */
  private handleImportFailure(importKey: string, error: unknown): void {
    const state = this.importStates.get(importKey);
    if (state) {
      state.isImporting = false;
      state.failedImports.add(importKey);
      state.successfulImports.delete(importKey);
    }

    console.error(`❌ [IMPORT MANAGER] Import failed for ${importKey}:`, error);
  }

  /**
   * Clear import state (useful for testing or manual reset)
   */
  public clearImportState(importKey?: string): void {
    if (importKey) {
      this.importStates.delete(importKey);
      this.importPromises.delete(importKey);
    } else {
      this.importStates.clear();
      this.importPromises.clear();
    }
  }

  /**
   * Get all import states for monitoring
   */
  public getAllImportStates(): Map<string, ImportState> {
    return new Map(this.importStates);
  }

  /**
   * Check if any imports are currently in progress
   */
  public hasActiveImports(): boolean {
    return Array.from(this.importStates.values()).some(state => state.isImporting);
  }

  /**
   * Wait for all active imports to complete
   */
  public async waitForAllImports(): Promise<void> {
    const activePromises = Array.from(this.importPromises.values());
    if (activePromises.length > 0) {
      console.log(`⏳ [IMPORT MANAGER] Waiting for ${activePromises.length} active imports to complete...`);
      await Promise.allSettled(activePromises);
    }
  }
}

// Export singleton instance
export const importManager = ImportManager.getInstance();
