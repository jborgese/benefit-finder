/**
 * Database type definitions
 */
import type { RxDatabase, RxCollection } from 'rxdb';
import type {
  UserProfile,
  BenefitProgram,
  EligibilityRule,
  EligibilityResult,
  AppSetting,
  UserProfileDocument,
  BenefitProgramDocument,
  EligibilityRuleDocument,
  EligibilityResultDocument,
} from '../schemas';

export interface WindowWithDevUtils extends Window {
  clearBenefitFinderDatabase?: () => Promise<void>;
  inspectBenefitFinderStorage?: () => Promise<void>;
}

export interface UserProfilesCollection extends RxCollection<UserProfile> {
  findLatest: () => Promise<UserProfileDocument | null>;
}

export interface BenefitProgramsCollection extends RxCollection<BenefitProgram> {
  findActivePrograms: () => Promise<BenefitProgramDocument[]>;
  findProgramsByJurisdiction: (jurisdiction: string) => Promise<BenefitProgramDocument[]>;
  findProgramsByCategory: (category: string) => Promise<BenefitProgramDocument[]>;
}

export interface EligibilityRulesCollection extends RxCollection<EligibilityRule> {
  findRulesByProgram: (programId: string) => Promise<EligibilityRuleDocument[]>;
}

export interface EligibilityResultsCollection extends RxCollection<EligibilityResult> {
  findResultsByUserProfile: (userProfileId: string) => Promise<EligibilityResultDocument[]>;
  findValidResultsByUser: (userProfileId: string) => Promise<EligibilityResultDocument[]>;
  clearExpired: () => Promise<number>;
}

export interface AppSettingsCollection extends RxCollection<AppSetting> {
  findSettingByKey: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown, encrypted?: boolean) => Promise<void>;
}

export interface BenefitFinderCollections {
  user_profiles: UserProfilesCollection;
  benefit_programs: BenefitProgramsCollection;
  eligibility_rules: EligibilityRulesCollection;
  eligibility_results: EligibilityResultsCollection;
  app_settings: AppSettingsCollection;
}

export type BenefitFinderDatabase = RxDatabase<BenefitFinderCollections>;
