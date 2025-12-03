/**
 * Auto-Save Encryption Tests
 *
 * Tests for encrypted autosave functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { loadSavedProgress, getSavedProgressMetadata, type SavedProgressData } from '../AutoSave';
import { useEncryptionStore } from '../../../stores/encryptionStore';
import { encrypt } from '../../../utils/encryption';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AutoSave - Encryption', () => {
  const storageKey = 'test-autosave-encrypted';

  beforeEach(() => {
    localStorageMock.clear();
    useEncryptionStore.getState().disableEncryption();
  });

  describe('Loading Encrypted Data', () => {
    it('should load encrypted data with correct key', async () => {
      // Setup encryption
      const encryptionStore = useEncryptionStore.getState();
      await encryptionStore.enablePassphraseEncryption('TestPassword123!', 'test hint');

      const encryptionKey = encryptionStore.getKey();
      expect(encryptionKey).not.toBeNull();

      // Create test data
      const testData: SavedProgressData = {
        sessionId: 'test-session',
        flowId: 'test-flow',
        currentNodeId: 'node1',
        answers: [['q1', 'sensitive-answer']],
        history: ['node1'],
        startedAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Encrypt and store
      const encrypted = await encrypt(JSON.stringify(testData), encryptionKey!);
      const wrapper = {
        version: 1,
        encrypted: true,
        data: JSON.stringify(encrypted),
      };
      localStorage.setItem(storageKey, JSON.stringify(wrapper));

      // Load should decrypt successfully
      const loaded = await loadSavedProgress(storageKey);

      expect(loaded).not.toBeNull();
      expect(loaded!.flowId).toBe('test-flow');
      expect(loaded!.sessionId).toBe('test-session');
      expect(loaded!.answers).toEqual([['q1', 'sensitive-answer']]);
    });

    it('should fail to load encrypted data without key', async () => {
      // Setup encryption and save data
      const encryptionStore = useEncryptionStore.getState();
      await encryptionStore.enablePassphraseEncryption('TestPassword123!', 'test hint');

      const encryptionKey = encryptionStore.getKey();
      expect(encryptionKey).not.toBeNull();

      const testData: SavedProgressData = {
        sessionId: 'test-session',
        flowId: 'test-flow',
        currentNodeId: 'node1',
        answers: [['q1', 'sensitive-data']],
        history: ['node1'],
        startedAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Encrypt and store
      const encrypted = await encrypt(JSON.stringify(testData), encryptionKey!);
      const wrapper = {
        version: 1,
        encrypted: true,
        data: JSON.stringify(encrypted),
      };
      localStorage.setItem(storageKey, JSON.stringify(wrapper));

      // Lock encryption (clear key from memory)
      encryptionStore.lockEncryption();

      // Try to load without key
      const loaded = await loadSavedProgress(storageKey);

      expect(loaded).toBeNull();
    });

    it('should load legacy unencrypted data', async () => {
      // Simulate old format (no wrapper)
      const legacyData: SavedProgressData = {
        sessionId: 'legacy-session',
        flowId: 'legacy-flow',
        currentNodeId: 'node1',
        answers: [['q1', 'answer1']],
        history: ['node1'],
        startedAt: Date.now(),
        updatedAt: Date.now(),
      };

      localStorage.setItem(storageKey, JSON.stringify(legacyData));

      // Load should work without encryption
      const loaded = await loadSavedProgress(storageKey);

      expect(loaded).not.toBeNull();
      expect(loaded!.flowId).toBe('legacy-flow');
      expect(loaded!.sessionId).toBe('legacy-session');
    });

    it('should load new format unencrypted data', async () => {
      const testData: SavedProgressData = {
        sessionId: 'test-session',
        flowId: 'test-flow',
        currentNodeId: 'node1',
        answers: [['q1', 'answer1']],
        history: ['node1'],
        startedAt: Date.now(),
        updatedAt: Date.now(),
      };

      const wrapper = {
        version: 1,
        encrypted: false,
        data: testData,
      };

      localStorage.setItem(storageKey, JSON.stringify(wrapper));

      // Load should work
      const loaded = await loadSavedProgress(storageKey);

      expect(loaded).not.toBeNull();
      expect(loaded!.flowId).toBe('test-flow');
      expect(loaded!.sessionId).toBe('test-session');
    });
  });

  describe('Security', () => {
    it('should not store plaintext sensitive data when encrypted', async () => {
      const sensitiveData = 'SSN: 123-45-6789';

      // Setup encryption
      const encryptionStore = useEncryptionStore.getState();
      await encryptionStore.enablePassphraseEncryption('TestPassword123!', 'test hint');

      const encryptionKey = encryptionStore.getKey();
      expect(encryptionKey).not.toBeNull();

      const testData: SavedProgressData = {
        sessionId: 'test-session',
        flowId: 'test-flow',
        currentNodeId: 'ssn-node',
        answers: [['ssn', sensitiveData]],
        history: ['ssn-node'],
        startedAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Encrypt and store
      const encrypted = await encrypt(JSON.stringify(testData), encryptionKey!);
      const wrapper = {
        version: 1,
        encrypted: true,
        data: JSON.stringify(encrypted),
      };
      localStorage.setItem(storageKey, JSON.stringify(wrapper));

      // Check localStorage doesn't contain plaintext
      const saved = localStorage.getItem(storageKey);
      expect(saved).not.toContain(sensitiveData);
      expect(saved).not.toContain('123-45-6789');
    });

    it('should require same key for decryption', async () => {
      // Save with one key
      let encryptionStore = useEncryptionStore.getState();
      await encryptionStore.enablePassphraseEncryption('Password1!', 'hint1');

      const encryptionKey = encryptionStore.getKey();
      expect(encryptionKey).not.toBeNull();

      const testData: SavedProgressData = {
        sessionId: 'test-session',
        flowId: 'test-flow',
        currentNodeId: 'node1',
        answers: [['q1', 'secret-data']],
        history: ['node1'],
        startedAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Encrypt and store
      const encrypted = await encrypt(JSON.stringify(testData), encryptionKey!);
      const wrapper = {
        version: 1,
        encrypted: true,
        data: JSON.stringify(encrypted),
      };
      localStorage.setItem(storageKey, JSON.stringify(wrapper));

      // Try to load with different key
      encryptionStore.disableEncryption();
      encryptionStore = useEncryptionStore.getState();
      await encryptionStore.enablePassphraseEncryption('DifferentPassword2!', 'hint2');

      const loaded = await loadSavedProgress(storageKey);
      expect(loaded).toBeNull(); // Should fail with wrong key
    });
  });

  describe('Metadata', () => {
    it('should indicate encrypted status when key unavailable', async () => {
      // Setup encryption and save
      const encryptionStore = useEncryptionStore.getState();
      await encryptionStore.enablePassphraseEncryption('TestPassword123!', 'test hint');

      const encryptionKey = encryptionStore.getKey();
      expect(encryptionKey).not.toBeNull();

      const testData: SavedProgressData = {
        sessionId: 'test-session',
        flowId: 'test-flow',
        currentNodeId: 'node1',
        answers: [['q1', 'data']],
        history: ['node1'],
        startedAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Encrypt and store
      const encrypted = await encrypt(JSON.stringify(testData), encryptionKey!);
      const wrapper = {
        version: 1,
        encrypted: true,
        data: JSON.stringify(encrypted),
      };
      localStorage.setItem(storageKey, JSON.stringify(wrapper));

      // Lock and check metadata
      encryptionStore.lockEncryption();

      const metadata = await getSavedProgressMetadata(storageKey);
      expect(metadata.exists).toBe(true);
      expect(metadata.encrypted).toBe(true);
    });
  });
});
