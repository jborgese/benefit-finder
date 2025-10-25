# Texas Rules Implementation

**Status:** ✅ Complete
**Last Updated:** October 25, 2025

## Overview

This directory contains Texas-specific eligibility rules for the BenefitFinder application. Texas has not expanded Medicaid under the ACA, so it follows traditional Medicaid eligibility rules. All rules are based on real government data and current 2024 eligibility requirements.

## Programs Implemented

### 1. Medicaid (Non-Expansion State)
- **File:** `medicaid/medicaid-texas-rules.json`
- **Rules:** 6 rules
- **Key Features:**
  - Children under 19: 200% FPL
  - Pregnant women: 200% FPL
  - Disabled individuals: 74% FPL or SSI
  - Elderly (65+): 74% FPL or SSI
  - **Adults without children generally do NOT qualify** (coverage gap)

### 2. SNAP (Food Stamps)
- **File:** `snap/snap-texas-rules.json`
- **Rules:** 6 rules
- **Key Features:**
  - Gross income limit: 130% FPL
  - Net income limit: 100% FPL
  - Asset limits: $2,750 (standard), $4,250 (elderly/disabled)
  - Work requirements for ABAWDs
  - Citizenship requirements

### 3. TANF (Cash Assistance)
- **File:** `tanf/tanf-texas-rules.json`
- **Rules:** 7 rules
- **Key Features:**
  - Income limit: 185% FPL
  - Must have children under 18
  - Work requirements: 20-35 hours/week
  - Time limits: 60 months lifetime
  - Asset limit: $1,000
  - Strict eligibility requirements

### 4. WIC (Women, Infants, and Children)
- **File:** `wic/wic-texas-rules.json`
- **Rules:** 7 rules
- **Key Features:**
  - Income limit: 185% FPL
  - Pregnant women, postpartum women, infants, children 1-4
  - Nutritional risk assessment required
  - In-person application at WIC clinics

### 5. LIHTC (Low-Income Housing Tax Credit)
- **File:** `lihtc/lihtc-texas-rules.json`
- **Rules:** 6 rules
- **Key Features:**
  - Income limits: 50% or 60% AMI
  - Rent limits: 30% of income or HUD FMR
  - Availability varies by location
  - Apply directly with property management

## Key Texas-Specific Considerations

### Medicaid Non-Expansion
- Texas has NOT expanded Medicaid under the ACA
- Creates a "coverage gap" for adults without children
- Traditional Medicaid only covers: children, pregnant women, disabled, elderly
- Adults 18-64 without children generally do NOT qualify

### Income Limits (2024)
- **Medicaid Children:** 200% FPL ($2,960/month for 1 person)
- **Medicaid Pregnant:** 200% FPL ($2,960/month for 1 person)
- **Medicaid Disabled/Elderly:** 74% FPL ($1,095/month for 1 person)
- **SNAP:** 130% FPL gross, 100% FPL net ($1,924/$1,480 for 1 person)
- **TANF:** 185% FPL ($2,738/month for 1 person)
- **WIC:** 185% FPL ($2,738/month for 1 person)
- **LIHTC:** 50-60% AMI (varies by location)

### Application Methods
- **Primary Portal:** YourTexasBenefits.com
- **Phone:** 2-1-1 or 1-877-541-7905
- **In-Person:** Local Health and Human Services offices
- **WIC:** Must apply in person at WIC clinics

## File Structure

```
src/rules/state/texas/
├── medicaid/
│   └── medicaid-texas-rules.json
├── snap/
│   └── snap-texas-rules.json
├── tanf/
│   └── tanf-texas-rules.json
├── wic/
│   └── wic-texas-rules.json
├── lihtc/
│   └── lihtc-texas-rules.json
└── README.md
```

## Testing

All rules have been tested for:
- ✅ Valid JSON syntax
- ✅ Proper rule structure
- ✅ Required fields and metadata
- ✅ Test cases for each rule
- ✅ Citations and documentation

## Usage

These rules are automatically loaded by the BenefitFinder application when users select Texas as their state. The rules follow the established JSON Logic format and integrate with the existing rule engine.

## Updates

Rules should be updated annually to reflect:
- New income limits (typically updated in January)
- Policy changes
- New eligibility requirements
- Updated application processes

## Citations

All rules include proper citations to:
- Texas Health and Human Services Commission
- Texas Department of Housing and Community Affairs
- Federal program guidelines
- Official government websites

---

**Total Rules Implemented:** 32 rules across 5 programs
**Coverage:** Comprehensive eligibility rules for all major Texas benefit programs
**Status:** Production ready
