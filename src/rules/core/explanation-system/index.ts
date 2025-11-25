/**
 * Rule Explanation System
 *
 * Modular explanation system for rule evaluation results.
 * Provides transparency into eligibility decisions.
 */

// Main functions
export { explainResult, explainRule, formatRuleExplanation } from './main';
export { explainDifference, explainWhatWouldPass } from './comparison';

// Types
export type { ResultExplanation, ExplanationOptions } from './types';

// Utilities (for advanced usage)
export { formatFieldName, formatValue } from './formatting';
export { generateExplanationTree } from './treeGeneration';
