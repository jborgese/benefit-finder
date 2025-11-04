/**
 * Alabama State Rules Index
 *
 * Centralized export for all Alabama-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidAlabamaRules from './medicaid/medicaid-alabama-rules.json';

// SNAP rules
import snapAlabamaRules from './snap/snap-alabama-rules.json';

export interface AlabamaRules {
  medicaid: typeof medicaidAlabamaRules;
  snap: typeof snapAlabamaRules;
}

const alabamaRules: AlabamaRules = {
  medicaid: medicaidAlabamaRules,
  snap: snapAlabamaRules,
};

export default alabamaRules;
