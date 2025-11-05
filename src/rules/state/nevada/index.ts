/**
 * Nevada State Rules Index
 *
 * Centralized export for all Nevada-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidNevadaRules from './medicaid/medicaid-nevada-rules.json';

// SNAP rules
import snapNevadaRules from './snap/snap-nevada-rules.json';

export interface NevadaRules {
  medicaid: typeof medicaidNevadaRules;
  snap: typeof snapNevadaRules;
}

const nevadaRules: NevadaRules = {
  medicaid: medicaidNevadaRules,
  snap: snapNevadaRules,
};

export default nevadaRules;
