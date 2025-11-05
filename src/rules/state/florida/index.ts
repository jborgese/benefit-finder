/**
 * Florida State Rules Index
 *
 * Centralized export for all Florida-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidFloridaRules from './medicaid/medicaid-florida-rules.json';

// SNAP rules
import snapFloridaRules from './snap/snap-florida-rules.json';

export interface FloridaRules {
  medicaid: typeof medicaidFloridaRules;
  snap: typeof snapFloridaRules;
}

const floridaRules: FloridaRules = {
  medicaid: medicaidFloridaRules,
  snap: snapFloridaRules,
};

export default floridaRules;
