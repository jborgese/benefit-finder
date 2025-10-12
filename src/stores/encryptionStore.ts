/**
 * Encryption Store
 *
 * Manages encryption state and user passphrase.
 * Provides reactive state for encryption indicator UI.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  deriveKeyFromPassphrase,
  isEncryptionEnabled,
  setEncryptionEnabled,
  getStoredSalt,
  storeSalt,
  clearEncryptionData,
  evaluatePassphraseStrength,
  storePassphraseHint,
  getPassphraseHint,
  testEncryption,
  type EncryptionStrength,
  type DerivedKey,
} from '../utils/encryption';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Encryption mode
 */
export type EncryptionMode = 'disabled' | 'auto' | 'passphrase';

/**
 * Encryption state interface
 */
export interface EncryptionState {
  /** Current encryption mode */
  mode: EncryptionMode;

  /** Whether encryption is active */
  isEnabled: boolean;

  /** Whether encryption key is loaded and ready */
  isKeyLoaded: boolean;

  /** Passphrase strength rating */
  passphraseStrength: EncryptionStrength;

  /** Stored passphrase hint */
  passphraseHint: string | null;

  /** Current encryption key (not persisted) */
  _encryptionKey: CryptoKey | null;

  /** Salt used for key derivation */
  _salt: string | null;
}

/**
 * Encryption actions interface
 */
export interface EncryptionActions {
  /**
   * Enable encryption with a user passphrase
   *
   * @param passphrase User-provided passphrase
   * @param hint Optional hint for the passphrase
   * @returns True if successful
   */
  enablePassphraseEncryption: (
    passphrase: string,
    hint?: string
  ) => Promise<boolean>;

  /**
   * Unlock encryption with passphrase
   *
   * @param passphrase User-provided passphrase
   * @returns True if correct passphrase
   */
  unlockWithPassphrase: (passphrase: string) => Promise<boolean>;

  /**
   * Enable automatic encryption (random key)
   */
  enableAutoEncryption: () => void;

  /**
   * Disable encryption
   *
   * WARNING: This will make encrypted data unrecoverable!
   */
  disableEncryption: () => void;

  /**
   * Lock encryption (clear key from memory)
   */
  lockEncryption: () => void;

  /**
   * Check passphrase strength
   *
   * @param passphrase Passphrase to check
   * @returns Strength rating
   */
  checkPassphraseStrength: (passphrase: string) => EncryptionStrength;

  /**
   * Get stored passphrase hint
   *
   * @returns Hint or null
   */
  getHint: () => string | null;

  /**
   * Get current encryption key (if loaded)
   *
   * @returns CryptoKey or null
   */
  getKey: () => CryptoKey | null;

  /**
   * Reset encryption store to initial state
   */
  reset: () => void;
}

/**
 * Combined store type
 */
export type EncryptionStore = EncryptionState & EncryptionActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: EncryptionState = {
  mode: isEncryptionEnabled() ? 'auto' : 'disabled',
  isEnabled: isEncryptionEnabled(),
  isKeyLoaded: false,
  passphraseStrength: 'none',
  passphraseHint: getPassphraseHint(),
  _encryptionKey: null,
  _salt: getStoredSalt(),
};

// ============================================================================
// STORE DEFINITION
// ============================================================================

/**
 * Encryption store with Zustand
 *
 * @example
 * ```typescript
 * const { enablePassphraseEncryption } = useEncryptionStore();
 * await enablePassphraseEncryption('my-secure-passphrase', 'my pet name');
 * ```
 */
export const useEncryptionStore = create<EncryptionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ======================================================================
      // ACTIONS
      // ======================================================================

      enablePassphraseEncryption: async (
        passphrase: string,
        hint?: string
      ): Promise<boolean> => {
        try {
          // Validate passphrase strength
          const strength = evaluatePassphraseStrength(passphrase);
          if (strength === 'none' || strength === 'weak') {
            console.warn('Passphrase is too weak');
            return false;
          }

          // Derive key from passphrase
          const derived: DerivedKey = await deriveKeyFromPassphrase(passphrase);

          // Test encryption to ensure key works
          const testResult = await testEncryption(derived.key);
          if (!testResult) {
            console.error('Encryption test failed');
            return false;
          }

          // Store salt and hint
          storeSalt(derived.salt);
          if (hint) {
            storePassphraseHint(hint);
          }

          // Update state
          setEncryptionEnabled(true);
          set({
            mode: 'passphrase',
            isEnabled: true,
            isKeyLoaded: true,
            passphraseStrength: strength,
            passphraseHint: hint || null,
            _encryptionKey: derived.key,
            _salt: derived.salt,
          });

          return true;
        } catch (error) {
          console.error('Failed to enable passphrase encryption:', error);
          return false;
        }
      },

      unlockWithPassphrase: async (passphrase: string): Promise<boolean> => {
        try {
          const state = get();

          // Get stored salt
          const salt = state._salt || getStoredSalt();
          if (!salt) {
            console.error('No salt found for key derivation');
            return false;
          }

          // Derive key with stored salt
          const derived: DerivedKey = await deriveKeyFromPassphrase(
            passphrase,
            salt
          );

          // Test encryption to verify correct passphrase
          const testResult = await testEncryption(derived.key);
          if (!testResult) {
            return false;
          }

          // Update state
          const strength = evaluatePassphraseStrength(passphrase);
          set({
            isKeyLoaded: true,
            passphraseStrength: strength,
            _encryptionKey: derived.key,
          });

          return true;
        } catch (error) {
          console.error('Failed to unlock with passphrase:', error);
          return false;
        }
      },

      enableAutoEncryption: (): void => {
        setEncryptionEnabled(true);
        set({
          mode: 'auto',
          isEnabled: true,
          isKeyLoaded: true,
          passphraseStrength: 'none',
        });
      },

      disableEncryption: (): void => {
        // Clear all encryption data
        clearEncryptionData();

        set({
          mode: 'disabled',
          isEnabled: false,
          isKeyLoaded: false,
          passphraseStrength: 'none',
          passphraseHint: null,
          _encryptionKey: null,
          _salt: null,
        });
      },

      lockEncryption: (): void => {
        set({
          isKeyLoaded: false,
          _encryptionKey: null,
        });
      },

      checkPassphraseStrength: (passphrase: string): EncryptionStrength => {
        const strength = evaluatePassphraseStrength(passphrase);
        set({ passphraseStrength: strength });
        return strength;
      },

      getHint: (): string | null => {
        return get().passphraseHint || getPassphraseHint();
      },

      getKey: (): CryptoKey | null => {
        return get()._encryptionKey;
      },

      reset: (): void => {
        set(initialState);
      },
    }),
    {
      name: 'bf-encryption-store',
      // Only persist non-sensitive fields
      partialize: (state) => ({
        mode: state.mode,
        isEnabled: state.isEnabled,
        passphraseHint: state.passphraseHint,
        // NEVER persist the encryption key or salt in Zustand storage
      }),
    }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

/**
 * Select encryption mode
 */
export const selectEncryptionMode = (state: EncryptionStore): EncryptionMode =>
  state.mode;

/**
 * Select encryption enabled status
 */
export const selectIsEncryptionEnabled = (state: EncryptionStore): boolean =>
  state.isEnabled;

/**
 * Select encryption key loaded status
 */
export const selectIsKeyLoaded = (state: EncryptionStore): boolean =>
  state.isKeyLoaded;

/**
 * Select passphrase strength
 */
export const selectPassphraseStrength = (
  state: EncryptionStore
): EncryptionStrength => state.passphraseStrength;

/**
 * Select whether encryption is locked
 */
export const selectIsLocked = (state: EncryptionStore): boolean =>
  state.isEnabled && !state.isKeyLoaded;

