/**
 * RxDB Database Configuration
 * 
 * Main database initialization and export.
 * All collections are defined and exported from here.
 */

// Core database functions
export {
  initializeDatabase,
  getDatabase,
  destroyDatabase,
  isDatabaseInitialized,
  exportDatabase,
  importDatabase,
} from './database';

// Collections
export { collections } from './collections';

// Utility functions
export {
  generateId,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
  createBenefitProgram,
  createEligibilityRule,
  saveEligibilityResult,
  clearUserData,
  getDatabaseStats,
  checkDatabaseHealth,
} from './utils';

// React hooks
export {
  useDatabase,
  useRxQuery,
  useRxDocument,
  useUserProfiles,
  useUserProfile,
  useBenefitPrograms,
  useEligibilityRules,
  useEligibilityResults,
  useAppSetting,
} from './hooks';

// Types
export type { BenefitFinderDatabase, BenefitFinderCollections } from './database';

export type {
  UserProfile,
  UserProfileDocument,
  UserProfileCollection,
  BenefitProgram,
  BenefitProgramDocument,
  BenefitProgramCollection,
  EligibilityRule,
  EligibilityRuleDocument,
  EligibilityRuleCollection,
  EligibilityResult,
  EligibilityResultDocument,
  EligibilityResultCollection,
  AppSetting,
  AppSettingDocument,
  AppSettingCollection,
} from './schemas';

