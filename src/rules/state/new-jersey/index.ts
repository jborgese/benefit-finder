/**
 * New Jersey State Rules Index
 *
 * Centralized export for all New Jersey-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidNewJerseyRules from './medicaid/medicaid-new-jersey-rules.json';

// SNAP rules
import snapNewJerseyRules from './snap/snap-new-jersey-rules.json';

export interface NewJerseyRules {
  medicaid: typeof medicaidNewJerseyRules;
  snap: typeof snapNewJerseyRules;
}

const newJerseyRules: NewJerseyRules = {
  medicaid: medicaidNewJerseyRules,
  snap: snapNewJerseyRules,
};

export default newJerseyRules;
