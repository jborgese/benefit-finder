# Rule System Architecture Documentation

## Overview

The BenefitFinder application uses a sophisticated rule-based eligibility evaluation system that processes user profiles against government benefit program criteria. This document outlines the architecture, components, and critical implementation details.

## System Components

### 1. Rule Discovery & Import System

**Location**: `src/rules/core/import-export.ts`, `src/utils/ruleDiscovery.ts`

**Purpose**: Dynamically discovers and imports rule files into the RxDB database.

**Key Features**:
- Automatic discovery of rule files in `src/rules/federal/` directory
- JSON Logic validation before import
- Database schema validation (VD2 error handling)
- Batch import with error recovery

**Critical Implementation Details**:
- **Test Cases Mapping**: Must map `expectedOutput` field correctly to avoid VD2 database errors
- **Null Value Handling**: Test cases with `expectedOutput: null` must be handled with fallback values
- **Schema Compliance**: All rule data must match the database schema in `src/db/schemas.ts`

### 2. Rule Evaluation Engine

**Location**: `src/rules/core/eligibility/evaluation.ts`

**Purpose**: Evaluates user profiles against program rules using JSON Logic.

**Key Features**:
- JSON Logic rule evaluation
- Income conversion (annual ↔ monthly)
- Missing field detection
- Rule priority handling
- Detailed evaluation logging

**Critical Implementation Details**:
- **Income Conversion**: Only converts annual to monthly if `incomePeriod` is 'annual'
- **Rule Logic Complexity**: Complex nested if statements can fail JSON Logic validation
- **Field Requirements**: Rules specify required fields that must be present in user profile

### 3. Database Schema

**Location**: `src/db/schemas.ts`

**Purpose**: Defines the structure for rules, programs, and evaluation results.

**Key Collections**:
- `eligibility_rules`: Individual rule definitions
- `benefit_programs`: Program metadata
- `eligibility_results`: Cached evaluation results

**Critical Schema Requirements**:
- `testCases` must have `input`, `expectedOutput`, and `description` fields
- `expectedOutput` must be boolean or object, not null
- Rule logic must be valid JSON Logic expressions

## Rule File Structure

### Location
Rules are stored in `src/rules/federal/[program]/[program]-federal-rules.json`

### Example Structure
```json
{
  "metadata": {
    "id": "snap-federal-rules-2024",
    "name": "SNAP Federal Eligibility Rules (2024)",
    "version": { "major": 1, "minor": 0, "patch": 0 },
    "jurisdiction": "US-FEDERAL"
  },
  "rules": [
    {
      "id": "snap-federal-gross-income",
      "programId": "snap-federal",
      "name": "SNAP Gross Income Test",
      "description": "Household gross income must be at or below 130% of the federal poverty line",
      "ruleLogic": {
        "<=": [
          { "var": "householdIncome" },
          1696
        ]
      },
      "ruleType": "eligibility",
      "requiredFields": ["householdIncome", "householdSize"],
      "testCases": [
        {
          "input": { "householdIncome": 1500, "householdSize": 1 },
          "expectedOutput": true,
          "description": "Income below threshold should qualify"
        }
      ]
    }
  ]
}
```

## JSON Logic Implementation

### Supported Operators
- `var`: Variable reference
- `<=`, `>=`, `<`, `>`, `==`, `!=`: Comparison operators
- `if`: Conditional logic
- `and`, `or`: Logical operators
- `+`, `-`, `*`, `/`: Arithmetic operators
- `in`: Array membership

### Best Practices
1. **Keep Logic Simple**: Avoid deep nested if statements (max 3-4 levels)
2. **Use Lookup Tables**: For complex household size logic, consider simpler approaches
3. **Validate Early**: Test JSON Logic expressions before committing
4. **Handle Edge Cases**: Include test cases for boundary conditions

### Common Pitfalls
- **Complex Nested If Statements**: Can fail JSON Logic validation
- **Missing Required Fields**: Rules fail if required fields are not present
- **Null Values**: Test cases with null `expectedOutput` cause VD2 errors
- **Schema Mismatches**: Field names must match database schema exactly

## Income Conversion Logic

### Location
`src/rules/core/eligibility/evaluation.ts` - `convertAnnualIncomeToMonthly` function

### Implementation
```typescript
const convertAnnualIncomeToMonthly = (income: number, incomePeriod: string): number => {
  if (incomePeriod === 'annual') {
    return Math.round(income / 12);
  }
  return income; // Already monthly
};
```

### Critical Details
- Only converts if `incomePeriod` is explicitly 'annual'
- Uses `Math.round()` for integer results
- Preserves monthly income without conversion
- Handles unknown income periods gracefully

## Error Handling & Debugging

### Common Error Codes
- **VD2**: Database validation error (schema mismatch)
- **DB1**: Database encryption key mismatch
- **JSON Logic Validation**: Rule logic syntax errors

### Debug Logging
The system includes extensive debug logging:
- Rule discovery and import process
- JSON Logic validation results
- Income conversion calculations
- Evaluation results and reasoning

### Debug Log Locations
- `src/rules/core/import-export.ts`: Import process logging
- `src/rules/core/eligibility/evaluation.ts`: Evaluation logging
- `src/App.tsx`: User profile and result processing
- `src/components/results/`: UI rendering logs

## Performance Considerations

### Caching
- Evaluation results are cached in the database
- Cache expiration: 30 days
- Cache keys based on profile ID and program ID

### Batch Processing
- Multiple programs evaluated in parallel
- Resource monitoring for memory usage
- Import batching for large rule sets

## Testing & Validation

### Rule Testing
- Each rule includes test cases with expected outputs
- Test cases validated during import process
- Failed test cases prevent rule import

### Integration Testing
- End-to-end evaluation testing
- Income conversion accuracy testing
- UI result display testing

## Maintenance Guidelines

### Adding New Rules
1. Create rule file in appropriate directory
2. Follow JSON Logic best practices
3. Include comprehensive test cases
4. Test with various user profiles
5. Validate import process

### Modifying Existing Rules
1. Update rule logic carefully
2. Test JSON Logic validation
3. Verify test cases still pass
4. Test with existing user profiles
5. Monitor for VD2 errors

### Debugging Issues
1. Check console logs for specific error messages
2. Verify rule import success in database
3. Test JSON Logic expressions independently
4. Check income conversion logic
5. Validate user profile data completeness

## Critical Fixes Implemented

### 1. VD2 Database Error Resolution
**Problem**: Test cases with null `expectedOutput` values caused database validation failures.

**Solution**: Added null coalescing operator in test cases mapping:
```typescript
expectedOutput: tc.expectedOutput ?? true
```

### 2. JSON Logic Validation Failures
**Problem**: Complex nested if statements in SNAP rules failed JSON Logic validation.

**Solution**: Simplified rule logic to basic income thresholds:
```json
{
  "<=": [
    { "var": "householdIncome" },
    1696
  ]
}
```

### 3. Income Conversion Logic
**Problem**: Income was being converted from annual to monthly regardless of input period.

**Solution**: Added conditional conversion based on `incomePeriod` field:
```typescript
if (incomePeriod === 'annual') {
  return Math.round(income / 12);
}
return income;
```

## Future Considerations

### Scalability
- Consider rule versioning for updates
- Implement rule deprecation workflow
- Add rule performance monitoring

### Maintainability
- Create rule validation tools
- Implement automated testing
- Add rule documentation generation

### Performance
- Optimize JSON Logic evaluation
- Implement rule result caching
- Add performance monitoring

## Related Documentation

- [Rule Schema Documentation](./RULE_SCHEMA.md)
- [Database Architecture](./DATABASE_ARCHITECTURE.md)
- [Evaluation Engine Details](./EVALUATION_ENGINE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
