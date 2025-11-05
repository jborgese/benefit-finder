/**
 * Indiana State Rules Index
 *
 * Centralized export for all Indiana-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidIndianaRules from './medicaid/medicaid-indiana-rules.json';

// SNAP rules
import snapIndianaRules from './snap/snap-indiana-rules.json';

export interface IndianaRules {
  medicaid: typeof medicaidIndianaRules;
  snap: typeof snapIndianaRules;
}

const indianaRules: IndianaRules = {
  medicaid: medicaidIndianaRules,
  snap: snapIndianaRules,
};

export default indianaRules;
