/**
 * Oregon State Rules Index
 *
 * Centralized export for all Oregon-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidOregonRules from './medicaid/medicaid-oregon-rules.json';

// SNAP rules
import snapOregonRules from './snap/snap-oregon-rules.json';

export interface OregonRules {
  medicaid: typeof medicaidOregonRules;
  snap: typeof snapOregonRules;
}

const oregonRules: OregonRules = {
  medicaid: medicaidOregonRules,
  snap: snapOregonRules,
};

export default oregonRules;
