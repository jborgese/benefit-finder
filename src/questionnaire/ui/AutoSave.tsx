/**
 * Auto-Save Hook
 *
 * Automatically saves questionnaire progress to localStorage with encryption
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQuestionFlowStore } from '../store';
import { useEncryptionStore } from '../../stores/encryptionStore';
import { encrypt, decrypt, type EncryptedData } from '../../utils/encryption';

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

/**
 * Wrapper for saved progress with encryption metadata
 */
interface SavedProgressWrapper {
  version: number;
  encrypted: boolean;
  data: string | SavedProgressData; // Encrypted string or plain data
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
 * Hook for auto-saving questionnaire progress with encryption
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
  const encryptionStore = useEncryptionStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSavedRef = useRef<string>('');

  const saveToStorage = useCallback(async () => {
    if (!enabled || !store.started) {return;}

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

      // Check if encryption is available
      const encryptionKey = encryptionStore.getKey();
      
      let wrapper: SavedProgressWrapper;
      
      if (encryptionKey) {
        // Encrypt the data
        const encrypted = await encrypt(serialized, encryptionKey);
        wrapper = {
          version: 1,
          encrypted: true,
          data: JSON.stringify(encrypted),
        };
      } else {
        // Store unencrypted (fallback for when encryption not set up)
        wrapper = {
          version: 1,
          encrypted: false,
          data,
        };
      }

      localStorage.setItem(storageKey, JSON.stringify(wrapper));
      lastSavedRef.current = serialized;

      onSave?.(data);
    } catch (error) {
      console.error('Auto-save failed:', error);
      onError?.(error as Error);
    }
  }, [enabled, store, storageKey, onSave, onError, encryptionStore]);

  // Debounced save on any change
  useEffect(() => {
    if (!enabled) {return;}

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      void saveToStorage();
    }, debounceMs);

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
        void saveToStorage();
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
 * Load saved progress from localStorage (with decryption support)
 */
export async function loadSavedProgress(
  storageKey = DEFAULT_STORAGE_KEY
): Promise<SavedProgressData | null> {
  try {
    const saved = localStorage.getItem(storageKey);

    if (!saved) {
      return null;
    }

    const parsed = JSON.parse(saved);

    // Handle new wrapper format
    if (parsed.version === 1) {
      const wrapper = parsed as SavedProgressWrapper;

      if (wrapper.encrypted) {
        // Encrypted data - need encryption key to decrypt
        const encryptionStore = useEncryptionStore.getState();
        const encryptionKey = encryptionStore.getKey();

        if (!encryptionKey) {
          console.warn('Saved progress is encrypted but encryption key not available');
          return null;
        }

        try {
          const encryptedData = JSON.parse(wrapper.data as string) as EncryptedData;
          const decrypted = await decrypt(encryptedData, encryptionKey);
          const data = JSON.parse(decrypted) as SavedProgressData;

          // Validate required fields
          if (!data.sessionId || !data.flowId || !data.currentNodeId) {
            console.warn('Invalid saved progress data');
            return null;
          }

          return data;
        } catch (error) {
          console.error('Failed to decrypt saved progress:', error);
          return null;
        }
      } else {
        // Unencrypted data
        const data = wrapper.data as SavedProgressData;

        // Validate required fields
        if (!data.sessionId || !data.flowId || !data.currentNodeId) {
          console.warn('Invalid saved progress data');
          return null;
        }

        return data;
      }
    }

    // Handle legacy format (unencrypted, no wrapper)
    const data = parsed as SavedProgressData;

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
export async function getSavedProgressMetadata(storageKey = DEFAULT_STORAGE_KEY): Promise<{
  exists: boolean;
  encrypted?: boolean;
  lastSaved?: Date;
  flowId?: string;
  progress?: number;
}> {
  const saved = await loadSavedProgress(storageKey);

  if (!saved) {
    // Check if data exists but couldn't be loaded (encrypted without key)
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.version === 1 && parsed.encrypted) {
          return {
            exists: true,
            encrypted: true,
          };
        }
      } catch {
        // Ignore parse errors
      }
    }

    return { exists: false };
  }

  return {
    exists: true,
    encrypted: false, // If we could load it, we had the key or it wasn't encrypted
    lastSaved: new Date(saved.updatedAt),
    flowId: saved.flowId,
  };
}

