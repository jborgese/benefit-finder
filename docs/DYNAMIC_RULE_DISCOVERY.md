# Dynamic Rule Discovery System

**Status:** ✅ Complete
**Last Updated:** October 25, 2025

## Overview

The Dynamic Rule Discovery System automatically discovers and seeds benefit programs from rule files, eliminating the need for hardcoded program definitions. This makes the system truly agnostic - when new rule files are added, they are automatically discovered and made available.

## Problem Solved

Previously, `initializeApp.ts` had hardcoded program definitions for each benefit program:

```typescript
// OLD: Hardcoded approach
await db.benefit_programs.insert({
  id: 'snap-federal',
  name: 'SNAP',
  // ... hardcoded metadata
});
```

This approach had several problems:
- **Not scalable**: Adding new programs required code changes
- **Maintenance burden**: Metadata was duplicated between rule files and code
- **Error-prone**: Easy to forget to add new programs
- **Inconsistent**: Program metadata could get out of sync

## Solution

The new dynamic system automatically:

1. **Discovers** all rule files matching a pattern
2. **Extracts** program metadata from rule file headers
3. **Creates** benefit programs in the database
4. **Imports** the corresponding rules

## Architecture

### Core Components

#### 1. `ruleDiscovery.ts`
Main discovery engine that:
- Scans for rule files using `import.meta.glob`
- Extracts metadata from rule package headers
- Creates benefit programs automatically
- Imports rules for each program

#### 2. Updated `initializeApp.ts`
Now uses dynamic discovery instead of hardcoded definitions:
- Calls `discoverAndSeedAllRules()` instead of manual program creation
- Checks for new rule files before skipping initialization
- Handles errors gracefully with detailed reporting

### Key Features

#### Automatic Discovery
```typescript
// Automatically finds all files matching pattern
const ruleFiles = import.meta.glob('../rules/federal/**/*-federal-rules.json', { eager: true });
```

#### Metadata Extraction
Extracts program information from rule file metadata:
- Program ID from `metadata.programs[0]`
- Program name from `metadata.name`
- Description from `metadata.description`
- Tags from `metadata.tags`
- Category determined by program type

#### Smart Categorization
Automatically determines program category:
- **Food**: SNAP, WIC (food/nutrition tags)
- **Healthcare**: Medicaid (healthcare/medical tags)
- **Housing**: Section 8, LIHTC (housing tags)
- **Financial**: TANF, SSI (cash/assistance tags)

#### Contact Information
Provides default contact information for each program type:
- Website URLs
- Phone numbers
- Application URLs

## Usage

### Adding New Programs

To add a new benefit program, simply:

1. **Create a rule file** in `src/rules/federal/[program-name]/[program-name]-federal-rules.json`
2. **Include proper metadata** in the rule file header
3. **Restart the application** - the new program will be automatically discovered

### Example: Adding a New Program

Create `src/rules/federal/liheap/liheap-federal-rules.json`:

```json
{
  "metadata": {
    "id": "liheap-federal-rules-2024",
    "name": "LIHEAP Federal Eligibility Rules",
    "description": "Low-Income Home Energy Assistance Program eligibility rules",
    "programs": ["liheap-federal"],
    "tags": ["energy", "utilities", "heating", "cooling"],
    "jurisdiction": "US-FEDERAL"
  },
  "rules": [
    {
      "id": "liheap-income-eligibility",
      "programId": "liheap-federal,
      "name": "LIHEAP Income Eligibility",
      "ruleLogic": { /* eligibility rules */ }
    }
  ]
}
```

The system will automatically:
- ✅ Discover the new rule file
- ✅ Extract program metadata
- ✅ Create `liheap-federal` program in database
- ✅ Import the eligibility rules
- ✅ Make it available in the assessment

### No Code Changes Required!

## Configuration

### Rule Discovery Config

```typescript
const FEDERAL_RULE_CONFIG: RuleDiscoveryConfig = {
  baseDir: '../rules/federal',
  pattern: /.*-federal-rules\.json$/,
  jurisdictionLevel: 'federal',
  defaultJurisdiction: 'US-FEDERAL',
};
```

### Supported Patterns

- **Federal Rules**: `*-federal-rules.json`
- **State Rules**: `*-[state]-rules.json` (future)
- **County Rules**: `*-[county]-rules.json` (future)

## API Reference

### `discoverAndSeedAllRules()`
Discovers and seeds all available rule files.

**Returns:**
```typescript
{
  discovered: number;    // Number of rule files found
  created: number;       // Number of programs created
  imported: number;      // Number of rule sets imported
  errors: string[];      // Any errors encountered
}
```

### `checkForNewRuleFiles()`
Checks if new rule files have been added since last discovery.

**Returns:** `Promise<boolean>`

## Error Handling

The system handles errors gracefully:

- **Invalid rule files**: Logged and skipped
- **Missing metadata**: Uses defaults where possible
- **Import failures**: Reported but don't stop other programs
- **Database errors**: Retried with fallback

## Performance

- **Fast discovery**: Uses Vite's `import.meta.glob` for efficient file scanning
- **Lazy loading**: Only processes files when needed
- **Caching**: Skips discovery if all programs already exist
- **Incremental**: Only processes new files on subsequent runs

## Migration from Hardcoded System

The new system is backward compatible:

1. **Existing databases**: Will detect missing programs and add them
2. **No data loss**: Existing programs remain unchanged
3. **Gradual adoption**: Can run alongside old system during transition

## Future Enhancements

### Planned Features

1. **State-specific rules**: Automatic discovery of state rule files
2. **Rule validation**: Validate rule files before importing
3. **Hot reloading**: Detect rule file changes during development
4. **Rule versioning**: Handle multiple versions of the same rule
5. **Custom metadata**: Support for custom program metadata in rule files

### Extensibility

The system is designed to be extensible:

- **New jurisdictions**: Add support for county/city rules
- **Custom patterns**: Support different file naming conventions
- **Metadata sources**: Extract from external APIs or databases
- **Validation rules**: Add custom validation for rule files

## Testing

### Unit Tests
```bash
npm test -- src/utils/__tests__/ruleDiscovery.test.ts
```

### Integration Tests
The system is tested as part of the main application initialization.

### Manual Testing
1. Add a new rule file
2. Clear the database
3. Start the application
4. Verify the new program appears in results

## Troubleshooting

### Common Issues

#### Program Not Appearing
- Check rule file follows naming convention: `*-federal-rules.json`
- Verify metadata includes `programs` array
- Check console for discovery errors

#### Import Failures
- Validate rule file JSON syntax
- Check rule logic is valid JSON Logic
- Verify all required fields are present

#### Performance Issues
- Check for large rule files
- Verify database is properly indexed
- Monitor memory usage during discovery

### Debug Mode

Enable debug logging:
```typescript
// In development, detailed logs are shown
if (import.meta.env.DEV) {
  console.warn('[DEBUG] Rule Discovery: ...');
}
```

## Conclusion

The Dynamic Rule Discovery System transforms BenefitFinder from a hardcoded system to a truly agnostic, self-discovering platform. Adding new benefit programs now requires only creating a properly formatted rule file - no code changes needed.

This makes the system:
- ✅ **Scalable**: Add unlimited programs without code changes
- ✅ **Maintainable**: Single source of truth for program metadata
- ✅ **Reliable**: Automatic discovery prevents missing programs
- ✅ **Consistent**: Metadata always matches rule files
- ✅ **Future-proof**: Ready for new jurisdictions and program types
