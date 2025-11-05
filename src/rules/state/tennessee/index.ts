/**
 * Tennessee State Rules Index
 *
 * Centralized export for all Tennessee-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidTennesseeRules from './medicaid/medicaid-tennessee-rules.json';

// SNAP rules
import snapTennesseeRules from './snap/snap-tennessee-rules.json';

export interface TennesseeRules {
  medicaid: typeof medicaidTennesseeRules;
  snap: typeof snapTennesseeRules;
}

const tennesseeRules: TennesseeRules = {
  medicaid: medicaidTennesseeRules,
  snap: snapTennesseeRules,
};

export default tennesseeRules;
