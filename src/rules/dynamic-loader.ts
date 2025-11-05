/**
 * Dynamic Rule Loader
 *
 * Provides efficient, on-demand loading of benefit rules based on user state.
 * This replaces static imports with dynamic imports for better bundle optimization.
 */

import type { RuleDefinition } from './core/types';
import { importManager } from '../services/ImportManager';

export interface StateRules {
  [program: string]: {
    rules: RuleDefinition[];
    metadata: {
      state: string;
      program: string;
      version: string;
      lastUpdated: number;
    };
  };
}

export interface RuleLoadResult {
  success: boolean;
  rules: StateRules;
  errors: string[];
  loadTime: number;
}

/**
 * Load federal rules dynamically
 */
export async function loadFederalRules(): Promise<RuleLoadResult> {
  const startTime = performance.now();
  const errors: string[] = [];

  try {
    const { default: federalRules } = await import('./federal/index');

    // Convert to StateRules format
    const rules: StateRules = {};

    // Process each federal program
    for (const [programName, ruleData] of Object.entries(federalRules)) {
      // Validate program name to prevent object injection
      if (!programName || typeof programName !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(programName)) {
        continue;
      }

      if (ruleData && typeof ruleData === 'object' && 'rules' in ruleData) {
        const validatedRuleData = ruleData as { rules: RuleDefinition[] };
        // Use Object.assign for safer property assignment
        Object.assign(rules, {
          [programName]: {
            rules: validatedRuleData.rules,
            metadata: {
              state: 'FEDERAL',
              program: programName,
              version: '1.0.0',
              lastUpdated: Date.now(),
            },
          },
        });
      }
    }

    const loadTime = performance.now() - startTime;

    return {
      success: true,
      rules,
      errors,
      loadTime,
    };
  } catch (error) {
    const loadTime = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error loading federal rules';
    errors.push(errorMessage);

    console.error('Failed to load federal rules:', error);

    return {
      success: false,
      rules: {},
      errors,
      loadTime,
    };
  }
}

/**
 * Load state-specific rules dynamically
 */
export async function loadStateRules(stateCode: string): Promise<RuleLoadResult> {
  const startTime = performance.now();
  const errors: string[] = [];

  try {
    // Dynamic import based on state code with proper directory mapping
    const stateDirectory = getStateDirectory(stateCode);
    const stateModule = await import(`./state/${stateDirectory}/index.ts`);
    const stateRules = stateModule.default;

    // Convert to StateRules format
    const rules: StateRules = {};

    // Process each program in the state
    for (const [programName, ruleData] of Object.entries(stateRules)) {
      // Validate program name to prevent object injection
      if (!programName || typeof programName !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(programName)) {
        continue;
      }

      if (ruleData && typeof ruleData === 'object' && 'rules' in ruleData) {
        const validatedRuleData = ruleData as { rules: RuleDefinition[] };
        // Use Object.assign for safer property assignment
        Object.assign(rules, {
          [programName]: {
            rules: validatedRuleData.rules,
            metadata: {
              state: stateCode,
              program: programName,
              version: '1.0.0',
              lastUpdated: Date.now(),
            },
          },
        });
      }
    }

    const loadTime = performance.now() - startTime;

    return {
      success: true,
      rules,
      errors,
      loadTime,
    };
  } catch (error) {
    const loadTime = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : `Unknown error loading rules for state: ${stateCode}`;
    errors.push(errorMessage);

    console.warn(`No rules found for state: ${stateCode}`, error);

    return {
      success: false,
      rules: {},
      errors,
      loadTime,
    };
  }
}

/**
 * Load rules for a specific program and state
 */
export async function loadProgramRules(program: string, stateCode?: string): Promise<RuleLoadResult> {
  const startTime = performance.now();
  const errors: string[] = [];

  try {
    const rules: StateRules = {};

    // Validate program name to prevent object injection
    if (!program || typeof program !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(program)) {
      throw new Error('Invalid program name');
    }

    // Always load federal rules first
    const federalResult = await loadFederalRules();
    if (federalResult.success && Object.hasOwnProperty.call(federalResult.rules, program)) {
      const federalProgramRules = federalResult.rules[program as keyof StateRules];
      // Use Object.assign for safer property assignment
      Object.assign(rules, {
        [program]: federalProgramRules,
      });
    }

    // Load state-specific rules if state is provided
    if (stateCode) {
      const stateResult = await loadStateRules(stateCode);
      if (stateResult.success && Object.hasOwnProperty.call(stateResult.rules, program)) {
        const stateProgramRules = stateResult.rules[program as keyof StateRules];
        // State rules override federal rules
        Object.assign(rules, {
          [program]: stateProgramRules,
        });
      }
    }

    const loadTime = performance.now() - startTime;

    return {
      success: true,
      rules,
      errors,
      loadTime,
    };
  } catch (error) {
    const loadTime = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error loading program rules';
    errors.push(errorMessage);

    console.error(`Failed to load rules for program: ${program}`, error);

    return {
      success: false,
      rules: {},
      errors,
      loadTime,
    };
  }
}

/**
 * Import rules using the dynamic loader
 */
export async function importRulesDynamically(
  stateCode?: string,
  options: {
    force?: boolean;
    retryOnFailure?: boolean;
    maxRetries?: number;
    timeout?: number;
  } = {}
): Promise<{
  success: boolean;
  imported: number;
  errors: string[];
  loadTime: number;
}> {
  const startTime = performance.now();
  const errors: string[] = [];
  let imported = 0;

  try {
    // Load federal rules
    const federalResult = await loadFederalRules();
    imported += await processFederalRules(federalResult, options, errors);

    // Load state-specific rules if state is provided
    if (stateCode) {
      const stateResult = await loadStateRules(stateCode);
      imported += await processStateRules(stateResult, stateCode, options, errors);
    }

    const loadTime = performance.now() - startTime;

    return {
      success: errors.length === 0,
      imported,
      errors,
      loadTime,
    };
  } catch (error) {
    const loadTime = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error in dynamic rule loading';
    errors.push(errorMessage);

    console.error('Failed to import rules dynamically:', error);

    return {
      success: false,
      imported,
      errors,
      loadTime,
    };
  }
}

/**
 * Process federal rules import
 */
async function processFederalRules(
  federalResult: RuleLoadResult,
  options: {
    force?: boolean;
    retryOnFailure?: boolean;
    maxRetries?: number;
    timeout?: number;
  },
  errors: string[]
): Promise<number> {
  let imported = 0;

  if (!federalResult.success) {
    errors.push(...federalResult.errors);
    return imported;
  }

  for (const [programName, programRules] of Object.entries(federalResult.rules)) {
    // Validate program name to prevent object injection
    if (!programName || typeof programName !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(programName)) {
      continue;
    }

    try {
      const importResult = await importManager.importRules(
        `federal-${programName}`,
        programRules.rules,
        options
      );

      if (importResult.success) {
        imported += importResult.imported;
      } else {
        errors.push(
          ...importResult.errors.map((err: { message: string }) =>
            typeof err.message === 'string' ? err.message : 'Unknown import error'
          )
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown import error';
      errors.push(`Failed to import federal ${programName} rules: ${errorMessage}`);
    }
  }

  return imported;
}

/**
 * Process state rules import
 */
async function processStateRules(
  stateResult: RuleLoadResult,
  stateCode: string,
  options: {
    force?: boolean;
    retryOnFailure?: boolean;
    maxRetries?: number;
    timeout?: number;
  },
  errors: string[]
): Promise<number> {
  let imported = 0;

  if (!stateResult.success) {
    errors.push(...stateResult.errors);
    return imported;
  }

  for (const [programName, programRules] of Object.entries(stateResult.rules)) {
    // Validate program name to prevent object injection
    if (!programName || typeof programName !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(programName)) {
      continue;
    }

    try {
      const importResult = await importManager.importRules(
        `state-${stateCode}-${programName}`,
        programRules.rules,
        options
      );

      if (importResult.success) {
        imported += importResult.imported;
      } else {
        errors.push(
          ...importResult.errors.map((err: { message: string }) =>
            typeof err.message === 'string' ? err.message : 'Unknown import error'
          )
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown import error';
      errors.push(`Failed to import ${stateCode} ${programName} rules: ${errorMessage}`);
    }
  }

  return imported;
}

/**
 * Get available states for rule loading
 */
export function getAvailableStates(): string[] {
  return ['georgia', 'california', 'texas', 'alabama', 'alaska', 'arizona', 'arkansas', 'colorado', 'connecticut', 'delaware', 'florida', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa'];
}

/**
 * Map state codes to directory names
 */
const STATE_CODE_MAP: Record<string, string> = {
  'GA': 'georgia',
  'CA': 'california',
  'TX': 'texas',
  'AL': 'alabama',
  'AK': 'alaska',
  'AZ': 'arizona',
  'AR': 'arkansas',
  'CO': 'colorado',
  'CT': 'connecticut',
  'DE': 'delaware',
  'FL': 'florida',
  'HI': 'hawaii',
  'ID': 'idaho',
  'IL': 'illinois',
  'IN': 'indiana',
  'IA': 'iowa',
  'georgia': 'georgia',
  'california': 'california',
  'texas': 'texas',
  'alabama': 'alabama',
  'alaska': 'alaska',
  'arizona': 'arizona',
  'arkansas': 'arkansas',
  'colorado': 'colorado',
  'connecticut': 'connecticut',
  'delaware': 'delaware',
  'florida': 'florida',
  'hawaii': 'hawaii',
  'idaho': 'idaho',
  'illinois': 'illinois',
  'indiana': 'indiana',
  'iowa': 'iowa'
};

/**
 * Get directory name for state code
 */
function getStateDirectory(stateCode: string): string {
  return STATE_CODE_MAP[stateCode.toUpperCase()] || stateCode.toLowerCase();
}

/**
 * Get available programs for rule loading
 */
export function getAvailablePrograms(): string[] {
  return ['snap', 'medicaid', 'tanf', 'wic', 'lihtc', 'section8', 'ssi'];
}
