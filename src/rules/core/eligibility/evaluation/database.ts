/**
 * Database operations for eligibility evaluation
 */

import { getDatabase } from '../../../../db/database';
import type { EligibilityRuleDocument, UserProfileDocument } from '../../../../db/schemas';
import type { EvaluationEntities } from '../types';
import { debugLog } from './utils';

/**
 * Log detailed entities information for debugging
 */
function logEntitiesDebugInfo(
  profileId: string,
  programId: string,
  programName: string,
  profile: UserProfileDocument,
  sortedRules: EligibilityRuleDocument[]
): void {
  if (import.meta.env.DEV) {
    console.warn('🔍 [DEBUG] getEvaluationEntities: Retrieved entities:', {
      profileId,
      programId,
      programName,
      profileData: {
        householdIncome: profile.householdIncome,
        householdSize: profile.householdSize,
        citizenship: profile.citizenship
      },
      rulesFound: sortedRules.length,
      allRules: sortedRules.map(r => ({
        id: r.id,
        name: r.name,
        priority: r.priority,
        active: r.active,
        ruleLogic: `${JSON.stringify(r.ruleLogic, null, 2).substring(0, 100)}...`
      }))
    });
  }
}

/**
 * Retrieve and validate required entities from database
 */
export async function getEvaluationEntities(
  profileId: string,
  programId: string
): Promise<EvaluationEntities> {
  debugLog('Retrieving evaluation entities for', { profileId, programId });
  const db = getDatabase()!;

  // Get user profile
  const profile = await db.user_profiles.findOne(profileId).exec();
  if (!profile) {
    debugLog('User profile not found', { profileId });
    throw new Error(`Profile ${profileId} not found`);
  }

  // Get program
  console.log('🔍 [PROGRAM LOOKUP DEBUG] Looking up program', { programId });
  const program = await db.benefit_programs.findOne(programId).exec();
  if (!program) {
    console.log('🔍 [PROGRAM LOOKUP DEBUG] Program not found, checking all programs', { programId });

    // Debug: Check what programs exist
    const allPrograms = await db.benefit_programs.find({}).exec();
    console.log('🔍 [PROGRAM LOOKUP DEBUG] All programs in database', {
      totalPrograms: allPrograms.length,
      programIds: allPrograms.map(p => p.id),
      programNames: allPrograms.map(p => p.name),
      activePrograms: allPrograms.filter(p => p.active).length
    });

    // Re-check all programs to see if they exist
    console.log('🔍 [PROGRAM LOOKUP DEBUG] Re-checking all programs', { programId });
    const allProgramsRecheck = await db.benefit_programs.find({}).exec();
    console.log('🔍 [PROGRAM LOOKUP DEBUG] Programs on re-check', {
      totalPrograms: allProgramsRecheck.length,
      programIds: allProgramsRecheck.map(p => p.id),
      activePrograms: allProgramsRecheck.filter(p => p.active).length
    });

    debugLog('Benefit program not found', { programId });
    throw new Error(`Program ${programId} not found`);
  }

  console.log('🔍 [PROGRAM LOOKUP DEBUG] Program found', {
    programId: program.id,
    programName: program.name,
    isActive: program.active,
    category: program.category
  });

  // Get active rules for program
  const rules: EligibilityRuleDocument[] = await db.eligibility_rules.findRulesByProgram(programId);
  debugLog('🔍 [DEBUG] Rules found for program', {
    programId,
    ruleCount: rules.length,
    ruleIds: rules.map(r => r.id),
    ruleNames: rules.map(r => r.name)
  });

  if (rules.length === 0) {
    debugLog('No active rules found for program', { programId });
    throw new Error(`No active rules found for program ${programId}`);
  }

  // Sort rules by priority (highest first) for consistent evaluation order
  const sortedRules = rules.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  debugLog('Entities retrieved and sorted', {
    profileId,
    programId,
    programName: program.name,
    rulesFound: sortedRules.length,
    rulesSummary: sortedRules.map(r => ({
      id: r.id,
      name: r.name,
      priority: r.priority,
      active: r.active,
    }))
  });

  logEntitiesDebugInfo(profileId, programId, program.name, profile, sortedRules);

  return { profile, rules: sortedRules };
}

/**
 * Get all active rules for a program (for displaying program requirements)
 *
 * @param programId Program ID
 * @returns Array of rule IDs for the program
 */
export async function getAllProgramRuleIds(programId: string): Promise<string[]> {
  debugLog('Retrieving all rule IDs for program', programId);
  try {
    const db = getDatabase()!;
    const rules: EligibilityRuleDocument[] = await db.eligibility_rules.findRulesByProgram(programId);

    // Sort by priority (highest first) for consistent order
    const sortedRules = rules.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    debugLog('Rule IDs found', sortedRules.map(rule => rule.id));
    return sortedRules.map(rule => rule.id);
  } catch (error) {
    console.warn(`Failed to get program rules for ${programId}:`, error);
    debugLog('Failed to retrieve rules for program', { programId, error });
    return [];
  }
}
