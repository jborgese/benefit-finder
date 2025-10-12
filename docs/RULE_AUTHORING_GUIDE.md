# Rule Authoring Guide

**Version:** 1.0
**Last Updated:** October 12, 2025

This guide explains how to research, author, validate, and maintain benefit eligibility rules for BenefitFinder.

---

## Table of Contents

1. [Overview](#overview)
2. [Rule Research Process](#rule-research-process)
3. [Rule Structure](#rule-structure)
4. [JSON Logic Basics](#json-logic-basics)
5. [Authoring Workflow](#authoring-workflow)
6. [Testing Rules](#testing-rules)
7. [Source Citations](#source-citations)
8. [Rule Maintenance](#rule-maintenance)
9. [Examples](#examples)

---

## Overview

BenefitFinder rules are **static, researched data** encoded as JSON Logic rules. They are:

- ✅ **Privacy-preserving**: No API calls to external services
- ✅ **Offline-first**: All evaluation happens locally
- ✅ **Verifiable**: Rules include source citations and legal references
- ✅ **Testable**: Each rule includes test cases for validation
- ✅ **Versioned**: Rules track changes over time

**Important**: Rules are NOT fetched from APIs. They are researched from official sources and encoded as static JSON files.

---

## Rule Research Process

### Step 1: Identify Official Sources

Always use authoritative government sources:

**Federal Programs:**
- SNAP: [fns.usda.gov/snap](https://www.fns.usda.gov/snap/recipient/eligibility)
- Medicaid: [medicaid.gov](https://www.medicaid.gov/medicaid/eligibility/index.html)
- WIC: [fns.usda.gov/wic](https://www.fns.usda.gov/wic)
- Benefits.gov program database

**State Programs:**
- State Department of Health and Human Services websites
- State-specific program portals
- Published state eligibility manuals

**Legal References:**
- Code of Federal Regulations (CFR)
- United States Code (USC)
- State statutes and regulations

### Step 2: Document Eligibility Criteria

Extract clear eligibility requirements:

1. **Income thresholds** (gross/net income limits)
2. **Asset limits** (resource tests)
3. **Categorical requirements** (citizenship, residency, etc.)
4. **Age requirements**
5. **Disability status**
6. **Work requirements**
7. **Household composition rules**
8. **Benefit amount calculations**

### Step 3: Note Policy Changes

- Check for recent updates or policy changes
- Note effective dates for rule changes
- Document which version of rules supersede previous versions
- Track which rules expire or sunset

### Step 4: Collect Supporting Documentation

- Save PDFs of source materials
- Screenshot relevant sections
- Note publication dates
- Record legal citation references

---

## Rule Structure

Each rule package contains:

```typescript
{
  metadata: {
    id: string,           // e.g., "snap-federal-rules-2024"
    name: string,         // e.g., "SNAP Federal Eligibility Rules"
    description: string,
    version: {
      major: number,
      minor: number,
      patch: number
    },
    author: {
      name: string,
      organization: string
    },
    jurisdiction: string, // e.g., "US-FEDERAL", "US-CA", "US-GA"
    programs: string[],   // e.g., ["snap-federal"]
    tags: string[],
    createdAt: number,
    updatedAt: number
  },
  rules: RuleDefinition[]
}
```

### Rule Definition Structure

Each individual rule contains:

```typescript
{
  // Identification
  id: string,                    // e.g., "snap-federal-gross-income"
  programId: string,             // e.g., "snap-federal"
  name: string,
  description: string,

  // Logic (JSON Logic format)
  ruleLogic: JsonLogicRule,      // The actual eligibility logic

  // Classification
  ruleType: "eligibility" | "benefit_amount" | "document_requirements" | "conditional",

  // Human-readable explanation
  explanation: string,

  // Data requirements
  requiredFields: string[],      // Profile fields needed

  // Documents
  requiredDocuments: DocumentRequirement[],

  // Next steps
  nextSteps: NextStep[],

  // Versioning
  version: RuleVersion,
  effectiveDate?: number,
  expirationDate?: number,
  supersedes?: string,           // Previous rule ID

  // Source & Attribution
  author?: RuleAuthor,
  citations: RuleCitation[],     // REQUIRED: Where rule came from
  source?: string,               // Primary source URL
  legalReference?: string,       // e.g., "7 CFR § 273.9"

  // Status
  active: boolean,
  draft: boolean,
  priority: number,              // Higher = evaluated first

  // Testing
  testCases: EmbeddedTestCase[],

  // Metadata
  createdAt: number,
  updatedAt: number,
  tags: string[],
  category: string,
  jurisdiction?: string
}
```

---

## JSON Logic Basics

BenefitFinder uses [json-logic-js](http://jsonlogic.com/) for rule evaluation.

### Common Operators

#### Comparison
```json
{ "==": [{ "var": "age" }, 18] }              // age equals 18
{ "!=": [{ "var": "status" }, "inactive"] }   // status not equals inactive
{ ">": [{ "var": "income" }, 1000] }          // income > 1000
{ ">=": [{ "var": "income" }, 1000] }         // income >= 1000
{ "<": [{ "var": "age" }, 65] }               // age < 65
{ "<=": [{ "var": "income" }, 2000] }         // income <= 2000
```

#### Logical
```json
{ "and": [rule1, rule2, rule3] }              // All must be true
{ "or": [rule1, rule2] }                      // At least one true
{ "!": rule }                                  // NOT (negate)
{ "if": [condition, thenValue, elseValue] }   // Conditional
```

#### Arithmetic
```json
{ "+": [10, 20, 30] }                         // Sum: 60
{ "-": [100, 25] }                            // Subtract: 75
{ "*": [5, 10] }                              // Multiply: 50
{ "/": [100, 4] }                             // Divide: 25
{ "%": [10, 3] }                              // Modulo: 1
```

#### Arrays
```json
{ "in": ["apple", { "var": "fruits" }] }      // Check if value in array
{ "map": [array, rule] }                      // Transform array
{ "filter": [array, rule] }                   // Filter array
{ "all": [array, rule] }                      // All items match
{ "some": [array, rule] }                     // Some items match
```

### Variable References

Use `{ "var": "fieldName" }` to reference data:

```json
{ "var": "householdIncome" }                  // Top-level field
{ "var": "household.size" }                   // Nested field
{ "var": ["age", 0] }                         // With default value
```

### Example: SNAP Gross Income Test

**Rule**: Household gross income ≤ 130% of Federal Poverty Level

```json
{
  "<=": [
    { "var": "householdIncome" },
    {
      "*": [
        { "var": "householdSize" },
        1923  // 130% FPL per person (2024)
      ]
    }
  ]
}
```

### Example: Citizenship Check

**Rule**: Must be US citizen, permanent resident, refugee, or asylee

```json
{
  "in": [
    { "var": "citizenship" },
    ["us_citizen", "permanent_resident", "refugee", "asylee"]
  ]
}
```

### Example: Complex Combined Rule

**Rule**: Eligible if (income < limit AND citizen) OR (disabled AND age >= 65)

```json
{
  "or": [
    {
      "and": [
        { "<=": [{ "var": "income" }, 2000] },
        { "==": [{ "var": "citizenship" }, "us_citizen"] }
      ]
    },
    {
      "and": [
        { "==": [{ "var": "disabled" }, true] },
        { ">=": [{ "var": "age" }, 65] }
      ]
    }
  ]
}
```

---

## Authoring Workflow

### 1. Create Rule File

Create a new JSON file in `src/rules/examples/`:

```
src/rules/examples/
  ├── snap-rules.json        (existing example)
  ├── medicaid-federal-rules.json
  ├── wic-federal-rules.json
  └── snap-california-rules.json
```

### 2. Start with Metadata

```json
{
  "metadata": {
    "id": "medicaid-federal-rules-2024",
    "name": "Medicaid Federal Eligibility Rules",
    "description": "Federal baseline Medicaid eligibility rules for 2024",
    "version": {
      "major": 1,
      "minor": 0,
      "patch": 0
    },
    "author": {
      "name": "Your Name",
      "organization": "BenefitFinder"
    },
    "jurisdiction": "US-FEDERAL",
    "programs": ["medicaid-federal"],
    "tags": ["medicaid", "healthcare", "federal", "2024"],
    "createdAt": 1697068800000,
    "updatedAt": 1697068800000
  },
  "rules": []
}
```

### 3. Add Individual Rules

For each eligibility criterion, create a rule:

```json
{
  "id": "medicaid-federal-income-limit",
  "programId": "medicaid-federal",
  "name": "Medicaid Income Limit",
  "description": "Income must be at or below 138% FPL for expansion states",
  "ruleLogic": {
    "<=": [
      { "var": "householdIncome" },
      { "*": [{ "var": "householdSize" }, 2040] }
    ]
  },
  "ruleType": "eligibility",
  "explanation": "In Medicaid expansion states, adults under 65 can qualify if household income is at or below 138% of the federal poverty level.",
  "requiredFields": ["householdIncome", "householdSize"],
  "requiredDocuments": [
    {
      "id": "proof-income",
      "name": "Proof of Income",
      "description": "Pay stubs, tax returns, or benefit statements",
      "required": true,
      "alternatives": ["W-2", "1099", "Bank statements"],
      "where": "Employer or bank"
    }
  ],
  "version": { "major": 1, "minor": 0, "patch": 0 },
  "citations": [
    {
      "title": "Medicaid Eligibility",
      "url": "https://www.medicaid.gov/medicaid/eligibility/index.html",
      "legalReference": "42 CFR § 435.119"
    }
  ],
  "active": true,
  "draft": false,
  "priority": 10,
  "testCases": [
    {
      "id": "test-eligible-single",
      "description": "Single person with low income",
      "input": { "householdIncome": 1500, "householdSize": 1 },
      "expected": true,
      "tags": ["eligible"]
    },
    {
      "id": "test-ineligible-high-income",
      "description": "Single person with high income",
      "input": { "householdIncome": 5000, "householdSize": 1 },
      "expected": false,
      "tags": ["ineligible"]
    }
  ],
  "createdAt": 1697068800000,
  "updatedAt": 1697068800000,
  "tags": ["income", "poverty-level"],
  "category": "financial-eligibility"
}
```

### 4. Add Source Citations

**Always include citations** for traceability:

```json
"citations": [
  {
    "title": "SNAP Eligibility Requirements",
    "url": "https://www.fns.usda.gov/snap/recipient/eligibility",
    "legalReference": "7 CFR § 273.9",
    "date": "2024-10-01",
    "notes": "Retrieved from FNS official website"
  }
]
```

### 5. Write Test Cases

Include at least 3 test cases per rule:
1. Eligible case
2. Ineligible case
3. Boundary/edge case

```json
"testCases": [
  {
    "id": "test-eligible",
    "description": "Should pass eligibility",
    "input": { /* test data */ },
    "expected": true,
    "tags": ["eligible", "baseline"]
  },
  {
    "id": "test-ineligible",
    "description": "Should fail eligibility",
    "input": { /* test data */ },
    "expected": false,
    "tags": ["ineligible"]
  },
  {
    "id": "test-boundary",
    "description": "Edge case at exact threshold",
    "input": { /* test data */ },
    "expected": true,
    "tags": ["boundary", "edge-case"]
  }
]
```

---

## Testing Rules

### Validate Rule Structure

```typescript
import { validateRuleDefinition } from '@/rules/schema';

const result = validateRuleDefinition(myRule);
if (!result.success) {
  console.error('Validation errors:', result.error);
}
```

### Run Rule Tests

```typescript
import { testRule } from '@/rules/tester';

const testResults = await testRule(myRule);
console.log(`Passed: ${testResults.passed}/${testResults.total}`);
```

### Test Rule Logic

```typescript
import { evaluateRule } from '@/rules/evaluator';

const result = evaluateRule(
  myRule.ruleLogic,
  { householdIncome: 2000, householdSize: 3 }
);
console.log('Eligible:', result.result);
```

---

## Source Citations

### Required Citation Elements

Every rule must include:

1. **Title**: Human-readable name of source
2. **URL**: Link to official source (if available)
3. **Legal Reference**: CFR/USC citation (if applicable)
4. **Date**: When information was retrieved/published

### Citation Examples

#### Federal Regulation
```json
{
  "title": "SNAP Eligibility Requirements",
  "url": "https://www.fns.usda.gov/snap/recipient/eligibility",
  "legalReference": "7 CFR § 273.9",
  "date": "2024-10-01"
}
```

#### State Manual
```json
{
  "title": "California CalFresh Eligibility Handbook",
  "url": "https://www.cdss.ca.gov/calfresh",
  "document": "CalFresh Handbook Section 63-300",
  "date": "2024-09-15"
}
```

#### Legal Statute
```json
{
  "title": "Social Security Act Title XIX",
  "legalReference": "42 USC § 1396a",
  "url": "https://www.ssa.gov/OP_Home/ssact/title19/1900.htm",
  "date": "2024-01-01"
}
```

---

## Rule Maintenance

### When to Update Rules

Update rules when:
- ✅ Policy changes are announced
- ✅ Federal poverty levels are updated (annually)
- ✅ Benefit amounts change
- ✅ Legal requirements change
- ✅ Errors are discovered in existing rules

### Update Process

1. **Research the change**
   - Find official announcement
   - Note effective date
   - Document what changed

2. **Create new rule version**
   - Increment version number (major.minor.patch)
   - Set `effectiveDate` to when rule becomes active
   - Set `supersedes` to previous rule ID
   - Update `updatedAt` timestamp

3. **Add to changelog**
   ```json
   "changelog": [
     {
       "version": { "major": 1, "minor": 1, "patch": 0 },
       "date": 1697068800000,
       "author": "Your Name",
       "description": "Updated income thresholds for 2024 FPL",
       "breaking": false
     }
   ]
   ```

4. **Update citations**
   - Add new source citations
   - Update dates
   - Keep old citations for historical reference

5. **Update tests**
   - Update test cases for new thresholds
   - Add tests for changed behavior
   - Keep old tests with tags

6. **Validate**
   - Run all tests
   - Validate schema
   - Check for breaking changes

### Version Numbering

Follow semantic versioning:

- **Major** (X.0.0): Breaking changes, major policy overhaul
- **Minor** (1.X.0): New criteria added, non-breaking changes
- **Patch** (1.0.X): Corrections, threshold updates, clarifications

Examples:
- Update poverty level thresholds: `1.0.0` → `1.0.1`
- Add new eligibility category: `1.0.1` → `1.1.0`
- Complete rule overhaul: `1.1.0` → `2.0.0`

### Rule Lifecycle

```
Draft → Active → Superseded → Archived

draft: true, active: false    // In development
draft: false, active: true    // Currently in use
draft: false, active: false   // Superseded by newer version
                              // (set expirationDate)
```

---

## Examples

### Complete Example: SNAP Asset Test

```json
{
  "id": "snap-federal-asset-limit",
  "programId": "snap-federal",
  "name": "SNAP Asset Limit",
  "description": "Households must have countable resources below $2,750 ($4,250 if elderly/disabled)",
  "ruleLogic": {
    "or": [
      {
        "and": [
          { "<=": [{ "var": "householdAssets" }, 2750] },
          { "!": { "var": "hasElderlyOrDisabled" } }
        ]
      },
      {
        "and": [
          { "<=": [{ "var": "householdAssets" }, 4250] },
          { "var": "hasElderlyOrDisabled" }
        ]
      }
    ]
  },
  "ruleType": "eligibility",
  "explanation": "SNAP has an asset test. Most households can have up to $2,750 in countable resources. If the household includes someone 60+ or disabled, the limit is $4,250. Countable resources include bank accounts, stocks, and bonds, but NOT your home or retirement accounts.",
  "requiredFields": ["householdAssets", "hasElderlyOrDisabled"],
  "requiredDocuments": [
    {
      "id": "proof-assets",
      "name": "Proof of Assets",
      "description": "Bank statements, investment account statements",
      "required": true,
      "alternatives": ["Bank letter", "Brokerage statements"],
      "where": "Your bank or financial institution"
    }
  ],
  "version": { "major": 1, "minor": 0, "patch": 0 },
  "citations": [
    {
      "title": "SNAP Resource Limits",
      "url": "https://www.fns.usda.gov/snap/recipient/eligibility#Resources",
      "legalReference": "7 CFR § 273.8",
      "date": "2024-10-01"
    }
  ],
  "active": true,
  "draft": false,
  "priority": 15,
  "testCases": [
    {
      "id": "test-regular-below-limit",
      "description": "Regular household below asset limit",
      "input": {
        "householdAssets": 2000,
        "hasElderlyOrDisabled": false
      },
      "expected": true,
      "tags": ["eligible", "regular-household"]
    },
    {
      "id": "test-regular-above-limit",
      "description": "Regular household above asset limit",
      "input": {
        "householdAssets": 3000,
        "hasElderlyOrDisabled": false
      },
      "expected": false,
      "tags": ["ineligible", "above-limit"]
    },
    {
      "id": "test-elderly-below-higher-limit",
      "description": "Elderly household below higher limit",
      "input": {
        "householdAssets": 4000,
        "hasElderlyOrDisabled": true
      },
      "expected": true,
      "tags": ["eligible", "elderly-disabled"]
    },
    {
      "id": "test-elderly-above-higher-limit",
      "description": "Elderly household above higher limit",
      "input": {
        "householdAssets": 5000,
        "hasElderlyOrDisabled": true
      },
      "expected": false,
      "tags": ["ineligible", "above-limit"]
    },
    {
      "id": "test-boundary-regular",
      "description": "Regular household at exact limit",
      "input": {
        "householdAssets": 2750,
        "hasElderlyOrDisabled": false
      },
      "expected": true,
      "tags": ["boundary", "edge-case"]
    }
  ],
  "createdAt": 1697068800000,
  "updatedAt": 1697068800000,
  "tags": ["assets", "resources", "elderly", "disabled"],
  "category": "financial-eligibility",
  "jurisdiction": "US-FEDERAL"
}
```

---

## Best Practices

### Do's ✅

- **Always cite sources** with URLs and legal references
- **Write clear explanations** in plain language
- **Include comprehensive test cases**
- **Use realistic test data** based on actual scenarios
- **Document thresholds and limits** with comments
- **Keep rules focused** (one criterion per rule when possible)
- **Version rules properly** when updating
- **Test edge cases** and boundary conditions

### Don'ts ❌

- **Never hardcode dates** that will become stale
- **Avoid overly complex nested logic** (break into multiple rules)
- **Don't guess at thresholds** (always verify)
- **Don't skip citations** (traceability is critical)
- **Never use external API calls** in rule logic
- **Don't create rules without test cases**
- **Avoid abbreviations** in explanations (use plain language)

---

## Resources

### Federal Eligibility Information

- **SNAP**: https://www.fns.usda.gov/snap/recipient/eligibility
- **Medicaid**: https://www.medicaid.gov/medicaid/eligibility/
- **WIC**: https://www.fns.usda.gov/wic/wic-eligibility-requirements
- **Federal Poverty Guidelines**: https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines

### Legal References

- **Code of Federal Regulations**: https://www.ecfr.gov/
- **United States Code**: https://uscode.house.gov/

### BenefitFinder Documentation

- Rule Schema: `docs/RULE_SCHEMA.md`
- Rule Engine: `docs/RULE_ENGINE_COMPLETE.md`
- Type Definitions: `src/types/README.md`

---

## Questions?

For questions about rule authoring:
1. Check existing examples in `src/rules/examples/`
2. Review test cases in `src/rules/__tests__/`
3. Open a GitHub discussion
4. Contact maintainers

---

**Remember**: Rules are living documents that require periodic maintenance. Set calendar reminders to check for policy updates, especially:
- **January**: Federal Poverty Guidelines update
- **October**: Federal fiscal year changes
- **Quarterly**: State policy review

