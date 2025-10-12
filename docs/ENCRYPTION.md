# Encryption System Documentation

**Status:** ✅ Complete
**Last Updated:** October 12, 2025

## Overview

BenefitFinder implements a robust, privacy-first encryption system using **AES-256-GCM** encryption with **PBKDF2** key derivation. All user data is encrypted at rest with no external dependencies.

## Architecture

### Components

1. **`src/utils/encryption.ts`** - Core encryption utilities
2. **`src/stores/encryptionStore.ts`** - Zustand store for encryption state
3. **`src/components/EncryptionIndicator.tsx`** - UI components for encryption status
4. **`src/db/database.ts`** - Database integration with passphrase support

## Features

### ✅ AES-256-GCM Encryption
- **Algorithm:** AES-GCM (Authenticated Encryption with Associated Data)
- **Key Length:** 256 bits
- **IV Length:** 12 bytes (96 bits - recommended for GCM)
- **Authentication Tag:** 128 bits
- **Benefits:**
  - Provides both confidentiality and authenticity
  - Prevents tampering with encrypted data
  - Fast and secure for modern browsers

### ✅ PBKDF2 Key Derivation
- **Algorithm:** PBKDF2 with SHA-256
- **Iterations:** 600,000 (OWASP 2023 recommendation)
- **Salt Length:** 32 bytes (256 bits)
- **Benefits:**
  - Makes brute-force attacks computationally expensive
  - Each user gets unique encryption key from passphrase
  - Industry-standard key derivation

### ✅ Passphrase Strength Evaluation
- Evaluates length, character diversity, and common patterns
- Real-time feedback with 5 strength levels:
  - `none` - No passphrase entered
  - `weak` - Too short or simple
  - `medium` - Adequate but could be stronger
  - `strong` - Good protection
  - `very-strong` - Excellent protection

### ✅ Encryption Modes
1. **Passphrase Mode** - User provides passphrase for key derivation
2. **Auto Mode** - Randomly generated key (automatic)
3. **Disabled** - No encryption (not recommended)

### ✅ UI Components
- **`<EncryptionIndicator />`** - Full indicator with label and tooltip
- **`<EncryptionBadge />`** - Compact icon-only badge
- **`<EncryptionBanner />`** - Large status banner
- Color-coded by security level
- Accessible with ARIA labels and keyboard navigation

## Usage

### Basic Usage

```typescript
import {
  deriveKeyFromPassphrase,
  encrypt,
  decrypt
} from '@/utils/encryption';

// 1. Derive key from passphrase
const { key, salt } = await deriveKeyFromPassphrase('my-secure-passphrase');

// 2. Encrypt data
const sensitiveData = { ssn: '123-45-6789', income: 50000 };
const encrypted = await encrypt(sensitiveData, key);

// 3. Decrypt data
const decrypted = await decrypt(encrypted, key);
const data = JSON.parse(decrypted);
```

### Using with Zustand Store

```typescript
import { useEncryptionStore } from '@/stores';

function SetupEncryption() {
  const {
    enablePassphraseEncryption,
    unlockWithPassphrase,
    lockEncryption,
    checkPassphraseStrength,
  } = useEncryptionStore();

  // Enable encryption with passphrase
  const setup = async () => {
    const passphrase = 'MySecure!P@ssw0rd123';
    const hint = 'My favorite password pattern';

    // Check strength first
    const strength = checkPassphraseStrength(passphrase);
    if (strength === 'weak') {
      alert('Passphrase too weak!');
      return;
    }

    // Enable encryption
    const success = await enablePassphraseEncryption(passphrase, hint);
    if (success) {
      console.log('Encryption enabled!');
    }
  };

  // Lock encryption (clear key from memory)
  const lock = () => {
    lockEncryption();
  };

  // Unlock with passphrase
  const unlock = async () => {
    const passphrase = prompt('Enter your passphrase:');
    const unlocked = await unlockWithPassphrase(passphrase);

    if (unlocked) {
      console.log('Unlocked successfully!');
    } else {
      alert('Incorrect passphrase');
    }
  };
}
```

### Using UI Components

```typescript
import { EncryptionIndicator, EncryptionBadge, EncryptionBanner } from '@/components/EncryptionIndicator';

// Simple indicator (icon only)
<EncryptionBadge />

// Indicator with label
<EncryptionIndicator showLabel />

// Full banner with large size
<EncryptionBanner />

// Custom configuration
<EncryptionIndicator
  size="lg"
  showLabel
  showTooltip
  className="my-custom-class"
/>
```

### Database Integration

```typescript
import { initializeDatabase } from '@/db';

// Initialize with user passphrase
const db = await initializeDatabase('my-secure-passphrase');

// Initialize with auto-generated key
const db = await initializeDatabase();
```

## Security Considerations

### ✅ Best Practices Implemented
1. **Keys never leave the browser** - All encryption happens client-side
2. **Keys not extractable** - CryptoKey objects cannot be exported
3. **Salt stored separately** - Salt is stored in localStorage, not in database
4. **Key not persisted in Zustand** - Security-sensitive data cleared on unmount
5. **Unique IVs** - Each encryption uses a unique randomly generated IV
6. **Authenticated encryption** - GCM mode provides tamper protection
7. **Strong iteration count** - 600,000 PBKDF2 iterations (OWASP 2023)

### ⚠️ Important Security Notes

1. **Passphrase is the only way to recover encrypted data**
   - If a user forgets their passphrase, data is unrecoverable
   - Store passphrase hint securely (never the passphrase itself)

2. **Salt must be stored**
   - Without the salt, the key cannot be re-derived
   - Salt is stored in `localStorage` under `bf_encryption_salt`

3. **Lock encryption when not in use**
   - Call `lockEncryption()` to clear key from memory
   - Prevents access if device is left unattended

4. **Use strong passphrases**
   - Minimum 12 characters recommended
   - Include uppercase, lowercase, numbers, and symbols
   - Avoid common words and patterns

## Testing

### Unit Tests

Run encryption tests:

```bash
npm test -- encryption.test.ts
```

Run store tests:

```bash
npm test -- encryptionStore.test.ts
```

### Test Coverage

- ✅ Salt generation
- ✅ Key derivation with PBKDF2
- ✅ Encryption/decryption round-trips
- ✅ Passphrase strength evaluation
- ✅ Storage helpers
- ✅ Store state management
- ✅ UI component rendering
- ✅ Error handling (wrong key, tampered data)
- ✅ Integration workflows

## API Reference

### Encryption Utilities (`src/utils/encryption.ts`)

#### Key Derivation

```typescript
deriveKeyFromPassphrase(
  passphrase: string,
  salt?: string,
  iterations?: number
): Promise<DerivedKey>
```

Derives a CryptoKey from a user passphrase using PBKDF2.

#### Encryption

```typescript
encrypt(
  data: string | Record<string, unknown>,
  key: CryptoKey
): Promise<EncryptedData>
```

Encrypts data using AES-256-GCM.

#### Decryption

```typescript
decrypt(
  encryptedData: EncryptedData,
  key: CryptoKey
): Promise<string>
```

Decrypts data using AES-256-GCM.

#### Passphrase Strength

```typescript
evaluatePassphraseStrength(passphrase: string): EncryptionStrength
```

Evaluates passphrase strength (none/weak/medium/strong/very-strong).

### Store Actions (`src/stores/encryptionStore.ts`)

```typescript
// Enable encryption with passphrase
enablePassphraseEncryption(passphrase: string, hint?: string): Promise<boolean>

// Unlock with passphrase
unlockWithPassphrase(passphrase: string): Promise<boolean>

// Enable auto encryption
enableAutoEncryption(): void

// Disable encryption
disableEncryption(): void

// Lock encryption (clear key from memory)
lockEncryption(): void

// Check passphrase strength
checkPassphraseStrength(passphrase: string): EncryptionStrength

// Get stored hint
getHint(): string | null

// Get current key
getKey(): CryptoKey | null
```

## Configuration

### Constants (`ENCRYPTION_CONFIG`)

```typescript
{
  ALGORITHM: 'AES-GCM',
  KEY_LENGTH: 256,              // bits
  IV_LENGTH: 12,                // bytes
  TAG_LENGTH: 128,              // bits
  PBKDF2_ITERATIONS: 600000,    // OWASP 2023
  SALT_LENGTH: 32,              // bytes
  KDF_ALGORITHM: 'PBKDF2',
  HASH_FUNCTION: 'SHA-256',
}
```

### Storage Keys

```typescript
{
  ENCRYPTION_SALT: 'bf_encryption_salt',
  ENCRYPTION_ENABLED: 'bf_encryption_enabled',
  KEY_DERIVATION_HINT: 'bf_kdf_hint',
}
```

## Troubleshooting

### "Decryption failed" Error
- Wrong passphrase or key
- Data has been tampered with
- Salt mismatch (ensure same salt used for key derivation)

### Key Not Loading
- Check if `lockEncryption()` was called
- Verify passphrase is correct
- Ensure salt is stored in localStorage

### Weak Passphrase Rejected
- Make passphrase longer (12+ characters)
- Add variety: uppercase, lowercase, numbers, symbols
- Avoid common patterns (password, 12345, etc.)

## Future Enhancements

Potential improvements for future versions:

- [ ] Argon2 key derivation (when widely supported in browsers)
- [ ] Hardware security key support (WebAuthn)
- [ ] Encrypted backup/restore
- [ ] Multi-factor authentication
- [ ] Biometric unlock (device-specific)
- [ ] Key rotation mechanism
- [ ] Encrypted sync between devices

## References

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Web Crypto API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [AES-GCM Specification](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf)
- [PBKDF2 Specification](https://tools.ietf.org/html/rfc2898)

---

**Implementation Complete:** October 12, 2025
**Next Phase:** Rule Engine Foundation (Week 3)

