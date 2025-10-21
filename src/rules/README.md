# Rule Engine Module

**Status:** ✅ Complete
**Last Updated:** October 12, 2025

## Overview

The Rule Engine module provides a comprehensive JSON Logic integration for evaluating benefit eligibility rules. It includes type-safe evaluation, validation, testing, and custom operators specifically designed for benefit programs.

## Features

### ✅ JSON Logic Integration
- Full support for JSON Logic specification
- TypeScript type definitions for rules and data
- Custom operator support
- Benefit-specific operators

### ✅ Rule Evaluation
- Asynchronous and synchronous evaluation
- Batch evaluation of multiple rules
- Performance monitoring
- Error handling with detailed error information
- Timeout protection
- Maximum depth protection

### ✅ Rule Validation
- Structural validation with Zod
- Operator validation (allowed/disallowed)
- Complexity scoring
- Depth analysis
- Variable extraction
- Circular reference detection

### ✅ Rule Testing Framework
- Test case execution
- Test suite management
- Boundary test generation
- Coverage reporting
- Fluent API for test building

## Directory Structure

The rules directory has been reorganized for better clarity and maintainability:

- **`core/`**: Contains all rule engine functionality (evaluator, validator, tester, etc.)
- **`federal/`**: Federal-level rules organized by benefit program (SNAP, Medicaid, TANF, WIC)
- **`state/`**: State-specific rules organized by state and program
- **`__tests__/`**: Test files for the rule engine

See [STRUCTURE.md](./STRUCTURE.md) for detailed organization information.

## Installation

The module is built-in. To use:

```typescript
import {
  evaluateRule,
  validateRule,
  testRule,
  registerBenefitOperators,
} from '@/rules';
```

## Quick Start

### Basic Rule Evaluation

```typescript
import { evaluateRule } from '@/rules';

// Define a rule
const rule = {
  and: [
    { '>': [{ var: 'age' }, 18] },
    { '<': [{ var: 'income' }, 50000] },
  ],
};

// Provide data
const data = {
  age: 25,
  income: 35000,
};

// Evaluate
const result = await evaluateRule(rule, data);

if (result.success) {
  console.log('Eligible:', result.result);
} else {
  console.error('Error:', result.error);
}
```

### Rule Validation

```typescript
import { validateRule } from '@/rules';

const rule = {
  '>': [{ var: 'age' }, 18],
};

const validation = validateRule(rule);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}

console.log('Complexity:', validation.complexity);
console.log('Operators:', validation.operators);
console.log('Variables:', validation.variables);
```

### Rule Testing

```typescript
import { createTestSuite, runTestSuite } from '@/rules';

const suite = createTestSuite()
  .name('Age Eligibility')
  .rule({ '>': [{ var: 'age' }, 18] })
  .test({
    description: 'Adult',
    input: { age: 25 },
    expected: true,
  })
  .test({
    description: 'Minor',
    input: { age: 15 },
    expected: false,
  })
  .build();

const result = await runTestSuite(suite);
console.log(`Passed: ${result.passed}/${result.total}`);
```

## Custom Operators

### Benefit-Specific Operators

The module includes custom operators for benefit eligibility:

```typescript
import { registerBenefitOperators, evaluateRule } from '@/rules';

// Register custom operators
registerBenefitOperators();

// Use custom operators
const rule = {
  and: [
    { between: [{ var: 'age' }, 18, 65] },
    { age_from_dob: [{ var: 'dob' }] },
    { matches_any: [{ var: 'citizenship' }, ['us_citizen', 'permanent_resident']] },
  ],
};
```

#### Available Custom Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `between` | Check if value is between min and max | `{ between: [value, min, max] }` |
| `within_percent` | Check if value is within percentage of target | `{ within_percent: [value, target, percent] }` |
| `age_from_dob` | Calculate age from date of birth | `{ age_from_dob: [dateString] }` |
| `date_in_past` | Check if date is in the past | `{ date_in_past: [dateString] }` |
| `date_in_future` | Check if date is in the future | `{ date_in_future: [dateString] }` |
| `matches_any` | Case-insensitive match against array | `{ matches_any: [value, array] }` |
| `count_true` | Count truthy values in array | `{ count_true: [array] }` |
| `all_true` | Check if all values are truthy | `{ all_true: [array] }` |
| `any_true` | Check if any value is truthy | `{ any_true: [array] }` |

## API Reference

### Evaluation

#### `evaluateRule(rule, data, options?)`

Evaluate a JSON Logic rule asynchronously.

**Parameters:**
- `rule: JsonLogicRule` - The rule to evaluate
- `data: JsonLogicData` - Data context
- `options?: RuleEvaluationOptions` - Evaluation options
  - `timeout?: number` - Timeout in milliseconds (default: 5000)
  - `measureTime?: boolean` - Measure execution time (default: true)
  - `captureContext?: boolean` - Capture data snapshot (default: false)
  - `customOperators?: Record<string, Function>` - Custom operators
  - `strict?: boolean` - Throw errors instead of returning them (default: false)
  - `maxDepth?: number` - Maximum recursion depth (default: 100)

**Returns:** `Promise<RuleEvaluationResult>`

```typescript
interface RuleEvaluationResult<T = boolean> {
  result: T;
  success: boolean;
  error?: string;
  errorDetails?: RuleEvaluationError;
  executionTime?: number;
  context?: JsonLogicData;
}
```

#### `evaluateRuleSync(rule, data)`

Evaluate a rule synchronously (use with caution).

#### `batchEvaluateRules(rules, data, options?)`

Evaluate multiple rules with the same data context.

### Validation

#### `validateRule(rule, options?)`

Validate a JSON Logic rule.

**Parameters:**
- `rule: unknown` - Rule to validate
- `options?: RuleValidationOptions` - Validation options
  - `allowedOperators?: string[]` - Allowed operators
  - `disallowedOperators?: string[]` - Disallowed operators
  - `maxComplexity?: number` - Maximum complexity (default: 100)
  - `maxDepth?: number` - Maximum depth (default: 20)
  - `requiredVariables?: string[]` - Required variables
  - `strict?: boolean` - Strict mode (default: false)

**Returns:** `RuleValidationResult`

```typescript
interface RuleValidationResult {
  valid: boolean;
  errors: RuleValidationError[];
  warnings: RuleValidationWarning[];
  complexity?: number;
  operators?: string[];
  variables?: string[];
}
```

#### `isValidRule(rule, options?)`

Quick boolean check for rule validity.

#### `sanitizeRule(rule, options?)`

Remove invalid or disallowed operations from a rule.

### Testing

#### `testRule(rule, testCase, options?)`

Test a rule with a single test case.

**Parameters:**
- `rule: JsonLogicRule` - Rule to test
- `testCase: RuleTestCase` - Test case
- `options?: RuleEvaluationOptions` - Evaluation options

**Returns:** `Promise<RuleTestResult>`

#### `runTestSuite(suite, options?)`

Run a complete test suite.

**Parameters:**
- `suite: RuleTestSuite` - Test suite
- `options?: RuleEvaluationOptions` - Evaluation options

**Returns:** `Promise<RuleTestSuiteResult>`

```typescript
interface RuleTestSuiteResult {
  name: string;
  total: number;
  passed: number;
  failed: number;
  results: RuleTestResult[];
  totalTime?: number;
  successRate: number;
}
```

#### `createTestSuite()`

Create a test suite with fluent API.

**Returns:** `TestSuiteBuilder`

```typescript
createTestSuite()
  .name('Suite Name')
  .rule({ '>': [{ var: 'age' }, 18] })
  .test({
    description: 'Test description',
    input: { age: 25 },
    expected: true,
  })
  .build();
```

## Examples

### SNAP Eligibility Rule

```typescript
import { evaluateRule, registerBenefitOperators } from '@/rules';

registerBenefitOperators();

const snapRule = {
  and: [
    // Age requirement: 18-65 or has children
    {
      or: [
        { between: [{ age_from_dob: [{ var: 'dateOfBirth' }] }, 18, 65] },
        { '==': [{ var: 'hasChildren' }, true] },
      ],
    },
    // Income requirement: below 130% of poverty line
    {
      '<': [
        { var: 'householdIncome' },
        { '*': [{ var: 'householdSize' }, 1500] },
      ],
    },
    // Citizenship requirement
    { matches_any: [{ var: 'citizenship' }, ['us_citizen', 'permanent_resident', 'refugee']] },
  ],
};

const applicant = {
  dateOfBirth: '1990-01-15',
  householdIncome: 3500,
  householdSize: 3,
  citizenship: 'us_citizen',
  hasChildren: false,
};

const result = await evaluateRule(snapRule, applicant);
console.log('Eligible for SNAP:', result.result);
```

### Complex Conditional Rule

```typescript
const medicaidRule = {
  if: [
    // Condition: Is pregnant
    { '==': [{ var: 'isPregnant' }, true] },
    // Then: Lower income threshold
    { '<': [{ var: 'householdIncome' }, 40000] },
    // Else: Check age and income
    {
      and: [
        { '<': [{ age_from_dob: [{ var: 'dateOfBirth' }] }, 19] },
        { '<': [{ var: 'householdIncome' }, 30000] },
      ],
    },
  ],
};
```

## Best Practices

### 1. Always Validate Rules First

```typescript
const validation = validateRule(rule);
if (!validation.valid) {
  console.error('Invalid rule:', validation.errors);
  return;
}

const result = await evaluateRule(rule, data);
```

### 2. Use Batch Evaluation for Multiple Rules

```typescript
// More efficient than evaluating individually
const results = await batchEvaluateRules(
  [rule1, rule2, rule3],
  data
);
```

### 3. Set Appropriate Timeouts

```typescript
// For complex rules, increase timeout
const result = await evaluateRule(rule, data, {
  timeout: 10000, // 10 seconds
});
```

### 4. Test Rules Thoroughly

```typescript
const suite = createTestSuite()
  .name('Income Eligibility')
  .rule(rule)
  .tests(generateBoundaryTests(rule, {
    income: { min: 0, max: 100000, boundary: 50000 },
  }))
  .build();

const results = await runTestSuite(suite);
```

### 5. Monitor Complexity

```typescript
const validation = validateRule(rule);
if (validation.complexity > 80) {
  console.warn('Rule is very complex, consider simplifying');
}
```

## Testing

Run rule engine tests:

```bash
npm test -- src/rules/__tests__
```

## Performance Considerations

- **Complexity**: Rules with complexity > 100 may impact performance
- **Depth**: Avoid nesting deeper than 10-15 levels
- **Batch Operations**: Use `batchEvaluateRules` for multiple rules
- **Custom Operators**: Register once, not per evaluation
- **Caching**: Consider caching evaluation results for identical inputs

## Security

- ✅ No `eval()` or code execution
- ✅ Timeout protection prevents infinite loops
- ✅ Depth limits prevent stack overflow
- ✅ Operator validation prevents unauthorized operations
- ✅ Input sanitization with Zod

## Rule Schema & Versioning

### Schema Features

- ✅ **Comprehensive Metadata** - Author, citations, tags, categories
- ✅ **Version Control** - Semantic versioning with changelog
- ✅ **Test Cases** - Embedded test cases for validation
- ✅ **Documentation** - Required documents and next steps
- ✅ **Import/Export** - JSON-based package format

### Version Management

```typescript
import {
  parseVersion,
  formatVersion,
  incrementVersion,
  compareVersions,
} from '@/rules';

// Parse version string
const version = parseVersion('1.2.3');
// { major: 1, minor: 2, patch: 3 }

// Format to string
const versionString = formatVersion(version);
// "1.2.3"

// Increment version
const newVersion = incrementVersion(version, 'minor');
// { major: 1, minor: 3, patch: 0 }

// Compare versions
compareVersions(v1, v2); // -1, 0, or 1
```

### Import/Export Rules

```typescript
import {
  importFromJSON,
  exportPackageToJSON,
  exportProgramRules,
} from '@/rules';

// Import rules from JSON
const result = await importFromJSON(
  jsonString,
  { validate: true, skipTests: false }
);

console.log(`Imported: ${result.imported}`);
console.log(`Failed: ${result.failed}`);

// Export rules for a program
const rules = await exportProgramRules('snap-federal');

// Export as package
const packageJson = await exportPackageToJSON(
  ['rule-1', 'rule-2'],
  'My Rules Package',
  { includeTests: true, pretty: true }
);
```

### Rule Migrations

```typescript
import {
  registerMigration,
  migrateRule,
  createRuleVersion,
} from '@/rules';

// Register a migration
registerMigration('snap-federal', {
  fromVersion: { major: 1, minor: 0, patch: 0 },
  toVersion: { major: 2, minor: 0, patch: 0 },
  description: 'Update income calculation',
  migrate: async (rule) => {
    // Transform rule logic
    return {
      ...rule,
      ruleLogic: updatedLogic,
    };
  },
});

// Migrate a rule
const migrated = await migrateRule(rule, targetVersion);
```

## Example Rules

See `src/rules/examples/` for complete rule examples:
- **`snap-rules.json`** - Federal SNAP eligibility rules

## Future Enhancements

- [ ] Rule visualization/flowchart generation
- [ ] Performance profiling per operator
- [ ] Rule optimization suggestions
- [ ] Machine learning for rule validation
- [ ] GraphQL query integration
- [ ] Automated migration generation

## Resources

- [JSON Logic Specification](http://jsonlogic.com/)
- [json-logic-js Documentation](https://github.com/jwadhams/json-logic-js)
- [BenefitFinder ROADMAP](../../ROADMAP.md)
- [Rule Examples](./examples/README.md)

---

**Module Complete:** October 12, 2025
**Status:** ✅ JSON Logic Integration & Rule Schema Design Complete
**Next Phase:** Core Rule Operations (evaluateEligibility, explainResult)

