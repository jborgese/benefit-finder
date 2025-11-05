/**
 * Ohio State Rules Index
 *
 * Centralized export for all Ohio-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidOhioRules from './medicaid/medicaid-ohio-rules.json';

// SNAP rules
import snapOhioRules from './snap/snap-ohio-rules.json';

export interface OhioRules {
  medicaid: typeof medicaidOhioRules;
  snap: typeof snapOhioRules;
}

const ohioRules: OhioRules = {
  medicaid: medicaidOhioRules,
  snap: snapOhioRules,
};

export default ohioRules;
