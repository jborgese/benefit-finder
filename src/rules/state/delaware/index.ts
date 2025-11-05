/**
 * Delaware State Rules Index
 *
 * Centralized export for all Delaware-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidDelawareRules from './medicaid/medicaid-delaware-rules.json';

// SNAP rules
import snapDelawareRules from './snap/snap-delaware-rules.json';

export interface DelawareRules {
  medicaid: typeof medicaidDelawareRules;
  snap: typeof snapDelawareRules;
}

const delawareRules: DelawareRules = {
  medicaid: medicaidDelawareRules,
  snap: snapDelawareRules,
};

export default delawareRules;
