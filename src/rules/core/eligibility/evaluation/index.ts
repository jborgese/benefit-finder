/**
 * Main eligibility evaluation orchestration
 *
 * This file provides the primary exports and maintains backward compatibility.
 */

import { registerBenefitOperators } from '../../evaluator';
import { debugLog } from './utils';

// Re-export all public functions
export { getEvaluationEntities, getAllProgramRuleIds } from './database';
export { prepareDataContext } from './dataContext';
export { evaluateAllRules } from './multiRuleEvaluation';
export { selectResultRule, buildEvaluationResult, buildErrorResult } from './resultBuilder';

// Re-export types from parent directory
export type {
  EvaluationEntities,
  RuleEvaluationWithDetails,
  AllRulesEvaluationResult,
  ResultRuleSelection,
  EligibilityEvaluationResult
} from '../types';

let operatorsRegistered = false;

/**
 * Ensure custom operators are registered
 */
export function ensureOperatorsRegistered(): void {
  if (!operatorsRegistered) {
    debugLog('Registering benefit operators for rule evaluation.');
    registerBenefitOperators();
    operatorsRegistered = true;
  } else {
    debugLog('Benefit operators already registered.');
  }
}
