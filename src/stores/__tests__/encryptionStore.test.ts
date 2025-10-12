/**
 * Encryption Store Tests
 *
 * Tests for the encryption Zustand store.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEncryptionStore } from '../encryptionStore';
import {
  clearEncryptionData,
} from '../../utils/encryption';

describe('EncryptionStore', () => {
  // Clear localStorage and reset store before each test
  beforeEach(() => {
    localStorage.clear();
    const { result } = renderHook(() => useEncryptionStore());
    act(() => {
      result.current.reset();
    });
  });

  afterEach(() => {
    localStorage.clear();
    clearEncryptionData();
  });

  // ==========================================================================
  // INITIAL STATE
  // ==========================================================================

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useEncryptionStore());

      expect(result.current.mode).toBe('disabled');
      expect(result.current.isEnabled).toBe(false);
      expect(result.current.isKeyLoaded).toBe(false);
      expect(result.current.passphraseStrength).toBe('none');
      expect(result.current.passphraseHint).toBeNull();
    });
  });

  // ==========================================================================
  // ENABLE PASSPHRASE ENCRYPTION
  // ==========================================================================

  describe('enablePassphraseEncryption', () => {
    it('should enable encryption with strong passphrase', async () => {
      const { result } = renderHook(() => useEncryptionStore());

      const passphrase = 'MyStr0ng!P@ssw0rd';
      let success = false;

      await act(async () => {
        success = await result.current.enablePassphraseEncryption(passphrase);
      });

      expect(success).toBe(true);
      expect(result.current.mode).toBe('passphrase');
      expect(result.current.isEnabled).toBe(true);
      expect(result.current.isKeyLoaded).toBe(true);
      expect(['strong', 'very-strong']).toContain(
        result.current.passphraseStrength
      );
    });

    it('should store passphrase hint', async () => {
      const { result } = renderHook(() => useEncryptionStore());

      const passphrase = 'MyStr0ng!P@ssw0rd';
      const hint = 'My favorite password pattern';

      await act(async () => {
        await result.current.enablePassphraseEncryption(passphrase, hint);
      });

      expect(result.current.passphraseHint).toBe(hint);
      expect(result.current.getHint()).toBe(hint);
    });

    it('should reject weak passphrase', async () => {
      const { result } = renderHook(() => useEncryptionStore());

      const weakPassphrase = 'weak';
      let success = false;

      await act(async () => {
        success = await result.current.enablePassphraseEncryption(
          weakPassphrase
        );
      });

      expect(success).toBe(false);
      expect(result.current.isEnabled).toBe(false);
    });

    it('should generate and store salt', async () => {
      const { result } = renderHook(() => useEncryptionStore());

      const passphrase = 'MyStr0ng!P@ssw0rd';

      await act(async () => {
        await result.current.enablePassphraseEncryption(passphrase);
      });

      expect(result.current._salt).toBeDefined();
      expect(typeof result.current._salt).toBe('string');
    });
  });

  // ==========================================================================
  // UNLOCK WITH PASSPHRASE
  // ==========================================================================

  describe('unlockWithPassphrase', () => {
    it('should unlock with correct passphrase', async () => {
      const { result } = renderHook(() => useEncryptionStore());

      const passphrase = 'MyStr0ng!P@ssw0rd';

      // First enable encryption
      await act(async () => {
        await result.current.enablePassphraseEncryption(passphrase);
      });

      // Lock it
      act(() => {
        result.current.lockEncryption();
      });

      expect(result.current.isKeyLoaded).toBe(false);

      // Unlock with correct passphrase
      let unlocked = false;
      await act(async () => {
        unlocked = await result.current.unlockWithPassphrase(passphrase);
      });

      expect(unlocked).toBe(true);
      expect(result.current.isKeyLoaded).toBe(true);
    });

    it('should reject incorrect passphrase', async () => {
      const { result } = renderHook(() => useEncryptionStore());

      const correctPassphrase = 'MyStr0ng!P@ssw0rd';
      const wrongPassphrase = 'Wr0ng!P@ssw0rd';

      // First enable encryption
      await act(async () => {
        await result.current.enablePassphraseEncryption(correctPassphrase);
      });

      // Lock it
      act(() => {
        result.current.lockEncryption();
      });

      // Try to unlock with wrong passphrase
      let unlocked = false;
      await act(async () => {
        unlocked = await result.current.unlockWithPassphrase(wrongPassphrase);
      });

      expect(unlocked).toBe(false);
      expect(result.current.isKeyLoaded).toBe(false);
    });

    it('should fail if no salt is stored', async () => {
      const { result } = renderHook(() => useEncryptionStore());

      let unlocked = false;
      await act(async () => {
        unlocked = await result.current.unlockWithPassphrase('any-passphrase');
      });

      expect(unlocked).toBe(false);
    });
  });

  // ==========================================================================
  // ENABLE AUTO ENCRYPTION
  // ==========================================================================

  describe('enableAutoEncryption', () => {
    it('should enable auto encryption', () => {
      const { result } = renderHook(() => useEncryptionStore());

      act(() => {
        result.current.enableAutoEncryption();
      });

      expect(result.current.mode).toBe('auto');
      expect(result.current.isEnabled).toBe(true);
      expect(result.current.isKeyLoaded).toBe(true);
      expect(result.current.passphraseStrength).toBe('none');
    });
  });

  // ==========================================================================
  // DISABLE ENCRYPTION
  // ==========================================================================

  describe('disableEncryption', () => {
    it('should disable encryption', async () => {
      const { result } = renderHook(() => useEncryptionStore());

      // First enable it
      await act(async () => {
        await result.current.enablePassphraseEncryption('MyStr0ng!P@ssw0rd');
      });

      expect(result.current.isEnabled).toBe(true);

      // Now disable it
      act(() => {
        result.current.disableEncryption();
      });

      expect(result.current.mode).toBe('disabled');
      expect(result.current.isEnabled).toBe(false);
      expect(result.current.isKeyLoaded).toBe(false);
      expect(result.current.passphraseStrength).toBe('none');
      expect(result.current._encryptionKey).toBeNull();
      expect(result.current._salt).toBeNull();
    });
  });

  // ==========================================================================
  // LOCK ENCRYPTION
  // ==========================================================================

  describe('lockEncryption', () => {
    it('should lock encryption (clear key from memory)', async () => {
      const { result } = renderHook(() => useEncryptionStore());

      await act(async () => {
        await result.current.enablePassphraseEncryption('MyStr0ng!P@ssw0rd');
      });

      expect(result.current.isKeyLoaded).toBe(true);
      expect(result.current._encryptionKey).not.toBeNull();

      act(() => {
        result.current.lockEncryption();
      });

      expect(result.current.isKeyLoaded).toBe(false);
      expect(result.current._encryptionKey).toBeNull();

      // But encryption should still be enabled
      expect(result.current.isEnabled).toBe(true);
    });
  });

  // ==========================================================================
  // CHECK PASSPHRASE STRENGTH
  // ==========================================================================

  describe('checkPassphraseStrength', () => {
    it('should evaluate passphrase strength', () => {
      const { result } = renderHook(() => useEncryptionStore());

      let strength;

      act(() => {
        strength = result.current.checkPassphraseStrength('weak');
      });
      expect(strength).toBe('weak');

      act(() => {
        strength = result.current.checkPassphraseStrength('MyStr0ng!P@ssw0rd');
      });
      expect(['strong', 'very-strong']).toContain(strength);
    });

    it('should update store state', () => {
      const { result } = renderHook(() => useEncryptionStore());

      act(() => {
        result.current.checkPassphraseStrength('MyStr0ng!P@ssw0rd');
      });

      expect(['strong', 'very-strong']).toContain(
        result.current.passphraseStrength
      );
    });
  });

  // ==========================================================================
  // GET KEY
  // ==========================================================================

  describe('getKey', () => {
    it('should return null when not loaded', () => {
      const { result } = renderHook(() => useEncryptionStore());

      const key = result.current.getKey();
      expect(key).toBeNull();
    });

    it('should return key when loaded', async () => {
      const { result } = renderHook(() => useEncryptionStore());

      await act(async () => {
        await result.current.enablePassphraseEncryption('MyStr0ng!P@ssw0rd');
      });

      const key = result.current.getKey();
      expect(key).not.toBeNull();
      expect(key).toBeInstanceOf(CryptoKey);
    });
  });

  // ==========================================================================
  // RESET
  // ==========================================================================

  describe('reset', () => {
    it('should reset store to initial state', async () => {
      const { result } = renderHook(() => useEncryptionStore());

      // Enable encryption
      await act(async () => {
        await result.current.enablePassphraseEncryption(
          'MyStr0ng!P@ssw0rd',
          'hint'
        );
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.mode).toBe('disabled');
      expect(result.current.isEnabled).toBe(false);
      expect(result.current.isKeyLoaded).toBe(false);
    });
  });

  // ==========================================================================
  // SELECTORS
  // ==========================================================================

  describe('selectors', () => {
    it('should select encryption mode', async () => {
      const { result } = renderHook(() => useEncryptionStore());

      expect(result.current.mode).toBe('disabled');

      await act(async () => {
        await result.current.enablePassphraseEncryption('MyStr0ng!P@ssw0rd');
      });

      expect(result.current.mode).toBe('passphrase');
    });

    it('should select encryption enabled status', async () => {
      const { result } = renderHook(() => useEncryptionStore());

      expect(result.current.isEnabled).toBe(false);

      await act(async () => {
        await result.current.enablePassphraseEncryption('MyStr0ng!P@ssw0rd');
      });

      expect(result.current.isEnabled).toBe(true);
    });
  });

  // ==========================================================================
  // PERSISTENCE
  // ==========================================================================

  describe('persistence', () => {
    it('should persist encryption mode', async () => {
      const { result: result1, unmount } = renderHook(() =>
        useEncryptionStore()
      );

      await act(async () => {
        await result1.current.enablePassphraseEncryption('MyStr0ng!P@ssw0rd');
      });

      // Simulate page reload: clear memory state but keep localStorage
      act(() => {
        result1.current.lockEncryption(); // Clear key from memory
      });

      unmount();

      // Create new hook instance (simulates page reload)
      const { result: result2 } = renderHook(() => useEncryptionStore());

      // Mode should be persisted, but key should not be loaded (security)
      expect(result2.current.mode).toBe('passphrase');
      expect(result2.current.isEnabled).toBe(true);
      expect(result2.current.isKeyLoaded).toBe(false); // Key not persisted
    });

    it('should not persist encryption key', async () => {
      const { result: result1, unmount } = renderHook(() =>
        useEncryptionStore()
      );

      await act(async () => {
        await result1.current.enablePassphraseEncryption('MyStr0ng!P@ssw0rd');
      });

      expect(result1.current._encryptionKey).not.toBeNull();

      // Simulate page reload: clear memory state but keep localStorage
      act(() => {
        result1.current.lockEncryption(); // Clear key from memory
      });

      unmount();

      // Create new hook instance (simulates page reload)
      const { result: result2 } = renderHook(() => useEncryptionStore());

      // Key should NOT be persisted
      expect(result2.current._encryptionKey).toBeNull();
    });
  });
});

