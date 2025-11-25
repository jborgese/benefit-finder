/**
 * Encryption helpers
 */

const STORAGE_KEY = 'bf_encryption_key';

export function getDefaultEncryptionPassword(): string {
  let key = localStorage.getItem(STORAGE_KEY);

  if (import.meta.env.DEV) {
    console.warn(`[DEBUG] getDefaultEncryptionPassword: Found key: ${key ? 'YES' : 'NO'}`);
    if (key) console.warn(`[DEBUG] Key length: ${key.length}, first 8: ${key.substring(0,8)}...`);
  }

  if (!key) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    key = Array.from(array, b => b.toString(16).padStart(2,'0')).join('');
    localStorage.setItem(STORAGE_KEY, key);
    if (import.meta.env.DEV) {
      console.warn(`[DEBUG] getDefaultEncryptionPassword: Generated new key length ${key.length}, first 8: ${key.substring(0,8)}...`);
    }
  }
  return key;
}

export function convertToRxDBPassword(passphrase: string): string {
  return passphrase; // RxDB performs its own derivation
}

export function clearStoredEncryptionKey(): void {
  localStorage.removeItem(STORAGE_KEY);
  if (import.meta.env.DEV) {
    console.warn('[DEBUG] Cleared stored encryption key');
  }
}
