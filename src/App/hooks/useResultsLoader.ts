/**
 * Results loader hook
 * Manages loading and storing eligibility results
 */

import { useState, useEffect, useRef } from 'react';
import type { EligibilityResults } from '../../components/results';
import { useResultsManagement } from '../../components/results/useResultsManagement';

export function useResultsLoader() {
  const [currentResults, setCurrentResults] = useState<EligibilityResults | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<{ state?: string; [key: string]: unknown } | null>(null);

  const { saveResults, loadAllResults, loadResult } = useResultsManagement();

  // Use refs to store functions and prevent dependency-triggered re-runs
  const loadAllResultsRef = useRef(loadAllResults);
  const loadResultRef = useRef(loadResult);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Keep refs updated with latest functions
  useEffect(() => {
    loadAllResultsRef.current = loadAllResults;
    loadResultRef.current = loadResult;
  }, [loadAllResults, loadResult]);

  // Check for existing results on app startup
  useEffect(() => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const checkExistingResults = async (): Promise<void> => {
      try {
        const results = await loadAllResultsRef.current(abortController.signal);
        if (abortController.signal.aborted) { return; }

        if (results.length > 0) {
          const [mostRecent] = results;
          const { signal } = abortController;
          const actualResults = await loadResultRef.current(mostRecent.id, signal);
          if (signal.aborted) { return; }

          if (actualResults) {
            setCurrentResults(actualResults);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'Operation cancelled') {
          return;
        }
        console.error('Failed to check for existing results:', error);
      }
    };

    void checkExistingResults();

    return () => {
      abortController.abort();
      abortControllerRef.current = null;
    };
  }, []);

  return {
    currentResults,
    setCurrentResults,
    currentUserProfile,
    setCurrentUserProfile,
    saveResults,
  };
}
