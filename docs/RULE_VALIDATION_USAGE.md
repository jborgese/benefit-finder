# Rule Validation Usage Guide

This guide explains how to use the rule validation and testing utilities.

---

## Overview

The `validate-rules` script validates rule files and runs their embedded test cases to ensure:
- Rule structure is valid (matches schema)
- JSON Logic is well-formed
- All test cases pass
- Citations and metadata are present
- No duplicate rule IDs exist

---

## Installation

First, ensure dependencies are installed:

```bash
npm install
```

The script requires:
- `json-logic-js` - For evaluating rules
- `zod` - For schema validation
- `tsx` - For running TypeScript scripts

---

## Usage

### Validate All Rules

Validate all rule files in `src/rules/examples/`:

```bash
npm run validate-rules
```

### Validate Specific File

Validate a specific rule file:

```bash
npm run validate-rules src/rules/examples/snap-federal-rules.json
```

### Validate Multiple Files

```bash
npm run validate-rules src/rules/examples/snap-federal-rules.json src/rules/examples/medicaid-federal-rules.json
```

---

## Output Examples

### Successful Validation

```
Validating 3 rule file(s)...

═══════════════════════════════════════════════════
File: src/rules/examples/snap-federal-rules.json
═══════════════════════════════════════════════════

✓ Structure: VALID
  Rules: 7

Test Results:
  Total Rules: 7
  Total Tests: 24
  ✓ All tests passed (24/24)

═══════════════════════════════════════════════════
SUMMARY
═══════════════════════════════════════════════════

Files: 3/3 valid
Rules: 18 total
Tests: 67/67 passed

✓ All validations passed!
```

### Validation with Warnings

```
═══════════════════════════════════════════════════
File: src/rules/examples/snap-federal-rules.json
═══════════════════════════════════════════════════

✓ Structure: VALID
  Rules: 7

Warnings (2):
  1. Rule snap-federal-work-requirement has no citations
  2. Rule snap-federal-asset-limit has no test cases
```

### Failed Validation

```
═══════════════════════════════════════════════════
File: src/rules/examples/broken-rules.json
═══════════════════════════════════════════════════

✗ Structure: INVALID
  Rules: 3

Errors (2):
  1. rules.0.ruleLogic: Required
  2. Duplicate rule ID: snap-federal-gross-income

Test Results:
  Total Rules: 3
  Total Tests: 8
  ✓ Passed: 6
  ✗ Failed: 2

Failed Tests:

  SNAP Gross Income Test (snap-federal-gross-income)
    ✗ 3-person household at exact limit
      Test ID: test-boundary-3-person
      Expected: true
      Actual: false
```

---

## What Gets Validated

### 1. Structure Validation

Checks that the rule package matches the expected schema:
- ✅ Metadata is complete and well-formed
- ✅ Version numbers are valid
- ✅ All required fields are present
- ✅ Field types are correct (strings, numbers, booleans)
- ✅ URLs are properly formatted
- ✅ Dates are valid timestamps

### 2. Rule Logic Validation

Checks individual rules:
- ✅ JSON Logic is valid and well-formed
- ✅ No duplicate rule IDs
- ✅ Citations are present
- ✅ Required fields are specified
- ✅ Version information is complete

### 3. Test Execution

Runs all embedded test cases:
- ✅ Evaluates rule logic with test inputs
- ✅ Compares actual results to expected results
- ✅ Reports which tests passed/failed
- ✅ Shows detailed failure information

### 4. Quality Checks (Warnings)

Non-critical issues:
- ⚠️ Rules without citations
- ⚠️ Rules without test cases
- ⚠️ Draft rules marked as active
- ⚠️ Missing documentation fields

---

## Interpreting Results

### Exit Codes

- `0` - All validations passed
- `1` - One or more validations failed

Use in CI/CD:
```bash
npm run validate-rules || exit 1
```

### Error Types

**Structure Errors** (Must Fix):
- Invalid schema
- Missing required fields
- Invalid data types
- Duplicate IDs

**Test Failures** (Must Fix):
- Rule logic doesn't match expected behavior
- Test cases need updating
- JSON Logic errors

**Warnings** (Should Fix):
- Missing documentation
- Best practice violations
- Quality issues

---

## Integration with Development Workflow

### Pre-Commit Hook

Add to `.git/hooks/pre-commit`:
```bash
#!/bin/sh
npm run validate-rules
if [ $? -ne 0 ]; then
  echo "Rule validation failed. Commit aborted."
  exit 1
fi
```

### CI/CD Pipeline

Add to GitHub Actions (`.github/workflows/validate-rules.yml`):
```yaml
name: Validate Rules
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run validate-rules
```

### Before Releasing

Always validate before creating a release:
```bash
# 1. Validate all rules
npm run validate-rules

# 2. Run all tests
npm run test

# 3. Build
npm run build

# 4. Create release
git tag v1.1.0
git push origin v1.1.0
```

---

## Troubleshooting

### Common Issues

**Issue**: `Cannot find module 'tsx'`
**Solution**: Install dev dependencies: `npm install --save-dev tsx`

**Issue**: Test fails with "Cannot read property 'var' of undefined"
**Solution**: Check that `ruleLogic` is properly formatted JSON Logic

**Issue**: "Duplicate rule ID" error
**Solution**: Ensure each rule has a unique `id` field

**Issue**: Citation URL validation fails
**Solution**: Ensure URLs are complete (include `https://`) and properly formatted

### Debugging Failed Tests

1. **Check the test input data**:
   - Does it include all `requiredFields`?
   - Are values in the correct format?

2. **Test the rule logic separately**:
   ```typescript
   import jsonLogic from 'json-logic-js';

   const result = jsonLogic.apply(
     rule.ruleLogic,
     testCase.input
   );
   console.log('Result:', result);
   console.log('Expected:', testCase.expected);
   ```

3. **Use the debug tool**:
   ```typescript
   import { debugRule } from '@/rules/debug';

   const debugInfo = debugRule(
     rule.ruleLogic,
     testCase.input
   );
   console.log(debugInfo);
   ```

---

## Advanced Usage

### Programmatic Validation

Use validation functions in your own scripts:

```typescript
import { validatePackageStructure, testRulePackage } from './scripts/validate-rules';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('path/to/rules.json', 'utf-8'));
const validationReport = validatePackageStructure(pkg, 'rules.json');
const testReport = testRulePackage(pkg);

if (!validationReport.valid) {
  console.error('Validation failed:', validationReport.errors);
}

if (testReport.failedTests > 0) {
  console.error('Tests failed:', testReport.failedTests);
}
```

### Custom Validators

Extend validation with custom checks:

```typescript
function validateCustomRules(pkg: RulePackage): string[] {
  const issues: string[] = [];

  pkg.rules.forEach(rule => {
    // Custom check: All income rules should cite FPL
    if (rule.tags?.includes('income') &&
        !rule.citations?.some(c => c.title.includes('Poverty'))) {
      issues.push(`${rule.id}: Income rule should cite poverty guidelines`);
    }
  });

  return issues;
}
```

---

## Related Documentation

- **Rule Authoring Guide**: `docs/RULE_AUTHORING_GUIDE.md`
- **Rule Maintenance Guide**: `docs/RULE_MAINTENANCE.md`
- **Rule Schema**: `docs/RULE_SCHEMA.md`
- **Testing Guide**: `src/rules/__tests__/README.md`

---

## Getting Help

If you encounter issues:
1. Check this documentation
2. Review example rule files
3. Run validation to see detailed error messages
4. Open a GitHub issue with error details

---

**Remember**: Validation is your friend! Run it frequently during development to catch issues early.

