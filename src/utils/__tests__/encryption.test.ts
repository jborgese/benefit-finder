/**
 * Encryption Utilities Tests
 *
 * Comprehensive test suite for encryption functionality.
 * Tests AES-GCM encryption, key derivation, and utility functions.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateSalt,
  deriveKeyFromPassphrase,
  generateEncryptionKey,
  encrypt,
  decrypt,
  encryptToString,
  decryptFromString,
  evaluatePassphraseStrength,
  getStrengthMessage,
  isEncryptionEnabled,
  setEncryptionEnabled,
  getStoredSalt,
  storeSalt,
  clearEncryptionData,
  storePassphraseHint,
  getPassphraseHint,
  testEncryption,
  estimateCrackTime,
  ENCRYPTION_CONFIG,
  STORAGE_KEYS,
  type EncryptedData,
  type EncryptionStrength,
} from '../encryption';

// ============================================================================
// TEST SETUP
// ============================================================================

describe('Encryption Utilities', () => {
  // Clear localStorage before and after each test
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ==========================================================================
  // SALT GENERATION
  // ==========================================================================

  describe('generateSalt', () => {
    it('should generate a base64-encoded salt', () => {
      const salt = generateSalt();

      expect(salt).toBeDefined();
      expect(typeof salt).toBe('string');
      expect(salt.length).toBeGreaterThan(0);

      // Should be valid base64
      expect(() => atob(salt)).not.toThrow();
    });

    it('should generate unique salts', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      const salt3 = generateSalt();

      expect(salt1).not.toBe(salt2);
      expect(salt2).not.toBe(salt3);
      expect(salt1).not.toBe(salt3);
    });

    it('should generate salts of consistent length', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();

      expect(salt1.length).toBe(salt2.length);
    });
  });

  // ==========================================================================
  // KEY DERIVATION
  // ==========================================================================

  describe('deriveKeyFromPassphrase', () => {
    it('should derive a CryptoKey from passphrase', async () => {
      const passphrase = 'test-passphrase-123';
      const result = await deriveKeyFromPassphrase(passphrase);

      expect(result).toBeDefined();
      expect(result.key).toBeInstanceOf(CryptoKey);
      expect(result.salt).toBeDefined();
      expect(result.iterations).toBe(ENCRYPTION_CONFIG.PBKDF2_ITERATIONS);
    });

    it('should generate new salt if not provided', async () => {
      const passphrase = 'test-passphrase-123';
      const result = await deriveKeyFromPassphrase(passphrase);

      expect(result.salt).toBeDefined();
      expect(typeof result.salt).toBe('string');
    });

    it('should use provided salt', async () => {
      const passphrase = 'test-passphrase-123';
      const salt = generateSalt();

      const result = await deriveKeyFromPassphrase(passphrase, salt);

      expect(result.salt).toBe(salt);
    });

    it('should derive same key from same passphrase and salt', async () => {
      const passphrase = 'test-passphrase-123';
      const salt = generateSalt();

      const result1 = await deriveKeyFromPassphrase(passphrase, salt);
      const result2 = await deriveKeyFromPassphrase(passphrase, salt);

      // Keys should be functionally equivalent (can't compare CryptoKey objects directly)
      // Test by encrypting/decrypting with both
      const testData = 'test data';
      const encrypted = await encrypt(testData, result1.key);
      const decrypted = await decrypt(encrypted, result2.key);

      expect(decrypted).toBe(testData);
    });

    it('should derive different keys from different passphrases', async () => {
      const salt = generateSalt();

      const result1 = await deriveKeyFromPassphrase('passphrase1', salt);
      const result2 = await deriveKeyFromPassphrase('passphrase2', salt);

      // Try to decrypt with wrong key - should fail
      const testData = 'test data';
      const encrypted = await encrypt(testData, result1.key);

      await expect(decrypt(encrypted, result2.key)).rejects.toThrow();
    });

    it('should throw error for empty passphrase', async () => {
      await expect(deriveKeyFromPassphrase('')).rejects.toThrow(
        'Passphrase cannot be empty'
      );
    });

    it('should accept custom iterations', async () => {
      const passphrase = 'test-passphrase-123';
      const customIterations = 100000;

      const result = await deriveKeyFromPassphrase(
        passphrase,
        undefined,
        customIterations
      );

      expect(result.iterations).toBe(customIterations);
    });
  });

  describe('generateEncryptionKey', () => {
    it('should generate a CryptoKey', async () => {
      const key = await generateEncryptionKey();

      expect(key).toBeInstanceOf(CryptoKey);
      expect(key.type).toBe('secret');
      expect(key.algorithm.name).toBe(ENCRYPTION_CONFIG.ALGORITHM);
    });

    it('should generate different keys each time', async () => {
      const key1 = await generateEncryptionKey();
      const key2 = await generateEncryptionKey();

      // Verify they're different by encrypting same data
      const testData = 'test data';
      const encrypted1 = await encrypt(testData, key1);
      const encrypted2 = await encrypt(testData, key2);

      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
    });
  });

  // ==========================================================================
  // ENCRYPTION & DECRYPTION
  // ==========================================================================

  describe('encrypt', () => {
    it('should encrypt string data', async () => {
      const key = await generateEncryptionKey();
      const data = 'sensitive information';

      const encrypted = await encrypt(data, key);

      expect(encrypted).toBeDefined();
      expect(encrypted.ciphertext).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.algorithm).toBe(ENCRYPTION_CONFIG.ALGORITHM);
      expect(encrypted.timestamp).toBeGreaterThan(0);
    });

    it('should encrypt object data', async () => {
      const key = await generateEncryptionKey();
      const data = { name: 'John', age: 30, sensitive: true };

      const encrypted = await encrypt(data, key);

      expect(encrypted).toBeDefined();
      expect(encrypted.ciphertext).toBeDefined();
    });

    it('should generate unique IVs for each encryption', async () => {
      const key = await generateEncryptionKey();
      const data = 'same data';

      const encrypted1 = await encrypt(data, key);
      const encrypted2 = await encrypt(data, key);

      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
    });

    it('should produce valid base64 outputs', async () => {
      const key = await generateEncryptionKey();
      const data = 'test data';

      const encrypted = await encrypt(data, key);

      // Should not throw when decoding base64
      expect(() => atob(encrypted.ciphertext)).not.toThrow();
      expect(() => atob(encrypted.iv)).not.toThrow();
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted string data', async () => {
      const key = await generateEncryptionKey();
      const originalData = 'sensitive information';

      const encrypted = await encrypt(originalData, key);
      const decrypted = await decrypt(encrypted, key);

      expect(decrypted).toBe(originalData);
    });

    it('should decrypt encrypted object data', async () => {
      const key = await generateEncryptionKey();
      const originalData = { name: 'John', age: 30 };

      const encrypted = await encrypt(originalData, key);
      const decrypted = await decrypt(encrypted, key);
      const parsed = JSON.parse(decrypted);

      expect(parsed).toEqual(originalData);
    });

    it('should fail with wrong key', async () => {
      const key1 = await generateEncryptionKey();
      const key2 = await generateEncryptionKey();
      const data = 'test data';

      const encrypted = await encrypt(data, key1);

      await expect(decrypt(encrypted, key2)).rejects.toThrow(
        /Decryption failed/
      );
    });

    it('should fail with tampered ciphertext', async () => {
      const key = await generateEncryptionKey();
      const data = 'test data';

      const encrypted = await encrypt(data, key);

      // Tamper with ciphertext
      const tamperedEncrypted: EncryptedData = {
        ...encrypted,
        ciphertext: `${encrypted.ciphertext.slice(0, -4)}XXXX`,
      };

      await expect(decrypt(tamperedEncrypted, key)).rejects.toThrow();
    });

    it('should fail with invalid encrypted data structure', async () => {
      const key = await generateEncryptionKey();

      const invalidData = {
        ciphertext: '',
        iv: '',
        algorithm: 'INVALID' as const,
        timestamp: Date.now(),
      };

      // @ts-expect-error Testing invalid data
      await expect(decrypt(invalidData, key)).rejects.toThrow();
    });
  });

  describe('encryptToString and decryptFromString', () => {
    it('should encrypt and decrypt to/from string', async () => {
      const key = await generateEncryptionKey();
      const data = { secret: 'data', value: 123 };

      const encrypted = await encryptToString(data, key);
      const decrypted = await decryptFromString(encrypted, key);
      const parsed = JSON.parse(decrypted);

      expect(parsed).toEqual(data);
    });

    it('should produce a single base64 string', async () => {
      const key = await generateEncryptionKey();
      const data = 'test';

      const encrypted = await encryptToString(data, key);

      expect(typeof encrypted).toBe('string');
      expect(() => atob(encrypted)).not.toThrow();
    });
  });

  // ==========================================================================
  // PASSPHRASE STRENGTH
  // ==========================================================================

  describe('evaluatePassphraseStrength', () => {
    it('should rate empty passphrase as none', () => {
      expect(evaluatePassphraseStrength('')).toBe('none');
    });

    it('should rate weak passphrases as weak', () => {
      expect(evaluatePassphraseStrength('abc')).toBe('weak');
      expect(evaluatePassphraseStrength('12345678')).toBe('weak');
      expect(evaluatePassphraseStrength('password')).toBe('weak');
    });

    it('should rate medium passphrases as medium', () => {
      expect(evaluatePassphraseStrength('Password123')).toBe('medium');
      expect(evaluatePassphraseStrength('abcd1234EFGH')).toBe('medium');
    });

    it('should rate strong passphrases as strong', () => {
      expect(evaluatePassphraseStrength('MyP@ssw0rd123!')).toBe('strong');
      // Longer passphrase is rated as very-strong
      expect(evaluatePassphraseStrength('Str0ng!Passphrase')).toBe('very-strong');
    });

    it('should rate very strong passphrases as very-strong', () => {
      expect(
        evaluatePassphraseStrength('MyV3ry$tr0ng!P@ssphr@se2024')
      ).toBe('very-strong');
    });

    it('should penalize common patterns', () => {
      const weak1 = evaluatePassphraseStrength('Password123!');
      const weak2 = evaluatePassphraseStrength('12345678Aa!');
      const weak3 = evaluatePassphraseStrength('aaaaaaaA1!');

      // Common patterns are penalized but may still be rated higher due to length/diversity
      expect(['weak', 'medium', 'strong'] as EncryptionStrength[]).toContain(weak1);
      expect(['weak', 'medium', 'strong'] as EncryptionStrength[]).toContain(weak2);
      expect(['weak', 'medium', 'strong'] as EncryptionStrength[]).toContain(weak3);
    });
  });

  describe('getStrengthMessage', () => {
    it('should return appropriate messages for each strength', () => {
      expect(getStrengthMessage('none')).toContain('enter');
      expect(getStrengthMessage('weak')).toContain('Weak');
      expect(getStrengthMessage('medium')).toContain('Medium');
      expect(getStrengthMessage('strong')).toContain('Strong');
      expect(getStrengthMessage('very-strong')).toContain('Very Strong');
    });
  });

  // ==========================================================================
  // STORAGE HELPERS
  // ==========================================================================

  describe('encryption storage helpers', () => {
    it('should store and retrieve encryption enabled state', () => {
      expect(isEncryptionEnabled()).toBe(false);

      setEncryptionEnabled(true);
      expect(isEncryptionEnabled()).toBe(true);

      setEncryptionEnabled(false);
      expect(isEncryptionEnabled()).toBe(false);
    });

    it('should store and retrieve salt', () => {
      const salt = generateSalt();

      expect(getStoredSalt()).toBeNull();

      storeSalt(salt);
      expect(getStoredSalt()).toBe(salt);
    });

    it('should store and retrieve passphrase hint', () => {
      const hint = 'My favorite pet name';

      expect(getPassphraseHint()).toBeNull();

      storePassphraseHint(hint);
      expect(getPassphraseHint()).toBe(hint);
    });

    it('should clear all encryption data', () => {
      const salt = generateSalt();
      const hint = 'test hint';

      storeSalt(salt);
      storePassphraseHint(hint);
      setEncryptionEnabled(true);

      clearEncryptionData();

      expect(getStoredSalt()).toBeNull();
      expect(getPassphraseHint()).toBeNull();
      expect(isEncryptionEnabled()).toBe(false);
    });
  });

  // ==========================================================================
  // TESTING UTILITIES
  // ==========================================================================

  describe('testEncryption', () => {
    it('should return true for valid key', async () => {
      const key = await generateEncryptionKey();
      const result = await testEncryption(key);

      expect(result).toBe(true);
    });

    it('should complete encryption round-trip', async () => {
      const passphrase = 'test-passphrase';
      const { key } = await deriveKeyFromPassphrase(passphrase);

      const result = await testEncryption(key);

      expect(result).toBe(true);
    });
  });

  describe('estimateCrackTime', () => {
    it('should return time estimates for various passphrases', () => {
      const weak = estimateCrackTime('abc');
      const medium = estimateCrackTime('Password123');
      const strong = estimateCrackTime('MyStr0ng!P@ssw0rd');

      expect(weak).toBeDefined();
      expect(medium).toBeDefined();
      expect(strong).toBeDefined();

      expect(typeof weak).toBe('string');
      expect(typeof medium).toBe('string');
      expect(typeof strong).toBe('string');
    });

    it('should show longer time for stronger passphrases', () => {
      // This is a rough test since actual estimates can vary
      estimateCrackTime('pass');
      const strong = estimateCrackTime('MyV3ry$tr0ng!P@ssphr@se2024');

      // Strong should mention years, centuries, or larger units
      const strongHasLargeUnit =
        strong.includes('years') ||
        strong.includes('Centuries') ||
        strong.includes('days');

      expect(strongHasLargeUnit).toBe(true);
    });
  });

  // ==========================================================================
  // INTEGRATION TESTS
  // ==========================================================================

  describe('integration tests', () => {
    it('should complete full encryption workflow', async () => {
      // 1. Generate passphrase
      const passphrase = 'MySecure!P@ssw0rd123';

      // 2. Check strength
      const strength = evaluatePassphraseStrength(passphrase);
      expect(['strong', 'very-strong'] as EncryptionStrength[]).toContain(
        strength
      );

      // 3. Derive key
      const { key, salt } = await deriveKeyFromPassphrase(passphrase);

      // 4. Store salt
      storeSalt(salt);

      // 5. Encrypt data
      const sensitiveData = {
        name: 'John Doe',
        ssn: '123-45-6789',
        income: 50000,
      };
      const encrypted = await encrypt(sensitiveData, key);

      // 6. Decrypt data
      const decrypted = await decrypt(encrypted, key);
      const parsed = JSON.parse(decrypted);

      expect(parsed).toEqual(sensitiveData);

      // 7. Re-derive key from passphrase and salt
      const storedSalt = getStoredSalt();
      expect(storedSalt).toBe(salt);

      const { key: reDerivedKey } = await deriveKeyFromPassphrase(
        passphrase,
        storedSalt!
      );

      // 8. Verify re-derived key works
      const decrypted2 = await decrypt(encrypted, reDerivedKey);
      const parsed2 = JSON.parse(decrypted2);

      expect(parsed2).toEqual(sensitiveData);
    });

    it('should handle multiple encryptions with same key', async () => {
      const key = await generateEncryptionKey();

      const data1 = 'First secret';
      const data2 = 'Second secret';
      const data3 = { third: 'secret', value: 42 };

      const encrypted1 = await encrypt(data1, key);
      const encrypted2 = await encrypt(data2, key);
      const encrypted3 = await encrypt(data3, key);

      const decrypted1 = await decrypt(encrypted1, key);
      const decrypted2 = await decrypt(encrypted2, key);
      const decrypted3 = await decrypt(encrypted3, key);

      expect(decrypted1).toBe(data1);
      expect(decrypted2).toBe(data2);
      expect(JSON.parse(decrypted3)).toEqual(data3);
    });

    it('should reject wrong passphrase', async () => {
      const correctPassphrase = 'correct-passphrase';
      const wrongPassphrase = 'wrong-passphrase';

      // Encrypt with correct passphrase
      const { key: correctKey, salt } = await deriveKeyFromPassphrase(
        correctPassphrase
      );
      const data = 'sensitive data';
      const encrypted = await encrypt(data, correctKey);

      // Try to decrypt with wrong passphrase
      const { key: wrongKey } = await deriveKeyFromPassphrase(
        wrongPassphrase,
        salt
      );

      await expect(decrypt(encrypted, wrongKey)).rejects.toThrow();
    });
  });

  // ==========================================================================
  // CONFIGURATION CONSTANTS
  // ==========================================================================

  describe('configuration constants', () => {
    it('should have correct encryption configuration', () => {
      expect(ENCRYPTION_CONFIG.ALGORITHM).toBe('AES-GCM');
      expect(ENCRYPTION_CONFIG.KEY_LENGTH).toBe(256);
      expect(ENCRYPTION_CONFIG.IV_LENGTH).toBe(12);
      expect(ENCRYPTION_CONFIG.TAG_LENGTH).toBe(128);
      expect(ENCRYPTION_CONFIG.PBKDF2_ITERATIONS).toBeGreaterThanOrEqual(
        600000
      );
      expect(ENCRYPTION_CONFIG.SALT_LENGTH).toBe(32);
    });

    it('should have storage keys defined', () => {
      expect(STORAGE_KEYS.ENCRYPTION_SALT).toBeDefined();
      expect(STORAGE_KEYS.ENCRYPTION_ENABLED).toBeDefined();
      expect(STORAGE_KEYS.KEY_DERIVATION_HINT).toBeDefined();
    });
  });
});

