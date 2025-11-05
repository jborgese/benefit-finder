/**
 * Hawaii State Rules Index
 *
 * Centralized export for all Hawaii-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidHawaiiRules from './medicaid/medicaid-hawaii-rules.json';

// SNAP rules
import snapHawaiiRules from './snap/snap-hawaii-rules.json';

export interface HawaiiRules {
  medicaid: typeof medicaidHawaiiRules;
  snap: typeof snapHawaiiRules;
}

const hawaiiRules: HawaiiRules = {
  medicaid: medicaidHawaiiRules,
  snap: snapHawaiiRules,
};

export default hawaiiRules;
