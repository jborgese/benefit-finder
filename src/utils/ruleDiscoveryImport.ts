// Rule Import Helper for Rule Discovery
import { importManager } from '../services/ImportManager';
import type { DiscoveredRuleFile } from './ruleDiscoveryConfig';
// Removed unused imports
import { logRuleImportStart, logRuleImportResult, logRuleImportError } from './ruleDiscoveryLogging';

export async function importRulesForProgram(discoveredFile: DiscoveredRuleFile): Promise<void> {
  const programId = discoveredFile.programInfo.id;
  const importKey = `rule-discovery-${programId}`;
  logRuleImportStart(discoveredFile, programId);
  try {
    const importResult = await importManager.importRules(
      importKey,
      (discoveredFile.rulePackage['rules'] as unknown[]),
      {
        force: false,
        retryOnFailure: true,
        maxRetries: 3,
        timeout: 30000
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
