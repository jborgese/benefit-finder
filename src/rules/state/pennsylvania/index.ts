/**
 * Pennsylvania State Rules Index
 *
 * Centralized export for all Pennsylvania-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidPennsylvaniaRules from './medicaid/medicaid-pennsylvania-rules.json';

// SNAP rules
import snapPennsylvaniaRules from './snap/snap-pennsylvania-rules.json';

export interface PennsylvaniaRules {
  medicaid: typeof medicaidPennsylvaniaRules;
  snap: typeof snapPennsylvaniaRules;
}

const pennsylvaniaRules: PennsylvaniaRules = {
  medicaid: medicaidPennsylvaniaRules,
  snap: snapPennsylvaniaRules,
};

export default pennsylvaniaRules;
