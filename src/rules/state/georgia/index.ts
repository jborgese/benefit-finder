/**
 * Georgia State Rules Index
 *
 * Centralized export for all Georgia-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidGeorgiaRules from './medicaid/medicaid-georgia-rules.json';

// SNAP rules
import snapGeorgiaRules from './snap/snap-georgia-rules.json';

export interface GeorgiaRules {
  medicaid: typeof medicaidGeorgiaRules;
  snap: typeof snapGeorgiaRules;
}

const georgiaRules: GeorgiaRules = {
  medicaid: medicaidGeorgiaRules,
  snap: snapGeorgiaRules,
};

export default georgiaRules;
