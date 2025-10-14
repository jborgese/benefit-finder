/**
 * Results Display Components
 *
 * Export all components for eligibility results display
 */

// Display Components
export { ResultsSummary } from './ResultsSummary';
export { ProgramCard } from './ProgramCard';
export { ConfidenceScore } from './ConfidenceScore';
export { getContextualLabelFromBasicData } from './confidenceUtils';
export { DocumentChecklist } from './DocumentChecklist';
export { NextStepsList } from './NextStepsList';
export { WhyExplanation } from './WhyExplanation';
export { PrintView } from './PrintView';
export { QuestionnaireAnswersCard } from './QuestionnaireAnswersCard';

// Management Components
export { ResultsHistory } from './ResultsHistory';
export { ResultsExport } from './ResultsExport';
export { ResultsImport } from './ResultsImport';
export { ResultsComparison } from './ResultsComparison';

// Hooks
export { useEligibilityEvaluation } from './useEligibilityEvaluation';
export { useResultsManagement } from './useResultsManagement';

// Utilities
export {
  exportToPDF,
  exportEncrypted,
  importEncrypted,
  downloadBlob,
  generateExportFilename,
} from './exportUtils';

// Types
export type {
  EligibilityStatus,
  ConfidenceLevel,
  RequiredDocument,
  NextStep,
  EligibilityExplanation,
  ProgramEligibilityResult,
  EligibilityResults,
  ResultsFilter,
  ResultsSortBy,
  ResultsSortOptions,
} from './types';

export type {
  EligibilityResultsDocument,
} from './resultsSchema';

// Import print styles
import './print.css';

