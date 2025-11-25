/**
 * Results handlers
 * Manages results import operations
 */

import type { EligibilityResults } from '../../components/results';

export function createResultsHandlers(
  saveResults: (params: { results: EligibilityResults }) => Promise<void>,
  setCurrentResults: (results: EligibilityResults | null) => void,
  setHasResults: (hasResults: boolean) => void,
  setAnnouncementMessage: (message: string) => void
) {
  const handleImportResults = async (results: EligibilityResults): Promise<void> => {
    try {
      await saveResults({ results });
      setCurrentResults(results);
      setHasResults(true);
      setAnnouncementMessage('Results imported successfully.');
    } catch (error) {
      console.error('Failed to import results:', error);
      setAnnouncementMessage('Failed to import results. Please try again.');
    }
  };

  return {
    handleImportResults,
  };
}
