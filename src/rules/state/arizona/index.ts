/**
 * Arizona State Rules Index
 *
 * Centralized export for all Arizona-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidArizonaRules from './medicaid/medicaid-arizona-rules.json';

// SNAP rules
import snapArizonaRules from './snap/snap-arizona-rules.json';

export interface ArizonaRules {
  medicaid: typeof medicaidArizonaRules;
  snap: typeof snapArizonaRules;
}

const arizonaRules: ArizonaRules = {
  medicaid: medicaidArizonaRules,
  snap: snapArizonaRules,
};

export default arizonaRules;
