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

## Rule Maintenance Checklist Template

Use this comprehensive checklist when adding or updating benefit program rules to ensure consistency, accuracy, and completeness.

### 📋 New Rule Set Checklist

**Program Information**
- [ ] Program name clearly defined (e.g., "SNAP", "Medicaid", "WIC")
- [ ] Jurisdiction specified (e.g., "US-CA", "US-GA", "US-Federal")
- [ ] Effective year identified (e.g., 2025)
- [ ] Program ID follows naming convention (e.g., `snap-federal-gross-income`)

**Research & Documentation**
- [ ] Official program website reviewed
- [ ] Current eligibility requirements documented
- [ ] Income thresholds verified (if applicable)
- [ ] Asset limits verified (if applicable)
- [ ] Categorical eligibility rules identified
- [ ] Special exemptions/waivers documented
- [ ] State-specific variations researched (if applicable)

**Citations & Sources**
- [ ] At least one authoritative citation added
- [ ] Citation includes program name/regulation number
- [ ] Citation includes URL to official source
- [ ] Citation includes access/retrieval date
- [ ] Legal references added (e.g., CFR citations, state statutes)
- [ ] Backup sources documented (in case primary source changes)
- [ ] Citations validated with `node scripts/check-citations.js`

**Example Citations:**
```json
"citations": [
  {
    "title": "SNAP Eligibility Requirements",
    "url": "https://www.fns.usda.gov/snap/recipient/eligibility",
    "legalReference": "7 CFR § 273.9",
    "date": "2025-01-18",
    "notes": "Federal gross income limit: 130% FPL"
  },
  {
    "title": "Federal Poverty Guidelines 2025",
    "url": "https://aspe.hhs.gov/2025-poverty-guidelines",
    "date": "2025-01-18",
    "notes": "FPL base: $15,541 for 1 person"
  }
]
```

**Rule Logic Implementation**
- [ ] Rule logic implemented using json-logic-js syntax
- [ ] Variables clearly named (use snake_case)
- [ ] Numeric thresholds accurate and current
- [ ] Boolean conditions properly structured
- [ ] Complex conditions broken into readable sub-rules
- [ ] Edge cases handled (e.g., zero income, very large households)
- [ ] Rule logic tested manually with sample data

**Metadata**
- [ ] Rule ID unique and descriptive
- [ ] Version number assigned (start at 1.0.0)
- [ ] Effective date set (Unix timestamp)
- [ ] Expiration date set (if known) or null
- [ ] Description clearly explains what rule checks
- [ ] Tags added for categorization (e.g., ["income", "federal", "snap"])
- [ ] Author/creator documented

**Required Documents**
- [ ] List of required documents complete
- [ ] Documents match official requirements
- [ ] Documents described in plain language
- [ ] State-specific documents included (if applicable)

**Next Steps & Application Info**
- [ ] Application method documented
- [ ] Application URL provided (if online application exists)
- [ ] Phone numbers included (if applicable)
- [ ] Office locations referenced (if in-person required)
- [ ] Estimated processing time noted (if known)

**Test Cases**
- [ ] At least 3 test cases created (pass, fail, boundary)
- [ ] Boundary conditions tested (exactly at threshold)
- [ ] Edge cases covered (e.g., household size = 1, 8+)
- [ ] Real-world scenarios validated
- [ ] Expected results documented for each test
- [ ] Test descriptions are clear and specific

**Example Test Cases:**
```json
"tests": [
  {
    "id": "test-eligible-below-limit",
    "description": "4-person household well below income limit",
    "input": {
      "householdIncome": 4000,
      "householdSize": 4,
      "citizenship": true
    },
    "expected": true,
    "tags": ["pass", "typical"]
  },
  {
    "id": "test-ineligible-above-limit",
    "description": "2-person household above income limit",
    "input": {
      "householdIncome": 5000,
      "householdSize": 2,
      "citizenship": true
    },
    "expected": false,
    "tags": ["fail", "above-threshold"]
  },
  {
    "id": "test-boundary-exact-limit",
    "description": "3-person household at exact income limit",
    "input": {
      "householdIncome": 5952,
      "householdSize": 3,
      "citizenship": true
    },
    "expected": true,
    "tags": ["boundary", "edge-case"]
  }
]
```

**Schema Validation**
- [ ] Rule validates against schema using `npm run validate-rules`
- [ ] All required fields present
- [ ] Field types correct (string, number, boolean, array, object)
- [ ] No validation errors or warnings

**Integration Testing**
- [ ] Rule loads correctly in application
- [ ] Rule appears in questionnaire flow (if applicable)
- [ ] Results display correctly
- [ ] Explanation text renders properly
- [ ] Links/URLs are clickable and correct

**Comparison & Verification**
- [ ] Results compared to official eligibility calculator (if available)
- [ ] Test cases validated against official examples
- [ ] Cross-checked with state/federal policy manuals
- [ ] Reviewed by subject matter expert (if possible)

**Version Control**
- [ ] Rule file added to `src/rules/examples/` directory
- [ ] File named consistently (e.g., `snap-california-rules.json`)
- [ ] Git commit message describes what was added
- [ ] Branch created for new rule set (if using Git Flow)

---

### 🔄 Rule Update Checklist

**Change Identification**
- [ ] Change identified (policy update, FPL increase, correction)
- [ ] Effective date of change determined
- [ ] Source of change documented (law, regulation, policy memo)
- [ ] Scope of change assessed (affects how many rules?)

**Research & Verification**
- [ ] Official announcement/documentation obtained
- [ ] New thresholds/criteria verified from multiple sources
- [ ] Change confirmed to be active (not proposed)
- [ ] State vs. federal change clarified

**Rule Modification**
- [ ] Rule logic updated with new values/conditions
- [ ] Version number incremented appropriately:
  - [ ] Patch (X.X.1) for threshold updates
  - [ ] Minor (X.1.0) for new criteria/exemptions
  - [ ] Major (2.0.0) for breaking changes
- [ ] Effective date updated
- [ ] Expiration date set for old rule (if replacing)
- [ ] `supersedes` field added (referencing old rule ID)

**Changelog**
- [ ] Changelog entry added to rule
- [ ] Version, date, and author specified
- [ ] Clear description of what changed
- [ ] Breaking change flag set (true/false)

**Example Changelog Entry:**
```json
{
  "changelog": [
    {
      "version": { "major": 1, "minor": 0, "patch": 1 },
      "date": 1737244800000,
      "author": "Your Name",
      "description": "Updated gross income limit from $1923 to $1984 per person to reflect 2025 Federal Poverty Guidelines (3.2% increase)",
      "breaking": false
    }
  ]
}
```

**Citations Update**
- [ ] New citations added for policy change
- [ ] Citation dates updated
- [ ] Old citations marked as historical (if applicable)
- [ ] Legal references updated if regulation changed

**Test Cases Update**
- [ ] Existing test cases updated with new thresholds
- [ ] New test cases added for new conditions (if applicable)
- [ ] Boundary test values recalculated
- [ ] All tests pass with new rule logic

**Validation & Testing**
- [ ] Schema validation passes (`npm run validate-rules`)
- [ ] Citations check passes (`node scripts/check-citations.js`)
- [ ] All embedded tests pass
- [ ] Manual testing with sample scenarios
- [ ] Compared results to official calculator (if available)

**Regression Testing**
- [ ] Related rules still work correctly
- [ ] No unintended side effects introduced
- [ ] Application still runs without errors
- [ ] Results page displays correctly

**Documentation**
- [ ] Maintenance log updated with change details
- [ ] README updated (if needed)
- [ ] User-facing documentation updated (if eligibility criteria changed significantly)
- [ ] Developer notes added (if complex change)

**Version Control & Release**
- [ ] Changes committed to version control
- [ ] Commit message follows convention (e.g., "fix(snap): Update 2025 FPL thresholds")
- [ ] Pull request created (if using PR workflow)
- [ ] Code reviewed (if team process)
- [ ] Tagged release created (e.g., `v1.1.0-snap-federal-2025`)
- [ ] Release notes written

**Distribution**
- [ ] Rule package created (if distributing separately)
- [ ] Checksum calculated for integrity verification
- [ ] Package tested on target devices (if applicable)
- [ ] Stakeholders notified of update

---

### 🔍 Annual Review Checklist (January)

Use this checklist every January for Federal Poverty Level updates:

**FPL Research**
- [ ] Check HHS ASPE website for new FPL guidelines (usually mid-January)
- [ ] Confirm FPL effective date
- [ ] Document percent increase from prior year
- [ ] Download official FPL table/PDF for reference

**Programs to Update**
- [ ] SNAP (130% FPL gross income, 100% FPL net income)
- [ ] Medicaid (varies by state, typically 138% FPL for expansion states)
- [ ] WIC (185% FPL in most states)
- [ ] LIHEAP (150% FPL federal baseline, states vary)
- [ ] CHIP (varies by state, typically 200-300% FPL)
- [ ] Weatherization Assistance (200% FPL)
- [ ] Free/Reduced School Meals (130%/185% FPL)

**Calculation Updates**
- [ ] Update base FPL amounts for each household size
- [ ] Recalculate all percentage-based thresholds (130%, 185%, etc.)
- [ ] Update monthly income limits
- [ ] Update annual income limits
- [ ] Verify calculations with official calculator

**Multi-State Updates**
- [ ] Update federal baseline rules
- [ ] Check if any states have different FPL percentages
- [ ] Update state-specific rules that reference FPL
- [ ] Document which states differ from federal

**Testing**
- [ ] Test all FPL-dependent rules
- [ ] Verify boundary conditions with new thresholds
- [ ] Compare results to official calculators for each program
- [ ] Run full test suite

**Documentation**
- [ ] Update all citations with 2025 FPL reference
- [ ] Update changelog for each affected rule
- [ ] Create summary document of all FPL-related changes
- [ ] Update maintenance log

---

### ✅ Pre-Release Checklist

Before releasing any rule updates, verify:

**Quality Assurance**
- [ ] All validation checks pass
- [ ] All tests pass (unit, integration, E2E if applicable)
- [ ] Citations present and verified
- [ ] No console errors when rules load
- [ ] Performance acceptable (rules load in <100ms)

**Documentation**
- [ ] Changelog complete for all changes
- [ ] Version numbers correct
- [ ] Release notes drafted
- [ ] Migration guide written (if breaking changes)

**Testing**
- [ ] Tested in development environment
- [ ] Tested with actual benefit scenarios
- [ ] Peer reviewed (if possible)
- [ ] Validated against official sources

**Compliance**
- [ ] No personal identifiable information (PII) in test cases
- [ ] Privacy-preserving (offline-first maintained)
- [ ] Open source license compliance
- [ ] Accessibility requirements met (if UI changes)

**Distribution Readiness**
- [ ] Git repository up-to-date
- [ ] Tagged release created
- [ ] Package files generated (if applicable)
- [ ] Checksum/signature created for integrity
- [ ] Distribution channels identified

---

### 📝 Maintenance Log Template

Keep a running log of all rule maintenance activities:

```markdown
## Rule Maintenance Log

### 2025-01-18: SNAP Federal FPL Update
**Program**: SNAP (Federal)
**Change Type**: Annual FPL Update
**Version**: 1.0.0 → 1.0.1
**Effective Date**: January 18, 2025
**Updated By**: Your Name

**Changes Made**:
- Updated gross income limit from $1923 to $1984 per person (130% FPL)
- Updated net income limit from $1480 to $1526 per person (100% FPL)
- Updated all test cases with new thresholds

**Sources**:
- [HHS 2025 Poverty Guidelines](https://aspe.hhs.gov/2025-poverty-guidelines)
- [USDA SNAP FY2025 Update](https://www.fns.usda.gov/snap/fy2025)

**Testing**:
- ✅ Schema validation passed
- ✅ All 12 test cases passed
- ✅ Verified against USDA SNAP calculator
- ✅ Citations check passed

**Notes**: 3.2% increase from 2024. All 50 states + DC updated.

---

### 2025-03-15: Georgia Medicaid Expansion
**Program**: Medicaid (Georgia)
**Change Type**: State Policy Change
**Version**: 1.0.0 → 2.0.0 (breaking change)
**Effective Date**: April 1, 2025
**Updated By**: Your Name

**Changes Made**:
- Added Medicaid expansion eligibility for adults (138% FPL)
- Created new rule set for expansion population
- Updated GA-specific Medicaid rules

**Sources**:
- [Georgia Department of Community Health](https://dch.georgia.gov/medicaid-expansion)
- Georgia HB 150 (2025 Session)

**Testing**:
- ✅ New test cases created for expansion population
- ✅ Compared to Healthcare.gov eligibility screener
- ✅ All 18 test cases passed

**Notes**: Major policy change. Marks first Medicaid expansion in Georgia. Work requirements apply for some enrollees.

---
```

---

## Contact & Support

For questions about rule maintenance:
- Open a GitHub issue
- Contact maintainers
- Join community discussions

---

**Remember**: Keeping rules up-to-date is critical for providing accurate benefit information. Set up a sustainable maintenance process and stick to it. Use these checklists to ensure nothing is overlooked.

