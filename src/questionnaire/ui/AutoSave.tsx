/**
 * Auto-Save Hook
 *
 * Automatically saves questionnaire progress to localStorage
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQuestionFlowStore } from '../store';

/**
 * Default storage key for auto-save functionality
 */
const DEFAULT_STORAGE_KEY = 'bf-questionnaire-autosave';

/**
 * Saved progress data structure
 */
export interface SavedProgressData {
  sessionId: string;
  flowId: string;
  currentNodeId: string;
  answers: [string, unknown][];
  history: string[];
  startedAt: number;
  updatedAt: number;
}

export interface AutoSaveOptions {
  /** Storage key prefix */
  storageKey?: string;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Enable/disable auto-save */
  enabled?: boolean;
  /** Callback when save occurs */
  onSave?: (data: SavedProgressData) => void;
  /** Callback when save fails */
  onError?: (error: Error) => void;
}

/**
 * Hook for auto-saving questionnaire progress
 */
export function useAutoSave(options: AutoSaveOptions = {}): {
  save: () => void;
  clear: () => void;
} {
  const {
    storageKey = DEFAULT_STORAGE_KEY,
    debounceMs = 1000,
    enabled = true,
    onSave,
    onError,
  } = options;

  const store = useQuestionFlowStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSavedRef = useRef<string>('');

  const saveToStorage = useCallback(() => {
    if (!enabled || !store.started) return;

    try {
      // Ensure all required fields are non-null before saving
      if (!store.sessionId || !store.flowId || !store.currentNodeId || store.startedAt === null) {
        return;
      }

      const data: SavedProgressData = {
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
export function loadSavedProgress(storageKey = DEFAULT_STORAGE_KEY): SavedProgressData | null {
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
export function hasSavedProgress(storageKey = DEFAULT_STORAGE_KEY): boolean {
  return localStorage.getItem(storageKey) !== null;
}

/**
 * Clear saved progress
 */
export function clearSavedProgress(storageKey = DEFAULT_STORAGE_KEY): void {
  localStorage.removeItem(storageKey);
}

/**
 * Get saved progress metadata
 */
export function getSavedProgressMetadata(storageKey = DEFAULT_STORAGE_KEY): {
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

