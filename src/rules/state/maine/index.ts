/**
 * Maine State Rules Index
 *
 * Centralized export for all Maine-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidMaineRules from './medicaid/medicaid-maine-rules.json';

// SNAP rules
import snapMaineRules from './snap/snap-maine-rules.json';

export interface MaineRules {
  medicaid: typeof medicaidMaineRules;
  snap: typeof snapMaineRules;
}

const maineRules: MaineRules = {
  medicaid: medicaidMaineRules,
  snap: snapMaineRules,
};

export default maineRules;
