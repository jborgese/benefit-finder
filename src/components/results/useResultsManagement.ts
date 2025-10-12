/**
 * useResultsManagement Hook
 *
 * Manages saving, loading, and managing eligibility results in RxDB
 */

import { useState, useCallback, useEffect } from 'react';
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
  loadResult: (id: string) => Promise<EligibilityResults | null>;
  loadAllResults: () => Promise<SavedResult[]>;
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
   */
  const loadResult = useCallback((id: string): Promise<EligibilityResults | null> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual RxDB query
        // const doc = await db.eligibility_results.findOne(id).exec();

        // Mock: Load from localStorage
        const existing = JSON.parse(localStorage.getItem('eligibility_results') ?? '[]') as Partial<EligibilityResultsDocument>[];
        const doc = existing.find((d) => d.id === id);

        if (!doc) {
          setIsLoading(false);
          resolve(null);
          return;
        }

        const results: EligibilityResults = {
          qualified: doc.results!.qualified,
          likely: doc.results!.likely,
          maybe: doc.results!.maybe,
          notQualified: doc.results!.notQualified,
          totalPrograms: doc.results!.totalPrograms,
          evaluatedAt: new Date(doc.results!.evaluatedAt),
        };

        setIsLoading(false);
        resolve(results);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load results');
        setError(error);
        setIsLoading(false);
        reject(error);
      }
    });
  }, []);

  /**
   * Load all saved results (summary only)
   */
  const loadAllResults = useCallback((): Promise<SavedResult[]> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual RxDB query
        // const docs = await db.eligibility_results
        //   .find()
        //   .sort({ evaluatedAt: 'desc' })
        //   .exec();

        // Mock: Load from localStorage
        const existing = JSON.parse(localStorage.getItem('eligibility_results') ?? '[]') as Partial<EligibilityResultsDocument>[];

        const results: SavedResult[] = existing.map((doc) => ({
          id: doc.id!,
          qualifiedCount: doc.qualifiedCount!,
          totalPrograms: doc.results!.totalPrograms,
          evaluatedAt: new Date(doc.evaluatedAt!),
          state: doc.state,
          tags: doc.tags,
          notes: doc.notes,
        }));

        // Sort by date descending
        results.sort((a, b) => b.evaluatedAt.getTime() - a.evaluatedAt.getTime());

        setSavedResults(results);
        setIsLoading(false);
        resolve(results);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load results');
        setError(error);
        setIsLoading(false);
        reject(error);
      }
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

        if (index !== -1 && index < existing.length) {
          const item = existing[index];
          if (item) {
            existing[index] = {
              ...item,
              ...updates,
              updatedAt: Date.now(),
            };
            localStorage.setItem('eligibility_results', JSON.stringify(existing));

            // Update local state
            setSavedResults(prev => prev.map(r =>
              r.id === id ? { ...r, ...updates } : r
            ));
          }
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
   */
  useEffect(() => {
    loadAllResults().catch(console.error);
  }, [loadAllResults]);

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

