/**
 * Virginia State Rules Index
 *
 * Centralized export for all Virginia-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidVirginiaRules from './medicaid/medicaid-virginia-rules.json';

// SNAP rules
import snapVirginiaRules from './snap/snap-virginia-rules.json';

export interface VirginiaRules {
  medicaid: typeof medicaidVirginiaRules;
  snap: typeof snapVirginiaRules;
}

const virginiaRules: VirginiaRules = {
  medicaid: medicaidVirginiaRules,
  snap: snapVirginiaRules,
};

export default virginiaRules;
