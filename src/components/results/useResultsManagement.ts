/**
 * useResultsManagement Hook
 *
 * Manages saving, loading, and managing eligibility results in RxDB
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import type { EligibilityResults } from './types';
import type { EligibilityResultsDocument } from './resultsSchema';

// Note: In a real implementation, this would import from your RxDB setup
// For now, we'll create a mock implementation that can be replaced

interface SaveResultsOptions {
  results: EligibilityResults;
  profileSnapshot?: Record<string, unknown>;
  userId?: string;
  userName?: string;
  state?: string;
  tags?: string[];
  notes?: string;
}

interface SavedResult {
  id: string;
  qualifiedCount: number;
  totalPrograms: number;
  evaluatedAt: Date;
  state?: string;
  tags?: string[];
  notes?: string;
}

interface UseResultsManagementReturn {
  savedResults: SavedResult[];
  isLoading: boolean;
  error: Error | null;
  saveResults: (options: SaveResultsOptions) => Promise<string>;
  loadResult: (id: string, signal?: AbortSignal) => Promise<EligibilityResults | null>;
  loadAllResults: (signal?: AbortSignal) => Promise<SavedResult[]>;
  deleteResult: (id: string) => Promise<void>;
  updateResult: (id: string, updates: { notes?: string; tags?: string[] }) => Promise<void>;
}

/**
 * Hook for managing results persistence
 */
export function useResultsManagement(): UseResultsManagementReturn {
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Save results to RxDB
   */
  const saveResults = useCallback((options: SaveResultsOptions): Promise<string> => {
    return new Promise((resolve, reject) => {
      const {
        results,
        profileSnapshot,
        userId,
        userName,
        state,
        tags = [],
        notes = '',
      } = options;

      setIsLoading(true);
      setError(null);

      try {
      const id = nanoid();
      const now = Date.now();

      // Extract program IDs from results
      const allPrograms = [
        ...results.qualified,
        ...results.likely,
        ...results.maybe,
        ...results.notQualified,
      ];
      const programsEvaluated = allPrograms.map(p => p.programId);

      const document: Partial<EligibilityResultsDocument> = {
        id,
        userId,
        userName,
        results: {
          qualified: results.qualified,
          likely: results.likely,
          maybe: results.maybe,
          notQualified: results.notQualified,
          totalPrograms: results.totalPrograms,
          evaluatedAt: results.evaluatedAt.toISOString(),
        },
        profileSnapshot,
        evaluatedAt: results.evaluatedAt.getTime(),
        state,
        programsEvaluated,
        qualifiedCount: results.qualified.length,
        tags,
        notes,
        createdAt: now,
        updatedAt: now,
      };

        // TODO: Replace with actual RxDB insertion
        // await db.eligibility_results.insert(document);

        // Mock: Save to localStorage for now
        const existing = JSON.parse(localStorage.getItem('eligibility_results') ?? '[]');
        existing.push(document);
        localStorage.setItem('eligibility_results', JSON.stringify(existing));

        // Update local state
        setSavedResults(prev => [...prev, {
          id,
          qualifiedCount: results.qualified.length,
          totalPrograms: results.totalPrograms,
          evaluatedAt: results.evaluatedAt,
          state,
          tags,
          notes,
        }]);

        setIsLoading(false);
        resolve(id);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to save results');
        setError(error);
        setIsLoading(false);
        reject(error);
      }
    });
  }, []);

  /**
   * Load a specific saved result
   * Uses refs for setState functions to prevent memory leaks from Promise closures
   */
  const loadResult = useCallback((id: string, signal?: AbortSignal): Promise<EligibilityResults | null> => {
    return new Promise((resolve, reject) => {
      // Check if already aborted
      if (signal?.aborted) {
        reject(new Error('Operation cancelled'));
        return;
      }

      // Use refs instead of direct setState to avoid closure capturing
      setLoadingRef.current(true);
      setErrorRef.current(null);
      loadingRef.current = true;

      // Use Promise.resolve().then() instead of queueMicrotask to allow proper cancellation
      // This prevents closure memory leaks by ensuring the Promise can be properly rejected on abort
      Promise.resolve().then(() => {
        // Check if aborted before processing
        if (signal?.aborted || !loadingRef.current) {
          setLoadingRef.current(false);
          loadingRef.current = false;
          reject(new Error('Operation cancelled'));
          return;
        }

        try {
          // TODO: Replace with actual RxDB query
          // const doc = await db.eligibility_results.findOne(id).exec();

          // Mock: Load from localStorage (synchronous operation)
          const existing = JSON.parse(localStorage.getItem('eligibility_results') ?? '[]') as Partial<EligibilityResultsDocument>[];
          const doc = existing.find((d) => d.id === id);

          if (!doc?.results) {
            if (!signal?.aborted && loadingRef.current) {
              setLoadingRef.current(false);
              loadingRef.current = false;
              resolve(null);
            } else {
              setLoadingRef.current(false);
              loadingRef.current = false;
              reject(new Error('Operation cancelled'));
            }
            return;
          }

          const results: EligibilityResults = {
            qualified: doc.results.qualified,
            likely: doc.results.likely,
            maybe: doc.results.maybe,
            notQualified: doc.results.notQualified,
            totalPrograms: doc.results.totalPrograms,
            evaluatedAt: new Date(doc.results.evaluatedAt),
          };

          // Check again before setting state
          if (!signal?.aborted && loadingRef.current) {
            setLoadingRef.current(false);
            loadingRef.current = false;
            resolve(results);
          } else {
            setLoadingRef.current(false);
            loadingRef.current = false;
            reject(new Error('Operation cancelled'));
          }
        } catch (err) {
          if (!signal?.aborted && loadingRef.current) {
            const error = err instanceof Error ? err : new Error('Failed to load results');
            setErrorRef.current(error);
            setLoadingRef.current(false);
            loadingRef.current = false;
            reject(error);
          } else {
            setLoadingRef.current(false);
            loadingRef.current = false;
            reject(new Error('Operation cancelled'));
          }
        }
      });
    });
  }, []);

  /**
   * Load all saved results (summary only)
   * Uses refs for setState functions to prevent memory leaks from Promise closures
   */
  const loadingRef = useRef(false);
  const setLoadingRef = useRef(setIsLoading);
  const setErrorRef = useRef(setError);
  const setSavedResultsRef = useRef(setSavedResults);

  // Keep refs updated with latest setState functions
  // This ensures Promises always use the current setState, not stale closures
  useEffect(() => {
    setLoadingRef.current = setIsLoading;
    setErrorRef.current = setError;
    setSavedResultsRef.current = setSavedResults;
  }, [setIsLoading, setError, setSavedResults]);

  const loadAllResults = useCallback((signal?: AbortSignal): Promise<SavedResult[]> => {
    return new Promise((resolve, reject) => {
      // Check if already aborted
      if (signal?.aborted) {
        reject(new Error('Operation cancelled'));
        return;
      }

      // Use refs instead of direct setState to avoid closure capturing
      setLoadingRef.current(true);
      setErrorRef.current(null);
      loadingRef.current = true;

      // Use Promise.resolve().then() instead of queueMicrotask to allow proper cancellation
      // This prevents closure memory leaks by ensuring the Promise can be properly rejected on abort
      Promise.resolve().then(() => {
        // Check if aborted before processing
        if (signal?.aborted || !loadingRef.current) {
          setLoadingRef.current(false);
          loadingRef.current = false;
          reject(new Error('Operation cancelled'));
          return;
        }

        try {
          // TODO: Replace with actual RxDB query
          // const docs = await db.eligibility_results
          //   .find()
          //   .sort({ evaluatedAt: 'desc' })
          //   .exec();

          // Mock: Load from localStorage (synchronous operation)
          const existing = JSON.parse(localStorage.getItem('eligibility_results') ?? '[]') as Partial<EligibilityResultsDocument>[];

          const results: SavedResult[] = existing
            .filter((doc) => doc.id && doc.qualifiedCount !== undefined && doc.results && doc.evaluatedAt)
            .map((doc) => ({
              id: doc.id as string,
              qualifiedCount: doc.qualifiedCount as number,
              totalPrograms: doc.results?.totalPrograms ?? 0,
              evaluatedAt: new Date(doc.evaluatedAt as number),
              state: doc.state,
              tags: doc.tags,
              notes: doc.notes,
            }));

          // Sort by date descending
          results.sort((a, b) => b.evaluatedAt.getTime() - a.evaluatedAt.getTime());

          // Check again before setting state
          if (!signal?.aborted && loadingRef.current) {
            setSavedResultsRef.current(results);
            setLoadingRef.current(false);
            loadingRef.current = false;
            resolve(results);
          } else {
            setLoadingRef.current(false);
            loadingRef.current = false;
            reject(new Error('Operation cancelled'));
          }
        } catch (err) {
          if (!signal?.aborted && loadingRef.current) {
            const error = err instanceof Error ? err : new Error('Failed to load results');
            setErrorRef.current(error);
            setLoadingRef.current(false);
            loadingRef.current = false;
            reject(error);
          } else {
            setLoadingRef.current(false);
            loadingRef.current = false;
            reject(new Error('Operation cancelled'));
          }
        }
      });
    });
  }, []);

  /**
   * Delete a saved result
   */
  const deleteResult = useCallback((id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual RxDB deletion
        // await db.eligibility_results.findOne(id).remove();

        // Mock: Remove from localStorage
        const existing = JSON.parse(localStorage.getItem('eligibility_results') ?? '[]') as Partial<EligibilityResultsDocument>[];
        const filtered = existing.filter((d) => d.id !== id);
        localStorage.setItem('eligibility_results', JSON.stringify(filtered));

        // Update local state
        setSavedResults(prev => prev.filter(r => r.id !== id));

        setIsLoading(false);
        resolve();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete results');
        setError(error);
        setIsLoading(false);
        reject(error);
      }
    });
  }, []);

  /**
   * Update notes or tags for a saved result
   */
  const updateResult = useCallback((
    id: string,
    updates: { notes?: string; tags?: string[] }
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual RxDB update
        // await db.eligibility_results.findOne(id).update({
        //   $set: { ...updates, updatedAt: Date.now() }
        // });

        // Mock: Update in localStorage
        const existing = JSON.parse(localStorage.getItem('eligibility_results') ?? '[]') as Partial<EligibilityResultsDocument>[];
        const index = existing.findIndex((d) => d.id === id);

        if (index !== -1) {
          // TypeScript knows index is valid here, so we can safely access the item
          // eslint-disable-next-line security/detect-object-injection
          const itemToUpdate = existing[index];
          const updatedItem = {
            ...itemToUpdate,
            ...updates,
            updatedAt: Date.now(),
          };

          // Create a new array with the updated item
          const updatedArray = [
            ...existing.slice(0, index),
            updatedItem,
            ...existing.slice(index + 1),
          ];

          localStorage.setItem('eligibility_results', JSON.stringify(updatedArray));

          // Update local state
          setSavedResults(prev => prev.map(r =>
            r.id === id ? { ...r, ...updates } : r
          ));
        }

        setIsLoading(false);
        resolve();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update results');
        setError(error);
        setIsLoading(false);
        reject(error);
      }
    });
  }, []);

  /**
   * Load saved results on mount
   * Only run once on initial mount to prevent memory leaks from repeated calls
   * Uses AbortController to cancel pending operations on unmount
   */
  const hasLoadedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Only load once per component instance to prevent memory leaks
    if (hasLoadedRef.current) return;

    hasLoadedRef.current = true;

    // Create AbortController for this operation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    loadAllResults(abortController.signal)
      .then(() => {
        // Promise resolved successfully
      })
      .catch((error) => {
        // Only log error if it's not a cancellation
        if (error.message !== 'Operation cancelled') {
          console.error(error);
        }
      });

    return () => {
      // Cancel any pending operations on unmount
      abortController.abort();
      abortControllerRef.current = null;
      hasLoadedRef.current = false; // Reset for potential remount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount, not when loadAllResults changes

  return {
    // State
    savedResults,
    isLoading,
    error,

    // Actions
    saveResults,
    loadResult,
    loadAllResults,
    deleteResult,
    updateResult,
  };
}

export default useResultsManagement;

