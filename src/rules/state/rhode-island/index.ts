/**
 * Rhode Island State Rules Index
 *
 * Centralized export for all Rhode Island-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidRhodeIslandRules from './medicaid/medicaid-rhode-island-rules.json';

// SNAP rules
import snapRhodeIslandRules from './snap/snap-rhode-island-rules.json';

export interface RhodeIslandRules {
  medicaid: typeof medicaidRhodeIslandRules;
  snap: typeof snapRhodeIslandRules;
}

const rhodeIslandRules: RhodeIslandRules = {
  medicaid: medicaidRhodeIslandRules,
  snap: snapRhodeIslandRules,
};

export default rhodeIslandRules;
