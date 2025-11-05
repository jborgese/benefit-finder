/**
 * Kansas State Rules Index
 *
 * Centralized export for all Kansas-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidKansasRules from './medicaid/medicaid-kansas-rules.json';

// SNAP rules
import snapKansasRules from './snap/snap-kansas-rules.json';

export interface KansasRules {
  medicaid: typeof medicaidKansasRules;
  snap: typeof snapKansasRules;
}

const kansasRules: KansasRules = {
  medicaid: medicaidKansasRules,
  snap: snapKansasRules,
};

export default kansasRules;
