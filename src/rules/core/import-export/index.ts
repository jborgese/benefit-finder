/**
 * Rule Import/Export Module
 *
 * Handles importing and exporting rules with validation,
 * versioning, and error handling.
 */

// Export constants
export { IMPORT_ERROR_CODES, PROGRAM_IDS } from './constants';

// Export import functions
export {
  importRule,
  importRules,
  importRulePackage,
  importFromJSON,
} from './importers';

// Export export functions
export {
  exportRule,
  exportRules,
  exportRulePackage,
  exportProgramRules,
  exportToJSON,
  exportPackageToJSON,
} from './exporters';

// Export validation functions (if needed externally)
export {
  validateRuleLogic,
  runRuleTests,
  performRuleValidationAndTests,
} from './validation';

// Export database functions (if needed externally)
export {
  checkExistingRuleConflicts,
  saveRuleToDatabase,
  convertDatabaseRuleToDefinition,
} from './database';

// Export logging utilities (if needed externally)
export {
  extractRuleMetadata,
  logSnapSsiDebugInfo,
  logSnapSsiValidationResult,
  logSnapSsiDatabaseOperation,
  logSnapSsiError,
  logSnapSsiBatchImport,
} from './logging';
