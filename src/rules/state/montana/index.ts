/**
 * Montana State Rules Index
 *
 * Centralized export for all Montana-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidMontanaRules from './medicaid/medicaid-montana-rules.json';

// SNAP rules
import snapMontanaRules from './snap/snap-montana-rules.json';

export interface MontanaRules {
  medicaid: typeof medicaidMontanaRules;
  snap: typeof snapMontanaRules;
}

const montanaRules: MontanaRules = {
  medicaid: medicaidMontanaRules,
  snap: snapMontanaRules,
};

export default montanaRules;
