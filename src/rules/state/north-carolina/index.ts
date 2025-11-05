/**
 * North Carolina State Rules Index
 *
 * Centralized export for all North Carolina-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidNorthCarolinaRules from './medicaid/medicaid-north-carolina-rules.json';

// SNAP rules
import snapNorthCarolinaRules from './snap/snap-north-carolina-rules.json';

export interface NorthCarolinaRules {
  medicaid: typeof medicaidNorthCarolinaRules;
  snap: typeof snapNorthCarolinaRules;
}

const northCarolinaRules: NorthCarolinaRules = {
  medicaid: medicaidNorthCarolinaRules,
  snap: snapNorthCarolinaRules,
};

export default northCarolinaRules;
