# Benefit Thresholds Utility

The `benefitThresholds.ts` utility centralizes all Federal Poverty Level (FPL) calculations and income thresholds for SNAP, Medicaid, WIC, and other benefit programs.

## Overview

This utility provides:
- Base FPL calculations for any household size
- Program-specific income thresholds (SNAP, Medicaid, WIC)
- Eligibility checking functions
- Formatting and conversion utilities

## Why Centralized Thresholds?

**Benefits:**
- ✅ Single source of truth for all benefit thresholds
- ✅ Easy annual updates (update once, affects entire system)
- ✅ Consistent calculations across the application
- ✅ Well-documented with legal references
- ✅ Comprehensive test coverage

## Usage Examples

### Basic FPL Calculations

```typescript
import { calculateFPL, calculateFPLPercentage } from '@/utils/benefitThresholds';

// Get 100% FPL for household of 3
const fpl = calculateFPL(3); // Returns 2148 (monthly)

// Get 130% FPL for household of 4
const snap130 = calculateFPLPercentage(4, 130); // Returns ~3372
```

### SNAP Eligibility

```typescript
import {
  getSNAPGrossIncomeLimit,
  isSNAPIncomeEligible
} from '@/utils/benefitThresholds';

// Get SNAP gross income limit for household of 2
const limit = getSNAPGrossIncomeLimit(2); // Returns 2292

// Check if household is SNAP eligible
const eligible = isSNAPIncomeEligible(1800, 2); // Returns true
```

### Medicaid Eligibility

```typescript
import {
  getMedicaidExpansionLimit,
  getMedicaidChildrenPregnantLimit,
  isMedicaidExpansionEligible
} from '@/utils/benefitThresholds';

// Get Medicaid expansion limit (138% FPL)
const expansionLimit = getMedicaidExpansionLimit(1); // Returns 2040

// Get children/pregnant limit (200% FPL)
const childLimit = getMedicaidChildrenPregnantLimit(3); // Returns 8880

// Check eligibility
const eligible = isMedicaidExpansionEligible(1900, 1); // Returns true
```

### WIC Eligibility

```typescript
import { getWICIncomeLimit, isWICIncomeEligible } from '@/utils/benefitThresholds';

// Get WIC income limit (185% FPL)
const wicLimit = getWICIncomeLimit(4);

// Check eligibility
const eligible = isWICIncomeEligible(3500, 3);
```

### Utility Functions

```typescript
import {
  annualToMonthly,
  monthlyToAnnual,
  formatIncomeThreshold,
  describeFPLPercentage
} from '@/utils/benefitThresholds';

// Convert income frequencies
const monthly = annualToMonthly(36000); // Returns 3000
const annual = monthlyToAnnual(2500); // Returns 30000

// Format for display
const formatted = formatIncomeThreshold(2888, 'monthly');
// Returns "$2,888/month"

// Get description
const desc = describeFPLPercentage(130);
// Returns "SNAP Gross Income Limit"
```

## Available Functions

### Core FPL Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `calculateFPL(size)` | Get 100% FPL for household | Monthly $ amount |
| `calculateFPLPercentage(size, %)` | Get FPL at specific % | Monthly $ amount |
| `isIncomeAtOrBelowFPL(income, size, %)` | Check if income ≤ threshold | Boolean |

### SNAP Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `getSNAPGrossIncomeLimit(size)` | 130% FPL (gross test) | Monthly $ amount |
| `getSNAPNetIncomeLimit(size)` | 100% FPL (net test) | Monthly $ amount |
| `getSNAPBBCELimit(size)` | 200% FPL (BBCE states) | Monthly $ amount |
| `isSNAPIncomeEligible(income, size)` | Check gross eligibility | Boolean |

### Medicaid Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `getMedicaidExpansionLimit(size)` | 138% FPL (expansion) | Monthly $ amount |
| `getMedicaidChildrenPregnantLimit(size)` | 200% FPL (children) | Monthly $ amount |
| `getMedicaidDisabilityLimit(size)` | ~74% FPL (disability) | Monthly $ amount |
| `isMedicaidExpansionEligible(income, size)` | Check expansion eligibility | Boolean |

### WIC Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `getWICIncomeLimit(size)` | 185% FPL | Monthly $ amount |
| `isWICIncomeEligible(income, size)` | Check WIC eligibility | Boolean |

### Utility Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `annualToMonthly(amount)` | Convert annual → monthly | Monthly $ amount |
| `monthlyToAnnual(amount)` | Convert monthly → annual | Annual $ amount |
| `formatIncomeThreshold(amount, freq)` | Format for display | Formatted string |
| `describeFPLPercentage(%)` | Get human description | Description string |

## Constants

### FPL Constants
- `FPL_YEAR` - Current year of data (2024)
- `FPL_2024_MONTHLY` - Base FPL values by household size
- `FPL_2024_PER_ADDITIONAL_PERSON` - Additional amount for households > 8

### Program-Specific Constants
- `SNAP_GROSS_INCOME_FPL_PERCENT` = 130
- `SNAP_NET_INCOME_FPL_PERCENT` = 100
- `SNAP_BBCE_FPL_PERCENT` = 200
- `MEDICAID_EXPANSION_FPL_PERCENT` = 138
- `MEDICAID_CHILDREN_PREGNANT_MIN_FPL_PERCENT` = 200
- `MEDICAID_DISABILITY_FPL_PERCENT` = 74
- `WIC_FPL_PERCENT` = 185

## Annual Updates

The Federal Poverty Guidelines are published annually by HHS (typically January/February). When new guidelines are released:

### Step 1: Update Base FPL Values

Edit `src/utils/benefitThresholds.ts`:

```typescript
export const FPL_2025_MONTHLY: Record<number, number> = {
  1: 1290, // Update with new values
  2: 1750, // Update with new values
  // ... etc
};

export const FPL_2025_PER_ADDITIONAL_PERSON = 460; // Update

export const FPL_YEAR = 2025; // Update year
```

### Step 2: Update SNAP Thresholds

Update the pre-calculated SNAP thresholds (130% of new FPL):

```typescript
export function getSNAPGrossIncomeLimit(householdSize: number): number {
  const thresholds: Record<number, number> = {
    1: 1677, // 130% of new FPL
    2: 2275, // 130% of new FPL
    // ... etc
  };
}
```

### Step 3: Update Medicaid Thresholds

Update the per-person limits in Medicaid functions:

```typescript
export function getMedicaidExpansionLimit(householdSize: number): number {
  const perPersonLimit = 2100; // 138% of new FPL for 1 person
  return perPersonLimit * householdSize;
}
```

### Step 4: Run Tests

```bash
npm run test -- src/utils/__tests__/benefitThresholds.test.ts
```

Verify all tests pass. Update test expectations if needed due to threshold changes.

### Step 5: Update Documentation

Update this file and any references in:
- Rule files (`src/rules/examples/*.json`)
- User-facing documentation
- Help text and explanations

## Data Sources

### Federal Poverty Guidelines
**Source:** U.S. Department of Health and Human Services (HHS)
**URL:** https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines
**Updated:** Annually in January/February

### SNAP Income Limits
**Source:** USDA Food and Nutrition Service
**URL:** https://www.fns.usda.gov/snap/recipient/eligibility
**Legal Reference:** 7 CFR § 273.9
**Note:** Based on 130% of FPL for gross income test

### Medicaid Eligibility
**Source:** Centers for Medicare & Medicaid Services
**URL:** https://www.medicaid.gov/medicaid/eligibility/index.html
**Legal References:**
- Expansion: 42 CFR § 435.119 (138% FPL)
- Children/Pregnant: 42 CFR § 435.116, 435.118 (200% FPL minimum)
- Disability: 42 CFR § 435.120, 435.121 (~74% FPL)

### WIC Income Limits
**Source:** USDA Food and Nutrition Service
**URL:** https://www.fns.usda.gov/wic
**Legal Reference:** 7 CFR § 246.7
**Note:** Based on 185% of FPL

## Important Notes

### Geographic Variations
- These thresholds use the **48 contiguous states + DC** poverty guidelines
- **Alaska** and **Hawaii** have higher poverty guidelines (not implemented)
- State-specific programs may have different thresholds

### State Variations
- **Medicaid**: Varies significantly by state (expansion vs. non-expansion)
- **SNAP BBCE**: Not all states use 200% FPL limit
- **CHIP**: Many states cover children above 200% FPL
- Always check state-specific rules for accurate determinations

### Program-Specific Rules
- **SNAP Net Income**: Calculated after allowable deductions
- **Medicaid Expansion**: Only in expansion states (40 states + DC as of 2024)
- **Categorical Eligibility**: Some recipients automatically qualify regardless of income
- **Special Populations**: Elderly, disabled, and other groups may have different rules

## Integration with Rule System

The benefit thresholds utility integrates with the rule evaluation system via custom operators in `src/rules/evaluator.ts`:

```typescript
// In evaluator.ts
import { getSNAPGrossIncomeLimit } from '@/utils/benefitThresholds';

export const BENEFIT_OPERATORS = {
  snap_income_eligible: (income: number, size: number): boolean => {
    const threshold = getSNAPGrossIncomeLimit(size);
    return income <= threshold;
  }
};
```

This allows rules to use consistent, centralized threshold calculations.

## Related Files

- **Implementation:** `src/utils/benefitThresholds.ts`
- **Tests:** `src/utils/__tests__/benefitThresholds.test.ts`
- **Rule Evaluator:** `src/rules/evaluator.ts`
- **Rule Examples:** `src/rules/examples/*.json`

## Questions?

For questions about specific thresholds or implementation details, refer to:
1. The legal references listed above
2. Official program websites
3. The test file for usage examples
4. The inline JSDoc documentation in the source file

