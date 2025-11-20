// Database Helper for Rule Discovery
import { getDatabase, isDatabaseInitialized } from '../db';
import type { DiscoveredRuleFile } from './ruleDiscoveryConfig';

export async function createBenefitProgram(discoveredFile: DiscoveredRuleFile): Promise<boolean> {
  // Create a new benefit program in the database from discoveredFile
  const db = getDatabase();
  if (!isDatabaseInitialized()) {
    console.error('[RuleDiscoveryDb] Database is not initialized');
    return false;
  }
  try {
    const program = {
      id: discoveredFile.programInfo.id,
      name: discoveredFile.programInfo.name,
      shortName: discoveredFile.programInfo.shortName,
      description: discoveredFile.programInfo.description,
      category: discoveredFile.programInfo.category as
        | 'food'
        | 'healthcare'
        | 'housing'
        | 'financial'
        | 'childcare'
        | 'education'
        | 'employment'
        | 'transportation'
        | 'utilities'
        | 'legal'
        | 'other',
      jurisdiction: discoveredFile.programInfo.jurisdiction,
      website: discoveredFile.programInfo.website,
      phoneNumber: discoveredFile.programInfo.phoneNumber,
      applicationUrl: discoveredFile.programInfo.applicationUrl,
      tags: discoveredFile.programInfo.tags,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastUpdated: Date.now(),
    };
    await db.benefit_programs.insert(program);
    return true;
  } catch (error) {
    console.error('[RuleDiscoveryDb] Error creating benefit program:', error);
    return false;
  }
}
