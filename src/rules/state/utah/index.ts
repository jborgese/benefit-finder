/**
 * Utah State Rules Index
 *
 * Centralized export for all Utah-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidUtahRules from './medicaid/medicaid-utah-rules.json';

// SNAP rules
import snapUtahRules from './snap/snap-utah-rules.json';

export interface UtahRules {
  medicaid: typeof medicaidUtahRules;
  snap: typeof snapUtahRules;
}

const utahRules: UtahRules = {
  medicaid: medicaidUtahRules,
  snap: snapUtahRules,
};

export default utahRules;
