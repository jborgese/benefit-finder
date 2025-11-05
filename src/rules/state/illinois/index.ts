/**
 * Illinois State Rules Index
 *
 * Centralized export for all Illinois-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidIllinoisRules from './medicaid/medicaid-illinois-rules.json';

// SNAP rules
import snapIllinoisRules from './snap/snap-illinois-rules.json';

export interface IllinoisRules {
  medicaid: typeof medicaidIllinoisRules;
  snap: typeof snapIllinoisRules;
}

const illinoisRules: IllinoisRules = {
  medicaid: medicaidIllinoisRules,
  snap: snapIllinoisRules,
};

export default illinoisRules;
