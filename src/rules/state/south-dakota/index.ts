/**
 * South Dakota State Rules Index
 *
 * Centralized export for all South Dakota-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidSouthDakotaRules from './medicaid/medicaid-south-dakota-rules.json';

// SNAP rules
import snapSouthDakotaRules from './snap/snap-south-dakota-rules.json';

export interface SouthDakotaRules {
  medicaid: typeof medicaidSouthDakotaRules;
  snap: typeof snapSouthDakotaRules;
}

const southDakotaRules: SouthDakotaRules = {
  medicaid: medicaidSouthDakotaRules,
  snap: snapSouthDakotaRules,
};

export default southDakotaRules;
