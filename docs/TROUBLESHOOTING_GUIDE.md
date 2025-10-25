# Troubleshooting Guide

## Overview

This guide helps diagnose and resolve common issues in the BenefitFinder rule system. Each issue includes symptoms, root causes, and step-by-step solutions.

## Common Error Codes

### VD2 - Database Validation Error

**Symptoms**:
- Rules fail to import into database
- Console shows "VD2" error messages
- "No active rules found" errors in evaluation

**Root Causes**:
1. Test cases with null `expectedOutput` values
2. Schema field mismatches
3. Invalid data types in rule data

**Solutions**:

#### 1. Fix Test Cases Mapping
**File**: `src/rules/core/import-export.ts`

**Problem**: Test cases have null `expectedOutput` values
```typescript
// ❌ Failing
testCases: rule.testCases?.map((tc) => ({
  input: tc.input,
  expectedOutput: tc.expectedOutput,  // Could be null
  description: tc.description || '',
}))
```

**Solution**: Add null coalescing operator
```typescript
// ✅ Fixed
testCases: rule.testCases?.map((tc) => ({
  input: tc.input,
  expectedOutput: tc.expectedOutput ?? true, // Default to true if null
  description: tc.description || '',
}))
```

#### 2. Verify Database Schema
**File**: `src/db/schemas.ts`

Ensure test cases schema matches:
```typescript
testCases: {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      input: { type: 'object' },
      expectedOutput: { type: 'boolean' }, // Must be boolean, not null
      description: { type: 'string' }
    }
  }
}
```

### DB1 - Database Encryption Key Mismatch

**Symptoms**:
- Database gets cleared and reinitialized
- Rules disappear after restart
- "Database cleared due to encryption key mismatch" messages

**Root Causes**:
1. Encryption key changes between sessions
2. Database corruption
3. Browser storage issues

**Solutions**:

#### 1. Force Rule Re-import
**File**: `src/utils/initializeApp.ts`

Add logic to detect missing rules and force re-import:
```typescript
// Check if SNAP program exists but has no rules
const snapProgram = await db.benefit_programs.findOne({
  selector: { id: 'snap-federal' }
});

if (snapProgram && snapProgram.ruleCount === 0) {
  console.log('SNAP program found but no rules - forcing rule discovery');
  await discoverAndSeedAllRules();
}
```

#### 2. Clear Browser Storage
If issues persist, clear browser storage:
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
indexedDB.deleteDatabase('benefitfinder');
```

### JSON Logic Validation Failures

**Symptoms**:
- Rules fail validation during import
- "Rule validation failed" messages
- Complex nested if statements causing errors

**Root Causes**:
1. Too many nested if statements
2. Invalid JSON Logic syntax
3. Complex arithmetic operations

**Solutions**:

#### 1. Simplify Complex Rules
**Before (Failing)**:
```json
{
  "if": [
    { "==": [{"var": "householdSize"}, 1] },
    1696,
    {
      "if": [
        { "==": [{"var": "householdSize"}, 2] },
        2292,
        {
          "if": [
            { "==": [{"var": "householdSize"}, 3] },
            2888,
            // ... many more nested levels
          ]
        }
      ]
    }
  ]
}
```

**After (Fixed)**:
```json
{
  "<=": [
    { "var": "householdIncome" },
    1696
  ]
}
```

#### 2. Test JSON Logic Expressions
Create test cases to validate rule logic:
```javascript
// Test the rule logic
const ruleLogic = {
  "<=": [
    { "var": "householdIncome" },
    1696
  ]
};

const testData = { householdIncome: 1500 };
const result = jsonLogic.apply(ruleLogic, testData);
console.log('Rule result:', result);
```

### Income Conversion Issues

**Symptoms**:
- High-income users showing as eligible
- Income being treated as monthly when it should be annual
- Incorrect eligibility calculations

**Root Causes**:
1. Missing `incomePeriod` field in user profile
2. Income conversion logic not checking period
3. Data type mismatches

**Solutions**:

#### 1. Fix Income Conversion Logic
**File**: `src/rules/core/eligibility/evaluation.ts`

**Before (Failing)**:
```typescript
const convertAnnualIncomeToMonthly = (income: number): number => {
  return Math.round(income / 12); // Always converts
};
```

**After (Fixed)**:
```typescript
const convertAnnualIncomeToMonthly = (income: number, incomePeriod: string): number => {
  if (incomePeriod === 'annual') {
    return Math.round(income / 12);
  }
  return income; // Preserve monthly income
};
```

#### 2. Add Income Period to User Profile
**File**: `src/App.tsx`

Ensure `incomePeriod` is included in user profile:
```typescript
const userProfile = {
  householdIncome: convertedIncome,
  householdSize: answers.householdSize,
  incomePeriod: answers.incomePeriod, // Add this field
  citizenship: answers.citizenship,
  // ... other fields
};
```

#### 3. Update User Profile Interface
**File**: `src/components/results/useEligibilityEvaluation.ts`

Add `incomePeriod` to the interface:
```typescript
interface UserProfile {
  householdIncome: number;
  householdSize: number;
  incomePeriod: 'monthly' | 'annual'; // Add this field
  citizenship: string;
  // ... other fields
}
```

## Debugging Techniques

### 1. Enable Debug Logging

**Console Logging**:
```typescript
// Add debug logs to key functions
console.log('🔍 [DEBUG] Rule evaluation:', {
  ruleId,
  userData,
  result
});
```

**File Locations for Debug Logs**:
- `src/rules/core/import-export.ts` - Rule import process
- `src/rules/core/eligibility/evaluation.ts` - Rule evaluation
- `src/App.tsx` - User profile processing
- `src/components/results/` - UI rendering

### 2. Check Database State

**Verify Rules in Database**:
```javascript
// In browser console
const db = await getDatabase();
const rules = await db.eligibility_rules.find().exec();
console.log('Rules in database:', rules.length);
console.log('Rule IDs:', rules.map(r => r.id));
```

**Check Program Rules**:
```javascript
// Check specific program rules
const snapRules = await db.eligibility_rules.find({
  selector: { programId: 'snap-federal' }
}).exec();
console.log('SNAP rules:', snapRules.length);
```

### 3. Test Rule Evaluation

**Manual Rule Testing**:
```javascript
// Test individual rules
const ruleLogic = {
  "<=": [
    { "var": "householdIncome" },
    1696
  ]
};

const testData = {
  householdIncome: 100000, // High income
  householdSize: 1
};

const result = jsonLogic.apply(ruleLogic, testData);
console.log('Rule result:', result); // Should be false
```

### 4. Validate User Profile Data

**Check Profile Data**:
```javascript
// In browser console
console.log('User profile:', userProfile);
console.log('Income period:', userProfile.incomePeriod);
console.log('Converted income:', convertedIncome);
```

## Performance Issues

### 1. Slow Rule Evaluation

**Symptoms**:
- Long delays in evaluation results
- Browser freezing during evaluation
- High memory usage

**Solutions**:

#### Enable Caching
```typescript
// Check if result is cached
const cachedResult = await db.eligibility_results.findOne({
  selector: {
    userProfileId: profileId,
    programId: programId
  }
});

if (cachedResult && !cachedResult.expired) {
  return cachedResult;
}
```

#### Optimize Rule Logic
- Simplify complex nested if statements
- Use efficient operators
- Avoid redundant calculations

### 2. Memory Issues

**Symptoms**:
- Browser crashes
- High memory usage
- Slow performance

**Solutions**:

#### Clear Old Data
```typescript
// Clear expired results
await db.eligibility_results.find({
  selector: {
    expiresAt: { $lt: Date.now() }
  }
}).remove();
```

#### Limit Cache Size
```typescript
// Limit cached results
const maxCacheSize = 1000;
const results = await db.eligibility_results.find().exec();
if (results.length > maxCacheSize) {
  // Remove oldest results
  const toRemove = results
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(0, results.length - maxCacheSize);

  await Promise.all(toRemove.map(r => r.remove()));
}
```

## Testing Procedures

### 1. Rule Import Testing

**Test Steps**:
1. Clear browser storage
2. Refresh application
3. Check console for rule import logs
4. Verify rules in database
5. Test evaluation with sample data

**Expected Results**:
- All rules import successfully
- No VD2 or validation errors
- Rules available for evaluation

### 2. Income Conversion Testing

**Test Scenarios**:
1. **Annual Income**: $100,000 annual → should show "Not Qualified"
2. **Monthly Income**: $8,333 monthly → should show "Not Qualified"
3. **Low Income**: $1,500 monthly → should show appropriate eligibility

**Test Code**:
```javascript
// Test income conversion
const testCases = [
  { income: 100000, period: 'annual', expected: 8333 },
  { income: 8333, period: 'monthly', expected: 8333 },
  { income: 1500, period: 'monthly', expected: 1500 }
];

testCases.forEach(test => {
  const result = convertAnnualIncomeToMonthly(test.income, test.period);
  console.log(`Income: ${test.income} (${test.period}) → ${result} (expected: ${test.expected})`);
});
```

### 3. End-to-End Testing

**Test Workflow**:
1. Complete questionnaire with high income ($100,000 annual)
2. Verify all programs show "Not Qualified"
3. Complete questionnaire with low income ($1,500 monthly)
4. Verify appropriate eligibility results
5. Check for any error messages or console errors

## Prevention Strategies

### 1. Code Quality

**Before Committing**:
- Test all rule logic expressions
- Validate JSON Logic syntax
- Check for null values in test cases
- Verify required fields are present

### 2. Automated Testing

**Unit Tests**:
```javascript
describe('Rule System', () => {
  test('SNAP income rule', () => {
    const ruleLogic = { "<=": [{ "var": "householdIncome" }, 1696] };
    const testData = { householdIncome: 1500 };
    const result = jsonLogic.apply(ruleLogic, testData);
    expect(result).toBe(true);
  });
});
```

**Integration Tests**:
```javascript
test('SNAP eligibility evaluation', async () => {
  const userProfile = {
    householdIncome: 1500,
    householdSize: 1,
    citizenship: 'us_citizen'
  };

  const result = await evaluateEligibility('snap-federal', userProfile);
  expect(result.eligible).toBe(true);
});
```

### 3. Monitoring

**Error Tracking**:
- Monitor console for VD2 errors
- Track rule import success rates
- Watch for database errors
- Monitor evaluation performance

**Performance Monitoring**:
- Track evaluation times
- Monitor memory usage
- Check cache hit rates
- Monitor rule complexity

## Emergency Procedures

### 1. Complete System Reset

**If All Else Fails**:
1. Clear all browser storage
2. Delete IndexedDB database
3. Restart application
4. Force rule re-import
5. Test with known good data

**Commands**:
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
indexedDB.deleteDatabase('benefitfinder');
location.reload();
```

### 2. Rule Rollback

**If New Rules Cause Issues**:
1. Revert to previous rule version
2. Clear rule cache
3. Force rule re-import
4. Test with sample data

### 3. Database Recovery

**If Database is Corrupted**:
1. Clear browser storage
2. Restart application
3. Let system rebuild database
4. Verify rule import
5. Test evaluation

## Getting Help

### 1. Check Console Logs
- Look for specific error messages
- Check rule import logs
- Verify evaluation results

### 2. Test with Sample Data
- Use known good test cases
- Verify expected results
- Check for data type issues

### 3. Review Documentation
- Check rule schema documentation
- Review JSON Logic best practices
- Consult troubleshooting guides

### 4. Contact Development Team
- Provide specific error messages
- Include console logs
- Describe steps to reproduce
- Share test data if possible

## Conclusion

This troubleshooting guide covers the most common issues in the BenefitFinder rule system. Following these procedures should resolve most problems and help prevent future issues.

Remember:
- **Test thoroughly** before deploying changes
- **Monitor system health** regularly
- **Document issues** for future reference
- **Keep backups** of working configurations
