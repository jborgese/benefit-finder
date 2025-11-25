/**
 * App state management hook
 * Manages primary application state and routing
 */

import { useState } from 'react';
import type { AppState } from '../types';

export function useAppState() {
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().includes('results')) {
        return 'results';
      }
    } catch {
      // no-op
    }
    return 'home';
  });

  const [hasResults, setHasResults] = useState(false);
  const [isProcessingResults, setIsProcessingResults] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  return {
    appState,
    setAppState,
    hasResults,
    setHasResults,
    isProcessingResults,
    setIsProcessingResults,
    announcementMessage,
    setAnnouncementMessage,
    errorMessage,
    setErrorMessage,
  };
}
