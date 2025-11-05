/**
 * Massachusetts State Rules Index
 *
 * Centralized export for all Massachusetts-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidMassachusettsRules from './medicaid/medicaid-massachusetts-rules.json';

// SNAP rules
import snapMassachusettsRules from './snap/snap-massachusetts-rules.json';

export interface MassachusettsRules {
  medicaid: typeof medicaidMassachusettsRules;
  snap: typeof snapMassachusettsRules;
}

const massachusettsRules: MassachusettsRules = {
  medicaid: medicaidMassachusettsRules,
  snap: snapMassachusettsRules,
};

export default massachusettsRules;
