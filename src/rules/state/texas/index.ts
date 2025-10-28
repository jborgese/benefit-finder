/**
 * Texas State Rules Index
 *
 * Centralized export for all Texas-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// LIHTC rules
import lihtcTexasRules from './lihtc/lihtc-texas-rules.json';

// Medicaid rules
import medicaidTexasRules from './medicaid/medicaid-texas-rules.json';

// SNAP rules
import snapTexasRules from './snap/snap-texas-rules.json';

// TANF rules
import tanfTexasRules from './tanf/tanf-texas-rules.json';

// WIC rules
import wicTexasRules from './wic/wic-texas-rules.json';

export interface TexasRules {
  lihtc: typeof lihtcTexasRules;
  medicaid: typeof medicaidTexasRules;
  snap: typeof snapTexasRules;
  tanf: typeof tanfTexasRules;
  wic: typeof wicTexasRules;
}

const texasRules: TexasRules = {
  lihtc: lihtcTexasRules,
  medicaid: medicaidTexasRules,
  snap: snapTexasRules,
  tanf: tanfTexasRules,
  wic: wicTexasRules,
};

export default texasRules;
