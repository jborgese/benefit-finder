/**
 * Kentucky State Rules Index
 *
 * Centralized export for all Kentucky-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidKentuckyRules from './medicaid/medicaid-kentucky-rules.json';

// SNAP rules
import snapKentuckyRules from './snap/snap-kentucky-rules.json';

export interface KentuckyRules {
  medicaid: typeof medicaidKentuckyRules;
  snap: typeof snapKentuckyRules;
}

const kentuckyRules: KentuckyRules = {
  medicaid: medicaidKentuckyRules,
  snap: snapKentuckyRules,
};

export default kentuckyRules;
