/**
 * LIHTC Programs Collection
 *
 * Centralized collection of all LIHTC programs with organized exports
 * and utility functions for program management.
 */

import type { BenefitProgram } from '../../../db/schemas';

// Import all LIHTC programs
import { FEDERAL_LIHTC_PROGRAM } from './federal';
import { GEORGIA_LIHTC_PROGRAM } from './state/georgia';
import { CALIFORNIA_LIHTC_PROGRAM } from './state/california';
import { FLORIDA_LIHTC_PROGRAM } from './state/florida';
import { ATLANTA_LIHTC_PROGRAM } from './city/atlanta';
import { LOS_ANGELES_LIHTC_PROGRAM } from './city/los-angeles';
import { MIAMI_LIHTC_PROGRAM } from './city/miami';

/**
 * All LIHTC Programs
 */
export const LIHTC_PROGRAMS: BenefitProgram[] = [
  FEDERAL_LIHTC_PROGRAM,
  GEORGIA_LIHTC_PROGRAM,
  CALIFORNIA_LIHTC_PROGRAM,
  FLORIDA_LIHTC_PROGRAM,
  ATLANTA_LIHTC_PROGRAM,
  LOS_ANGELES_LIHTC_PROGRAM,
  MIAMI_LIHTC_PROGRAM
];

/**
 * LIHTC Program by Jurisdiction Level
 */
export const LIHTC_PROGRAMS_BY_JURISDICTION_LEVEL: Record<'federal' | 'state' | 'city', BenefitProgram[]> = {
  federal: [FEDERAL_LIHTC_PROGRAM],
  state: [GEORGIA_LIHTC_PROGRAM, CALIFORNIA_LIHTC_PROGRAM, FLORIDA_LIHTC_PROGRAM],
  city: [ATLANTA_LIHTC_PROGRAM, LOS_ANGELES_LIHTC_PROGRAM, MIAMI_LIHTC_PROGRAM]
};

/**
 * LIHTC Program by State
 */
export const LIHTC_PROGRAMS_BY_STATE: Record<string, BenefitProgram[]> = {
  'GA': [GEORGIA_LIHTC_PROGRAM, ATLANTA_LIHTC_PROGRAM],
  'CA': [CALIFORNIA_LIHTC_PROGRAM, LOS_ANGELES_LIHTC_PROGRAM],
  'FL': [FLORIDA_LIHTC_PROGRAM, MIAMI_LIHTC_PROGRAM]
};

/**
 * Get LIHTC programs by state code
 */
export function getLIHTCProgramsByState(stateCode: string): BenefitProgram[] {
  // Check if state code exists in the mapping to avoid object injection
  if (!Object.hasOwnProperty.call(LIHTC_PROGRAMS_BY_STATE, stateCode)) {
    return [];
  }
   
  return LIHTC_PROGRAMS_BY_STATE[stateCode];
}

/**
 * Get LIHTC programs by jurisdiction level
 */
export function getLIHTCProgramsByLevel(level: 'federal' | 'state' | 'city'): BenefitProgram[] {
   
  return LIHTC_PROGRAMS_BY_JURISDICTION_LEVEL[level];
}

/**
 * Get all active LIHTC programs
 */
export function getActiveLIHTCPrograms(): BenefitProgram[] {
  return LIHTC_PROGRAMS.filter(program => program.active);
}

/**
 * Get LIHTC programs with open applications
 */
export function getLIHTCProgramsWithOpenApplications(): BenefitProgram[] {
  return LIHTC_PROGRAMS.filter(program => program.active && program.applicationOpen);
}

// Re-export individual programs for direct access
export {
  FEDERAL_LIHTC_PROGRAM,
  GEORGIA_LIHTC_PROGRAM,
  CALIFORNIA_LIHTC_PROGRAM,
  FLORIDA_LIHTC_PROGRAM,
  ATLANTA_LIHTC_PROGRAM,
  LOS_ANGELES_LIHTC_PROGRAM,
  MIAMI_LIHTC_PROGRAM
};
