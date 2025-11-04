/**
 * Colorado State Rules Index
 *
 * Centralized export for all Colorado-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidColoradoRules from './medicaid/medicaid-colorado-rules.json';

// SNAP rules
import snapColoradoRules from './snap/snap-colorado-rules.json';

export interface ColoradoRules {
  medicaid: typeof medicaidColoradoRules;
  snap: typeof snapColoradoRules;
}

const coloradoRules: ColoradoRules = {
  medicaid: medicaidColoradoRules,
  snap: snapColoradoRules,
};

export default coloradoRules;
