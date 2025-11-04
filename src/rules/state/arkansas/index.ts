/**
 * Arkansas State Rules Index
 *
 * Centralized export for all Arkansas-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidArkansasRules from './medicaid/medicaid-arkansas-rules.json';

// SNAP rules
import snapArkansasRules from './snap/snap-arkansas-rules.json';

export interface ArkansasRules {
  medicaid: typeof medicaidArkansasRules;
  snap: typeof snapArkansasRules;
}

const arkansasRules: ArkansasRules = {
  medicaid: medicaidArkansasRules,
  snap: snapArkansasRules,
};

export default arkansasRules;
