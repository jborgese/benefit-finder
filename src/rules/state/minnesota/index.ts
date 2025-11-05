/**
 * Minnesota State Rules Index
 *
 * Centralized export for all Minnesota-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidMinnesotaRules from './medicaid/medicaid-minnesota-rules.json';

// SNAP rules
import snapMinnesotaRules from './snap/snap-minnesota-rules.json';

export interface MinnesotaRules {
  medicaid: typeof medicaidMinnesotaRules;
  snap: typeof snapMinnesotaRules;
}

const minnesotaRules: MinnesotaRules = {
  medicaid: medicaidMinnesotaRules,
  snap: snapMinnesotaRules,
};

export default minnesotaRules;
