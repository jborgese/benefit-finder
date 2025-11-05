/**
 * Louisiana State Rules Index
 *
 * Centralized export for all Louisiana-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidLouisianaRules from './medicaid/medicaid-louisiana-rules.json';

// SNAP rules
import snapLouisianaRules from './snap/snap-louisiana-rules.json';

export interface LouisianaRules {
  medicaid: typeof medicaidLouisianaRules;
  snap: typeof snapLouisianaRules;
}

const louisianaRules: LouisianaRules = {
  medicaid: medicaidLouisianaRules,
  snap: snapLouisianaRules,
};

export default louisianaRules;
