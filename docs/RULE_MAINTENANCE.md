# Rule Maintenance Guide

**Version:** 1.0
**Last Updated:** October 12, 2025

This guide explains how to maintain, update, and manage benefit eligibility rules over time.

---

## Table of Contents

1. [Overview](#overview)
2. [Rule Update Schedule](#rule-update-schedule)
3. [Identifying Rule Changes](#identifying-rule-changes)
4. [Updating Rules](#updating-rules)
5. [Testing Updated Rules](#testing-updated-rules)
6. [Version Management](#version-management)
7. [Distribution](#distribution)
8. [Monitoring & Tracking](#monitoring--tracking)

---

## Overview

Benefit program rules change regularly due to:
- **Policy changes** (new legislation, program updates)
- **Annual adjustments** (poverty level updates, benefit amounts)
- **Corrections** (fixing errors in existing rules)
- **Jurisdictional changes** (state-specific rule modifications)

This guide ensures rules stay accurate and up-to-date while maintaining privacy and offline-first principles.

---

## Rule Update Schedule

### Annual Updates (Required)

#### January - Federal Poverty Guidelines
- **What changes**: Federal Poverty Level (FPL) thresholds
- **Affects**: SNAP, Medicaid, WIC, and most income-based programs
- **Source**: [HHS Federal Poverty Guidelines](https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines)
- **Action**: Update all rules using FPL calculations

**Example**: If 2025 FPL increases by 3%, update:
```json
{
  "ruleLogic": {
    "<=": [
      { "var": "householdIncome" },
      {
        "*": [
          { "var": "householdSize" },
          1980  // Updated from 1923 (2024)
        ]
      }
    ]
  }
}
```

#### October - Federal Fiscal Year
- **What changes**: Federal program budgets, benefit amounts, asset limits
- **Affects**: SNAP, WIC, federal housing programs
- **Source**: USDA FNS, HUD, agency websites
- **Action**: Review federal program announcements

### Quarterly Reviews (Recommended)

**Q1 (Jan-Mar)**: FPL updates, state legislative sessions
**Q2 (Apr-Jun)**: Spring legislative changes take effect
**Q3 (Jul-Sep)**: Summer policy updates
**Q4 (Oct-Dec)**: Federal fiscal year changes, state budget updates

### As-Needed Updates

- Emergency policy changes (e.g., COVID-19 waivers)
- Court decisions affecting eligibility
- State-specific legislation
- Error corrections

---

## Identifying Rule Changes

### Official Sources to Monitor

#### Federal Level

**SNAP**
- USDA Food and Nutrition Service: https://www.fns.usda.gov/snap
- Federal Register: https://www.federalregister.gov/
- Monitor: Policy memos, benefit updates, income limits

**Medicaid**
- CMS Medicaid: https://www.medicaid.gov/
- Medicaid.gov state pages
- Monitor: Expansion status, income thresholds, categorical eligibility

**WIC**
- USDA FNS WIC: https://www.fns.usda.gov/wic
- Monitor: Income guidelines (updated annually in July), benefit packages

#### State Level

**State DHHS/Social Services Websites**
- Look for: Eligibility manuals, policy bulletins, transmittals
- Subscribe to: Email updates, RSS feeds
- Check: Monthly or quarterly

**State Legislatures**
- Monitor: Bills affecting benefit programs
- Session periods vary by state

### Setting Up Monitoring

1. **Create a monitoring calendar**
   - Set reminders for annual updates
   - Schedule quarterly reviews
   - Add state legislative session dates

2. **Subscribe to updates**
   - Federal Register alerts for specific programs
   - State agency mailing lists
   - Advocacy organization newsletters (Center on Budget and Policy Priorities, CBPP)

3. **Track changes**
   - Use a spreadsheet to log when rules were last checked
   - Document sources reviewed
   - Note what changed and when

---

## Updating Rules

### Step-by-Step Update Process

#### 1. Research the Change

```markdown
**Change Identified**: 2025 Federal Poverty Level increase
**Effective Date**: January 18, 2025
**Source**: HHS ASPE Federal Poverty Guidelines
**URL**: https://aspe.hhs.gov/2025-poverty-guidelines
**What changed**: FPL increased 3.2% for all household sizes
```

#### 2. Identify Affected Rules

Search rule files for patterns that need updating:
- FPL-based income calculations
- Asset limits (if inflation-adjusted)
- Benefit amounts

Example: All SNAP income rules, Medicaid expansion rules, WIC income rules

#### 3. Create Updated Rule Version

**Before (2024 FPL at 130%):**
```json
{
  "id": "snap-federal-gross-income",
  "version": { "major": 1, "minor": 0, "patch": 0 },
  "effectiveDate": 1704067200000,  // Jan 1, 2024
  "ruleLogic": {
    "<=": [
      { "var": "householdIncome" },
      { "*": [{ "var": "householdSize" }, 1923] }
    ]
  }
}
```

**After (2025 FPL at 130%):**
```json
{
  "id": "snap-federal-gross-income",
  "version": { "major": 1, "minor": 0, "patch": 1 },
  "effectiveDate": 1737244800000,  // Jan 18, 2025
  "expirationDate": null,
  "supersedes": "snap-federal-gross-income-v1.0.0",
  "ruleLogic": {
    "<=": [
      { "var": "householdIncome" },
      { "*": [{ "var": "householdSize" }, 1984] }  // Updated
    ]
  },
  "updatedAt": 1737244800000,
  "changelog": [
    {
      "version": { "major": 1, "minor": 0, "patch": 1 },
      "date": 1737244800000,
      "author": "BenefitFinder Team",
      "description": "Updated gross income limit to reflect 2025 Federal Poverty Guidelines (3.2% increase)",
      "breaking": false
    }
  ]
}
```

#### 4. Update Citations

Add new citation or update existing:
```json
"citations": [
  {
    "title": "SNAP Eligibility Requirements",
    "url": "https://www.fns.usda.gov/snap/recipient/eligibility",
    "legalReference": "7 CFR § 273.9",
    "date": "2025-01-18",
    "notes": "Updated for 2025 FPL"
  },
  {
    "title": "Federal Poverty Guidelines 2025",
    "url": "https://aspe.hhs.gov/2025-poverty-guidelines",
    "date": "2025-01-18",
    "notes": "FPL base: $15,541 for 1 person (3.2% increase from 2024)"
  }
]
```

#### 5. Update Test Cases

Adjust test cases to reflect new thresholds:
```json
{
  "id": "test-boundary-3-person",
  "description": "3-person household at exact limit (2025)",
  "input": {
    "householdIncome": 5952,  // Updated from 5769
    "householdSize": 3
  },
  "expected": true,
  "tags": ["boundary", "edge-case", "2025"]
}
```

#### 6. Update Package Metadata

Increment package version and update timestamps:
```json
{
  "metadata": {
    "id": "snap-federal-rules-2025",
    "version": { "major": 1, "minor": 1, "patch": 0 },
    "updatedAt": 1737244800000
  }
}
```

---

## Testing Updated Rules

### 1. Schema Validation

Ensure updated rules conform to schema:
```typescript
import { validateRuleDefinition } from '@/rules/schema';

const result = validateRuleDefinition(updatedRule);
if (!result.success) {
  console.error('Validation failed:', result.error);
}
```

### 2. Run Embedded Tests

Execute all test cases in the rule:
```typescript
import { testRule } from '@/rules/tester';

const testResults = await testRule(updatedRule);
if (testResults.failed > 0) {
  console.error(`${testResults.failed} test(s) failed`);
}
```

### 3. Regression Testing

Test that changes don't break existing functionality:
- Run all tests in the rule package
- Verify dependent rules still work
- Check edge cases

### 4. Real-World Validation

Compare rule results to official calculators:
- SNAP: State SNAP calculators
- Medicaid: Healthcare.gov eligibility screener
- WIC: State WIC prescreeners

**Example Test**:
```
Household: 3 people, $5,000/month income
2024 Rule Result: Eligible (130% FPL = $5,769)
2025 Rule Result: Eligible (130% FPL = $5,952)
Official Calculator: Eligible ✓
```

---

## Version Management

### Semantic Versioning

Use `major.minor.patch` format:

**Patch** (1.0.X): Small updates, threshold adjustments
- FPL annual updates
- Asset limit inflation adjustments
- Typo corrections
- Citation updates

**Minor** (1.X.0): Non-breaking changes
- Adding new eligibility criteria
- New categorical exemptions
- Additional test cases
- Documentation improvements

**Major** (X.0.0): Breaking changes
- Complete rule overhaul
- Changed logic structure
- Incompatible with previous versions
- Significant policy changes

### Version Examples

```
1.0.0 → 1.0.1: Updated FPL thresholds for 2025
1.0.1 → 1.1.0: Added work requirement exemption for caregivers
1.1.0 → 2.0.0: Complete SNAP rule overhaul due to major policy change
```

### Changelog Format

Every rule update should include a changelog entry:
```json
{
  "changelog": [
    {
      "version": { "major": 1, "minor": 1, "patch": 0 },
      "date": 1737244800000,
      "author": "Your Name",
      "description": "Added exemption for caregivers of children under 6",
      "breaking": false
    },
    {
      "version": { "major": 1, "minor": 0, "patch": 1 },
      "date": 1737244800000,
      "author": "Your Name",
      "description": "Updated income thresholds for 2025 FPL",
      "breaking": false
    }
  ]
}
```

### Deprecation Strategy

When superseding rules:

1. **Mark old rule as inactive**
   ```json
   {
     "id": "snap-federal-gross-income-2024",
     "active": false,
     "expirationDate": 1737244800000,
     "supersededBy": "snap-federal-gross-income-2025"
   }
   ```

2. **Keep old rules for historical reference**
   - Users may need to check past eligibility
   - Useful for appeals or retroactive claims

3. **Set effective dates**
   - Use `effectiveDate` for when new rule starts
   - Use `expirationDate` for when old rule ends

---

## Distribution

### Rule Package Creation

Create distributable rule package:
```json
{
  "metadata": {
    "id": "snap-federal-rules-2025",
    "name": "SNAP Federal Eligibility Rules (2025)",
    "version": { "major": 1, "minor": 1, "patch": 0 },
    "releaseDate": 1737244800000,
    "description": "Updated for 2025 Federal Poverty Guidelines"
  },
  "rules": [ /* all updated rules */ ],
  "checksum": "a3f5b2c8d9e1f0..."  // For integrity verification
}
```

### Distribution Methods

1. **Git Repository** (Primary)
   - Commit updated rules to repository
   - Tag release: `v1.1.0-snap-federal-2025`
   - Create GitHub release with changelog

2. **Rule Package Files** (.bfrules)
   - Export as signed JSON file
   - Distribute to field workers
   - Import via device-to-device sync

3. **App Updates**
   - Include updated rules in app releases
   - Users get updates when updating app
   - No automatic downloads (offline-first principle)

### Release Checklist

- [ ] All rules validated against schema
- [ ] All test cases pass
- [ ] Changelog updated
- [ ] Version numbers incremented
- [ ] Citations updated
- [ ] Documentation reflects changes
- [ ] Checksum calculated
- [ ] Release notes written
- [ ] Git tagged
- [ ] Package created (if applicable)

---

## Monitoring & Tracking

### Maintenance Log Template

Keep a log of all rule updates:

| Date | Program | Change Type | Version | Effective Date | Updated By | Notes |
|------|---------|-------------|---------|----------------|------------|-------|
| 2025-01-18 | SNAP | FPL Update | 1.0.1 | 2025-01-18 | Team | Annual FPL increase |
| 2025-03-15 | Medicaid | State Expansion | 2.0.0 | 2025-04-01 | Team | GA expanded Medicaid |

### Tracking Metrics

Monitor:
- **Last updated date** for each program
- **Days since last review** (alert if > 180 days)
- **Number of rules needing updates**
- **Version distribution** (which versions are in use)

### Alerting System

Set up reminders:
```
January 15: Check for FPL updates
October 1: Review federal fiscal year changes
Quarterly: Review state policy changes
Monthly: Check email subscriptions for policy updates
```

---

## State-Specific Rules

### When States Differ from Federal

Many programs have state variations:

**SNAP**:
- Most rules are federal
- States may have different: asset limits, deductions, categorical eligibility

**Medicaid**:
- Varies significantly by state
- Expansion vs non-expansion
- Different income limits for children

**WIC**:
- Income limits are federal
- Food packages may vary by state
- Local clinic procedures differ

### Managing State Rules

Create separate rule files:
```
src/rules/examples/
  ├── snap-federal-rules.json
  ├── snap-california-rules.json
  ├── snap-georgia-rules.json
  ├── medicaid-federal-rules.json
  ├── medicaid-california-rules.json
  └── medicaid-georgia-rules.json
```

State rules should:
- Reference federal baseline
- Only include state-specific differences
- Link to state-specific sources
- Note effective dates for state changes

---

## Best Practices

### Do's ✅

- **Review rules at least quarterly**
- **Document all changes** with sources
- **Test thoroughly** before releasing
- **Version consistently** using semantic versioning
- **Keep changelogs** up to date
- **Archive old rules** for reference
- **Set up calendar reminders** for annual updates
- **Subscribe to official sources** for updates
- **Validate against official calculators**

### Don'ts ❌

- **Don't skip testing** after updates
- **Don't remove old rules** entirely (keep for history)
- **Don't update without citations**
- **Don't forget to update test cases**
- **Don't ignore state variations**
- **Don't wait too long** to update (rules can become misleading)
- **Never guess at thresholds** - always verify

---

## Troubleshooting

### Common Issues

**Issue**: Updated rule fails tests
**Solution**: Review test case expectations - may need updating along with rule logic

**Issue**: Can't find official source for update
**Solution**: Contact state agency directly, check archived websites, consult advocacy organizations

**Issue**: Multiple rules need updating
**Solution**: Create a batch update - version entire package together

**Issue**: Breaking change required
**Solution**: Increment major version, document breaking changes, provide migration guide

---

## Resources

### Federal Sources

- **Poverty Guidelines**: https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines
- **SNAP**: https://www.fns.usda.gov/snap
- **Medicaid**: https://www.medicaid.gov
- **WIC**: https://www.fns.usda.gov/wic
- **Federal Register**: https://www.federalregister.gov

### Policy Organizations

- **Center on Budget and Policy Priorities (CBPP)**: https://www.cbpp.org
- **National WIC Association**: https://www.nwica.org
- **Medicaid and CHIP Payment and Access Commission (MACPAC)**: https://www.macpac.gov

### Tools

- **Rule Schema Validator**: `src/rules/validator.ts`
- **Rule Tester**: `src/rules/tester.ts`
- **Version Management**: `src/rules/versioning.ts`

---

## Contact & Support

For questions about rule maintenance:
- Open a GitHub issue
- Contact maintainers
- Join community discussions

---

**Remember**: Keeping rules up-to-date is critical for providing accurate benefit information. Set up a sustainable maintenance process and stick to it.

