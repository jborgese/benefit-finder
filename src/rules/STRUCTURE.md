# Rules Directory Structure

This document describes the reorganized structure of the `src/rules` directory, which provides a clear hierarchy separating federal vs. state rules and organizing by benefit program.

## Directory Structure

```
src/rules/
├── core/                      # Core rule engine files
│   ├── evaluator.ts          # Rule evaluation logic
│   ├── validator.ts          # Rule validation
│   ├── schema.ts             # Rule schemas and types
│   ├── tester.ts             # Rule testing framework
│   ├── debug.ts              # Debug utilities
│   ├── performance.ts        # Performance monitoring
│   ├── explanation.ts        # Rule explanation
│   ├── eligibility.ts        # Eligibility evaluation
│   ├── detailedEvaluator.ts  # Detailed evaluation
│   ├── import-export.ts      # Import/export functionality
│   ├── versioning.ts         # Version management
│   ├── types.ts              # TypeScript type definitions
│   ├── eligibility/          # Eligibility-specific modules
│   │   ├── cache.ts
│   │   ├── evaluation.ts
│   │   ├── snap.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   └── examples/             # Example rule files
│       └── wic-federal-rules.json
├── federal/                  # Federal-level rules
│   ├── snap/                 # SNAP federal rules
│   │   ├── snap-federal-rules.json
│   │   └── snap-rules.json
│   ├── medicaid/             # Medicaid federal rules
│   │   └── medicaid-federal-rules.json
│   ├── tanf/                 # TANF federal rules
│   │   └── tanf-federal-rules.json
│   └── wic/                  # WIC federal rules
│       └── wic-federal-rules.json
├── state/                    # State-specific rules
│   ├── california/
│   │   ├── snap/             # California SNAP rules
│   │   │   └── snap-california-rules.json
│   │   └── medicaid/         # California Medicaid rules
│   └── georgia/
│       ├── snap/             # Georgia SNAP rules
│       │   └── snap-georgia-rules.json
│       └── medicaid/         # Georgia Medicaid rules
│           └── medicaid-georgia-rules.json
├── packages/                 # Legacy rule packages (for reference)
│   └── README.md
├── __tests__/                # Test files
│   ├── debug.test.ts
│   ├── eligibility.test.ts
│   ├── evaluator.test.ts
│   ├── explanation.test.ts
│   ├── performance.test.ts
│   ├── schema.test.ts
│   ├── tester.test.ts
│   └── validator.test.ts
├── index.ts                  # Main exports
└── README.md                 # Main documentation
```

## Organization Principles

### 1. Federal vs. State Separation
- **`federal/`**: Contains rules that apply at the federal level across all states
- **`state/`**: Contains state-specific rules that may override or supplement federal rules

### 2. Benefit Program Organization
Each level (federal/state) is organized by benefit program:
- **SNAP**: Supplemental Nutrition Assistance Program
- **Medicaid**: Health insurance for low-income individuals
- **TANF**: Temporary Assistance for Needy Families
- **WIC**: Women, Infants, and Children nutrition program

### 3. Core Engine Separation
The **`core/`** directory contains all the rule engine functionality:
- Evaluation logic
- Validation systems
- Testing frameworks
- Performance monitoring
- Debug utilities
- Import/export functionality

## File Naming Conventions

### Rule Files
- **Federal rules**: `{program}-federal-rules.json`
- **State rules**: `{program}-{state}-rules.json`
- **Legacy/example rules**: `{program}-rules.json`

### Examples
- `snap-federal-rules.json` - Federal SNAP rules
- `snap-california-rules.json` - California SNAP rules
- `medicaid-georgia-rules.json` - Georgia Medicaid rules

## Import Paths

### Core Engine
```typescript
// Import from core engine
import { evaluateRule, validateRule } from '@/rules';
// or directly from core
import { evaluateRule } from '@/rules/core/evaluator';
```

### Rule Files
```typescript
// Import specific rule files
import snapFederalRules from '@/rules/federal/snap/snap-federal-rules.json';
import snapCaliforniaRules from '@/rules/state/california/snap/snap-california-rules.json';
```

## Benefits of This Structure

1. **Clear Separation**: Federal vs. state rules are clearly separated
2. **Program Organization**: Easy to find rules for specific benefit programs
3. **Scalability**: Easy to add new states or programs
4. **Maintainability**: Core engine is separate from rule data
5. **Intuitive Navigation**: Structure mirrors the real-world organization of benefits

## Adding New Rules

### Adding a New State
1. Create state directory: `src/rules/state/{state-name}/`
2. Create program subdirectories as needed
3. Add state-specific rule files

### Adding a New Program
1. Add program directory under both `federal/` and relevant `state/` directories
2. Create federal rules first
3. Add state-specific implementations as needed

### Adding New Core Functionality
1. Add new files to `src/rules/core/`
2. Update `src/rules/index.ts` to export new functionality
3. Add tests in `src/rules/__tests__/`

## Migration Notes

This structure was created by reorganizing the existing rules directory. All existing functionality is preserved, but import paths have been updated to reflect the new organization.

### Key Changes
- Core engine files moved to `core/` directory
- Rule packages organized by federal/state and program
- Import paths updated throughout the codebase
- All tests updated to use new paths

### Backward Compatibility
The main `@/rules` import still works for all core functionality. Only direct imports to specific files need to be updated.
