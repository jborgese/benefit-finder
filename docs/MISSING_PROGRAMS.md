# Missing Benefit Programs

This document tracks federal and state-exclusive benefit programs that are not yet implemented in the app, based on the current rules present under `src/rules` as of 2025-12-03.

## Federal Programs To Add

- LIHEAP (Low Income Home Energy Assistance Program)
  - Category: `utilities`
  - Coverage: Nationwide (state-administered)
  - Typical Eligibility: ~150% FPL; crisis and weatherization components
  - Proposed IDs: `liheap-federal`, plus `liheap-<state>` variants
- CHIP (Children's Health Insurance Program)
  - Category: `healthcare`
  - Coverage: Nationwide (state-branded)
  - Notes: Some states integrate into Medicaid (e.g., PeachCare GA, HAWK-I IA)
  - Proposed IDs: `chip-federal`, `chip-<state>` (or state brand where applicable)
- National School Lunch / School Breakfast (Free & Reduced Meals)
  - Category: `food`
  - Eligibility: Free ≤130% FPL, Reduced ≤185% FPL; categorical via SNAP/Medicaid
  - Proposed IDs: `nslp-federal`, `sbp-federal`
- ACA Marketplace Premium Tax Credits & Cost-Sharing Reductions
  - Category: `healthcare`
  - Eligibility: 100–400%+ FPL with enhanced credits; CSR at ≤250% FPL
  - Proposed IDs: `aca-ptc-federal`, `aca-csr-federal`
- Lifeline (phone) and ACP successor (internet)
  - Category: `utilities`
  - Eligibility: ~135% FPL or participation in SNAP/Medicaid/SSI, etc.
  - Proposed IDs: `lifeline-federal`
- Veterans Benefits (individual-facing programs)
  - VA Pension (low-income wartime veterans)
  - VA Healthcare enrollment
  - VA Disability Compensation
  - Proposed IDs: `va-pension-federal`, `va-healthcare-federal`, `va-disability-federal`
- Social Security programs beyond SSI
  - SSDI (Social Security Disability Insurance)
  - Retirement (old-age) benefits
  - Proposed IDs: `ssdi-federal`, `ssa-retirement-federal`
- Unemployment Insurance (UI)
  - Category: `financial`
  - Coverage: State-administered with federal baseline
  - Proposed IDs: `ui-federal`, `ui-<state>`
- Medicare & Medicare Savings Programs
  - Parts A/B/C/D eligibility; QMB/SLMB/QI savings programs
  - Proposed IDs: `medicare-federal`, `medicare-savings-federal`
- Child Care and Development Fund (CCDF)
  - Category: `childcare`
  - State-administered subsidies
  - Proposed IDs: `ccdf-federal`, `ccdf-<state>`
- Head Start / Early Head Start
  - Category: `education`
  - Proposed IDs: `headstart-federal`, `early-headstart-federal`
- Pell Grants
  - Category: `education`
  - Proposed IDs: `pell-federal`
- Additional food/nutrition programs
  - CSFP (seniors) — `csfp-federal`
  - TEFAP — `tefap-federal`
  - Senior Farmers' Market — `sfmnp-federal`
- Housing beyond Section 8 vouchers
  - Public Housing — `public-housing-federal`
- Indian Health Service (IHS)
  - `ihs-federal`
- Workforce programs (WIOA)
  - `wioa-federal`
- Federal student loan relief pathways
  - IDR, PSLF — `student-loan-relief-federal`

## State-Exclusive Programs To Add

These are prominent state-branded programs or major state-administered categories missing from current coverage.

### California
- CalWORKs (state TANF) — `calworks-california`
- CAPI (Cash Assistance Program for Immigrants) — `capi-california`
- CFAP (California Food Assistance Program) — `cfap-california`
- Restaurant Meals Program (CalFresh RMP) — `calfresh-rmp-california`
- Covered California (ACA marketplace) — `covered-california`
- Healthy Families/other legacy names if applicable

### Texas
- CHIP Perinatal — `chip-perinatal-texas`
- Healthy Texas Women — `healthy-texas-women`
- Medicaid Buy-In (for workers with disabilities) — `medicaid-buyin-texas`
- Texas Rising Star (quality-linked childcare subsidy) — `texas-rising-star`
- Texas Works (TANF branding) — `tanf-texas-works`

### New York
- HEAP (energy assistance) — `heap-new-york`
- ERAP (rental assistance, if active) — `erap-new-york`
- Child Care Assistance Program (CCAP) — `ccap-new-york`
- Family Assistance (FA) — `tanf-new-york-fa`
- Safety Net Assistance (SNA) — `cash-assistance-new-york-sna`

### Massachusetts
- ConnectorCare (marketplace subsidies) — `connectorcare-massachusetts`
- EAEDC (Emergency Aid to the Elderly, Disabled, and Children) — `eaedc-massachusetts`

### Illinois
- LIHEAP (state-administered) — `liheap-illinois`
- All Kids (already referenced; ensure CHIP coverage) — `chip-illinois`

### Pennsylvania
- LIHEAP / LIURP — `liheap-pennsylvania`, `liurp-pennsylvania`
- Child Care Works (CCDF) — `ccdf-pennsylvania`

### Florida
- KidCare (CHIP umbrella) — `chip-florida-kidcare`
- Temporary Cash Assistance (state TANF) — `tca-florida`

### Georgia
- CAPS (Childcare and Parent Services) — `ccdf-georgia-caps`

### Common State Categories (multi-state rollouts)
- LIHEAP implementations in all states — `liheap-<state>`
- CCDF childcare subsidies in all states — `ccdf-<state>`
- State Earned Income Tax Credit — `eitc-<state>`
- State Child Tax Credit — `ctc-<state>`
- State rental assistance (ongoing/local) — `rental-assistance-<state>`
- State workforce/job training — `workforce-<state>`
- Transportation vouchers/subsidies where applicable — `transportation-<state>`

## Notes

- Several state health programs already appear under Medicaid/CHIP branding (e.g., `peachcare-georgia`, `hawk-i` for Iowa). Ensure CHIP coverage is complete and consistent across states.
- Alaska/Hawaii require adjusted FPL thresholds; reflect in LIHEAP, CCDF, and other income-tested programs.
- For each added program, include `metadata.programs`, `jurisdiction`, `category`, `eligibility` rules, and `requiredDocuments` per the existing schema in `docs/RULE_SCHEMA.md`.
- Consider seeding via the Dynamic Rule Discovery pipeline (`docs/DYNAMIC_RULE_DISCOVERY.md`).
