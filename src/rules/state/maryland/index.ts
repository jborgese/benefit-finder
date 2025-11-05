/**
 * Maryland State Rules Index
 *
 * Centralized export for all Maryland-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidMarylandRules from './medicaid/medicaid-maryland-rules.json';

// SNAP rules
import snapMarylandRules from './snap/snap-maryland-rules.json';

export interface MarylandRules {
  medicaid: typeof medicaidMarylandRules;
  snap: typeof snapMarylandRules;
}

const marylandRules: MarylandRules = {
  medicaid: medicaidMarylandRules,
  snap: snapMarylandRules,
};

export default marylandRules;
