/**
 * Wisconsin State Rules Index
 *
 * Centralized export for all Wisconsin-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidWisconsinRules from './medicaid/medicaid-wisconsin-rules.json';

// SNAP rules
import snapWisconsinRules from './snap/snap-wisconsin-rules.json';

export interface WisconsinRules {
  medicaid: typeof medicaidWisconsinRules;
  snap: typeof snapWisconsinRules;
}

const wisconsinRules: WisconsinRules = {
  medicaid: medicaidWisconsinRules,
  snap: snapWisconsinRules,
};

export default wisconsinRules;
