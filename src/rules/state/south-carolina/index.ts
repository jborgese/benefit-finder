/**
 * South Carolina State Rules Index
 *
 * Centralized export for all South Carolina-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidSouthCarolinaRules from './medicaid/medicaid-south-carolina-rules.json';

// SNAP rules
import snapSouthCarolinaRules from './snap/snap-south-carolina-rules.json';

export interface SouthCarolinaRules {
  medicaid: typeof medicaidSouthCarolinaRules;
  snap: typeof snapSouthCarolinaRules;
}

const southCarolinaRules: SouthCarolinaRules = {
  medicaid: medicaidSouthCarolinaRules,
  snap: snapSouthCarolinaRules,
};

export default southCarolinaRules;
