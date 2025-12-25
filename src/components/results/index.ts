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
import useEligibilityEvaluation from './useEligibilityEvaluation';
export { useEligibilityEvaluation };
export { useResultsManagement } from './useResultsManagement';

// Utilities (lazy-loaded to avoid bundling heavy export logic into main results chunk)
// Import types for the exported functions so we can wrap dynamic imports
import type {
  exportToPDF as ExportToPDFType,
  exportEncrypted as ExportEncryptedType,
  importEncrypted as ImportEncryptedType,
  downloadBlob as DownloadBlobType,
  generateExportFilename as GenerateExportFilenameType,
} from './exportUtils';

export const exportToPDF = async (...args: Parameters<ExportToPDFType>) => {
  const m = await import('./exportUtils');
  return m.exportToPDF(...args);
};

export const exportEncrypted = async (...args: Parameters<ExportEncryptedType>) => {
  const m = await import('./exportUtils');
  return m.exportEncrypted(...args);
};

export const importEncrypted = async (...args: Parameters<ImportEncryptedType>) => {
  const m = await import('./exportUtils');
  return m.importEncrypted(...args);
};

export const downloadBlob = async (...args: Parameters<DownloadBlobType>) => {
  const m = await import('./exportUtils');
  return m.downloadBlob(...args);
};

export const generateExportFilename = async (...args: Parameters<GenerateExportFilenameType>) => {
  const m = await import('./exportUtils');
  return m.generateExportFilename(...args);
};

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

