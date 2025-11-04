/**
 * Alaska State Rules Index
 *
 * Centralized export for all Alaska-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidAlaskaRules from './medicaid/medicaid-alaska-rules.json';

// SNAP rules
import snapAlaskaRules from './snap/snap-alaska-rules.json';

export interface AlaskaRules {
  medicaid: typeof medicaidAlaskaRules;
  snap: typeof snapAlaskaRules;
}

const alaskaRules: AlaskaRules = {
  medicaid: medicaidAlaskaRules,
  snap: snapAlaskaRules,
};

export default alaskaRules;
