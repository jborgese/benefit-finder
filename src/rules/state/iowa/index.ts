/**
 * Iowa State Rules Index
 *
 * Centralized export for all Iowa-specific benefit rules.
 * This enables dynamic imports and better tree-shaking.
 */

// Medicaid rules
import medicaidIowaRules from './medicaid/medicaid-iowa-rules.json';

// SNAP rules
import snapIowaRules from './snap/snap-iowa-rules.json';

export interface IowaRules {
  medicaid: typeof medicaidIowaRules;
  snap: typeof snapIowaRules;
}

const iowaRules: IowaRules = {
  medicaid: medicaidIowaRules,
  snap: snapIowaRules,
};

export default iowaRules;
