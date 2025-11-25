import {
  FEDERAL_RULE_CONFIG,
  RuleDiscoveryConfig,
  DiscoveredRuleFile
} from './ruleDiscoveryConfig';
import {
  logDiscoveryDebug,
  logSnapSsiDebug,
  logDiscoveryResults,
  logDiscoveryStart,
  logMainDiscoveryResults,
  logFileProcessingStart,
  logSnapSsiProcessing,
  logSnapSsiSuccess,
  logSnapSsiProcessingError,
  logFinalResults
} from './ruleDiscoveryLogging';
import { extractRulePackage, extractProgramInfo } from './ruleDiscoveryExtractors';
import { createBenefitProgram } from './ruleDiscoveryDb';
import { importRulesForProgram } from './ruleDiscoveryImport';

// Discover all rule files matching the configuration
async function discoverRuleFiles(config: RuleDiscoveryConfig): Promise<DiscoveredRuleFile[]> {
  const discoveredFiles: DiscoveredRuleFile[] = [];
  try {
    const ruleFiles = import.meta.glob('../rules/federal/**/*-federal-rules.json');
    logDiscoveryDebug(ruleFiles);
    for (const [filePath, importFn] of Object.entries(ruleFiles)) {
      const typedImportFn = (): Promise<Record<string, unknown>> => importFn() as Promise<Record<string, unknown>>;
      const module = await typedImportFn();
      const rulePackage = extractRulePackage(module, filePath);
      if (!rulePackage) {
        continue;
      }
      const programInfo = extractProgramInfo(rulePackage, config);
      logSnapSsiDebug(filePath, programInfo.id);
      discoveredFiles.push({ path: filePath, rulePackage, programInfo });
    }
    logDiscoveryResults(discoveredFiles, Object.keys(ruleFiles).length);
    return discoveredFiles;
  } catch (error) {
    console.error('[DEBUG] Rule Discovery: Error discovering rule files:', error);
    return [];
  }
}

// Process a single discovered file
async function processDiscoveredFile(discoveredFile: DiscoveredRuleFile): Promise<{ created: boolean; imported: boolean; error?: string }> {
  logSnapSsiProcessing(discoveredFile);
  try {
    const wasCreated = await createBenefitProgram(discoveredFile);
    await importRulesForProgram(discoveredFile);
    logSnapSsiSuccess(discoveredFile);
    return { created: wasCreated, imported: true };
  } catch (error) {
    logSnapSsiProcessingError(discoveredFile, error);
    return { created: false, imported: false, error: String(error) };
  }
}

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
    const discoveredFiles = await discoverRuleFiles(FEDERAL_RULE_CONFIG);
    results.discovered = discoveredFiles.length;
    logMainDiscoveryResults(discoveredFiles);
    logFileProcessingStart(discoveredFiles);
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

export async function checkForNewRuleFiles(): Promise<boolean> {
  try {
    const db = (await import('../db')).getDatabase();
    const existingPrograms = await db!.benefit_programs.find().exec();
    const discoveredFiles = await discoverRuleFiles(FEDERAL_RULE_CONFIG);
    const existingProgramIds = new Set(existingPrograms.map((p: { id: string }) => p.id));
    for (const discoveredFile of discoveredFiles) {
      if (!existingProgramIds.has(discoveredFile.programInfo.id)) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('[DEBUG] Rule Discovery: Error checking for new rule files:', error);
    return false;
  }
}
