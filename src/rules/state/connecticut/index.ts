/**
 * Connecticut State Rules Index
 *
 * Centralized export for all Connecticut-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidConnecticutRules from './medicaid/medicaid-connecticut-rules.json';

// SNAP rules
import snapConnecticutRules from './snap/snap-connecticut-rules.json';

export interface ConnecticutRules {
  medicaid: typeof medicaidConnecticutRules;
  snap: typeof snapConnecticutRules;
}

const connecticutRules: ConnecticutRules = {
  medicaid: medicaidConnecticutRules,
  snap: snapConnecticutRules,
};

export default connecticutRules;
