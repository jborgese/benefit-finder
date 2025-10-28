/**
 * Rule Engine Module
 *
 * Comprehensive JSON Logic integration for benefit eligibility evaluation.
 *
 * @module rules
 */

// Types
export type * from './core/types';

// Evaluator
export {
  evaluateRule,
  evaluateRuleSync,
  batchEvaluateRules,
  evaluateMultiple,
  DEFAULT_EVALUATION_OPTIONS,
  EVALUATION_ERROR_CODES,
  BENEFIT_OPERATORS,
  registerBenefitOperators,
  unregisterBenefitOperators,
} from './core/evaluator';

// Validator
export {
  validateRule,
  validateRules,
  isValidRule,
  sanitizeRule,
  DEFAULT_VALIDATION_OPTIONS,
  STANDARD_OPERATORS,
  VALIDATION_ERROR_CODES,
  JsonLogicRuleSchema,
} from './core/validator';

// Tester
export {
  testRule,
  testRuleSync,
  runTestSuite,
  runTestSuites,
  generateBoundaryTests,
  generateCombinationTests,
  formatTestSuiteResult,
  generateCoverageReport,
  createTestSuite,
  TestSuiteBuilder,
} from './core/tester';

// Schema
export {
  RuleDefinitionSchema,
  RulePackageSchema,
  RuleVersionSchema,
  validateRuleDefinition,
  validateRulePackage,
  parseVersion,
  formatVersion,
  compareVersions,
  isNewerVersion,
  incrementVersion,
  createRuleTemplate,
  calculateChecksum,
  type RuleDefinition,
  type RulePackage,
  type RuleVersion,
  type RuleAuthor,
  type RuleCitation,
  type RuleChange,
  type DocumentRequirement,
  type NextStep,
  type EmbeddedTestCase,
  type RulePackageMetadata,
  type RuleImportOptions,
  type RuleImportResult,
  type RuleExportOptions,
  type RuleSchemaValidationResult,
} from './core/schema';

// Import/Export
export {
  importRule,
  importRules,
  importRulePackage,
  exportRule,
  exportRules,
  exportRulePackage,
  exportProgramRules,
  importFromJSON,
  exportToJSON,
  exportPackageToJSON,
  IMPORT_ERROR_CODES,
} from './core/import-export';

// Versioning
export {
  getLatestRuleVersion,
  getAllRuleVersions,
  createRuleVersion,
  registerMigration,
  getMigrations,
  migrateRule,
  migrateAllProgramRules,
  isVersionCompatible,
  findBreakingChanges,
  getVersionChangelog,
  archiveOldVersions,
  deleteOldVersions,
  registerExampleMigrations,
  type RuleMigration,
  type VersionMigration,
} from './core/versioning';

// Eligibility
export {
  evaluateEligibility,
  evaluateMultiplePrograms,
  evaluateAllPrograms,
  getAllProgramRuleIds,
  clearCachedResults,
  getCachedResults,
  type EligibilityEvaluationResult,
  type EligibilityEvaluationOptions,
  type BatchEligibilityResult,
} from './core/eligibility';

// Detailed Evaluator
export {
  evaluateRuleWithDetails,
  type DetailedEvaluationResult,
  type DetailedCriterionResult,
} from './core/detailedEvaluator';

// Explanation
export {
  explainResult,
  explainRule,
  explainWhatWouldPass,
  explainDifference,
  formatRuleExplanation,
  type ResultExplanation,
  type ExplanationOptions,
} from './core/explanation';

// Debug
export {
  debugRule,
  inspectVariable,
  inspectAllVariables,
  inspectRule,
  formatDebugTrace,
  compareEvaluations,
  type DebugResult,
  type DebugTraceStep,
  type VariableInspection,
  type RuleInspection,
} from './core/debug';

// Performance
export {
  getPerformanceMonitor,
  calculateStats,
  getRulePerformanceProfile,
  getPerformanceWarnings,
  generatePerformanceReport,
  exportPerformanceData,
  clearPerformanceData,
  profileRule,
  compareRulePerformance,
  analyzePerformance,
  benchmarkRule,
  type PerformanceMetrics,
  type PerformanceStats,
  type RulePerformanceProfile,
  type PerformanceWarning,
} from './core/performance';

// Dynamic Rule Loading
export {
  loadFederalRules,
  loadStateRules,
  loadProgramRules,
  importRulesDynamically,
  getAvailableStates,
  getAvailablePrograms,
  type StateRules,
  type RuleLoadResult,
} from './dynamic-loader';

