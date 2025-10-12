# Rule Schema Specification

**Version:** 1.0.0
**Last Updated:** October 12, 2025

## Overview

This document defines the complete schema for benefit eligibility rules in BenefitFinder. All rules must conform to this schema for import, validation, and execution.

## Rule Definition Schema

### Minimal Required Rule

```json
{
  "id": "unique-rule-id",
  "programId": "program-id",
  "name": "Rule Name",
  "ruleLogic": { "var": "fieldName" },
  "version": { "major": 1, "minor": 0, "patch": 0 },
  "active": true,
  "createdAt": 1697068800000,
  "updatedAt": 1697068800000
}
```

### Complete Rule with All Fields

```json
{
  "id": "snap-federal-income-v1",
  "programId": "snap-federal",
  "name": "SNAP Federal Income Eligibility",
  "description": "Household gross income must be at or below 130% of federal poverty level",

  "ruleLogic": {
    "<=": [
      { "var": "householdIncome" },
      { "*": [{ "var": "householdSize" }, 1500] }
    ]
  },

  "ruleType": "eligibility",
  "explanation": "Your household's monthly income must be at or below the federal poverty guideline for your household size.",

  "requiredFields": ["householdIncome", "householdSize"],

  "requiredDocuments": [
    {
      "id": "proof-income",
      "name": "Proof of Income",
      "description": "Documentation of all household income",
      "required": true,
      "alternatives": ["Pay stubs", "W-2", "1099", "Tax returns"],
      "where": "Employer or IRS"
    }
  ],

  "nextSteps": [
    {
      "step": "Gather required documents",
      "priority": "high",
      "estimatedTime": "1-2 hours"
    },
    {
      "step": "Complete online application",
      "url": "https://www.fns.usda.gov/snap/state-directory",
      "priority": "high",
      "estimatedTime": "30-45 minutes"
    }
  ],

  "version": {
    "major": 1,
    "minor": 0,
    "patch": 0,
    "label": "stable"
  },

  "effectiveDate": 1697068800000,
  "expirationDate": null,
  "supersedes": null,

  "author": {
    "name": "BenefitFinder Team",
    "email": "rules@benefitfinder.org",
    "organization": "BenefitFinder"
  },

  "citations": [
    {
      "title": "SNAP Eligibility Requirements",
      "url": "https://www.fns.usda.gov/snap/recipient/eligibility",
      "document": "SNAP Regulations",
      "date": "2024-01-01",
      "legalReference": "7 CFR § 273.9",
      "notes": "Federal poverty guidelines updated annually"
    }
  ],

  "source": "https://www.fns.usda.gov/snap/recipient/eligibility",
  "legalReference": "7 CFR § 273.9",

  "active": true,
  "draft": false,
  "priority": 10,

  "testCases": [
    {
      "id": "test-eligible-single",
      "description": "Single person with qualifying income",
      "input": { "householdIncome": 1200, "householdSize": 1 },
      "expected": true,
      "tags": ["eligible", "single"]
    },
    {
      "id": "test-ineligible-family",
      "description": "Family with income above threshold",
      "input": { "householdIncome": 6000, "householdSize": 3 },
      "expected": false,
      "tags": ["ineligible", "family"]
    }
  ],

  "changelog": [
    {
      "version": { "major": 1, "minor": 0, "patch": 0 },
      "date": 1697068800000,
      "author": "admin",
      "description": "Initial rule creation based on 2024 federal guidelines",
      "breaking": false
    }
  ],

  "createdAt": 1697068800000,
  "updatedAt": 1697068800000,
  "createdBy": "admin",

  "tags": ["income", "federal", "snap"],
  "category": "financial-eligibility",
  "jurisdiction": "US-FEDERAL",

  "metadata": {
    "lastReviewed": 1697068800000,
    "nextReview": 1728604800000,
    "reviewFrequency": "annual"
  }
}
```

## Field Specifications

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string(128) | Unique identifier |
| `programId` | string(128) | Associated program |
| `name` | string(200) | Display name |
| `ruleLogic` | object | JSON Logic rule |
| `version` | object | Semantic version |
| `active` | boolean | Is rule active |
| `createdAt` | number | Creation timestamp |
| `updatedAt` | number | Last update timestamp |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string(2000) | Technical description |
| `explanation` | string(2000) | User-friendly explanation |
| `ruleType` | enum | Type of rule |
| `requiredFields` | array | Needed profile fields |
| `requiredDocuments` | array | Required documents |
| `nextSteps` | array | Post-eligibility steps |
| `effectiveDate` | number | When rule activates |
| `expirationDate` | number | When rule expires |
| `supersedes` | string | Previous rule ID |
| `author` | object | Author information |
| `citations` | array | Source citations |
| `testCases` | array | Embedded tests |
| `changelog` | array | Version history |
| `tags` | array | Organization tags |
| `metadata` | object | Custom metadata |

## Version Schema

### Semantic Versioning

```typescript
{
  "major": number,  // Breaking changes
  "minor": number,  // New features, non-breaking
  "patch": number,  // Bug fixes
  "label": string?  // Optional label (beta, alpha, etc.)
}
```

### Version Format

- Standard: `"1.2.3"`
- With label: `"2.0.0-beta"`
- Draft: `"0.1.0-draft"`

### Version Increment Rules

| Change Type | Increment | Example |
|-------------|-----------|---------|
| Bug fix, typo | Patch | 1.0.0 → 1.0.1 |
| New test case, docs | Minor | 1.0.0 → 1.1.0 |
| Logic change | Major | 1.0.0 → 2.0.0 |

## Rule Package Schema

### Package Structure

```json
{
  "metadata": {
    "id": "package-id",
    "name": "Package Name",
    "description": "What this package contains",
    "version": { "major": 1, "minor": 0, "patch": 0 },
    "author": {
      "name": "Author",
      "organization": "Org"
    },
    "jurisdiction": "US-GA",
    "programs": ["snap-ga", "medicaid-ga"],
    "tags": ["georgia", "2024"],
    "createdAt": 1697068800000,
    "updatedAt": 1697068800000
  },
  "rules": [
    // Array of RuleDefinition objects
  ],
  "checksum": "sha256-hash"
}
```

## Validation Rules

### Rule Logic Validation

1. **Structure**: Must be valid JSON Logic
2. **Operators**: Must use allowed operators only
3. **Depth**: Maximum 20 levels of nesting
4. **Complexity**: Score must be < 100
5. **Variables**: Must reference valid profile fields

### Metadata Validation

1. **ID**: Must be unique, alphanumeric with hyphens
2. **Version**: Must follow semver format
3. **Dates**: effectiveDate < expirationDate
4. **Citations**: URLs must be valid
5. **Tests**: Must include at least 1 test case (recommended)

## Import Options

```typescript
{
  mode: 'create' | 'update' | 'upsert' | 'replace',
  validate: boolean,        // Validate before import
  skipTests: boolean,       // Skip test execution
  overwriteExisting: boolean, // Overwrite existing rules
  dryRun: boolean,         // Simulate without saving
}
```

### Import Modes

- **create**: Only create new rules, error if exists
- **update**: Only update existing rules, skip if not exists
- **upsert**: Create or update as needed
- **replace**: Delete existing and create new

## Export Options

```typescript
{
  format: 'json' | 'yaml' | 'package',
  includeTests: boolean,    // Include test cases
  includeMetadata: boolean, // Include all metadata
  minify: boolean,         // Minify JSON
  pretty: boolean,         // Pretty print
}
```

## Migration System

### Migration Definition

```typescript
{
  fromVersion: { major: 1, minor: 0, patch: 0 },
  toVersion: { major: 2, minor: 0, patch: 0 },
  description: "What changed",
  migrate: async (rule) => {
    // Transform rule
    return transformedRule;
  }
}
```

### Registering Migrations

```typescript
import { registerMigration } from '@/rules';

registerMigration('snap-federal', {
  fromVersion: { major: 1, minor: 0, patch: 0 },
  toVersion: { major: 2, minor: 0, patch: 0 },
  description: 'Updated income calculation method',
  migrate: async (rule) => {
    // Update ruleLogic
    return {
      ...rule,
      ruleLogic: newLogic,
      changelog: [...rule.changelog, changeRecord],
    };
  },
});
```

## File Formats

### .bfrule (Single Rule)

JSON file containing a single `RuleDefinition` object.

```json
{
  "id": "...",
  "programId": "...",
  // ... full rule definition
}
```

### .bfrules (Rule Package)

JSON file containing a `RulePackage` object with multiple rules.

```json
{
  "metadata": { /* package metadata */ },
  "rules": [ /* array of rules */ ],
  "checksum": "..."
}
```

## Validation Error Codes

| Code | Description |
|------|-------------|
| `VAL_INVALID_STRUCTURE` | Invalid JSON structure |
| `VAL_UNKNOWN_OPERATOR` | Unknown JSON Logic operator |
| `VAL_DISALLOWED_OPERATOR` | Operator not allowed |
| `VAL_MAX_DEPTH` | Nesting too deep |
| `VAL_MAX_COMPLEXITY` | Rule too complex |
| `VAL_MISSING_VARIABLE` | Required variable not found |
| `VAL_CIRCULAR_REFERENCE` | Circular reference detected |

## Import Error Codes

| Code | Description |
|------|-------------|
| `IMPORT_INVALID_FORMAT` | Invalid file format |
| `IMPORT_VALIDATION_FAILED` | Validation failed |
| `IMPORT_DUPLICATE_ID` | Rule ID already exists |
| `IMPORT_MISSING_PROGRAM` | Program not found |
| `IMPORT_TEST_FAILED` | Test cases failed |
| `IMPORT_VERSION_CONFLICT` | Version conflict |
| `IMPORT_CHECKSUM_MISMATCH` | Package corrupted |

## Examples

See `src/rules/examples/` for complete examples:
- Federal SNAP eligibility rules
- Rule packages with metadata
- Test cases and validation

## Schema Versioning

This schema specification itself is versioned:

- **Current Version:** 1.0.0
- **Breaking Changes:** Will increment major version
- **Additions:** Will increment minor version

---

**Document Version:** 1.0.0
**Specification Complete:** October 12, 2025

