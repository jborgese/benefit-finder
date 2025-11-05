/**
 * Wyoming State Rules Index
 *
 * Centralized export for all Wyoming-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidWyomingRules from './medicaid/medicaid-wyoming-rules.json';

// SNAP rules
import snapWyomingRules from './snap/snap-wyoming-rules.json';

export interface WyomingRules {
  medicaid: typeof medicaidWyomingRules;
  snap: typeof snapWyomingRules;
}

const wyomingRules: WyomingRules = {
  medicaid: medicaidWyomingRules,
  snap: snapWyomingRules,
};

export default wyomingRules;
