# Phase 1.5 Quick Start Guide

**Status**: ✅ Complete
**Date**: October 12, 2025

This quick start guide helps you get started with the newly implemented program rules system.

---

## What Was Built

### 🎯 Federal Program Rules (18 rules total)

1. **SNAP** - 7 rules covering complete federal eligibility
2. **Medicaid** - 6 rules covering federal baseline eligibility
3. **WIC** - 5 rules covering federal WIC eligibility

**All rules include**:
- ✅ JSON Logic rule definitions
- ✅ Official source citations (.gov sites, CFR references)
- ✅ Comprehensive test cases (69 tests total)
- ✅ Required documents lists
- ✅ Next steps guidance
- ✅ Plain language explanations

### 📚 Documentation (3 comprehensive guides)

1. **Rule Authoring Guide** (`docs/RULE_AUTHORING_GUIDE.md`)
   - How to research and create rules
   - JSON Logic tutorial
   - Source citation standards
   - Best practices

2. **Rule Maintenance Guide** (`docs/RULE_MAINTENANCE.md`)
   - Annual update schedule
   - Monitoring official sources
   - Version management
   - Distribution methods

3. **Rule Validation Usage** (`docs/RULE_VALIDATION_USAGE.md`)
   - How to use validation script
   - Output interpretation
   - CI/CD integration
   - Troubleshooting

### 🛠️ Tools

**Validation Script** (`scripts/validate-rules.ts`)
- Validates rule structure
- Runs embedded test cases
- Color-coded output
- Detailed error reporting

---

## Quick Start

### 1. Install Dependencies

```bash
cd "C:\Users\Nipply Nathan\Documents\GitHub\benefit-finder"
npm install
```

New dependencies added:
- `json-logic-js` - Rule evaluation engine
- `@types/json-logic-js` - TypeScript types
- `tsx` - TypeScript script execution

### 2. Validate Rules

```bash
npm run validate-rules
```

**Expected output:**
```
Validating 4 rule file(s)...
Files: 4/4 valid
Rules: 20 total
Tests: 69/69 passed
✓ All validations passed!
```

### 3. Explore Rule Files

**Location**: `src/rules/examples/`

```
src/rules/examples/
  ├── snap-federal-rules.json      # SNAP eligibility (7 rules)
  ├── medicaid-federal-rules.json  # Medicaid eligibility (6 rules)
  ├── wic-federal-rules.json       # WIC eligibility (5 rules)
  └── snap-rules.json              # Original example (2 rules)
```

### 4. Read Documentation

Start with these guides:
1. `PHASE_1.5_IMPLEMENTATION_SUMMARY.md` - Overview of what was built
2. `docs/RULE_AUTHORING_GUIDE.md` - Learn how to create rules
3. `docs/RULE_VALIDATION_USAGE.md` - Learn to validate rules

---

## Usage Examples

### Validate All Rules

```bash
npm run validate-rules
```

### Validate Specific File

```bash
npm run validate-rules src/rules/examples/snap-federal-rules.json
```

### View Rule Structure

Open any rule file to see the structure:

```json
{
  "metadata": {
    "id": "snap-federal-rules-2024",
    "name": "SNAP Federal Eligibility Rules (2024)",
    "jurisdiction": "US-FEDERAL",
    "programs": ["snap-federal"],
    "version": { "major": 1, "minor": 0, "patch": 0 }
  },
  "rules": [
    {
      "id": "snap-federal-gross-income",
      "name": "SNAP Gross Income Test",
      "ruleLogic": { /* JSON Logic */ },
      "explanation": "Plain language description",
      "testCases": [ /* Tests */ ],
      "citations": [ /* Official sources */ ]
    }
  ]
}
```

---

## Key Features

### ✅ Privacy-First
- No external API calls
- All rules are static files
- Evaluation happens locally

### ✅ Offline-First
- Rules bundled with app
- No internet required
- Field deployment ready

### ✅ Verifiable
- All rules cite official sources
- Test cases document expected behavior
- Version controlled in git

### ✅ Maintainable
- Annual update schedule documented
- Validation catches errors early
- Clear versioning strategy

---

## Next Steps

### Immediate Tasks
1. **Add state-specific rules** (Georgia, California, New York)
2. **Integrate rules into UI** (Phase 1.6 - Results Display)
3. **Set up maintenance calendar** (January FPL update, etc.)

### Future Enhancements
1. Rule builder UI
2. Rule visualization (flowcharts)
3. Community contribution workflow
4. Automated FPL updates

---

## Testing

### All Tests Pass ✅

```
Files: 4/4 valid
Rules: 20 total
Tests: 69/69 passed
✓ All validations passed!
```

**Coverage:**
- SNAP: 26 tests
- Medicaid: 19 tests
- WIC: 18 tests
- Original examples: 6 tests

---

## Resources

### Rule Files
- `src/rules/examples/*.json` - All rule definitions
- `src/rules/schema.ts` - TypeScript schema definitions
- `src/rules/types.ts` - Type definitions

### Documentation
- `docs/RULE_AUTHORING_GUIDE.md` - How to write rules
- `docs/RULE_MAINTENANCE.md` - How to maintain rules
- `docs/RULE_VALIDATION_USAGE.md` - How to validate rules
- `docs/RULE_SCHEMA.md` - Schema documentation

### Tools
- `scripts/validate-rules.ts` - Validation utility
- `npm run validate-rules` - Run validation

---

## Official Sources Used

### SNAP
- USDA FNS: https://www.fns.usda.gov/snap
- Federal regulations: 7 CFR § 273

### Medicaid
- CMS Medicaid: https://www.medicaid.gov
- Federal regulations: 42 CFR § 435

### WIC
- USDA FNS WIC: https://www.fns.usda.gov/wic
- Federal regulations: 7 CFR § 246

### Federal Poverty Guidelines
- HHS ASPE: https://aspe.hhs.gov/poverty-guidelines

---

## Support

### Questions?
1. Check documentation in `docs/`
2. Review example rules
3. Run validation for error details
4. Open GitHub issue

### Contributing
See `docs/RULE_AUTHORING_GUIDE.md` for how to:
- Create new rules
- Update existing rules
- Submit contributions

---

## Summary

✅ **18 federal rules** created covering SNAP, Medicaid, and WIC
✅ **69 test cases** all passing
✅ **3 comprehensive guides** for authoring, maintenance, and validation
✅ **Full validation toolkit** to ensure rule quality
✅ **Privacy-first, offline-first** implementation
✅ **Ready for state-specific extensions**

**Phase 1.5 (Initial Program Rules - Federal Baseline) is COMPLETE! 🎉**

Next: Add state-specific rules (GA, CA, NY) and build Results Display UI (Phase 1.6)

