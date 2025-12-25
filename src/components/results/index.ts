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
export { default as useEligibilityEvaluation } from './useEligibilityEvaluation';
export { useResultsManagement } from './useResultsManagement';

// Utilities (lazy-loaded to avoid bundling heavy export logic into main results chunk)
// Provide a typed shape for the lazy-imported module so callers retain proper
// runtime types while avoiding explicit `any` usage.
import type { EligibilityResults } from './types';

type ExportUtilsModule = {
  exportToPDF: (
    results: EligibilityResults,
    options?: { userInfo?: { name?: string; evaluationDate?: Date } }
  ) => void;
  exportEncrypted: (
    results: EligibilityResults,
    password: string,
    options?: { profileSnapshot?: Record<string, unknown>; metadata?: { userName?: string; state?: string; notes?: string } }
  ) => Promise<Blob>;
  importEncrypted: (
    file: File | Blob,
    password: string
  ) => Promise<{
    results: EligibilityResults;
    profileSnapshot?: Record<string, unknown>;
    metadata?: { userName?: string; state?: string; notes?: string };
    exportedAt: Date;
  }>;
  downloadBlob: (blob: Blob, filename: string) => void;
  generateExportFilename: (prefix?: string) => string;
};

export const exportToPDF = async (...args: Parameters<ExportUtilsModule['exportToPDF']>) => {
  const m = (await import('./exportUtils')) as ExportUtilsModule;
  return m.exportToPDF(...args);
};

export const exportEncrypted = async (...args: Parameters<ExportUtilsModule['exportEncrypted']>) => {
  const m = (await import('./exportUtils')) as ExportUtilsModule;
  return m.exportEncrypted(...args);
};

export const importEncrypted = async (...args: Parameters<ExportUtilsModule['importEncrypted']>) => {
  const m = (await import('./exportUtils')) as ExportUtilsModule;
  return m.importEncrypted(...args);
};

export const downloadBlob = async (...args: Parameters<ExportUtilsModule['downloadBlob']>) => {
  const m = (await import('./exportUtils')) as ExportUtilsModule;
  return m.downloadBlob(...args);
};

export const generateExportFilename = async (...args: Parameters<ExportUtilsModule['generateExportFilename']>) => {
  const m = (await import('./exportUtils')) as ExportUtilsModule;
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

