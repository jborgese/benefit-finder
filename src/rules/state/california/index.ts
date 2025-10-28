/**
 * California State Rules Index
 *
 * Centralized export for all California-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import mediCalCaliforniaRules from './medicaid/medi-cal-california-rules.json';
import mediCalChildrenRules from './medicaid/medi-cal-children-rules.json';
import mediCalImmigrantRules from './medicaid/medi-cal-immigrant-rules.json';
import mediCalPregnancyRules from './medicaid/medi-cal-pregnancy-rules.json';

// SNAP rules
import snapCaliforniaRules from './snap/snap-california-rules.json';

export interface CaliforniaRules {
  medicaid: {
    general: typeof mediCalCaliforniaRules;
    children: typeof mediCalChildrenRules;
    immigrant: typeof mediCalImmigrantRules;
    pregnancy: typeof mediCalPregnancyRules;
  };
  snap: typeof snapCaliforniaRules;
}

const californiaRules: CaliforniaRules = {
  medicaid: {
    general: mediCalCaliforniaRules,
    children: mediCalChildrenRules,
    immigrant: mediCalImmigrantRules,
    pregnancy: mediCalPregnancyRules,
  },
  snap: snapCaliforniaRules,
};

export default californiaRules;
