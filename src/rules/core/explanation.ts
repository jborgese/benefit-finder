/**
 * Rule Explanation System (Wrapper)
 * 
 * This file maintains backward compatibility by re-exporting from the modular explanation implementation.
 * The explanation system has been refactored into a more maintainable structure in the ./explanation-system directory.
 */

// Re-export everything from the modular implementation
export { explainResult, explainRule, formatRuleExplanation } from './explanation-system';
export { explainDifference, explainWhatWouldPass } from './explanation-system';
export type { ResultExplanation, ExplanationOptions } from './explanation-system';