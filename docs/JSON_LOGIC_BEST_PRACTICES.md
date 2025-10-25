# JSON Logic Best Practices

## Overview

This document provides guidelines for creating and maintaining JSON Logic rules in the BenefitFinder system. Following these practices ensures rules pass validation and function correctly.

## JSON Logic Fundamentals

### What is JSON Logic?
JSON Logic is a data format for describing logical rules. It's used in BenefitFinder to define eligibility criteria for government benefit programs.

### Basic Structure
```json
{
  "operator": [operand1, operand2, ...]
}
```

## Supported Operators

### Comparison Operators
```json
{ "<=": [value1, value2] }    // Less than or equal
{ ">=": [value1, value2] }    // Greater than or equal
{ "<": [value1, value2] }     // Less than
{ ">": [value1, value2] }      // Greater than
{ "==": [value1, value2] }    // Equal
{ "!=": [value1, value2] }    // Not equal
```

### Logical Operators
```json
{ "and": [condition1, condition2, ...] }  // All conditions must be true
{ "or": [condition1, condition2, ...] }   // At least one condition must be true
{ "!": condition }                        // Not (negation)
```

### Arithmetic Operators
```json
{ "+": [value1, value2] }     // Addition
{ "-": [value1, value2] }     // Subtraction
{ "*": [value1, value2] }     // Multiplication
{ "/": [value1, value2] }     // Division
```

### Conditional Logic
```json
{ "if": [condition, trueValue, falseValue] }
```

### Variable Access
```json
{ "var": "variableName" }
```

### Array Operations
```json
{ "in": [value, [array]] }    // Check if value is in array
```

## Best Practices

### 1. Keep Logic Simple

**✅ Good - Simple and Clear**
```json
{
  "<=": [
    { "var": "householdIncome" },
    1696
  ]
}
```

**❌ Bad - Overly Complex**
```json
{
  "if": [
    { "==": [{ "var": "householdSize" }, 1] },
    1696,
    {
      "if": [
        { "==": [{ "var": "householdSize" }, 2] },
        2292,
        {
          "if": [
            { "==": [{ "var": "householdSize" }, 3] },
            2888,
            // ... many more nested levels
          ]
        }
      ]
    }
  ]
}
```

### 2. Use Appropriate Operators

**✅ Good - Clear Intent**
```json
{
  "and": [
    { "var": "householdIncome" },
    { "<=": [{ "var": "householdIncome" }, 1696] }
  ]
}
```

**❌ Bad - Unnecessary Complexity**
```json
{
  "!": {
    "!": {
      "and": [
        { "var": "householdIncome" },
        { "<=": [{ "var": "householdIncome" }, 1696] }
      ]
    }
  }
}
```

### 3. Handle Multiple Conditions Properly

**✅ Good - Clear Structure**
```json
{
  "and": [
    { "var": "householdIncome" },
    { "<=": [{ "var": "householdIncome" }, 1696] },
    { "var": "citizenship" },
    { "in": [{ "var": "citizenship" }, ["us_citizen", "us_national"]] }
  ]
}
```

**❌ Bad - Nested Complexity**
```json
{
  "if": [
    { "var": "householdIncome" },
    {
      "if": [
        { "<=": [{ "var": "householdIncome" }, 1696] },
        {
          "if": [
            { "var": "citizenship" },
            {
              "if": [
                { "in": [{ "var": "citizenship" }, ["us_citizen", "us_national"]] },
                true,
                false
              ]
            },
            false
          ]
        },
        false
      ]
    },
    false
  ]
}
```

### 4. Use Arithmetic Operations Wisely

**✅ Good - Clear Calculations**
```json
{
  "<=": [
    { "var": "householdIncome" },
    { "*": [{ "var": "householdSize" }, 1696] }
  ]
}
```

**❌ Bad - Complex Nested Arithmetic**
```json
{
  "<=": [
    { "var": "householdIncome" },
    {
      "+": [
        1696,
        {
          "*": [
            { "-": [{ "var": "householdSize" }, 1] },
            596
          ]
        }
      ]
    }
  ]
}
```

## Common Patterns

### Income Thresholds
```json
{
  "<=": [
    { "var": "householdIncome" },
    1696
  ]
}
```

### Multiple Eligibility Criteria
```json
{
  "and": [
    { "var": "householdIncome" },
    { "<=": [{ "var": "householdIncome" }, 1696] },
    { "var": "citizenship" },
    { "in": [{ "var": "citizenship" }, ["us_citizen", "us_national"]] }
  ]
}
```

### Age-Based Eligibility
```json
{
  "and": [
    { ">=": [{ "var": "age" }, 18] },
    { "<": [{ "var": "age" }, 65] }
  ]
}
```

### Family Status Checks
```json
{
  "or": [
    { "var": "hasChildren" },
    { "var": "isPregnant" },
    { "var": "isElderly" }
  ]
}
```

### Income After Deductions
```json
{
  "<=": [
    { "-": [{ "var": "householdIncome" }, { "var": "allowedDeductions" }] },
    1305
  ]
}
```

## Validation Guidelines

### 1. Test JSON Logic Expressions
Before committing rules, test the JSON Logic expressions:

```javascript
// Example test
const ruleLogic = {
  "<=": [
    { "var": "householdIncome" },
    1696
  ]
};

const testData = {
  householdIncome: 1500
};

const result = jsonLogic.apply(ruleLogic, testData);
console.log(result); // Should be true
```

### 2. Include Test Cases
Every rule should include comprehensive test cases:

```json
{
  "testCases": [
    {
      "input": { "householdIncome": 1500, "householdSize": 1 },
      "expectedOutput": true,
      "description": "Income below threshold should qualify"
    },
    {
      "input": { "householdIncome": 2000, "householdSize": 1 },
      "expectedOutput": false,
      "description": "Income above threshold should not qualify"
    }
  ]
}
```

### 3. Validate Required Fields
Ensure all required fields are present in test data:

```json
{
  "requiredFields": ["householdIncome", "householdSize", "citizenship"]
}
```

## Common Pitfalls

### 1. Deep Nesting
**Problem**: Too many nested if statements
**Solution**: Use lookup tables or simpler logic

### 2. Missing Variables
**Problem**: Referencing variables that don't exist in user profile
**Solution**: Check required fields and ensure all variables are available

### 3. Type Mismatches
**Problem**: Comparing strings to numbers
**Solution**: Ensure data types match in test cases

### 4. Complex Arithmetic
**Problem**: Overly complex calculations that are hard to debug
**Solution**: Break down into simpler steps or use lookup tables

## Debugging Tips

### 1. Use Console Logging
Add debug logging to understand rule evaluation:

```typescript
console.log('Rule evaluation:', {
  ruleLogic,
  userData,
  result
});
```

### 2. Test Individual Components
Test each part of complex rules separately:

```javascript
// Test individual conditions
const incomeCheck = { "<=": [{ "var": "householdIncome" }, 1696] };
const citizenshipCheck = { "in": [{ "var": "citizenship" }, ["us_citizen"]] };

// Then combine
const combinedRule = { "and": [incomeCheck, citizenshipCheck] };
```

### 3. Validate Data Types
Ensure all data is the correct type:

```javascript
// Check data types
console.log('Data types:', {
  householdIncome: typeof userData.householdIncome,
  citizenship: typeof userData.citizenship
});
```

## Performance Considerations

### 1. Avoid Complex Nested Logic
Complex nested if statements can be slow to evaluate.

### 2. Use Efficient Operators
Some operators are more efficient than others:
- `==` is faster than `in` for simple comparisons
- `and`/`or` are efficient for multiple conditions

### 3. Cache Results
Consider caching results for expensive calculations.

## Testing Strategies

### 1. Unit Testing
Test individual rules with various inputs:

```javascript
describe('SNAP Income Rule', () => {
  test('should qualify for low income', () => {
    const result = evaluateRule(ruleLogic, { householdIncome: 1500 });
    expect(result).toBe(true);
  });

  test('should not qualify for high income', () => {
    const result = evaluateRule(ruleLogic, { householdIncome: 2000 });
    expect(result).toBe(false);
  });
});
```

### 2. Integration Testing
Test rules with real user profiles:

```javascript
test('SNAP eligibility with real user profile', () => {
  const userProfile = {
    householdIncome: 1500,
    householdSize: 1,
    citizenship: 'us_citizen'
  };

  const result = evaluateEligibility('snap-federal', userProfile);
  expect(result.eligible).toBe(true);
});
```

### 3. Edge Case Testing
Test boundary conditions:

```javascript
test('boundary conditions', () => {
  // Test exact threshold
  expect(evaluateRule(ruleLogic, { householdIncome: 1696 })).toBe(true);
  expect(evaluateRule(ruleLogic, { householdIncome: 1697 })).toBe(false);
});
```

## Maintenance Guidelines

### 1. Document Complex Rules
Add comments explaining complex logic:

```json
{
  "description": "SNAP gross income test - household income must be at or below 130% of federal poverty line",
  "ruleLogic": {
    "<=": [
      { "var": "householdIncome" },
      1696
    ]
  }
}
```

### 2. Version Control
Track changes to rules:

```json
{
  "version": {
    "major": 1,
    "minor": 0,
    "patch": 0
  },
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

### 3. Regular Testing
Test rules regularly to ensure they still work:

```javascript
// Automated testing
const testSuite = [
  { input: { householdIncome: 1500 }, expected: true },
  { input: { householdIncome: 2000 }, expected: false }
];

testSuite.forEach(test => {
  const result = evaluateRule(ruleLogic, test.input);
  assert(result === test.expected, `Test failed: ${JSON.stringify(test)}`);
});
```

## Conclusion

Following these best practices ensures:
- Rules pass JSON Logic validation
- Rules are maintainable and debuggable
- Rules perform well in production
- Rules are thoroughly tested

Remember: **Keep it simple, test thoroughly, and document everything.**
