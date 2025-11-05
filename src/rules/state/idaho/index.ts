/**
 * Idaho State Rules Index
 *
 * Centralized export for all Idaho-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidIdahoRules from './medicaid/medicaid-idaho-rules.json';

// SNAP rules
import snapIdahoRules from './snap/snap-idaho-rules.json';

export interface IdahoRules {
  medicaid: typeof medicaidIdahoRules;
  snap: typeof snapIdahoRules;
}

const idahoRules: IdahoRules = {
  medicaid: medicaidIdahoRules,
  snap: snapIdahoRules,
};

export default idahoRules;
