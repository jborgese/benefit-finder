/**
 * Missouri State Rules Index
 *
 * Centralized export for all Missouri-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidMissouriRules from './medicaid/medicaid-missouri-rules.json';

// SNAP rules
import snapMissouriRules from './snap/snap-missouri-rules.json';

export interface MissouriRules {
  medicaid: typeof medicaidMissouriRules;
  snap: typeof snapMissouriRules;
}

const missouriRules: MissouriRules = {
  medicaid: medicaidMissouriRules,
  snap: snapMissouriRules,
};

export default missouriRules;
