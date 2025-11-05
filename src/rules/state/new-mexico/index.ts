/**
 * New Mexico State Rules Index
 *
 * Centralized export for all New Mexico-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidNewMexicoRules from './medicaid/medicaid-new-mexico-rules.json';

// SNAP rules
import snapNewMexicoRules from './snap/snap-new-mexico-rules.json';

export interface NewMexicoRules {
  medicaid: typeof medicaidNewMexicoRules;
  snap: typeof snapNewMexicoRules;
}

const newMexicoRules: NewMexicoRules = {
  medicaid: medicaidNewMexicoRules,
  snap: snapNewMexicoRules,
};

export default newMexicoRules;
