# TypeScript Type Definitions

Comprehensive type system for BenefitFinder with strict type safety.

## Overview

All types are organized by domain and exported from a central index file for easy importing.

## Type Modules

### 1. **household.ts** - Household & Personal Data

**Main Type**: `HouseholdProfile`

**Related Types**:
- `CitizenshipStatus` - 5 citizenship statuses
- `EmploymentStatus` - 6 employment statuses
- `HouseholdMember` - Individual member info
- `Address` - Physical address
- `ContactInfo` - Contact details
- `IncomeDetails` - Income breakdown
- `AssetInfo` - Asset tracking
- `ExpenseInfo` - Monthly expenses
- `ExtendedHouseholdProfile` - Complete profile with income/assets/expenses

**Usage**:
```typescript
import type { HouseholdProfile, Address, IncomeDetails } from '@/types';

const profile: HouseholdProfile = {
  id: 'profile-123',
  firstName: 'Jane',
  lastName: 'Doe',
  householdSize: 3,
  householdIncome: 35000,
  state: 'GA',
  citizenship: 'us_citizen',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const address: Address = {
  street1: '123 Main St',
  city: 'Atlanta',
  state: 'GA',
  zipCode: '30301',
};
```

---

### 2. **program.ts** - Benefit Programs

**Main Type**: `BenefitProgram`

**Related Types**:
- `ProgramCategory` - 11 program categories
- `JurisdictionLevel` - 4 government levels
- `ProgramContact` - Contact information
- `OfficeLocation` - Office locations
- `ApplicationDeadline` - Deadline info
- `BenefitAmountRange` - Benefit estimates
- `ExtendedBenefitProgram` - Program with computed fields
- `ProgramSearchFilters` - Search parameters
- `ProgramSearchResult` - Search results
- `ProgramComparison` - Compare programs
- `ProgramStatistics` - Aggregate stats
- `ProgramFAQ` - Frequently asked questions
- `ProgramApplicationSteps` - Step-by-step guide

**Usage**:
```typescript
import type { BenefitProgram, ProgramCategory, ExtendedBenefitProgram } from '@/types';

const program: BenefitProgram = {
  id: 'snap-ga',
  name: 'SNAP - Georgia',
  shortName: 'SNAP',
  description: 'Food assistance program',
  category: 'food',
  jurisdiction: 'US-GA',
  active: true,
  lastUpdated: Date.now(),
  createdAt: Date.now(),
};

const extended: ExtendedBenefitProgram = {
  ...program,
  benefitAmountRange: {
    min: 200,
    max: 1000,
    average: 500,
    frequency: 'monthly',
    currency: 'USD',
  },
  eligibilityRate: 65,
  averageProcessingTime: 30,
};
```

---

### 3. **rule.ts** - Eligibility Rules

**Main Type**: `RuleDefinition`

**Related Types**:
- `RuleType` - 4 rule types
- `JsonLogicOperator` - All JSON Logic operators
- `RuleLogic` - JSON Logic expression type
- `RuleVariable` - Available variables
- `RuleCriterion` - Individual criteria
- `RuleTestCase` - Test cases
- `RuleEvaluationContext` - Evaluation context
- `RuleEvaluationResult` - Single rule result
- `RuleValidationError` - Validation errors
- `RuleSet` - Collection of rules
- `RuleBuilder` - Helper for building rules

**Usage**:
```typescript
import type { RuleDefinition, RuleLogic, RuleTestCase } from '@/types';

const rule: RuleDefinition = {
  id: 'snap-income-test',
  programId: 'snap-ga',
  name: 'Income Test',
  ruleType: 'eligibility',
  ruleLogic: {
    '<=': [{ var: 'gross_income_fpl_percent' }, 130]
  },
  explanation: 'Income must be at or below 130% of FPL',
  version: '2024.1',
  active: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const testCase: RuleTestCase = {
  input: { gross_income_fpl_percent: 100 },
  expectedOutput: true,
  description: 'Should qualify at 100% FPL',
};
```

---

### 4. **eligibility.ts** - Eligibility Results

**Main Type**: `EligibilityResult`

**Related Types**:
- `EligibilityStatus` - 6 status types
- `CriterionResult` - Individual criterion result
- `NextStep` - Action items with priority
- `RequiredDocument` - Document checklist
- `BenefitEstimate` - Benefit amount estimate
- `BatchEligibilityResult` - Multiple programs
- `EligibilityComparison` - Scenario comparison
- `EligibilityTimeline` - Historical results
- `ConfidenceBreakdown` - Confidence scoring details

**Usage**:
```typescript
import type {
  EligibilityResult,
  EligibilityStatus,
  NextStep,
  RequiredDocument
} from '@/types';

const result: EligibilityResult = {
  id: 'result-123',
  userProfileId: 'profile-123',
  programId: 'snap-ga',
  ruleId: 'snap-income-test',
  eligible: true,
  confidence: 95,
  reason: 'Meets all income requirements',
  status: 'eligible',
  evaluatedAt: Date.now(),
};

const nextStep: NextStep = {
  step: 'Apply online at Georgia Gateway',
  url: 'https://gateway.ga.gov',
  priority: 'high',
  estimatedTime: '30 minutes',
};

const document: RequiredDocument = {
  document: 'Proof of Income',
  description: 'Recent pay stubs or tax returns',
  where: 'From employer or IRS',
  required: true,
  alternatives: ['W2 forms', 'Bank statements'],
};
```

---

### 5. **question.ts** - Questionnaire System

**Main Type**: `QuestionDefinition`

**Related Types**:
- `QuestionType` - 13 input types
- `QuestionOption` - Select/radio options
- `QuestionValidation` - Validation rules
- `ConditionalLogic` - Show/hide logic
- `QuestionFlow` - Complete questionnaire
- `QuestionSection` - Question grouping
- `QuestionAnswer` - User answer
- `QuestionNavigationState` - Navigation state
- `QuestionProgress` - Progress tracking
- `QuestionValidationResult` - Validation result
- `QuestionFlowState` - Current session state
- `QuestionSkipReason` - Why question was skipped
- `QuestionFlowAnalytics` - Completion analytics

**Usage**:
```typescript
import type {
  QuestionDefinition,
  QuestionType,
  QuestionOption,
  QuestionValidation
} from '@/types';

const question: QuestionDefinition = {
  id: 'q-income',
  key: 'householdIncome',
  question: 'What is your annual household income?',
  helpText: 'Include all sources of income before taxes',
  type: 'currency',
  required: true,
  validations: [
    {
      type: 'required',
      message: 'Income is required',
    },
    {
      type: 'min',
      value: 0,
      message: 'Income cannot be negative',
    },
  ],
  nextQuestionId: 'q-household-size',
};

const option: QuestionOption = {
  value: 'yes',
  label: 'Yes',
  description: 'I have children under 18',
};
```

---

### 6. **utility.ts** - Utility Types

**Generic Types**:
- `ValidationResult<T>` - Validation result wrapper
- `ValidationError` - Error details
- `AsyncResult<T, E>` - Async operation result
- `DeepPartial<T>` - Recursive partial
- `Writeable<T>` - Remove readonly
- `RequireSome<T, K>` - Make specific keys required
- `OptionalSome<T, K>` - Make specific keys optional
- `Nullable<T>` - Make all nullable
- `Exact<T, Shape>` - Exact type match

**Type Aliases**:
- `JsonValue` - Any JSON value
- `Timestamp` - Unix timestamp
- `ID` - Identifier string
- `CurrencyAmount` - Money in cents
- `Percentage` - 0-100 value
- `Promisable<T>` - Value or Promise
- `Awaitable<T>` - Awaited type

**Usage**:
```typescript
import type { ValidationResult, AsyncResult, DeepPartial } from '@/types';

const result: ValidationResult<UserProfile> = {
  valid: true,
  data: validatedProfile,
};

const asyncOp: AsyncResult<UserProfile, string> = {
  success: true,
  data: profile,
};

const partial: DeepPartial<QuestionFlow> = {
  questions: [{
    question: 'Updated question text',
  }],
};
```

---

## Import Patterns

### Centralized Import

```typescript
// Import everything from central index
import type {
  HouseholdProfile,
  BenefitProgram,
  RuleDefinition,
  EligibilityResult,
  QuestionDefinition,
} from '@/types';
```

### Specific Module Import

```typescript
// Import from specific module
import type {
  QuestionType,
  QuestionOption,
  QuestionValidation
} from '@/types/question';
```

### Database Type Import

```typescript
// Database types are also available
import type {
  UserProfile,
  BenefitProgram,
  EligibilityRule,
} from '@/db/schemas';
```

---

## Type Relationships

```
HouseholdProfile
  ├─ extends UserProfile (from DB)
  ├─ has HouseholdMember[]
  ├─ has Address
  └─ has ContactInfo

BenefitProgram (from DB)
  ├─ ExtendedBenefitProgram
  │   ├─ has ProgramContact[]
  │   ├─ has OfficeLocation[]
  │   └─ has ApplicationDeadline

RuleDefinition
  ├─ extends EligibilityRule (from DB)
  ├─ has RuleCriterion[]
  ├─ has RuleVariable[]
  └─ has RuleTestCase[]

EligibilityResult (from DB)
  ├─ has CriterionResult[]
  ├─ has NextStep[]
  ├─ has RequiredDocument[]
  └─ has BenefitEstimate

QuestionDefinition
  ├─ has QuestionOption[]
  ├─ has QuestionValidation[]
  ├─ has ConditionalLogic
  └─ belongs to QuestionFlow
```

---

## Best Practices

### 1. **Use Strict Types**

```typescript
// ✅ Good - specific type
function process(status: CitizenshipStatus): void { }

// ❌ Avoid - loose type
function process(status: string): void { }
```

### 2. **Use Type Inference**

```typescript
// ✅ Good - let TypeScript infer
const profile = createUserProfile({ ... });

// ❌ Unnecessary - explicit typing
const profile: HouseholdProfile = createUserProfile({ ... });
```

### 3. **Use Readonly for Immutable Data**

```typescript
// ✅ Good - prevent mutations
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

// ❌ Avoid - allows mutation
interface Config {
  apiUrl: string;
  timeout: number;
}
```

### 4. **Use Discriminated Unions**

```typescript
// ✅ Good - type-safe
type Result =
  | { success: true; data: string }
  | { success: false; error: Error };

if (result.success) {
  console.log(result.data); // TypeScript knows this exists
} else {
  console.error(result.error); // TypeScript knows this exists
}
```

### 5. **Use Utility Types**

```typescript
// ✅ Good - use utility types
type PartialProfile = DeepPartial<HouseholdProfile>;
type RequiredFields = RequireSome<HouseholdProfile, 'id' | 'createdAt'>;

// ❌ Avoid - manual types
type PartialProfile = {
  id?: string;
  firstName?: string;
  // ... repeat for all fields
};
```

---

## Testing Types

```typescript
import { describe, it, expectTypeOf } from 'vitest';
import type { HouseholdProfile, QuestionDefinition } from '@/types';

describe('Type Tests', () => {
  it('HouseholdProfile should have correct structure', () => {
    expectTypeOf<HouseholdProfile>().toHaveProperty('id');
    expectTypeOf<HouseholdProfile>().toHaveProperty('firstName');
  });

  it('QuestionType should be specific', () => {
    type QuestionType = QuestionDefinition['type'];
    expectTypeOf<QuestionType>().toEqualTypeOf<
      'text' | 'number' | 'currency' | /* ... */
    >();
  });
});
```

---

## Type Statistics

| Module | Types/Interfaces | Enums | Total Exports |
|--------|------------------|-------|---------------|
| household.ts | 10 | 2 | 12 |
| program.ts | 10 | 2 | 12 |
| rule.ts | 12 | 2 | 14 |
| eligibility.ts | 9 | 1 | 10 |
| question.ts | 15 | 1 | 16 |
| utility.ts | 18 | 0 | 18 |
| **TOTAL** | **74** | **8** | **82** |

---

## Quick Reference

### Required Interfaces (From ROADMAP)

✅ **HouseholdProfile** (`src/types/household.ts`)
- Extended UserProfile with members, address, contact
- 17+ fields, computed properties
- Includes IncomeDetails, AssetInfo, ExpenseInfo

✅ **BenefitProgram** (`src/types/program.ts`)
- Re-export of DB type for consistency
- ExtendedBenefitProgram with 30+ fields
- Includes contacts, offices, deadlines

✅ **RuleDefinition** (`src/types/rule.ts`)
- Extended EligibilityRule with criteria
- JSON Logic support with full operator types
- Test cases, variables, validation

✅ **EligibilityResult** (`src/types/eligibility.ts`)
- Re-export of DB type
- Extended with status, explanations
- Detailed breakdowns and estimates

✅ **QuestionDefinition** (`src/types/question.ts`)
- Complete questionnaire system types
- 13 question types, validation, conditional logic
- Flow management and analytics

---

## Integration with Database

Types work seamlessly with RxDB:

```typescript
import type { HouseholdProfile } from '@/types';
import { createUserProfile } from '@/db';

// HouseholdProfile extends UserProfile from DB
const profile: HouseholdProfile = await createUserProfile({
  firstName: 'Jane',
  lastName: 'Doe',
  // ... all fields are type-checked
});
```

---

## Examples

### Complete Workflow

```typescript
import type {
  HouseholdProfile,
  BenefitProgram,
  RuleDefinition,
  EligibilityResult,
  QuestionDefinition,
} from '@/types';

// 1. Define household
const household: HouseholdProfile = { /* ... */ };

// 2. Find programs
const program: BenefitProgram = { /* ... */ };

// 3. Check rules
const rule: RuleDefinition = { /* ... */ };

// 4. Evaluate eligibility
const result: EligibilityResult = evaluateRule(rule, household);

// 5. Display results
if (result.eligible) {
  console.log('Eligible!', result.nextSteps);
}
```

### Type Guards

```typescript
function isEligible(result: EligibilityResult): boolean {
  return result.eligible === true && result.confidence >= 80;
}

function hasCompleteProfile(profile: HouseholdProfile): boolean {
  return !!(
    profile.firstName &&
    profile.lastName &&
    profile.householdSize &&
    profile.householdIncome
  );
}
```

---

## Advanced Patterns

### Generic Types

```typescript
import type { ValidationResult, AsyncResult } from '@/types';

async function validateProfile(
  profile: unknown
): Promise<ValidationResult<HouseholdProfile>> {
  // Validation logic
  return {
    valid: true,
    data: profile as HouseholdProfile,
  };
}

async function fetchProgram(
  id: string
): Promise<AsyncResult<BenefitProgram, string>> {
  try {
    const program = await db.programs.findOne(id);
    return { success: true, data: program };
  } catch (error) {
    return { success: false, error: 'Not found' };
  }
}
```

### Mapped Types

```typescript
type ReadonlyProfile = Readonly<HouseholdProfile>;
type PartialProfile = Partial<HouseholdProfile>;
type RequiredProfile = Required<HouseholdProfile>;
type PickedProfile = Pick<HouseholdProfile, 'id' | 'firstName' | 'lastName'>;
```

---

## Documentation Standards

All types include:
- ✅ TSDoc comments
- ✅ Field descriptions
- ✅ Usage examples
- ✅ Related types referenced

---

## Future Enhancements

- [ ] Add JSDoc @example tags
- [ ] Generate type documentation site
- [ ] Add branded types for IDs
- [ ] Add runtime type guards
- [ ] Add serialization helpers

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Zod + TypeScript](https://zod.dev/?id=type-inference)

