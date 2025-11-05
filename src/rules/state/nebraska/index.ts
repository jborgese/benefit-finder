/**
 * Nebraska State Rules Index
 *
 * Centralized export for all Nebraska-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidNebraskaRules from './medicaid/medicaid-nebraska-rules.json';

// SNAP rules
import snapNebraskaRules from './snap/snap-nebraska-rules.json';

export interface NebraskaRules {
  medicaid: typeof medicaidNebraskaRules;
  snap: typeof snapNebraskaRules;
}

const nebraskaRules: NebraskaRules = {
  medicaid: medicaidNebraskaRules,
  snap: snapNebraskaRules,
};

export default nebraskaRules;
