/**
 * Washington State Rules Index
 *
 * Centralized export for all Washington-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidWashingtonRules from './medicaid/medicaid-washington-rules.json';

// SNAP rules
import snapWashingtonRules from './snap/snap-washington-rules.json';

export interface WashingtonRules {
  medicaid: typeof medicaidWashingtonRules;
  snap: typeof snapWashingtonRules;
}

const washingtonRules: WashingtonRules = {
  medicaid: medicaidWashingtonRules,
  snap: snapWashingtonRules,
};

export default washingtonRules;
