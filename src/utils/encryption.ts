/**
 * Encryption Utilities
 *
 * Provides AES-GCM encryption/decryption and secure key derivation.
 * All operations happen in the browser with no external dependencies.
 *
 * Features:
 * - AES-256-GCM encryption for data at rest
 * - PBKDF2 key derivation from user passphrases
 * - Secure random salt generation
 * - Base64 encoding for storage
 * - Type-safe API with Zod validation
 */

import { z } from 'zod';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/**
 * Encryption algorithm parameters
 */
export const ENCRYPTION_CONFIG = {
  /** Algorithm name for AES-GCM */
  ALGORITHM: 'AES-GCM' as const,
  /** Key length in bits (AES-256) */
  KEY_LENGTH: 256,
  /** IV length in bytes (96 bits = 12 bytes recommended for GCM) */
  IV_LENGTH: 12,
  /** Authentication tag length in bits */
  TAG_LENGTH: 128,
  /** PBKDF2 iterations (OWASP recommended minimum for 2023+) */
  PBKDF2_ITERATIONS: 600000,
  /** Salt length in bytes */
  SALT_LENGTH: 32,
  /** Key derivation algorithm */
  KDF_ALGORITHM: 'PBKDF2' as const,
  /** Hash function for PBKDF2 */
  HASH_FUNCTION: 'SHA-256' as const,
} as const;

/**
 * Storage keys for encryption metadata
 */
export const STORAGE_KEYS = {
  ENCRYPTION_SALT: 'bf_encryption_salt',
  ENCRYPTION_ENABLED: 'bf_encryption_enabled',
  KEY_DERIVATION_HINT: 'bf_kdf_hint',
  VERIFICATION_VALUE: 'bf_encryption_verification',
} as const;

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  /** Base64-encoded encrypted data */
  ciphertext: string;
  /** Base64-encoded initialization vector */
  iv: string;
  /** Base64-encoded authentication tag (included in ciphertext for GCM) */
  tag?: string;
  /** Algorithm identifier */
  algorithm: typeof ENCRYPTION_CONFIG.ALGORITHM;
  /** Timestamp when encrypted */
  timestamp: number;
}

/**
 * Zod schema for encrypted data validation
 */
export const EncryptedDataSchema = z.object({
  ciphertext: z.string().min(1),
  iv: z.string().min(1),
  tag: z.string().optional(),
  algorithm: z.literal(ENCRYPTION_CONFIG.ALGORITHM),
  timestamp: z.number().positive(),
});

/**
 * Key derivation result
 */
export interface DerivedKey {
  /** CryptoKey for encryption/decryption */
  key: CryptoKey;
  /** Base64-encoded salt used for derivation */
  salt: string;
  /** Number of PBKDF2 iterations used */
  iterations: number;
}

/**
 * Encryption strength indicator
 */
export type EncryptionStrength = 'none' | 'weak' | 'medium' | 'strong' | 'very-strong';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert ArrayBuffer to Base64 string
 *
 * Works in both browser and Node.js environments.
 *
 * @param buffer ArrayBuffer or ArrayBufferLike to convert
 * @returns Base64-encoded string
 */
function arrayBufferToBase64(buffer: ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    // Safe: i is a controlled loop counter within array bounds
    binary += String.fromCharCode(bytes[i]);
  }

  // Use btoa if available (browser), otherwise use Buffer (Node.js)
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  } else if (typeof Buffer !== 'undefined') {
    return Buffer.from(binary, 'binary').toString('base64');
  } else {
    throw new Error('No base64 encoding method available');
  }
}

/**
 * Convert Base64 string to ArrayBuffer
 *
 * Works in both browser and Node.js environments.
 *
 * @param base64 Base64-encoded string
 * @returns ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const bytes = base64ToUint8Array(base64);
  // Create a new ArrayBuffer from the Uint8Array to ensure proper type
  return bytes.buffer.slice(0) as ArrayBuffer;
}

/**
 * Convert Base64 string to Uint8Array
 *
 * Works in both browser and Node.js environments.
 * Preferred for Node.js webcrypto compatibility.
 *
 * @param base64 Base64-encoded string
 * @returns Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  let binary: string;

  // Use atob if available (browser), otherwise use Buffer (Node.js)
  if (typeof atob !== 'undefined') {
    binary = atob(base64);
  } else if (typeof Buffer !== 'undefined') {
    binary = Buffer.from(base64, 'base64').toString('binary');
  } else {
    throw new Error('No base64 decoding method available');
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    // Safe: i is a controlled loop counter within array bounds
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate cryptographically secure random bytes
 *
 * @param length Number of bytes to generate
 * @returns Uint8Array with random bytes
 */
function generateRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

// ============================================================================
// KEY DERIVATION
// ============================================================================

/**
 * Generate a random salt for key derivation
 *
 * @returns Base64-encoded salt
 */
export function generateSalt(): string {
  const saltBuffer = generateRandomBytes(ENCRYPTION_CONFIG.SALT_LENGTH);
  return arrayBufferToBase64(saltBuffer.buffer);
}

/**
 * Derive encryption key from passphrase using PBKDF2
 *
 * Uses PBKDF2 with SHA-256 and 600,000 iterations (OWASP 2023 recommendation).
 * This makes brute-force attacks computationally expensive.
 *
 * @param passphrase User-provided passphrase
 * @param salt Base64-encoded salt (generates new one if not provided)
 * @param iterations Number of PBKDF2 iterations (defaults to recommended value)
 * @returns Derived key and salt
 *
 * @example
 * ```typescript
 * const { key, salt } = await deriveKeyFromPassphrase('my-secure-passphrase');
 * // Store salt for later use
 * localStorage.setItem('salt', salt);
 * ```
 */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt?: string,
  iterations: number = ENCRYPTION_CONFIG.PBKDF2_ITERATIONS
): Promise<DerivedKey> {
  if (!passphrase || passphrase.length === 0) {
    throw new Error('Passphrase cannot be empty');
  }

  // Use provided salt or generate new one
  const saltString = salt ?? generateSalt();
  const saltBuffer = base64ToArrayBuffer(saltString);

  // Convert passphrase to key material
  const encoder = new TextEncoder();
  const passphraseBuffer = encoder.encode(passphrase);

  // Import passphrase as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passphraseBuffer,
    { name: ENCRYPTION_CONFIG.KDF_ALGORITHM },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive AES-GCM key using PBKDF2
  // Ensure saltBuffer is a proper Uint8Array for Node.js compatibility
  const saltArray = new Uint8Array(saltBuffer);
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: ENCRYPTION_CONFIG.KDF_ALGORITHM,
      salt: saltArray,
      iterations,
      hash: ENCRYPTION_CONFIG.HASH_FUNCTION,
    },
    keyMaterial,
    {
      name: ENCRYPTION_CONFIG.ALGORITHM,
      length: ENCRYPTION_CONFIG.KEY_LENGTH,
    },
    false, // Not extractable for security
    ['encrypt', 'decrypt']
  );

  return {
    key: derivedKey,
    salt: saltString,
    iterations,
  };
}

/**
 * Generate a random encryption key (for non-passphrase usage)
 *
 * @returns CryptoKey for AES-GCM encryption
 */
export function generateEncryptionKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: ENCRYPTION_CONFIG.ALGORITHM,
      length: ENCRYPTION_CONFIG.KEY_LENGTH,
    },
    false, // Not extractable
    ['encrypt', 'decrypt']
  );
}

// ============================================================================
// ENCRYPTION & DECRYPTION
// ============================================================================

/**
 * Encrypt data using AES-256-GCM
 *
 * AES-GCM provides both encryption and authentication, preventing
 * tampering with encrypted data.
 *
 * @param data Data to encrypt (string or object)
 * @param key CryptoKey for encryption
 * @returns Encrypted data structure
 *
 * @example
 * ```typescript
 * const key = await generateEncryptionKey();
 * const encrypted = await encrypt({ secret: 'data' }, key);
 * ```
 */
export async function encrypt(
  data: string | Record<string, unknown>,
  key: CryptoKey
): Promise<EncryptedData> {
  // Convert data to string if it's an object
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);

  // Convert to ArrayBuffer
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(dataString);

  // Generate random IV
  const iv = generateRandomBytes(ENCRYPTION_CONFIG.IV_LENGTH);

  // Encrypt using AES-GCM
  // Cast to BufferSource to satisfy TypeScript's strict type checking
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_CONFIG.ALGORITHM,
      iv: iv as BufferSource,
      tagLength: ENCRYPTION_CONFIG.TAG_LENGTH,
    },
    key,
    dataBuffer
  );

  return {
    ciphertext: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv.buffer),
    algorithm: ENCRYPTION_CONFIG.ALGORITHM,
    timestamp: Date.now(),
  };
}

/**
 * Decrypt data using AES-256-GCM
 *
 * @param encryptedData Encrypted data structure
 * @param key CryptoKey for decryption
 * @returns Decrypted data as string
 * @throws Error if decryption fails (wrong key or tampered data)
 *
 * @example
 * ```typescript
 * const decrypted = await decrypt(encrypted, key);
 * const data = JSON.parse(decrypted);
 * ```
 */
export async function decrypt(
  encryptedData: EncryptedData,
  key: CryptoKey
): Promise<string> {
  // Validate encrypted data structure
  const validated = EncryptedDataSchema.parse(encryptedData);

  // Convert from Base64 to Uint8Array (Node.js webcrypto prefers Uint8Array)
  const ciphertext = base64ToUint8Array(validated.ciphertext);
  const iv = base64ToUint8Array(validated.iv);

  try {
    // Decrypt using AES-GCM
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_CONFIG.ALGORITHM,
        iv: iv as BufferSource,
        tagLength: ENCRYPTION_CONFIG.TAG_LENGTH,
      },
      key,
      ciphertext as BufferSource
    );

    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch {
    throw new Error(
      'Decryption failed. The data may be corrupted or the key is incorrect.'
    );
  }
}

/**
 * Encrypt and encode data as a single string for storage
 *
 * @param data Data to encrypt
 * @param key Encryption key
 * @returns Base64-encoded JSON string
 */
export async function encryptToString(
  data: string | Record<string, unknown>,
  key: CryptoKey
): Promise<string> {
  const encrypted = await encrypt(data, key);
  const encodedData = new TextEncoder().encode(JSON.stringify(encrypted));
  return arrayBufferToBase64(encodedData.buffer);
}

/**
 * Decrypt data from encoded string
 *
 * @param encryptedString Base64-encoded encrypted data
 * @param key Decryption key
 * @returns Decrypted data as string
 */
export function decryptFromString(
  encryptedString: string,
  key: CryptoKey
): Promise<string> {
  const jsonString = new TextDecoder().decode(
    base64ToArrayBuffer(encryptedString)
  );
  const encrypted = JSON.parse(jsonString) as EncryptedData;
  return decrypt(encrypted, key);
}

// ============================================================================
// PASSPHRASE STRENGTH
// ============================================================================

/**
 * Calculate length-based score
 */
function getLengthScore(length: number): number {
  let score = 0;
  if (length >= 8) {score += 2;}  // Increased from 1 to reward meeting minimum length
  if (length >= 12) {score += 1;}
  if (length >= 16) {score += 1;}
  if (length >= 20) {score += 1;}
  return score;
}

/**
 * Calculate character diversity score
 */
function getCharacterDiversityScore(passphrase: string): number {
  let score = 0;
  if (/[a-z]/.test(passphrase)) {score += 1;} // Lowercase
  if (/[A-Z]/.test(passphrase)) {score += 1;} // Uppercase
  if (/[0-9]/.test(passphrase)) {score += 1;} // Numbers
  if (/[^a-zA-Z0-9]/.test(passphrase)) {score += 2;} // Special characters (worth more)
  return score;
}

/**
 * Calculate penalty for common patterns
 */
function getCommonPatternPenalty(passphrase: string): number {
  const commonPatterns = [
    /^password/i,
    /^12345/,
    /^qwerty/i,
    /(.)\1{2,}/, // Repeated characters
  ];

  let penalty = 0;
  for (const pattern of commonPatterns) {
    if (pattern.test(passphrase)) {
      penalty += 1;  // Reduced from 2 to be less punishing
    }
  }
  return penalty;
}

/**
 * Convert score to strength rating
 */
function scoreToStrength(score: number): EncryptionStrength {
  if (score >= 9) {return 'very-strong';}  // Adjusted threshold
  if (score >= 7) {return 'strong';}       // Adjusted threshold
  if (score >= 4) {return 'medium';}
  if (score >= 2) {return 'weak';}
  return 'none';
}

/**
 * Evaluate passphrase strength
 *
 * Checks:
 * - Length (minimum 12 characters recommended)
 * - Character diversity (uppercase, lowercase, numbers, symbols)
 * - Common patterns
 *
 * @param passphrase Passphrase to evaluate
 * @returns Strength rating
 *
 * @example
 * ```typescript
 * const strength = evaluatePassphraseStrength('MyP@ssw0rd123!');
 * // Returns: 'strong'
 * ```
 */
export function evaluatePassphraseStrength(passphrase: string): EncryptionStrength {
  if (!passphrase || passphrase.length === 0) {
    return 'none';
  }

  const lengthScore = getLengthScore(passphrase.length);
  const diversityScore = getCharacterDiversityScore(passphrase);
  const penalty = getCommonPatternPenalty(passphrase);

  // Calculate total score, but ensure minimum of 2 if there's any positive scoring
  // This prevents weak passphrases with penalties from falling to 'none'
  const rawScore = lengthScore + diversityScore - penalty;
  const totalScore = (lengthScore + diversityScore > 0) ? Math.max(rawScore, 2) : rawScore;

  return scoreToStrength(totalScore);
}

/**
 * Get user-friendly message for passphrase strength
 *
 * @param strength Strength rating
 * @returns Human-readable message
 */
export function getStrengthMessage(strength: EncryptionStrength): string {
  switch (strength) {
    case 'none':
      return 'Please enter a passphrase';
    case 'weak':
      return 'Weak - Add more characters and variety';
    case 'medium':
      return 'Medium - Consider making it longer';
    case 'strong':
      return 'Strong - Good passphrase';
    case 'very-strong':
      return 'Very Strong - Excellent passphrase';
  }
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

/**
 * Check if encryption is enabled
 *
 * @returns True if encryption is enabled
 */
export function isEncryptionEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEYS.ENCRYPTION_ENABLED) === 'true';
}

/**
 * Set encryption enabled state
 *
 * @param enabled Whether encryption is enabled
 */
export function setEncryptionEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEYS.ENCRYPTION_ENABLED, String(enabled));
}

/**
 * Get stored salt for key derivation
 *
 * @returns Base64-encoded salt or null if not found
 */
export function getStoredSalt(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ENCRYPTION_SALT);
}

/**
 * Store salt for key derivation
 *
 * @param salt Base64-encoded salt
 */
export function storeSalt(salt: string): void {
  localStorage.setItem(STORAGE_KEYS.ENCRYPTION_SALT, salt);
}

/**
 * Clear all encryption-related data from storage
 *
 * WARNING: This will make encrypted data unrecoverable!
 */
export function clearEncryptionData(): void {
  localStorage.removeItem(STORAGE_KEYS.ENCRYPTION_SALT);
  localStorage.removeItem(STORAGE_KEYS.ENCRYPTION_ENABLED);
  localStorage.removeItem(STORAGE_KEYS.KEY_DERIVATION_HINT);
  localStorage.removeItem(STORAGE_KEYS.VERIFICATION_VALUE);
}

/**
 * Store a hint for the passphrase (not the passphrase itself!)
 *
 * @param hint User-provided hint
 */
export function storePassphraseHint(hint: string): void {
  localStorage.setItem(STORAGE_KEYS.KEY_DERIVATION_HINT, hint);
}

/**
 * Get stored passphrase hint
 *
 * @returns Hint or null if not found
 */
export function getPassphraseHint(): string | null {
  return localStorage.getItem(STORAGE_KEYS.KEY_DERIVATION_HINT);
}

// ============================================================================
// TESTING UTILITIES
// ============================================================================

/**
 * Store verification value for passphrase validation
 *
 * @param key CryptoKey to use for encryption
 */
export async function storeVerificationValue(key: CryptoKey): Promise<void> {
  const verificationData = { verified: true, timestamp: Date.now() };
  try {
    const encrypted = await encrypt(verificationData, key);
    const encoded = JSON.stringify(encrypted);
    localStorage.setItem(STORAGE_KEYS.VERIFICATION_VALUE, encoded);
  } catch (error) {
    console.error('Failed to store verification value:', error);
    throw error;
  }
}

/**
 * Verify passphrase by trying to decrypt stored verification value
 *
 * @param key CryptoKey to test
 * @returns True if this is the correct key (can decrypt verification value)
 */
export async function verifyPassphrase(key: CryptoKey): Promise<boolean> {
  const stored = localStorage.getItem(STORAGE_KEYS.VERIFICATION_VALUE);
  if (!stored) {
    // No verification value stored, just test encryption works
    return testEncryption(key);
  }

  try {
    const encrypted = JSON.parse(stored) as EncryptedData;
    const decrypted = await decrypt(encrypted, key);
    const parsed = JSON.parse(decrypted);
    return parsed.verified === true;
  } catch {
    // Decryption failed - wrong passphrase
    return false;
  }
}

/**
 * Test encryption/decryption round-trip
 *
 * Useful for verifying that encryption is working correctly.
 *
 * @param key CryptoKey to test
 * @returns True if encryption and decryption work correctly
 */
export async function testEncryption(key: CryptoKey): Promise<boolean> {
  const testData = { test: 'data', timestamp: Date.now() };

  try {
    const encrypted = await encrypt(testData, key);
    const decrypted = await decrypt(encrypted, key);
    const parsed = JSON.parse(decrypted);

    return (
      parsed.test === testData.test &&
      parsed.timestamp === testData.timestamp
    );
  } catch {
    return false;
  }
}

/**
 * Estimate time to crack passphrase (rough approximation)
 *
 * Based on passphrase entropy and estimated attack speed.
 * This is a simplified calculation for user education only.
 *
 * @param passphrase Passphrase to analyze
 * @returns Human-readable time estimate
 */
export function estimateCrackTime(passphrase: string): string {
  // Character set sizes
  const charSets = {
    lowercase: 26,
    uppercase: 26,
    numbers: 10,
    symbols: 32,
  };

  // Determine character set size
  let charSetSize = 0;
  if (/[a-z]/.test(passphrase)) {charSetSize += charSets.lowercase;}
  if (/[A-Z]/.test(passphrase)) {charSetSize += charSets.uppercase;}
  if (/[0-9]/.test(passphrase)) {charSetSize += charSets.numbers;}
  if (/[^a-zA-Z0-9]/.test(passphrase)) {charSetSize += charSets.symbols;}

  // Calculate entropy (bits)
  const entropy = passphrase.length * Math.log2(charSetSize);

  // Estimate with PBKDF2 iterations (makes brute force much slower)
  const iterations = ENCRYPTION_CONFIG.PBKDF2_ITERATIONS;

  // Assume attacker can do ~10^9 hashes per second (conservative)
  const hashesPerSecond = 1e9;
  const secondsPerAttempt = iterations / hashesPerSecond;

  // Total possible combinations
  const combinations = 2 ** entropy;

  // Average time to crack (half the keyspace)
  const secondsToCrack = (combinations / 2) * secondsPerAttempt;

  // Convert to human-readable format
  if (secondsToCrack < 1) {return 'Less than 1 second';}
  if (secondsToCrack < 60) {return `${Math.round(secondsToCrack)} seconds`;}
  if (secondsToCrack < 3600) {return `${Math.round(secondsToCrack / 60)} minutes`;}
  if (secondsToCrack < 86400) {return `${Math.round(secondsToCrack / 3600)} hours`;}
  if (secondsToCrack < 31536000) {return `${Math.round(secondsToCrack / 86400)} days`;}
  if (secondsToCrack < 3153600000) {return `${Math.round(secondsToCrack / 31536000)} years`;}
  return 'Centuries';
}

