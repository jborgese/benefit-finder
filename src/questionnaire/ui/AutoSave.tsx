/**
 * Auto-Save Hook
 *
 * Automatically saves questionnaire progress to localStorage
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQuestionFlowStore } from '../store';

export interface AutoSaveOptions {
  /** Storage key prefix */
  storageKey?: string;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Enable/disable auto-save */
  enabled?: boolean;
  /** Callback when save occurs */
  onSave?: (data: any) => void;
  /** Callback when save fails */
  onError?: (error: Error) => void;
}

/**
 * Hook for auto-saving questionnaire progress
 */
export function useAutoSave(options: AutoSaveOptions = {}) {
  const {
    storageKey = 'bf-questionnaire-autosave',
    debounceMs = 1000,
    enabled = true,
    onSave,
    onError,
  } = options;

  const store = useQuestionFlowStore();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  const saveToStorage = useCallback(() => {
    if (!enabled || !store.started) return;

    try {
      const data = {
        sessionId: store.sessionId,
        flowId: store.flowId,
        currentNodeId: store.currentNodeId,
        answers: Array.from(store.answers.entries()),
        history: store.history,
        startedAt: store.startedAt,
        updatedAt: Date.now(),
      };

      const serialized = JSON.stringify(data);

      // Only save if data has changed
      if (serialized === lastSavedRef.current) {
        return;
      }

      localStorage.setItem(storageKey, serialized);
      lastSavedRef.current = serialized;

      onSave?.(data);
    } catch (error) {
      console.error('Auto-save failed:', error);
      onError?.(error as Error);
    }
  }, [enabled, store, storageKey, onSave, onError]);

  // Debounced save on any change
  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(saveToStorage, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    store.answers,
    store.currentNodeId,
    enabled,
    debounceMs,
    saveToStorage,
  ]);

  // Save immediately on unmount
  useEffect(() => {
    return () => {
      if (enabled) {
        saveToStorage();
      }
    };
  }, [enabled, saveToStorage]);

  return {
    save: saveToStorage,
    clear: () => {
      localStorage.removeItem(storageKey);
      lastSavedRef.current = '';
    },
  };
}

/**
 * Load saved progress from localStorage
 */
export function loadSavedProgress(storageKey = 'bf-questionnaire-autosave'): {
  sessionId: string;
  flowId: string;
  currentNodeId: string;
  answers: [string, any][];
  history: string[];
  startedAt: number;
  updatedAt: number;
} | null {
  try {
    const saved = localStorage.getItem(storageKey);

    if (!saved) {
      return null;
    }

    const data = JSON.parse(saved);

    // Validate required fields
    if (!data.sessionId || !data.flowId || !data.currentNodeId) {
      console.warn('Invalid saved progress data');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load saved progress:', error);
    return null;
  }
}

/**
 * Check if there is saved progress
 */
export function hasSavedProgress(storageKey = 'bf-questionnaire-autosave'): boolean {
  return localStorage.getItem(storageKey) !== null;
}

/**
 * Clear saved progress
 */
export function clearSavedProgress(storageKey = 'bf-questionnaire-autosave'): void {
  localStorage.removeItem(storageKey);
}

/**
 * Get saved progress metadata
 */
export function getSavedProgressMetadata(storageKey = 'bf-questionnaire-autosave'): {
  exists: boolean;
  lastSaved?: Date;
  flowId?: string;
  progress?: number;
} {
  const saved = loadSavedProgress(storageKey);

  if (!saved) {
    return { exists: false };
  }

  return {
    exists: true,
    lastSaved: new Date(saved.updatedAt),
    flowId: saved.flowId,
  };
}

