# RxDB Collection Schemas with Zod

Comprehensive documentation for all RxDB collection schemas in BenefitFinder.

## Overview

All schemas are defined using **Zod** for runtime validation and then converted to RxDB JSON Schema format. This provides:

- ✅ Runtime validation before database insertion
- ✅ TypeScript type inference
- ✅ Consistent validation logic
- ✅ Better error messages
- ✅ Type-safe queries

## Collections

### 1. **UserProfiles** - Encrypted Household Data

**Purpose**: Store household and personal information for eligibility checks.

**Security**: 🔒 All sensitive fields are encrypted at rest.

#### Zod Schema

```typescript
import { UserProfileZodSchema } from '@/db/schemas';

const profile = UserProfileZodSchema.parse({
  id: 'profile-123',
  firstName: 'Jane',
  lastName: 'Doe',
  dateOfBirth: '1985-03-15',
  householdSize: 3,
  householdIncome: 35000,
  state: 'GA',
  zipCode: '30301',
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
```

#### Fields

| Field | Type | Encrypted | Required | Description |
|-------|------|-----------|----------|-------------|
| `id` | string | ❌ | ✅ | Unique identifier |
| `firstName` | string | 🔒 | ❌ | First name |
| `lastName` | string | 🔒 | ❌ | Last name |
| `dateOfBirth` | string | 🔒 | ❌ | Birth date (YYYY-MM-DD) |
| `householdSize` | number | 🔒 | ❌ | Number in household (1-50) |
| `householdIncome` | number | 🔒 | ❌ | Annual income ($0-$10M) |
| `state` | string | 🔒 | ❌ | US state code (2 chars) |
| `zipCode` | string | 🔒 | ❌ | ZIP code (5 or 9 digits) |
| `county` | string | 🔒 | ❌ | County name |
| `citizenship` | enum | 🔒 | ❌ | Citizenship status |
| `employmentStatus` | enum | 🔒 | ❌ | Employment status |
| `hasDisability` | boolean | 🔒 | ❌ | Has disability |
| `isVeteran` | boolean | 🔒 | ❌ | Is veteran |
| `isPregnant` | boolean | 🔒 | ❌ | Is pregnant |
| `hasChildren` | boolean | 🔒 | ❌ | Has children under 18 |
| `createdAt` | number | ❌ | ✅ | Creation timestamp |
| `updatedAt` | number | ❌ | ✅ | Update timestamp |
| `lastAccessedAt` | number | ❌ | ❌ | Last access timestamp |

#### Enums

**Citizenship**:
- `us_citizen`
- `permanent_resident`
- `refugee`
- `asylee`
- `other`

**Employment Status**:
- `employed`
- `unemployed`
- `self_employed`
- `retired`
- `disabled`
- `student`

---

### 2. **Programs** - Benefit Program Definitions

**Purpose**: Store benefit program information and metadata.

**Security**: ✅ Public data, not encrypted.

#### Zod Schema

```typescript
import { BenefitProgramZodSchema } from '@/db/schemas';

const program = BenefitProgramZodSchema.parse({
  id: 'snap-ga',
  name: 'SNAP (Food Stamps) - Georgia',
  shortName: 'SNAP',
  description: 'Supplemental Nutrition Assistance Program',
  category: 'food',
  jurisdiction: 'US-GA',
  jurisdictionLevel: 'state',
  website: 'https://dhs.georgia.gov/snap',
  active: true,
  lastUpdated: Date.now(),
  createdAt: Date.now(),
});
```

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier |
| `name` | string | ✅ | Full program name (max 200) |
| `shortName` | string | ✅ | Abbreviated name (max 50) |
| `description` | string | ✅ | Program description (max 2000) |
| `category` | enum | ✅ | Program category |
| `jurisdiction` | string | ✅ | Geographic jurisdiction |
| `jurisdictionLevel` | enum | ❌ | Level of government |
| `website` | string (URL) | ❌ | Official website |
| `phoneNumber` | string | ❌ | Contact phone |
| `applicationUrl` | string (URL) | ❌ | Application URL |
| `officeAddress` | string | ❌ | Physical address (max 500) |
| `eligibilitySummary` | string | ❌ | Brief summary (max 1000) |
| `benefitAmount` | string | ❌ | Benefit description (max 200) |
| `tags` | string[] | ❌ | Search tags |
| `active` | boolean | ✅ | Is active |
| `applicationOpen` | boolean | ❌ | Applications open |
| `source` | string | ❌ | Data source URL |
| `sourceDate` | number | ❌ | Last source check |
| `lastUpdated` | number | ✅ | Update timestamp |
| `createdAt` | number | ✅ | Creation timestamp |

#### Enums

**Category**:
- `food`, `healthcare`, `housing`, `financial`, `childcare`
- `education`, `employment`, `transportation`, `utilities`, `legal`, `other`

**Jurisdiction Level**:
- `federal`, `state`, `county`, `city`

#### Indexes

- Single: `category`, `jurisdiction`, `active`
- Compound: `[category, jurisdiction]`

---

### 3. **Rules** - Eligibility Rule Sets

**Purpose**: Store JSON Logic rules for determining benefit eligibility.

**Security**: ✅ Public data, not encrypted.

#### Zod Schema

```typescript
import { EligibilityRuleZodSchema } from '@/db/schemas';

const rule = EligibilityRuleZodSchema.parse({
  id: 'snap-ga-income-2024',
  programId: 'snap-ga',
  name: 'SNAP Georgia Income Test 2024',
  description: 'Gross income must be at or below 130% of FPL',
  ruleType: 'eligibility',
  ruleLogic: {
    '<=': [
      { var: 'gross_income_fpl_percent' },
      130
    ]
  },
  explanation: 'Your household gross income must be at or below 130% of the Federal Poverty Level',
  requiredFields: ['householdSize', 'householdIncome'],
  version: '2024.1',
  effectiveDate: Date.parse('2024-01-01'),
  source: 'https://www.fns.usda.gov/snap/recipient/eligibility',
  active: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
```

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier |
| `programId` | string | ✅ | Program reference |
| `name` | string | ✅ | Rule name (max 200) |
| `description` | string | ❌ | Description (max 1000) |
| `ruleType` | enum | ❌ | Type of rule |
| `ruleLogic` | object | ✅ | JSON Logic definition |
| `explanation` | string | ❌ | Plain language (max 2000) |
| `requiredDocuments` | string[] | ❌ | Documents needed |
| `requiredFields` | string[] | ❌ | Profile fields needed |
| `version` | string | ✅ | Rule version (max 50) |
| `effectiveDate` | number | ❌ | Start date timestamp |
| `expirationDate` | number | ❌ | End date timestamp |
| `source` | string | ❌ | Source URL (max 500) |
| `sourceDocument` | string | ❌ | Document reference |
| `legalReference` | string | ❌ | Legal citation |
| `priority` | number | ❌ | Priority (higher first) |
| `active` | boolean | ✅ | Is active |
| `draft` | boolean | ❌ | Is draft |
| `testCases` | array | ❌ | Validation test cases |
| `createdAt` | number | ✅ | Creation timestamp |
| `updatedAt` | number | ✅ | Update timestamp |
| `createdBy` | string | ❌ | Author name |

#### Enums

**Rule Type**:
- `eligibility` - Determines if eligible
- `benefit_amount` - Calculates benefit amount
- `document_requirements` - Determines required docs
- `conditional` - Conditional logic

#### Test Cases Format

```typescript
testCases: [
  {
    input: { householdIncome: 30000, householdSize: 3 },
    expectedOutput: true,
    description: 'Family of 3 with $30k income should qualify',
  },
  {
    input: { householdIncome: 100000, householdSize: 2 },
    expectedOutput: false,
    description: 'Family of 2 with $100k income should not qualify',
  },
]
```

---

### 4. **EligibilityResults** - Cached Evaluations

**Purpose**: Store cached eligibility evaluation results.

**Security**: 🔒 All result data is encrypted.

#### Zod Schema

```typescript
import { EligibilityResultZodSchema } from '@/db/schemas';

const result = EligibilityResultZodSchema.parse({
  id: 'result-123',
  userProfileId: 'profile-123',
  programId: 'snap-ga',
  ruleId: 'snap-ga-income-2024',
  eligible: true,
  confidence: 95,
  reason: 'Household income is below 130% FPL',
  nextSteps: [
    {
      step: 'Apply online at Georgia Gateway',
      url: 'https://gateway.ga.gov',
      priority: 'high',
    },
  ],
  requiredDocuments: [
    {
      document: 'Proof of Income',
      description: 'Pay stubs, tax returns, or employer letter',
      where: 'From employer or IRS',
    },
  ],
  evaluatedAt: Date.now(),
  expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
});
```

#### Fields

| Field | Type | Encrypted | Required | Description |
|-------|------|-----------|----------|-------------|
| `id` | string | ❌ | ✅ | Unique identifier |
| `userProfileId` | string | 🔒 | ✅ | User reference |
| `programId` | string | ❌ | ✅ | Program reference |
| `ruleId` | string | ❌ | ✅ | Rule reference |
| `eligible` | boolean | 🔒 | ✅ | Eligibility status |
| `confidence` | number | 🔒 | ✅ | Confidence (0-100) |
| `reason` | string | 🔒 | ❌ | Explanation (max 1000) |
| `criteriaResults` | array | 🔒 | ❌ | Detailed breakdown |
| `missingFields` | string[] | 🔒 | ❌ | Missing info |
| `nextSteps` | array | 🔒 | ❌ | Action items |
| `requiredDocuments` | array | 🔒 | ❌ | Needed documents |
| `estimatedBenefit` | object | 🔒 | ❌ | Benefit estimate |
| `ruleVersion` | string | ❌ | ❌ | Rule version used |
| `evaluatedAt` | number | ❌ | ✅ | Evaluation time |
| `expiresAt` | number | ❌ | ❌ | Expiration time |
| `needsReview` | boolean | ❌ | ❌ | Needs manual review |
| `incomplete` | boolean | ❌ | ❌ | Incomplete data |

---

### 5. **AppSettings** - User Preferences and App State

**Purpose**: Store persistent application settings and state.

**Security**: 🔒 Can be encrypted per-setting.

#### Zod Schema

```typescript
import { AppSettingZodSchema } from '@/db/schemas';

const setting = AppSettingZodSchema.parse({
  key: 'user_onboarding_completed',
  value: JSON.stringify(true),
  type: 'boolean',
  encrypted: false,
  sensitive: false,
  category: 'app_state',
  description: 'Has user completed onboarding flow',
  updatedAt: Date.now(),
  createdAt: Date.now(),
});
```

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | string | ✅ | Setting key (max 128) |
| `value` | string | ✅ | JSON serialized value (max 10000) |
| `type` | enum | ✅ | Value type |
| `encrypted` | boolean | ✅ | Is encrypted |
| `sensitive` | boolean | ❌ | Don't log value |
| `category` | enum | ❌ | Setting category |
| `description` | string | ❌ | Description (max 500) |
| `updatedAt` | number | ✅ | Update timestamp |
| `createdAt` | number | ❌ | Creation timestamp |
| `expiresAt` | number | ❌ | Expiration (for cache) |

#### Enums

**Type**: `string`, `number`, `boolean`, `object`, `array`

**Category**:
- `user_preference` - User preferences
- `app_state` - Application state
- `feature_flag` - Feature toggles
- `cache` - Cached data
- `metadata` - App metadata
- `other` - Miscellaneous

---

## Validation

### Runtime Validation

Use Zod schemas to validate data before insertion:

```typescript
import { validateUserProfile, validateUserProfileSafe } from '@/db/validators';

// Throws on error
try {
  const validated = validateUserProfile(userData);
  await db.user_profiles.insert(validated);
} catch (error) {
  console.error('Validation failed:', error);
}

// Safe parsing (returns result object)
const result = validateUserProfileSafe(userData);
if (result.success) {
  await db.user_profiles.insert(result.data);
} else {
  console.error('Validation errors:', result.error);
}
```

### Type Safety

TypeScript types are automatically inferred from Zod schemas:

```typescript
import type { UserProfile, BenefitProgram } from '@/db/schemas';

function processProfile(profile: UserProfile): void {
  // profile.firstName is typed as string | undefined
  // profile.householdIncome is typed as number | undefined
  // Full autocomplete and type checking!
}
```

### Partial Validation (Updates)

For updates, use partial schemas:

```typescript
import { PartialUserProfileZodSchema } from '@/db/validators';

// Only validate fields being updated
const updateData = PartialUserProfileZodSchema.parse({
  householdIncome: 40000,
  updatedAt: Date.now(),
});
```

---

## Encryption Details

### Encrypted Fields

#### UserProfiles (14 fields encrypted)
All personal and household data:
- Personal: firstName, lastName, dateOfBirth
- Household: householdSize, householdIncome
- Location: state, zipCode, county
- Status: citizenship, employmentStatus
- Demographics: hasDisability, isVeteran, isPregnant, hasChildren

#### EligibilityResults (9 fields encrypted)
All result data:
- References: userProfileId
- Results: eligible, confidence, reason
- Details: criteriaResults, missingFields
- Actions: nextSteps, requiredDocuments
- Estimates: estimatedBenefit

#### AppSettings (configurable per setting)
- Controlled by `encrypted` field
- Sensitive settings can be encrypted

### Encryption Method

- **Algorithm**: AES-256-GCM
- **Key**: Generated or user-provided password
- **Storage**: Encrypted fields are unreadable in IndexedDB DevTools
- **Performance**: Field-level encryption (only sensitive data encrypted)

---

## Indexes

Optimized for common queries:

### UserProfiles
- `createdAt`, `updatedAt`

### Programs
- `category`, `jurisdiction`, `active`
- Compound: `[category, jurisdiction]`

### Rules
- `programId`, `active`, `effectiveDate`
- Compound: `[programId, active]`

### Results
- `userProfileId`, `programId`, `evaluatedAt`
- Compound: `[userProfileId, programId]`

### AppSettings
- `category`, `updatedAt`, `expiresAt`

---

## Examples

### Create User Profile

```typescript
import { createUserProfile } from '@/db/utils';

const profile = await createUserProfile({
  firstName: 'Jane',
  lastName: 'Doe',
  dateOfBirth: '1985-03-15',
  householdSize: 3,
  householdIncome: 35000,
  state: 'GA',
  zipCode: '30301',
  citizenship: 'us_citizen',
  employmentStatus: 'employed',
  hasChildren: true,
});

// All sensitive fields automatically encrypted!
```

### Create Benefit Program

```typescript
import { createBenefitProgram } from '@/db/utils';

const program = await createBenefitProgram({
  name: 'SNAP - Georgia',
  shortName: 'SNAP',
  description: 'Food assistance for low-income families',
  category: 'food',
  jurisdiction: 'US-GA',
  jurisdictionLevel: 'state',
  website: 'https://dhs.georgia.gov/snap',
  active: true,
  tags: ['food', 'nutrition', 'ebt'],
});
```

### Create Eligibility Rule

```typescript
import { createEligibilityRule } from '@/db/utils';

const rule = await createEligibilityRule({
  programId: 'snap-ga',
  name: 'Income Test',
  ruleType: 'eligibility',
  ruleLogic: {
    '<=': [{ var: 'gross_income_fpl_percent' }, 130]
  },
  explanation: 'Gross income must be ≤ 130% of Federal Poverty Level',
  requiredFields: ['householdSize', 'householdIncome'],
  requiredDocuments: ['Proof of income'],
  version: '2024.1',
  source: 'https://www.fns.usda.gov/snap',
  active: true,
  testCases: [
    {
      input: { gross_income_fpl_percent: 100 },
      expectedOutput: true,
      description: '100% FPL should qualify',
    },
  ],
});
```

### Save Eligibility Result

```typescript
import { saveEligibilityResult } from '@/db/utils';

const result = await saveEligibilityResult({
  userProfileId: 'profile-123',
  programId: 'snap-ga',
  ruleId: 'snap-ga-income-2024',
  eligible: true,
  confidence: 95,
  reason: 'Meets income requirements',
  nextSteps: [
    {
      step: 'Apply online at Georgia Gateway',
      url: 'https://gateway.ga.gov',
      priority: 'high',
    },
  ],
  requiredDocuments: [
    {
      document: 'Proof of Income',
      description: 'Recent pay stubs or tax returns',
      where: 'From employer or IRS',
    },
  ],
  estimatedBenefit: {
    amount: 500,
    frequency: 'monthly',
    description: 'Estimated monthly benefit for household of 3',
  },
}, 30); // Expires in 30 days
```

---

## Best Practices

### 1. Always Validate Before Insert

```typescript
// ✅ Good - validate first
const validated = validateUserProfile(userData);
await db.user_profiles.insert(validated);

// ❌ Bad - no validation
await db.user_profiles.insert(userData as any);
```

### 2. Use Safe Parsing for User Input

```typescript
const result = validateUserProfileSafe(userInput);

if (result.success) {
  await db.user_profiles.insert(result.data);
} else {
  // Show user-friendly error
  const errorMessage = formatZodError(result.error);
  showError(errorMessage);
}
```

### 3. Mark Sensitive Data as Encrypted

Always encrypt PII (Personally Identifiable Information):
- ✅ Names, DOB, addresses
- ✅ Income, household size
- ✅ Citizenship, employment status
- ✅ Any health or demographic data

### 4. Use Indexes for Queries

```typescript
// ✅ Good - uses index
const programs = await db.benefit_programs.find({
  selector: { category: 'food' }  // Indexed field
}).exec();

// ⚠️ Less optimal - no index
const programs = await db.benefit_programs.find({
  selector: { description: { $regex: /food/i } }
}).exec();
```

### 5. Set Expiration Dates

For cached data like eligibility results:

```typescript
const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days

await saveEligibilityResult({ ... }, 30);
```

---

## Schema Versioning

When schemas need to change:

1. **Increment version** in schema
2. **Add migration** in collections.ts
3. **Test migration** with sample data
4. **Deploy** with migration

```typescript
// In schemas.ts
export const userProfileSchema: RxJsonSchema<UserProfile> = {
  version: 1,  // Incremented
  // ...
};

// In collections.ts
migrationStrategies: {
  1: (oldDoc) => {
    return {
      ...oldDoc,
      newField: 'default-value',
    };
  },
},
```

---

## Testing

All schemas include test cases in:
- `src/db/__tests__/database.test.ts`
- `src/db/__tests__/collections.test.ts`

Run with: `npm test`

---

## Reference

- [Zod Documentation](https://zod.dev/)
- [RxDB Schema Documentation](https://rxdb.info/rx-schema.html)
- [JSON Logic](https://jsonlogic.com/)
- [RxDB Encryption](https://rxdb.info/encryption.html)

