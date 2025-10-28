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
      if (ruleData && typeof ruleData === 'object' && 'rules' in ruleData) {
        rules[programName] = {
          rules: (ruleData as { rules: RuleDefinition[] }).rules,
          metadata: {
            state: 'FEDERAL',
            program: programName,
            version: '1.0.0',
            lastUpdated: Date.now(),
          },
        };
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
    // Dynamic import based on state code
    const stateModule = await import(`./state/${stateCode.toLowerCase()}/index.ts`);
    const stateRules = stateModule.default;

    // Convert to StateRules format
    const rules: StateRules = {};

    // Process each program in the state
    for (const [programName, ruleData] of Object.entries(stateRules)) {
      if (ruleData && typeof ruleData === 'object' && 'rules' in ruleData) {
        rules[programName] = {
          rules: (ruleData as { rules: RuleDefinition[] }).rules,
          metadata: {
            state: stateCode,
            program: programName,
            version: '1.0.0',
            lastUpdated: Date.now(),
          },
        };
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
    let rules: StateRules = {};

    // Always load federal rules first
    const federalResult = await loadFederalRules();
    if (federalResult.success && federalResult.rules[program]) {
      rules[program] = federalResult.rules[program];
    }

    // Load state-specific rules if state is provided
    if (stateCode) {
      const stateResult = await loadStateRules(stateCode);
      if (stateResult.success && stateResult.rules[program]) {
        // State rules override federal rules
        rules[program] = stateResult.rules[program];
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
    if (federalResult.success) {
      for (const [programName, programRules] of Object.entries(federalResult.rules)) {
        try {
          const importResult = await importManager.importRules(
            `federal-${programName}`,
            programRules.rules,
            options
          );

          if (importResult.success) {
            imported += importResult.imported;
          } else {
            errors.push(...importResult.errors.map(e => e.message));
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown import error';
          errors.push(`Failed to import federal ${programName} rules: ${errorMessage}`);
        }
      }
    } else {
      errors.push(...federalResult.errors);
    }

    // Load state-specific rules if state is provided
    if (stateCode) {
      const stateResult = await loadStateRules(stateCode);
      if (stateResult.success) {
        for (const [programName, programRules] of Object.entries(stateResult.rules)) {
          try {
            const importResult = await importManager.importRules(
              `state-${stateCode}-${programName}`,
              programRules.rules,
              options
            );

            if (importResult.success) {
              imported += importResult.imported;
            } else {
              errors.push(...importResult.errors.map(e => e.message));
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown import error';
            errors.push(`Failed to import ${stateCode} ${programName} rules: ${errorMessage}`);
          }
        }
      } else {
        errors.push(...stateResult.errors);
      }
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
 * Get available states for rule loading
 */
export function getAvailableStates(): string[] {
  return ['georgia', 'california', 'texas'];
}

/**
 * Get available programs for rule loading
 */
export function getAvailablePrograms(): string[] {
  return ['snap', 'medicaid', 'tanf', 'wic', 'lihtc', 'section8', 'ssi'];
}
