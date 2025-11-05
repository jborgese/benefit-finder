/**
 * North Dakota State Rules Index
 *
 * Centralized export for all North Dakota-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidNorthDakotaRules from './medicaid/medicaid-north-dakota-rules.json';

// SNAP rules
import snapNorthDakotaRules from './snap/snap-north-dakota-rules.json';

export interface NorthDakotaRules {
  medicaid: typeof medicaidNorthDakotaRules;
  snap: typeof snapNorthDakotaRules;
}

const northDakotaRules: NorthDakotaRules = {
  medicaid: medicaidNorthDakotaRules,
  snap: snapNorthDakotaRules,
};

export default northDakotaRules;
