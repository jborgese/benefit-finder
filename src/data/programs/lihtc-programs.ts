/**
 * LIHTC Housing Programs Data
 *
 * Real LIHTC housing programs with contact information and eligibility details.
 *
 * @deprecated Use programs from @/data/sources/programs/lihtc instead
 */

import {
  LIHTC_PROGRAMS,
  LIHTC_PROGRAMS_BY_JURISDICTION_LEVEL,
  LIHTC_PROGRAMS_BY_STATE
} from '../sources/programs/lihtc';

// Re-export from new structure for backward compatibility

// Re-export from new structure for backward compatibility
export {
  LIHTC_PROGRAMS,
  LIHTC_PROGRAMS_BY_JURISDICTION_LEVEL as LIHTC_PROGRAMS_BY_JURISDICTION,
  LIHTC_PROGRAMS_BY_STATE
};
