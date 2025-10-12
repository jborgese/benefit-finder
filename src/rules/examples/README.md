# Rule Examples

This directory contains example rule definitions and packages for testing and reference.

## Files

- **`snap-rules.json`** - Federal SNAP eligibility rules (example package)

## Using Example Rules

### Import Example Package

```typescript
import { importFromJSON } from '@/rules';
import snapRules from './examples/snap-rules.json';

const result = await importFromJSON(
  JSON.stringify(snapRules),
  { validate: true, skipTests: false }
);

console.log(`Imported ${result.imported} rules`);
```

### Test Example Rules

```typescript
import { runTestSuite, createTestSuite } from '@/rules';
import snapRules from './examples/snap-rules.json';

// Run embedded tests
for (const rule of snapRules.rules) {
  if (rule.testCases) {
    const suite = createTestSuite()
      .name(rule.name)
      .rule(rule.ruleLogic)
      .tests(rule.testCases)
      .build();

    const result = await runTestSuite(suite);
    console.log(`${rule.name}: ${result.passed}/${result.total} passed`);
  }
}
```

## Creating Your Own Rules

### Basic Rule Structure

```json
{
  "id": "unique-rule-id",
  "programId": "program-id",
  "name": "Rule Name",
  "description": "What this rule checks",
  "ruleLogic": {
    ">": [{ "var": "age" }, 18]
  },
  "version": {
    "major": 1,
    "minor": 0,
    "patch": 0
  },
  "active": true,
  "createdAt": 1697068800000,
  "updatedAt": 1697068800000
}
```

### With Test Cases

```json
{
  "id": "income-test",
  "programId": "snap-ga",
  "name": "Income Eligibility",
  "ruleLogic": {
    "<": [{ "var": "income" }, 50000]
  },
  "version": { "major": 1, "minor": 0, "patch": 0 },
  "active": true,
  "testCases": [
    {
      "id": "test-low-income",
      "description": "Low income should qualify",
      "input": { "income": 30000 },
      "expected": true
    },
    {
      "id": "test-high-income",
      "description": "High income should not qualify",
      "input": { "income": 60000 },
      "expected": false
    }
  ],
  "createdAt": 1697068800000,
  "updatedAt": 1697068800000
}
```

### Complete Package

```json
{
  "metadata": {
    "id": "my-rules-package",
    "name": "My Rules Package",
    "version": { "major": 1, "minor": 0, "patch": 0 },
    "createdAt": 1697068800000,
    "updatedAt": 1697068800000
  },
  "rules": [
    // ... array of rule definitions
  ],
  "checksum": "optional-sha256-checksum"
}
```

## Rule Validation

All rules are validated against the schema before import. See the schema documentation for complete field requirements:

- Required fields: `id`, `programId`, `name`, `ruleLogic`, `version`, `active`, `createdAt`, `updatedAt`
- Optional but recommended: `description`, `explanation`, `testCases`, `citations`, `requiredDocuments`

## Testing Rules

Every rule should include test cases covering:
- ✅ Typical eligible cases
- ✅ Typical ineligible cases
- ✅ Boundary conditions
- ✅ Edge cases
- ✅ Missing data scenarios

## Version Control

Rules use semantic versioning:
- **Major** (x.0.0) - Breaking changes to rule logic
- **Minor** (0.x.0) - New features, non-breaking changes
- **Patch** (0.0.x) - Bug fixes, clarifications

## Legal Citations

Always include citations for rule sources:

```json
{
  "citations": [
    {
      "title": "Official Program Rules",
      "url": "https://official-source.gov/rules",
      "legalReference": "42 USC § 1396a",
      "date": "2024-01-15"
    }
  ]
}
```

## Contributing Rules

When contributing new rules:

1. Research official sources
2. Create complete rule definition with all metadata
3. Write comprehensive test cases
4. Include proper citations
5. Test thoroughly before submission
6. Follow naming conventions

See the main README for contribution guidelines.

