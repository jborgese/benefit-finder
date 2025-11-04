# California Rules Redundancy Review

**Date:** 2025-01-15
**Status:** ✅ Identified redundancies, recommendations provided

## Summary

After reviewing all California Medi-Cal and SNAP rules, several redundancies were identified between the general rules file (`medi-cal-california-rules.json`) and specialized files (`medi-cal-children-rules.json`, `medi-cal-pregnancy-rules.json`, `medi-cal-immigrant-rules.json`).

## Identified Redundancies

### 1. **Children Rules - DUPLICATE**

**Location 1:** `medi-cal-california-rules.json`
- Rule ID: `medi-cal-ca-children`
- Priority: 28
- Logic: Children < 19, income ≤ 266% FPL ($3,938/month for 1 person)

**Location 2:** `medi-cal-children-rules.json`
- Rule ID: `medi-cal-ca-children-266-percent`
- Priority: 28
- Logic: **Identical** - Children < 19, income ≤ 266% FPL ($3,938/month for 1 person)

**Recommendation:** ✅ Remove from general file. The children-specific file provides better organization and includes additional rules (immigrant children, year-round enrollment).

---

### 2. **Pregnancy Rules - DUPLICATE**

**Location 1:** `medi-cal-california-rules.json`
- Rule ID: `medi-cal-ca-pregnant-women`
- Priority: 25
- Logic: Pregnant, income ≤ 322% FPL ($4,768/month for 1 person)

**Location 2:** `medi-cal-pregnancy-rules.json`
- Rule ID: `medi-cal-ca-pregnancy-322-percent`
- Priority: 25
- Logic: **Identical** - Pregnant, income ≤ 322% FPL ($4,768/month for 1 person)

**Recommendation:** ✅ Remove from general file. The pregnancy-specific file provides more comprehensive coverage including immigrant pregnancy rules, postpartum coverage, and presumptive eligibility.

---

### 3. **Immigrant Rules - PARTIAL OVERLAP**

**Location 1:** `medi-cal-california-rules.json`
- Rule ID: `medi-cal-ca-immigrant-expansion`
- Priority: 32
- Scope: General immigrant eligibility (federal + state-funded)

**Location 2:** `medi-cal-immigrant-rules.json`
- Rule IDs: `medi-cal-ca-daca-coverage`, `medi-cal-ca-lawfully-present`, `medi-cal-ca-emergency-coverage`
- Priorities: 35, 33, 40
- Scope: **More specific** - DACA-specific, lawfully present-specific, emergency coverage

**Analysis:** The general rule in `medi-cal-california-rules.json` covers the same population but less specifically. The specialized file breaks down by immigration status and includes emergency coverage.

**Recommendation:** ⚠️ **Keep both but note overlap.** The general rule serves as a catch-all, while specialized rules provide specific guidance. However, consider consolidating to avoid confusion.

---

### 4. **Application Process - REDUNDANT CONTENT**

**Location 1:** `medi-cal-california-rules.json`
- Rule ID: `medi-cal-ca-application-process`
- Type: Conditional
- Priority: 10
- Content: General application information for all Medi-Cal

**Location 2:** All specialized files
- Content: Application steps included in `nextSteps` of each eligibility rule

**Analysis:** Application information is duplicated across multiple rules. Each eligibility rule in specialized files includes application steps in `nextSteps`.

**Recommendation:** ✅ **Keep the general application process rule** as it provides comprehensive application information. The `nextSteps` in individual rules should reference this or provide program-specific guidance.

---

## Recommendations

### Immediate Actions

1. ✅ **Remove duplicate children rule** from `medi-cal-california-rules.json`
   - Keep only `medi-cal-ca-children-266-percent` in `medi-cal-children-rules.json`

2. ✅ **Remove duplicate pregnancy rule** from `medi-cal-california-rules.json`
   - Keep only `medi-cal-ca-pregnancy-322-percent` in `medi-cal-pregnancy-rules.json`

3. ⚠️ **Review immigrant rules** - Consider consolidating general and specific immigrant rules
   - Option A: Keep general rule, remove from specialized file
   - Option B: Remove general rule, rely on specific rules (recommended)

4. ✅ **Keep application process rule** - It serves as a central reference point

### Benefits of Removing Redundancies

- **Reduced rule count:** Fewer rules to maintain and validate
- **Clearer organization:** Rules live in their logical specialized files
- **Reduced confusion:** Users see rules once, not duplicated
- **Better performance:** Fewer rules to evaluate
- **Easier maintenance:** Single source of truth for each rule

### File Organization After Cleanup

```
medi-cal-california-rules.json (General)
├── Adult expansion (138% FPL)
├── Disability coverage
└── Application process

medi-cal-children-rules.json (Children-specific)
├── Children 266% FPL
├── Immigrant children
└── Year-round enrollment

medi-cal-pregnancy-rules.json (Pregnancy-specific)
├── Pregnancy 322% FPL
├── Immigrant pregnancy
├── Postpartum 12 months
└── Presumptive eligibility

medi-cal-immigrant-rules.json (Immigrant-specific)
├── DACA coverage
├── Lawfully present
└── Emergency coverage
```

## Impact Assessment

### Rule IDs to Remove
- `medi-cal-ca-children` (from general file)
- `medi-cal-ca-pregnant-women` (from general file)

### Potential Breaking Changes
- ⚠️ Any code that specifically references these rule IDs will need updating
- ✅ The specialized files provide equivalent coverage
- ✅ Dynamic loader should handle this automatically

## Next Steps

1. Review and approve recommendations
2. Remove redundant rules from `medi-cal-california-rules.json`
3. Run validation: `npm run validate-rules`
4. Update any hardcoded rule ID references if they exist
5. Test eligibility evaluation to ensure no regression
