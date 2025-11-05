/**
 * Oklahoma State Rules Index
 *
 * Centralized export for all Oklahoma-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidOklahomaRules from './medicaid/medicaid-oklahoma-rules.json';

// SNAP rules
import snapOklahomaRules from './snap/snap-oklahoma-rules.json';

export interface OklahomaRules {
  medicaid: typeof medicaidOklahomaRules;
  snap: typeof snapOklahomaRules;
}

const oklahomaRules: OklahomaRules = {
  medicaid: medicaidOklahomaRules,
  snap: snapOklahomaRules,
};

export default oklahomaRules;
