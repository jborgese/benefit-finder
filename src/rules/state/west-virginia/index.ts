/**
 * West Virginia State Rules Index
 *
 * Centralized export for all West Virginia-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidWestVirginiaRules from './medicaid/medicaid-west-virginia-rules.json';

// SNAP rules
import snapWestVirginiaRules from './snap/snap-west-virginia-rules.json';

export interface WestVirginiaRules {
  medicaid: typeof medicaidWestVirginiaRules;
  snap: typeof snapWestVirginiaRules;
}

const westVirginiaRules: WestVirginiaRules = {
  medicaid: medicaidWestVirginiaRules,
  snap: snapWestVirginiaRules,
};

export default westVirginiaRules;
