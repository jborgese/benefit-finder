/**
 * Mississippi State Rules Index
 *
 * Centralized export for all Mississippi-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidMississippiRules from './medicaid/medicaid-mississippi-rules.json';

// SNAP rules
import snapMississippiRules from './snap/snap-mississippi-rules.json';

export interface MississippiRules {
  medicaid: typeof medicaidMississippiRules;
  snap: typeof snapMississippiRules;
}

const mississippiRules: MississippiRules = {
  medicaid: medicaidMississippiRules,
  snap: snapMississippiRules,
};

export default mississippiRules;
