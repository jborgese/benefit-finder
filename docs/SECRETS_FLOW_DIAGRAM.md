# BenefitFinder Secrets & Key Flow Diagram

This document provides comprehensive visual diagrams of all cryptographic key and secret flows in the BenefitFinder application.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    BENEFITFINDER ENCRYPTION                      │
│                                                                  │
│  ┌────────────────────────┐    ┌──────────────────────────┐   │
│  │  Application Layer      │    │   Database Layer         │   │
│  │  (Web Crypto API)       │    │   (RxDB + crypto-js)     │   │
│  │                         │    │                          │   │
│  │  • AES-256-GCM          │    │  • Field-level encryption│   │
│  │  • PBKDF2 derivation    │    │  • Transparent to app    │   │
│  │  • User-controlled      │    │  • IndexedDB storage     │   │
│  └────────────────────────┘    └──────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flow 1: User Passphrase Encryption Setup

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER PASSPHRASE SETUP                         │
└─────────────────────────────────────────────────────────────────────┘

1. USER INPUT
   ┌─────────────┐
   │   User      │
   │  enters     │
   │ passphrase  │
   └──────┬──────┘
          │
          ▼
   ┌─────────────────────────────────────────────────────┐
   │  evaluatePassphraseStrength(passphrase)             │
   │  ├─ Length check (min 8 chars)                      │
   │  ├─ Character variety (upper, lower, digits, etc.)  │
   │  ├─ Common password check                           │
   │  └─ Returns: 'none' | 'weak' | 'medium' | 'strong'  │
   └──────────────────────┬──────────────────────────────┘
                          │
                          ▼
                    [Is Strong Enough?]
                          │
          ┌───────────────┴───────────────┐
          │ No                            │ Yes
          ▼                               ▼
   [Reject/Warn User]          2. SALT GENERATION
                                   ┌──────────────────────┐
                                   │ crypto.getRandomValues│
                                   │ 32 bytes (256 bits)   │
                                   │ ✅ CSPRNG             │
                                   └──────┬────────────────┘
                                          │
                                          ▼
                               3. KEY DERIVATION
                                   ┌─────────────────────────────────┐
                                   │ crypto.subtle.deriveKey()       │
                                   │                                 │
                                   │ Inputs:                         │
                                   │  • Passphrase (user input)      │
                                   │  • Salt (32 bytes random)       │
                                   │  • Iterations: 600,000          │
                                   │  • Hash: SHA-256                │
                                   │                                 │
                                   │ Output:                         │
                                   │  • CryptoKey (AES-256)          │
                                   │  • ✅ Non-extractable           │
                                   │  • ✅ Only decrypt/encrypt      │
                                   └──────┬──────────────────────────┘
                                          │
                                          ▼
                               4. TEST ENCRYPTION
                                   ┌─────────────────────────────────┐
                                   │ encrypt("test", derivedKey)     │
                                   │ ├─ Generate random IV           │
                                   │ ├─ AES-256-GCM encryption       │
                                   │ └─ Verify round-trip            │
                                   └──────┬──────────────────────────┘
                                          │
                                          ▼
                                    [Test Pass?]
                                          │
                              ┌───────────┴───────────┐
                              │ No                    │ Yes
                              ▼                       ▼
                       [Reject Setup]       5. STORE VERIFICATION VALUE
                                                ┌──────────────────────────┐
                                                │ storeVerificationValue() │
                                                │                          │
                                                │ Encrypt "VERIFIED"       │
                                                │ with derived key         │
                                                │                          │
                                                │ Store encrypted value in │
                                                │ localStorage             │
                                                └──────┬───────────────────┘
                                                       │
                                                       ▼
                                            6. STORE METADATA
                                                ┌──────────────────────────┐
                                                │ localStorage.setItem()   │
                                                │                          │
                                                │ 'bf_encryption_salt'     │
                                                │  └─→ Salt (32 bytes hex) │
                                                │                          │
                                                │ 'bf_encryption_enabled'  │
                                                │  └─→ 'true'              │
                                                │                          │
                                                │ 'bf_kdf_hint' (optional) │
                                                │  └─→ User hint           │
                                                └──────┬───────────────────┘
                                                       │
                                                       ▼
                                            7. STORE IN MEMORY
                                                ┌──────────────────────────┐
                                                │ Zustand Store            │
                                                │                          │
                                                │ _encryptionKey ← CryptoKey│
                                                │ isKeyLoaded ← true        │
                                                │ isEnabled ← true          │
                                                │ mode ← 'passphrase'       │
                                                │ _salt ← salt              │
                                                │                          │
                                                │ ✅ CryptoKey NOT persisted│
                                                └──────┬───────────────────┘
                                                       │
                                                       ▼
                                               ┌───────────────┐
                                               │ SETUP COMPLETE│
                                               └───────────────┘

STORAGE SUMMARY:
┌────────────────────────────────────────────────────────────────┐
│ localStorage:                                                   │
│  ✅ Salt (public)                                              │
│  ✅ Verification value (encrypted)                             │
│  ✅ Hint (user-provided, NOT passphrase)                       │
│  ✅ Flags (enabled, mode)                                      │
│                                                                 │
│ Memory (Zustand):                                               │
│  ✅ CryptoKey (non-extractable)                                │
│  ✅ Salt reference                                             │
│                                                                 │
│ NEVER STORED:                                                   │
│  ❌ User passphrase                                            │
│  ❌ Extractable key                                            │
└────────────────────────────────────────────────────────────────┘
```

---

## Flow 2: Unlock with Passphrase

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     UNLOCK WITH PASSPHRASE                           │
└─────────────────────────────────────────────────────────────────────┘

1. USER INPUT
   ┌─────────────┐
   │   User      │
   │  enters     │
   │ passphrase  │
   └──────┬──────┘
          │
          ▼
2. RETRIEVE STORED SALT
   ┌──────────────────────────────────────────┐
   │ localStorage.getItem('bf_encryption_salt')│
   │ └─→ Salt (32 bytes hex)                  │
   └──────┬───────────────────────────────────┘
          │
          ▼
    [Salt Found?]
          │
     ┌────┴────┐
     │ No      │ Yes
     ▼         ▼
  [Error]   3. RE-DERIVE KEY
            ┌─────────────────────────────────────┐
            │ crypto.subtle.deriveKey()           │
            │                                     │
            │ Inputs:                             │
            │  • User passphrase                  │
            │  • Stored salt (same as setup)      │
            │  • Iterations: 600,000 (same)       │
            │  • Hash: SHA-256 (same)             │
            │                                     │
            │ Output:                             │
            │  • CryptoKey (should match original)│
            └──────┬──────────────────────────────┘
                   │
                   ▼
         4. VERIFY PASSPHRASE
            ┌─────────────────────────────────────────┐
            │ verifyPassphrase(derivedKey)            │
            │                                         │
            │ 1. Get verification value from storage  │
            │ 2. Try to decrypt with derived key      │
            │ 3. Check if result === "VERIFIED"       │
            └──────┬──────────────────────────────────┘
                   │
                   ▼
            [Correct Passphrase?]
                   │
         ┌─────────┴─────────┐
         │ No                │ Yes
         ▼                   ▼
   [Unlock Failed]    5. LOAD INTO MEMORY
   ┌────────────┐       ┌──────────────────────────┐
   │ Error      │       │ Zustand Store            │
   │ message    │       │                          │
   │ to user    │       │ _encryptionKey ← CryptoKey│
   └────────────┘       │ isKeyLoaded ← true        │
                        │                          │
                        │ ✅ Key now usable        │
                        └──────┬───────────────────┘
                               │
                               ▼
                      ┌────────────────┐
                      │ UNLOCKED       │
                      │ ✅ Can encrypt  │
                      │ ✅ Can decrypt  │
                      └────────────────┘

SECURITY NOTES:
┌────────────────────────────────────────────────────────────────┐
│ • Same PBKDF2 parameters = Same derived key                    │
│ • If passphrase wrong → Different key → Decryption fails       │
│ • No password validation beyond decryption test                │
│ • Passphrase never stored, re-derived every unlock             │
│ • CryptoKey remains non-extractable                            │
└────────────────────────────────────────────────────────────────┘
```

---

## Flow 3: Auto-Generated Encryption Key

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                  AUTO-GENERATED ENCRYPTION MODE                      │
└─────────────────────────────────────────────────────────────────────┘

1. APPLICATION START
   ┌─────────────────┐
   │ App initializes │
   │ Database needed │
   └────────┬────────┘
            │
            ▼
2. CHECK FOR EXISTING KEY
   ┌──────────────────────────────────────────┐
   │ getDefaultEncryptionPassword()           │
   │                                          │
   │ localStorage.getItem('bf_encryption_key')│
   └────────┬─────────────────────────────────┘
            │
            ▼
      [Key Exists?]
            │
     ┌──────┴──────┐
     │ Yes         │ No
     ▼             ▼
3a. USE EXISTING  3b. GENERATE NEW KEY
┌──────────────┐  ┌─────────────────────────────────────┐
│ Return       │  │ crypto.getRandomValues(32)          │
│ existing key │  │ ├─ 32 bytes = 256 bits              │
│              │  │ ├─ ✅ CSPRNG                         │
│              │  │ └─ Convert to hex string             │
└──────┬───────┘  └────────┬────────────────────────────┘
       │                   │
       │                   ▼
       │          4. STORE FOR FUTURE USE
       │             ┌───────────────────────────────────┐
       │             │ localStorage.setItem()            │
       │             │ 'bf_encryption_key' → hex key     │
       │             │                                   │
       │             │ ⚠️ Stored in plaintext           │
       │             │ ✅ But completely random          │
       │             └────────┬──────────────────────────┘
       │                      │
       └──────────────────────┘
                              │
                              ▼
                   5. USE FOR DATABASE
                      ┌──────────────────────────────────┐
                      │ createRxDatabase({               │
                      │   password: key,                 │
                      │   storage: wrapped...Storage()   │
                      │ })                               │
                      │                                  │
                      │ RxDB handles:                    │
                      │  • Key derivation                │
                      │  • Field encryption              │
                      │  • Transparent to app            │
                      └────────┬─────────────────────────┘
                               │
                               ▼
                      ┌────────────────┐
                      │ DATABASE READY │
                      │ ✅ Encrypted    │
                      └────────────────┘

SECURITY ANALYSIS:
┌────────────────────────────────────────────────────────────────┐
│ Auto-Generated Key Storage:                                     │
│                                                                 │
│ Risk: ⚠️ Stored in localStorage (plaintext)                    │
│                                                                 │
│ Mitigations:                                                    │
│  ✅ Key is completely random (256 bits entropy)                │
│  ✅ Generated with CSPRNG                                      │
│  ✅ Unique per browser/device                                  │
│  ✅ No user knowledge required                                 │
│                                                                 │
│ Tradeoff:                                                       │
│  • Automatic encryption (no user burden)                        │
│  • vs. Protection against device compromise                     │
│                                                                 │
│ Acceptable: ✅ YES (for auto-mode)                             │
│  • User opted for convenience                                   │
│  • Better than no encryption                                    │
│  • Same-origin policy protects localStorage                     │
└────────────────────────────────────────────────────────────────┘

CODE REFERENCE:
┌────────────────────────────────────────────────────────────────┐
│ File: src/db/database-engine/encryption.ts                     │
│                                                                 │
│ export function getDefaultEncryptionPassword(): string {       │
│   let key = localStorage.getItem(STORAGE_KEY);                 │
│   if (!key) {                                                  │
│     const array = new Uint8Array(32);                          │
│     crypto.getRandomValues(array);  // CSPRNG                  │
│     key = Array.from(array,                                    │
│       b => b.toString(16).padStart(2,'0')).join('');           │
│     localStorage.setItem(STORAGE_KEY, key);                    │
│   }                                                            │
│   return key;                                                  │
│ }                                                              │
└────────────────────────────────────────────────────────────────┘
```

---

## Flow 4: Data Encryption/Decryption

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA ENCRYPTION WORKFLOW                          │
└─────────────────────────────────────────────────────────────────────┘

ENCRYPTION PATH:
═══════════════

1. APPLICATION NEEDS TO ENCRYPT DATA
   ┌────────────────────┐
   │ User data          │
   │ (string/JSON)      │
   └─────────┬──────────┘
             │
             ▼
2. GET ENCRYPTION KEY
   ┌────────────────────────────────────┐
   │ Zustand Store                      │
   │ encryptionStore.getState()         │
   │  └─→ _encryptionKey (CryptoKey)    │
   └─────────┬──────────────────────────┘
             │
             ▼
      [Key Loaded?]
             │
       ┌─────┴─────┐
       │ No        │ Yes
       ▼           ▼
   [Error]   3. GENERATE RANDOM IV
             ┌──────────────────────────────┐
             │ generateRandomBytes(12)      │
             │ └─→ 12 bytes (96 bits)       │
             │ ✅ Unique per encryption     │
             └─────────┬────────────────────┘
                       │
                       ▼
             4. ENCRYPT WITH AES-GCM
                ┌─────────────────────────────────────┐
                │ crypto.subtle.encrypt({             │
                │   name: 'AES-GCM',                  │
                │   iv: randomIV,                     │
                │   tagLength: 128                    │
                │ }, key, dataBuffer)                 │
                │                                     │
                │ Returns:                            │
                │  • Ciphertext                       │
                │  • Authentication tag (included)    │
                └─────────┬───────────────────────────┘
                          │
                          ▼
             5. ENCODE RESULT
                ┌─────────────────────────────────────┐
                │ Base64 encode:                      │
                │  • IV (12 bytes)                    │
                │  • Encrypted data                   │
                │  • Auth tag (16 bytes)              │
                │                                     │
                │ Return JSON:                        │
                │ {                                   │
                │   data: base64String,               │
                │   iv: base64IV,                     │
                │   algorithm: 'AES-GCM',             │
                │   keyLength: 256,                   │
                │   tagLength: 128                    │
                │ }                                   │
                └─────────┬───────────────────────────┘
                          │
                          ▼
                ┌───────────────────┐
                │ ENCRYPTED DATA    │
                │ ✅ Authenticated   │
                │ ✅ Unique IV       │
                └───────────────────┘

DECRYPTION PATH:
════════════════

1. APPLICATION NEEDS TO DECRYPT DATA
   ┌────────────────────┐
   │ Encrypted data     │
   │ (JSON with IV)     │
   └─────────┬──────────┘
             │
             ▼
2. VALIDATE INPUT
   ┌────────────────────────────────────┐
   │ EncryptedDataSchema.parse()        │
   │ ├─ Check structure                 │
   │ ├─ Verify algorithm match          │
   │ └─ Validate IV exists              │
   └─────────┬──────────────────────────┘
             │
             ▼
      [Valid Format?]
             │
       ┌─────┴─────┐
       │ No        │ Yes
       ▼           ▼
   [Error]   3. GET DECRYPTION KEY
             ┌──────────────────────────────┐
             │ Zustand Store                │
             │  └─→ _encryptionKey          │
             └─────────┬────────────────────┘
                       │
                       ▼
             4. DECODE DATA
                ┌─────────────────────────────┐
                │ Base64 decode:              │
                │  • IV                       │
                │  • Ciphertext + tag         │
                └─────────┬───────────────────┘
                          │
                          ▼
             5. DECRYPT WITH AES-GCM
                ┌──────────────────────────────────┐
                │ crypto.subtle.decrypt({          │
                │   name: 'AES-GCM',               │
                │   iv: decodedIV,                 │
                │   tagLength: 128                 │
                │ }, key, encryptedBuffer)         │
                │                                  │
                │ GCM mode:                        │
                │  ✅ Verifies authentication tag  │
                │  ✅ Detects tampering            │
                │  ✅ Fails if wrong key           │
                └─────────┬────────────────────────┘
                          │
                          ▼
                  [Decryption Success?]
                          │
                ┌─────────┴─────────┐
                │ No                │ Yes
                ▼                   ▼
        [Error: Wrong Key     6. DECODE PLAINTEXT
         or Corrupted Data]      ┌──────────────────┐
                                 │ UTF-8 decode     │
                                 │ Return string    │
                                 └────────┬─────────┘
                                          │
                                          ▼
                                  ┌───────────────┐
                                  │ DECRYPTED DATA│
                                  │ ✅ Verified    │
                                  └───────────────┘

SECURITY PROPERTIES:
┌────────────────────────────────────────────────────────────────┐
│ Encryption:                                                     │
│  ✅ Unique IV per operation (prevents pattern analysis)        │
│  ✅ AES-256 (strong algorithm)                                 │
│  ✅ GCM mode (authenticated encryption)                        │
│  ✅ Full authentication tag (128 bits)                         │
│                                                                 │
│ Decryption:                                                     │
│  ✅ Authentication verified before decryption                  │
│  ✅ Tampering detected automatically                           │
│  ✅ Wrong key = Guaranteed failure                             │
│  ✅ Input validation with Zod schemas                          │
│                                                                 │
│ Key Management:                                                 │
│  ✅ CryptoKey never exposed                                    │
│  ✅ Non-extractable                                            │
│  ✅ Only used through Web Crypto API                           │
└────────────────────────────────────────────────────────────────┘
```

---

## Flow 5: Export Encryption

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      EXPORT ENCRYPTION FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

1. USER INITIATES EXPORT
   ┌─────────────────┐
   │ User clicks     │
   │ "Export Data"   │
   └────────┬────────┘
            │
            ▼
2. USER PROVIDES EXPORT PASSWORD
   ┌─────────────────────────────────────┐
   │ Modal prompts for password          │
   │ (separate from database passphrase) │
   └────────┬────────────────────────────┘
            │
            ▼
3. EVALUATE PASSWORD STRENGTH
   ┌─────────────────────────────────────┐
   │ evaluatePassphraseStrength()        │
   │ └─→ Require 'medium' or 'strong'    │
   └────────┬────────────────────────────┘
            │
            ▼
      [Strong Enough?]
            │
      ┌─────┴─────┐
      │ No        │ Yes
      ▼           ▼
  [Reject]   4. GENERATE EXPORT SALT
             ┌──────────────────────────┐
             │ crypto.getRandomValues(32)│
             │ └─→ Unique salt for export│
             └────────┬─────────────────┘
                      │
                      ▼
             5. DERIVE EXPORT KEY
                ┌─────────────────────────────────┐
                │ deriveKeyFromPassphrase()       │
                │  • Export password              │
                │  • New salt (not database salt) │
                │  • 600,000 iterations           │
                │  • SHA-256                      │
                └────────┬────────────────────────┘
                         │
                         ▼
             6. COLLECT DATA TO EXPORT
                ┌─────────────────────────────────┐
                │ Gather:                         │
                │  • Questionnaire answers        │
                │  • Results data                 │
                │  • User preferences             │
                │  • Timestamps                   │
                │                                 │
                │ Serialize to JSON               │
                └────────┬────────────────────────┘
                         │
                         ▼
             7. ENCRYPT DATA
                ┌─────────────────────────────────┐
                │ encrypt(data, exportKey)        │
                │  • Generate random IV           │
                │  • AES-256-GCM encryption       │
                │  • Include auth tag             │
                └────────┬────────────────────────┘
                         │
                         ▼
             8. CREATE EXPORT PACKAGE
                ┌─────────────────────────────────────┐
                │ {                                   │
                │   version: '1.0',                   │
                │   timestamp: Date.now(),            │
                │   salt: base64(exportSalt),         │
                │   encryptedData: {                  │
                │     data: base64(ciphertext),       │
                │     iv: base64(iv),                 │
                │     algorithm: 'AES-GCM',           │
                │     keyLength: 256                  │
                │   },                                │
                │   metadata: {                       │
                │     appVersion,                     │
                │     dataTypes: [...]                │
                │   }                                 │
                │ }                                   │
                └────────┬────────────────────────────┘
                         │
                         ▼
             9. DOWNLOAD FILE
                ┌──────────────────────────────┐
                │ Create Blob                  │
                │ Trigger download             │
                │ Filename: data_YYYY-MM-DD.bfx│
                └────────┬─────────────────────┘
                         │
                         ▼
                ┌────────────────┐
                │ EXPORT COMPLETE│
                └────────────────┘

IMPORT FLOW:
════════════

1. USER SELECTS .bfx FILE
   ┌─────────────────┐
   │ File selected   │
   └────────┬────────┘
            │
            ▼
2. READ AND PARSE FILE
   ┌──────────────────────────────┐
   │ Read JSON from .bfx file     │
   │ Validate structure           │
   └────────┬─────────────────────┘
            │
            ▼
3. USER PROVIDES IMPORT PASSWORD
   ┌─────────────────────────────┐
   │ Modal prompts for password  │
   │ (same as used for export)   │
   └────────┬────────────────────┘
            │
            ▼
4. EXTRACT SALT FROM FILE
   ┌──────────────────────────────┐
   │ salt = file.salt (base64)    │
   │ Decode to Uint8Array         │
   └────────┬─────────────────────┘
            │
            ▼
5. RE-DERIVE KEY
   ┌─────────────────────────────────┐
   │ deriveKeyFromPassphrase()       │
   │  • User's password              │
   │  • Salt from file               │
   │  • 600,000 iterations (same)    │
   │  • SHA-256 (same)               │
   │                                 │
   │ If password correct:            │
   │  → Same key as export           │
   └────────┬────────────────────────┘
            │
            ▼
6. DECRYPT DATA
   ┌─────────────────────────────────┐
   │ decrypt(encryptedData, key)     │
   │  • Extract IV from file         │
   │  • AES-256-GCM decryption       │
   │  • Verify auth tag              │
   └────────┬────────────────────────┘
            │
            ▼
      [Decryption Success?]
            │
      ┌─────┴─────┐
      │ No        │ Yes
      ▼           ▼
  [Wrong      7. VALIDATE DATA
   Password]     ┌──────────────────────┐
                 │ Parse JSON           │
                 │ Validate structure   │
                 │ Check version        │
                 └────────┬─────────────┘
                          │
                          ▼
                 8. IMPORT TO DATABASE
                    ┌──────────────────────┐
                    │ Write to database    │
                    │ Update UI            │
                    │ Show success message │
                    └────────┬─────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ IMPORT COMPLETE│
                    └────────────────┘

SECURITY FEATURES:
┌────────────────────────────────────────────────────────────────┐
│ Export Security:                                                │
│  ✅ Independent password (not database password)               │
│  ✅ User controls export encryption                            │
│  ✅ Unique salt per export                                     │
│  ✅ Same strong PBKDF2 (600k iterations)                       │
│  ✅ File includes all data for re-import                       │
│                                                                 │
│ Import Security:                                                │
│  ✅ No password = No data access                               │
│  ✅ Wrong password = Decryption fails                          │
│  ✅ Tampered file = Auth tag verification fails                │
│  ✅ Data validation before import                              │
│                                                                 │
│ Use Cases:                                                      │
│  • Backup before clearing browser data                         │
│  • Transfer between devices                                    │
│  • Share with trusted party (password separately)              │
│  • Long-term archival                                          │
└────────────────────────────────────────────────────────────────┘
```

---

## Flow 6: Database Encryption (RxDB Layer)

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                   DATABASE ENCRYPTION (RxDB)                         │
└─────────────────────────────────────────────────────────────────────┘

1. DATABASE INITIALIZATION
   ┌─────────────────┐
   │ App starts      │
   │ Need database   │
   └────────┬────────┘
            │
            ▼
2. GET ENCRYPTION PASSWORD
   ┌────────────────────────────────────────────┐
   │ Check encryption mode:                     │
   │                                            │
   │ If passphrase mode:                        │
   │  └─→ Use derived key from passphrase      │
   │                                            │
   │ If auto mode:                              │
   │  └─→ getDefaultEncryptionPassword()       │
   │      (auto-generated or existing)          │
   └────────┬───────────────────────────────────┘
            │
            ▼
3. CONVERT TO RXDB FORMAT
   ┌─────────────────────────────────────────────┐
   │ convertToRxDBPassword(password)             │
   │ └─→ Ensure compatible format                │
   └────────┬────────────────────────────────────┘
            │
            ▼
4. CREATE DATABASE WITH ENCRYPTION
   ┌──────────────────────────────────────────────────────┐
   │ createRxDatabase({                                   │
   │   name: 'benefitfinder_db',                          │
   │   storage: wrappedKeyEncryptionCryptoJsStorage({     │
   │     storage: getRxStorageDexie()  // IndexedDB      │
   │   }),                                                │
   │   password: rxdbPassword,  // ← Encryption password │
   │   ...                                                │
   │ })                                                   │
   │                                                      │
   │ RxDB Plugin Internals:                               │
   │  ┌────────────────────────────────────────┐         │
   │  │ 1. Receives password                   │         │
   │  │ 2. Derives encryption key (crypto-js)  │         │
   │  │ 3. Wraps Dexie storage                 │         │
   │  │ 4. Intercepts read/write operations    │         │
   │  └────────────────────────────────────────┘         │
   └────────┬─────────────────────────────────────────────┘
            │
            ▼
5. DEFINE COLLECTIONS WITH ENCRYPTED FIELDS
   ┌──────────────────────────────────────────────────────┐
   │ db.addCollections({                                  │
   │   questionnaire_data: {                              │
   │     schema: {                                        │
   │       version: 0,                                    │
   │       type: 'object',                                │
   │       properties: {                                  │
   │         id: { type: 'string' },                      │
   │         answers: {                                   │
   │           type: 'string',                            │
   │           encrypted: true  // ← Field-level encrypt  │
   │         },                                           │
   │         timestamp: { type: 'number' }                │
   │       }                                              │
   │     }                                                │
   │   }                                                  │
   │ })                                                   │
   └────────┬─────────────────────────────────────────────┘
            │
            ▼
   ┌────────────────┐
   │ DATABASE READY │
   └────────────────┘

WRITE OPERATION:
════════════════

   Application writes data
   ┌─────────────────┐
   │ db.collection   │
   │   .insert({     │
   │     answers: {} │
   │   })            │
   └────────┬────────┘
            │
            ▼
   RxDB Encryption Plugin
   ┌──────────────────────────────────────────┐
   │ 1. Intercepts write                      │
   │ 2. Identifies encrypted fields           │
   │ 3. Serializes field data to JSON         │
   │ 4. Encrypts with crypto-js               │
   │    (using derived key from password)     │
   │ 5. Stores encrypted value                │
   └────────┬─────────────────────────────────┘
            │
            ▼
   Dexie (IndexedDB)
   ┌──────────────────────────────────────────┐
   │ {                                        │
   │   id: "123",                             │
   │   answers: "U2FsdGVkX1/..." (encrypted), │
   │   timestamp: 1234567890                  │
   │ }                                        │
   └────────┬─────────────────────────────────┘
            │
            ▼
   Browser IndexedDB
   [Encrypted data at rest]

READ OPERATION:
═══════════════

   Application reads data
   ┌─────────────────┐
   │ db.collection   │
   │   .findOne()    │
   └────────┬────────┘
            │
            ▼
   Dexie retrieves from IndexedDB
   ┌──────────────────────────────────────────┐
   │ {                                        │
   │   id: "123",                             │
   │   answers: "U2FsdGVkX1/..." (encrypted), │
   │   timestamp: 1234567890                  │
   │ }                                        │
   └────────┬─────────────────────────────────┘
            │
            ▼
   RxDB Encryption Plugin
   ┌──────────────────────────────────────────┐
   │ 1. Intercepts read                       │
   │ 2. Identifies encrypted fields           │
   │ 3. Decrypts with crypto-js               │
   │    (using same derived key)              │
   │ 4. Parses JSON                           │
   │ 5. Returns plaintext to app              │
   └────────┬─────────────────────────────────┘
            │
            ▼
   Application receives plaintext
   ┌──────────────────┐
   │ {                │
   │   id: "123",     │
   │   answers: {...},│ ← Decrypted
   │   timestamp: ... │
   │ }                │
   └──────────────────┘

CRYPTO-JS USAGE:
════════════════

┌────────────────────────────────────────────────────────────────┐
│ crypto-js is used ONLY via RxDB plugin:                        │
│                                                                 │
│ import {                                                        │
│   wrappedKeyEncryptionCryptoJsStorage                          │
│ } from 'rxdb/plugins/encryption-crypto-js';                    │
│                                                                 │
│ ✅ No direct CryptoJS API calls                                │
│ ✅ RxDB handles key derivation                                 │
│ ✅ Transparent to application code                             │
│ ✅ Maintained by RxDB team                                     │
│                                                                 │
│ RxDB Internal (abstracted from us):                            │
│  • Password → Key derivation (PBKDF2?)                         │
│  • Field-level AES encryption                                  │
│  • Automatic encrypt/decrypt on read/write                     │
│  • Storage adapter wrapping                                    │
└────────────────────────────────────────────────────────────────┘

ENCRYPTED FIELDS INVENTORY:
═══════════════════════════

┌────────────────────────────────────────────────────────────────┐
│ Collection: questionnaire_data                                  │
│  • answers (JSON blob of user responses)                       │
│                                                                 │
│ Collection: results                                             │
│  • benefitsData (matching programs)                            │
│  • questionnaireData (linked to questionnaire)                 │
│                                                                 │
│ Collection: preferences                                         │
│  • settings (user preferences)                                 │
└────────────────────────────────────────────────────────────────┘

SECURITY PROPERTIES:
┌────────────────────────────────────────────────────────────────┐
│ ✅ Field-level encryption (only sensitive fields encrypted)    │
│ ✅ Transparent to application (no manual encrypt/decrypt)      │
│ ✅ Encryption at rest (IndexedDB contains ciphertext)          │
│ ✅ Key derived from user passphrase or auto-generated          │
│ ⚠️ Crypto-js algorithm (not Web Crypto API at this layer)     │
│ ℹ️ RxDB handles all crypto operations                         │
└────────────────────────────────────────────────────────────────┘
```

---

## Flow 7: Lock/Unlock Lifecycle

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                       LOCK/UNLOCK LIFECYCLE                          │
└─────────────────────────────────────────────────────────────────────┘

STATE: UNLOCKED
═══════════════

┌────────────────────────────────────────┐
│ Application State:                     │
│  • _encryptionKey: CryptoKey ✅        │
│  • isKeyLoaded: true                   │
│  • Can encrypt data                    │
│  • Can decrypt data                    │
│  • Database accessible                 │
└────────┬───────────────────────────────┘
         │
         │ User clicks "Lock"
         │ OR
         │ Auto-lock timer expires
         │ OR
         │ Tab closed/refreshed
         │
         ▼
┌─────────────────────────────────────────┐
│ lockEncryption()                        │
│                                         │
│ 1. Clear encryption key from state     │
│    _encryptionKey = null                │
│                                         │
│ 2. Set flag                             │
│    isKeyLoaded = false                  │
│                                         │
│ 3. Keep metadata                        │
│    mode, isEnabled, salt, hint (kept)   │
│                                         │
│ 4. Close database connections           │
│    (if configured)                      │
└────────┬────────────────────────────────┘
         │
         ▼

STATE: LOCKED
═════════════

┌────────────────────────────────────────┐
│ Application State:                     │
│  • _encryptionKey: null ❌             │
│  • isKeyLoaded: false                  │
│  • Cannot encrypt data                 │
│  • Cannot decrypt data                 │
│  • Database may be closed              │
│  • Salt still in localStorage          │
│  • Verification value still stored     │
└────────┬───────────────────────────────┘
         │
         │ User clicks "Unlock"
         │
         ▼
┌─────────────────────────────────────────┐
│ User provides passphrase                │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ unlockWithPassphrase(passphrase)        │
│                                         │
│ 1. Get salt from localStorage           │
│    salt = localStorage.getItem('...')   │
│                                         │
│ 2. Re-derive key                        │
│    key = deriveKeyFromPassphrase(...)   │
│                                         │
│ 3. Verify passphrase                    │
│    verified = verifyPassphrase(key)     │
│                                         │
│ 4. If verified:                         │
│    _encryptionKey = key                 │
│    isKeyLoaded = true                   │
│                                         │
│ 5. Re-initialize database               │
│    (with correct password)              │
└────────┬────────────────────────────────┘
         │
         ▼
   [Verification Success?]
         │
    ┌────┴────┐
    │ No      │ Yes
    ▼         ▼
[Error]   Back to UNLOCKED state
[Retry]

MEMORY STATE DIAGRAM:
═════════════════════

SETUP (Passphrase Enabled)
    │
    ├─→ localStorage:
    │    • bf_encryption_salt: "abc123..."
    │    • bf_encryption_verification: {encrypted}
    │    • bf_encryption_enabled: "true"
    │    • bf_kdf_hint: "My cat's name"
    │
    └─→ Memory (Zustand):
         • _encryptionKey: CryptoKey ✅
         • isKeyLoaded: true
         • _salt: Uint8Array
         • mode: 'passphrase'

         ┌────────────┐
         │ UNLOCKED   │ ← Active encryption/decryption
         └──────┬─────┘
                │
                │ Lock
                ▼
         ┌────────────┐
         │ LOCKED     │
         └──────┬─────┘
         
LOCKED STATE
    │
    ├─→ localStorage:
    │    • bf_encryption_salt: "abc123..." (kept)
    │    • bf_encryption_verification: {encrypted} (kept)
    │    • bf_encryption_enabled: "true" (kept)
    │    • bf_kdf_hint: "My cat's name" (kept)
    │
    └─→ Memory (Zustand):
         • _encryptionKey: null ❌
         • isKeyLoaded: false
         • _salt: Uint8Array (kept for re-derivation)
         • mode: 'passphrase' (kept)

                │
                │ Unlock (with correct passphrase)
                ▼
         ┌────────────┐
         │ UNLOCKED   │ ← Key re-derived and loaded
         └────────────┘

BROWSER REFRESH:
════════════════

Before Refresh (Unlocked):
    Memory: _encryptionKey = CryptoKey ✅

    ↓ [Page Refresh / Tab Close]

After Refresh:
    Memory: _encryptionKey = null ❌
    
    Zustand Persistence:
     ├─ partialize excludes _encryptionKey
     └─ Only metadata rehydrated

    Result: LOCKED state
    User must unlock again

AUTO-LOCK:
══════════

UNLOCKED
    │
    │ (configurable timeout)
    │ (user inactivity)
    │ (tab hidden)
    │
    ▼
setTimeout(() => {
  encryptionStore.lockEncryption();
}, AUTO_LOCK_TIMEOUT);
    │
    ▼
LOCKED

SECURITY BENEFITS:
┌────────────────────────────────────────────────────────────────┐
│ Lock Mechanism:                                                 │
│  ✅ Clears key from memory                                     │
│  ✅ No key persistence across sessions                         │
│  ✅ Prevents unauthorized access if device left unattended     │
│  ✅ Salt/verification kept for re-unlock                       │
│                                                                 │
│ Unlock Mechanism:                                               │
│  ✅ Requires correct passphrase                                │
│  ✅ Re-derives key (same PBKDF2)                               │
│  ✅ Verifies via encrypted test value                          │
│  ✅ No password stored anywhere                                │
│                                                                 │
│ Browser Refresh:                                                │
│  ✅ Key lost on refresh (by design)                            │
│  ✅ Forces re-authentication                                   │
│  ✅ Metadata persists for re-setup                             │
└────────────────────────────────────────────────────────────────┘
```

---

## Summary: Complete Secrets Inventory

### Keys and Secrets

| Secret Type | Location | Encrypted | Extractable | Persisted | Notes |
|-------------|----------|-----------|-------------|-----------|-------|
| **User Passphrase** | ❌ Never stored | N/A | N/A | ❌ No | Only exists during input |
| **Derived CryptoKey** | Memory (Zustand) | N/A | ❌ No | ❌ No | Non-extractable, cleared on lock |
| **PBKDF2 Salt** | localStorage | ❌ No | ✅ Yes | ✅ Yes | Public info, needed for re-derivation |
| **Verification Value** | localStorage | ✅ Yes | N/A | ✅ Yes | Encrypted with derived key |
| **Passphrase Hint** | localStorage | ❌ No | ✅ Yes | ✅ Yes | User-provided, NOT the passphrase |
| **Auto-Generated Key** | localStorage | ❌ No | ✅ Yes | ✅ Yes | Random, for auto-mode only |
| **RxDB Password** | Function parameter | N/A | ✅ Yes | ❌ No | Transient, passed to RxDB |
| **Export Salt** | Export file | ❌ No | ✅ Yes | ✅ Yes | Included in .bfx file |
| **Export Key** | ❌ Never stored | N/A | ❌ No | ❌ No | Derived during export/import |

### Storage Summary

**localStorage Keys:**
- `bf_encryption_key` → Auto-generated database key (random, plaintext)
- `bf_encryption_salt` → PBKDF2 salt (public, required)
- `bf_encryption_verification` → Encrypted test value (verifies passphrase)
- `bf_encryption_enabled` → Boolean flag
- `bf_kdf_hint` → User hint (NOT the passphrase)
- `bf-encryption-store` → Zustand persist (mode, salt, flags only)

**Memory (Zustand State):**
- `_encryptionKey` → CryptoKey (non-extractable, NOT persisted)
- `isKeyLoaded` → Boolean flag
- `_salt` → Uint8Array reference

**Never Stored:**
- ❌ User passphrases
- ❌ Extractable encryption keys
- ❌ Decrypted user data

---

## Threat Model

### Attack Scenarios

| Attack | Mitigation | Status |
|--------|------------|--------|
| **XSS Injection** | DOMPurify sanitization | ✅ Mitigated |
| **Key Extraction** | Non-extractable CryptoKeys | ✅ Mitigated |
| **Brute Force** | 600k PBKDF2 iterations | ✅ Mitigated |
| **Rainbow Tables** | Unique salt per user | ✅ Mitigated |
| **Device Compromise** | Keys cleared on lock | ⚠️ Partial (auto-key vulnerable) |
| **Network Sniffing** | No transmission (local-only) | ✅ Mitigated |
| **Shoulder Surfing** | Password masking, hints optional | ✅ Mitigated |
| **Data Tampering** | GCM authentication tags | ✅ Mitigated |

---

**Document Version:** 1.0  
**Last Updated:** December 3, 2025  
**Related:** CRYPTO_SECURITY_AUDIT.md, ENCRYPTION.md
