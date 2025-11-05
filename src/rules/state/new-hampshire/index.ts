/**
 * New Hampshire State Rules Index
 *
 * Centralized export for all New Hampshire-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidNewHampshireRules from './medicaid/medicaid-new-hampshire-rules.json';

// SNAP rules
import snapNewHampshireRules from './snap/snap-new-hampshire-rules.json';

export interface NewHampshireRules {
  medicaid: typeof medicaidNewHampshireRules;
  snap: typeof snapNewHampshireRules;
}

const newHampshireRules: NewHampshireRules = {
  medicaid: medicaidNewHampshireRules,
  snap: snapNewHampshireRules,
};

export default newHampshireRules;
