/**
 * Federal Rules Index
 *
 * Centralized export for all federal-level benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// LIHTC rules
import lihtcFederalRules from './lihtc/lihtc-federal-rules.json';

// Medicaid rules
import medicaidFederalRules from './medicaid/medicaid-federal-rules.json';

// Section 8 rules
import section8FederalRules from './section8/section8-federal-rules.json';

// SNAP rules
import snapFederalRules from './snap/snap-federal-rules.json';

// SSI rules
import ssiFederalRules from './ssi/ssi-federal-rules.json';

// TANF rules
import tanfFederalRules from './tanf/tanf-federal-rules.json';

// WIC rules
import wicFederalRules from './wic/wic-federal-rules.json';

export interface FederalRules {
  lihtc: typeof lihtcFederalRules;
  medicaid: typeof medicaidFederalRules;
  section8: typeof section8FederalRules;
  snap: typeof snapFederalRules;
  ssi: typeof ssiFederalRules;
  tanf: typeof tanfFederalRules;
  wic: typeof wicFederalRules;
}

const federalRules: FederalRules = {
  lihtc: lihtcFederalRules,
  medicaid: medicaidFederalRules,
  section8: section8FederalRules,
  snap: snapFederalRules,
  ssi: ssiFederalRules,
  tanf: tanfFederalRules,
  wic: wicFederalRules,
};

export default federalRules;
