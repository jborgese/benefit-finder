/**
 * LIHTC Housing Programs Data
 *
 * Real LIHTC housing programs with contact information and eligibility details.
 *
 * @deprecated Use programs from @/data/sources/programs/lihtc instead
 */

import type { BenefitProgram } from '../../db/schemas';
import {
  LIHTC_PROGRAMS,
  LIHTC_PROGRAMS_BY_JURISDICTION_LEVEL,
  LIHTC_PROGRAMS_BY_STATE,
  FEDERAL_LIHTC_PROGRAM,
  GEORGIA_LIHTC_PROGRAM,
  CALIFORNIA_LIHTC_PROGRAM,
  FLORIDA_LIHTC_PROGRAM,
  ATLANTA_LIHTC_PROGRAM,
  LOS_ANGELES_LIHTC_PROGRAM,
  MIAMI_LIHTC_PROGRAM
} from '../sources/programs/lihtc';

// Re-export from new structure for backward compatibility

// Re-export from new structure for backward compatibility
export {
  LIHTC_PROGRAMS,
  LIHTC_PROGRAMS_BY_JURISDICTION_LEVEL as LIHTC_PROGRAMS_BY_JURISDICTION,
  LIHTC_PROGRAMS_BY_STATE
};
