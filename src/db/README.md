# RxDB Database Configuration

This directory contains the RxDB database setup for BenefitFinder with **end-to-end encryption** for sensitive user data.

## 🔒 Security & Privacy

### Encryption
- **AES-256-GCM** encryption for all sensitive fields
- Automatic encryption key generation and storage
- User profiles, eligibility results, and personal data are fully encrypted
- Encryption happens at the field level for optimal performance

### Privacy Features
- All data stored locally in IndexedDB (browser)
- No external API calls or data transmission
- Encrypted at rest
- Easy full data deletion via `clearUserData()` or `destroyDatabase()`

## 📦 Collections

### 1. **user_profiles**
Stores household and personal information for eligibility checks.

**Encrypted Fields:** All personal data (name, DOB, income, etc.)

```typescript
{
  id: string;
  firstName: string;         // encrypted
  lastName: string;          // encrypted
  dateOfBirth: string;       // encrypted
  householdSize: number;     // encrypted
  householdIncome: number;   // encrypted
  state: string;             // encrypted
  zipCode: string;           // encrypted
  citizenship: string;       // encrypted
  employmentStatus: string;  // encrypted
  createdAt: number;
  updatedAt: number;
}
```

**Methods:**
- `getFullName()` - Returns full name
- `getAge()` - Calculates age from date of birth

**Static Methods:**
- `getLatest()` - Get most recently updated profile

### 2. **benefit_programs**
Stores benefit program definitions and metadata.

**No Encrypted Fields** (public information)

```typescript
{
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: 'food' | 'healthcare' | 'housing' | 'financial' | 'childcare' | 'other';
  jurisdiction: string;      // e.g., "US-GA", "US-FEDERAL"
  website: string;
  phoneNumber: string;
  applicationUrl: string;
  active: boolean;
  lastUpdated: number;
  createdAt: number;
}
```

**Static Methods:**
- `getActivePrograms()` - Get all active programs
- `getByJurisdiction(jurisdiction)` - Filter by location
- `getByCategory(category)` - Filter by category

### 3. **eligibility_rules**
Stores JSON Logic rules for determining benefit eligibility.

**No Encrypted Fields** (rules are public)

```typescript
{
  id: string;
  programId: string;         // References benefit_programs
  name: string;
  description: string;
  ruleLogic: object;         // JSON Logic rule
  requiredDocuments: string[];
  version: string;
  effectiveDate: number;
  expirationDate: number;
  source: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}
```

**Methods:**
- `isValid()` - Check if rule is currently valid

**Static Methods:**
- `getByProgram(programId)` - Get active rules for a program

### 4. **eligibility_results**
Stores cached eligibility evaluation results.

**Encrypted Fields:** All result data (user reference, eligibility status, etc.)

```typescript
{
  id: string;
  userProfileId: string;     // encrypted
  programId: string;
  ruleId: string;
  eligible: boolean;         // encrypted
  confidence: number;        // encrypted (0-100)
  reason: string;            // encrypted
  nextSteps: string[];       // encrypted
  requiredDocuments: string[]; // encrypted
  evaluatedAt: number;
  expiresAt: number;
}
```

**Methods:**
- `isExpired()` - Check if result has expired
- `isEligible()` - Check eligibility status

**Static Methods:**
- `getByUserProfile(userProfileId)` - Get all results for a user
- `getValidResults(userProfileId)` - Get non-expired results
- `clearExpired()` - Remove expired results

### 5. **app_settings**
Stores application-level settings (complements Zustand store).

```typescript
{
  key: string;               // Primary key
  value: string;             // JSON serialized
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  encrypted: boolean;
  updatedAt: number;
}
```

**Methods:**
- `getValue()` - Parse and return typed value

**Static Methods:**
- `get(key)` - Get setting value by key
- `set(key, value, encrypted)` - Set/update setting

## 🚀 Usage

### Initialization

```typescript
import { initializeDatabase, getDatabase } from '@/db';

// Initialize database (call once at app startup)
const db = await initializeDatabase();

// Or use custom encryption password
const db = await initializeDatabase('my-secure-password');
```

### Creating Documents

```typescript
import { createUserProfile, createBenefitProgram } from '@/db/utils';

// Create a user profile
const profile = await createUserProfile({
  firstName: 'Jane',
  lastName: 'Doe',
  dateOfBirth: '1985-03-15',
  householdSize: 3,
  householdIncome: 35000,
  state: 'GA',
  zipCode: '30301',
  citizenship: 'US Citizen',
  employmentStatus: 'Employed',
});

// Create a benefit program
const program = await createBenefitProgram({
  name: 'SNAP (Food Stamps)',
  shortName: 'SNAP',
  description: 'Supplemental Nutrition Assistance Program',
  category: 'food',
  jurisdiction: 'US-GA',
  website: 'https://dhs.georgia.gov',
  phoneNumber: '1-877-423-4746',
  applicationUrl: 'https://gateway.ga.gov',
  active: true,
});
```

### Querying Documents

```typescript
import { getDatabase } from '@/db';

const db = getDatabase();

// Find all active programs
const programs = await db.benefit_programs.find({
  selector: {
    active: true,
  },
  sort: [{ name: 'asc' }],
}).exec();

// Find one user profile
const profile = await db.user_profiles.findOne({
  selector: { id: 'profile-123' },
}).exec();

// Use collection static methods
const activePrograms = await db.benefit_programs.getActivePrograms();
const gaPrograms = await db.benefit_programs.getByJurisdiction('US-GA');
```

### React Integration

```typescript
import { useUserProfiles, useBenefitPrograms } from '@/db/hooks';

function MyComponent() {
  // Reactive queries that auto-update
  const { result: profiles, isFetching } = useUserProfiles();
  const { result: programs, isFetching: loadingPrograms } = useBenefitPrograms('US-GA');
  
  if (isFetching) return <div>Loading...</div>;
  
  return (
    <div>
      {profiles.map(profile => (
        <div key={profile.id}>{profile.getFullName()}</div>
      ))}
    </div>
  );
}
```

### Updating Documents

```typescript
import { getDatabase } from '@/db';

const db = getDatabase();

// Find and update
const profile = await db.user_profiles.findOne('profile-123').exec();

if (profile) {
  await profile.update({
    $set: {
      householdIncome: 40000,
      updatedAt: Date.now(),
    },
  });
}

// Or use utility function
import { updateUserProfile } from '@/db/utils';

await updateUserProfile('profile-123', {
  householdIncome: 40000,
});
```

### Deleting Documents

```typescript
import { deleteUserProfile, clearUserData } from '@/db/utils';

// Delete specific profile (and associated results)
await deleteUserProfile('profile-123');

// Clear all user data (privacy reset)
await clearUserData();

// Destroy entire database
import { destroyDatabase } from '@/db';
await destroyDatabase();
```

### Bulk Operations

```typescript
import { getDatabase } from '@/db';

const db = getDatabase();

// Bulk insert
const newPrograms = [
  { /* program 1 */ },
  { /* program 2 */ },
  { /* program 3 */ },
];

await db.benefit_programs.bulkInsert(newPrograms);
```

### Export/Import

```typescript
import { exportDatabase, importDatabase } from '@/db';

// Export all data (WARNING: not encrypted)
const exportData = await exportDatabase();

// Save to file
const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
// Trigger download...

// Import from backup
await importDatabase(exportData);
```

## 🔧 Utility Functions

### Database Management

```typescript
import {
  getDatabaseStats,
  checkDatabaseHealth,
  clearUserData,
} from '@/db/utils';

// Get statistics
const stats = await getDatabaseStats();
console.log(`Total documents: ${stats.total}`);

// Health check
const health = await checkDatabaseHealth();
if (!health.healthy) {
  console.error('Database issues:', health.issues);
}

// Clear user data for privacy
await clearUserData();
```

### ID Generation

```typescript
import { generateId } from '@/db/utils';

const newId = generateId(); // Uses nanoid
```

## 🧪 Testing

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initializeDatabase, destroyDatabase } from '@/db';
import { createUserProfile } from '@/db/utils';

describe('Database Tests', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });
  
  afterAll(async () => {
    await destroyDatabase();
  });
  
  it('should create a user profile', async () => {
    const profile = await createUserProfile({
      firstName: 'Test',
      lastName: 'User',
      // ... other fields
    });
    
    expect(profile.firstName).toBe('Test');
  });
});
```

## 🔐 Encryption Details

### What's Encrypted

- **User Profiles**: All personal information
- **Eligibility Results**: All results and details
- **App Settings**: Settings marked as encrypted

### What's NOT Encrypted

- **Benefit Programs**: Public information
- **Eligibility Rules**: Public rules and logic
- Metadata like timestamps, IDs, references

### Encryption Key Management

1. **Automatic**: Key is generated on first use and stored in localStorage
2. **Custom Password**: Pass a password to `initializeDatabase(password)`
3. **User Passphrase**: Derive key from user-provided passphrase (recommended for production)

```typescript
// Generate key from user passphrase
import { pbkdf2 } from 'crypto';

async function deriveKey(passphrase: string): Promise<string> {
  // Use PBKDF2 to derive a secure key
  // Implementation details...
}

const password = await deriveKey(userPassphrase);
await initializeDatabase(password);
```

## 📊 Performance

- **Indexed Queries**: Primary keys and frequently queried fields are indexed
- **Event Reduce**: Enabled for better query performance
- **Cleanup Policy**: Automatic cleanup of old data every 5 minutes
- **Multi-Instance**: Disabled for better single-tab performance

## 🚨 Common Issues

### Database not initialized
```typescript
// Always initialize before use
await initializeDatabase();
```

### Decryption errors
```typescript
// If password changes, old encrypted data cannot be decrypted
// Backup data before changing encryption keys
```

### Storage quota exceeded
```typescript
// Clear old/expired results
const db = getDatabase();
await db.eligibility_results.clearExpired();
```

## 🔄 Migrations

When schema changes are needed:

1. Increment `version` in schema
2. Add migration strategy in collection configuration
3. Test migration with sample data

```typescript
// Example migration (in collections.ts)
migrationStrategies: {
  1: (oldDoc) => {
    // Transform old document to new schema
    return {
      ...oldDoc,
      newField: 'default-value',
    };
  },
},
```

## 📝 Best Practices

1. **Always encrypt sensitive data** - Mark fields as `encrypted: true`
2. **Use utility functions** - Don't directly insert/update when utils exist
3. **Set expiration dates** - For eligibility results, set reasonable expiration
4. **Clear expired data** - Periodically run `clearExpired()` methods
5. **Validate data** - Use Zod schemas before inserting
6. **Handle errors** - Database operations can fail, always catch errors
7. **Test encryption** - Verify encrypted fields are not readable in DevTools

## 🆘 Support

For issues or questions about the database setup:
1. Check this README
2. Review schema definitions in `schemas.ts`
3. Check collection methods in `collections.ts`
4. Review RxDB documentation: https://rxdb.info/

