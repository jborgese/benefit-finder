/**
 * Vermont State Rules Index
 *
 * Centralized export for all Vermont-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidVermontRules from './medicaid/medicaid-vermont-rules.json';

// SNAP rules
import snapVermontRules from './snap/snap-vermont-rules.json';

export interface VermontRules {
  medicaid: typeof medicaidVermontRules;
  snap: typeof snapVermontRules;
}

const vermontRules: VermontRules = {
  medicaid: medicaidVermontRules,
  snap: snapVermontRules,
};

export default vermontRules;
