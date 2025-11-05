/**
 * Michigan State Rules Index
 *
 * Centralized export for all Michigan-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidMichiganRules from './medicaid/medicaid-michigan-rules.json';

// SNAP rules
import snapMichiganRules from './snap/snap-michigan-rules.json';

export interface MichiganRules {
  medicaid: typeof medicaidMichiganRules;
  snap: typeof snapMichiganRules;
}

const michiganRules: MichiganRules = {
  medicaid: medicaidMichiganRules,
  snap: snapMichiganRules,
};

export default michiganRules;
