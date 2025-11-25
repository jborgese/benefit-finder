/**
 * Test mode hook
 * Handles E2E test mode sample data creation
 */

import { useEffect, useCallback } from 'react';
import { createSampleResults as createSampleResultsData } from '../../utils/createSampleResults';
import type { EligibilityResults } from '../../components/results';
import type { AppState } from '../types';

export function useTestMode(
  _appState: AppState,
  setCurrentResults: (results: EligibilityResults | null) => void,
  setHasResults: (hasResults: boolean) => void,
  saveResults: (params: { results: EligibilityResults }) => Promise<void>
) {
  const createSampleResults = useCallback((): void => {
    const sampleResults = createSampleResultsData();
    setCurrentResults(sampleResults);
    setHasResults(true);
    void saveResults({ results: sampleResults });
  }, [setCurrentResults, setHasResults, saveResults]);

  // Lightweight routing: if URL path includes "results", show results view immediately
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().includes('results')) {
        // For E2E testing ONLY: create sample results if URL has explicit testing parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('test') === 'true' && (
          (typeof navigator !== 'undefined' && navigator.userAgent.includes('HeadlessChrome')) ||
          (typeof window !== 'undefined' && window.location.hostname === 'localhost' && urlParams.has('playwright'))
        )) {
          createSampleResults();
        }
      }
    } catch {
      // no-op: defensive for non-browser environments
    }
  }, [createSampleResults]);
}
