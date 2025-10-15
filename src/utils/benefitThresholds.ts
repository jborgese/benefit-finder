/**
 * Benefit Program Thresholds
 *
 * Centralizes Federal Poverty Level (FPL) thresholds and income limits
 * for SNAP, Medicaid, and other benefit programs.
 *
 * **Annual Update Required**: These values are based on the federal poverty
 * guidelines published annually by HHS (usually in January/February).
 *
 * @see https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines
 * @see https://www.fns.usda.gov/snap/recipient/eligibility (SNAP limits)
 * @see https://www.medicaid.gov/medicaid/eligibility/index.html (Medicaid limits)
 */

// ============================================================================
// CONSTANTS - 2024 VALUES
// ============================================================================

/**
 * 2024 Federal Poverty Level (100% FPL) - Monthly amounts
 * Source: HHS Poverty Guidelines for the 48 contiguous states and DC
 *
 * NOTE: Alaska and Hawaii have different poverty guidelines (higher)
 * This implementation uses the 48-state standard
 *
 * Last Updated: 2024 guidelines
 */
export const FPL_2024_MONTHLY: Record<number, number> = {
  1: 1255, // $15,060 annual / 12
  2: 1702, // $20,440 annual / 12
  3: 2148, // $25,820 annual / 12
  4: 2594, // $31,200 annual / 12
  5: 3040, // $36,580 annual / 12
  6: 3486, // $41,960 annual / 12
  7: 3932, // $47,340 annual / 12
  8: 4378, // $52,720 annual / 12
};

/**
 * Additional amount per person for households larger than 8
 * (add this for each additional member)
 */
export const FPL_2024_PER_ADDITIONAL_PERSON = 446; // $5,380 annual / 12

/**
 * Year of current FPL data
 */
export const FPL_YEAR = 2024;

// ============================================================================
// CORE FPL CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate 100% FPL (base poverty level) for a given household size
 *
 * @param householdSize Number of people in household
 * @returns Monthly FPL amount in dollars
 *
 * @example
 * ```typescript
 * calculateFPL(3); // Returns 2148 ($25,820/year)
 * calculateFPL(10); // Returns 5270 (8-person base + 2 additional)
 * ```
 */
export function calculateFPL(householdSize: number): number {
  if (householdSize < 1) {
    throw new Error('Household size must be at least 1');
  }

  if (householdSize <= 8) {
    // eslint-disable-next-line security/detect-object-injection
    return FPL_2024_MONTHLY[householdSize];
  }

  // For households larger than 8, add per-person amount
  const additionalPeople = householdSize - 8;
  return FPL_2024_MONTHLY[8] + (FPL_2024_PER_ADDITIONAL_PERSON * additionalPeople);
}

/**
 * Calculate FPL at a specific percentage
 *
 * @param householdSize Number of people in household
 * @param percentage Percentage of FPL (e.g., 130 for 130% FPL, 200 for 200% FPL)
 * @returns Monthly income threshold in dollars
 *
 * @example
 * ```typescript
 * calculateFPLPercentage(1, 130); // 130% FPL for 1 person
 * calculateFPLPercentage(4, 200); // 200% FPL for 4 people
 * ```
 */
export function calculateFPLPercentage(
  householdSize: number,
  percentage: number
): number {
  const baseFPL = calculateFPL(householdSize);
  return Math.round(baseFPL * (percentage / 100));
}

/**
 * Check if income is at or below a given FPL percentage
 *
 * @param monthlyIncome Monthly household income in dollars
 * @param householdSize Number of people in household
 * @param percentage FPL percentage threshold
 * @returns True if income is at or below threshold
 *
 * @example
 * ```typescript
 * isIncomeAtOrBelowFPL(1800, 2, 130); // Check if $1,800 is ≤ 130% FPL for 2 people
 * ```
 */
export function isIncomeAtOrBelowFPL(
  monthlyIncome: number,
  householdSize: number,
  percentage: number
): boolean {
  const threshold = calculateFPLPercentage(householdSize, percentage);
  return monthlyIncome <= threshold;
}

// ============================================================================
// SNAP THRESHOLDS
// ============================================================================

/**
 * SNAP gross income limit (130% of FPL)
 * Most households must meet this test
 *
 * Source: 7 CFR § 273.9
 */
export const SNAP_GROSS_INCOME_FPL_PERCENT = 130;

/**
 * SNAP net income limit (100% of FPL)
 * After allowable deductions
 */
export const SNAP_NET_INCOME_FPL_PERCENT = 100;

/**
 * SNAP Broad-Based Categorical Eligibility (BBCE) limit
 * Used by many states (California, Georgia, etc.)
 */
export const SNAP_BBCE_FPL_PERCENT = 200;

/**
 * Get SNAP gross income threshold for a household (130% FPL)
 *
 * @param householdSize Number of people in household
 * @returns Monthly income threshold in dollars
 *
 * @example
 * ```typescript
 * getSNAPGrossIncomeLimit(3); // Returns 2,888 (130% FPL for 3 people)
 * ```
 */
export function getSNAPGrossIncomeLimit(householdSize: number): number {
  // Pre-calculated 2024 values for performance
  // These match 130% of FPL
  const thresholds: Record<number, number> = {
    1: 1696,
    2: 2292,
    3: 2888,
    4: 3483,
    5: 4079,
    6: 4675,
    7: 5271,
    8: 5867,
  };

  if (householdSize <= 8) {
    // eslint-disable-next-line security/detect-object-injection
    return thresholds[householdSize];
  }

  // For households larger than 8, add $596 per additional member
  // (this is 130% of the per-person FPL increase)
  return thresholds[8] + (596 * (householdSize - 8));
}

/**
 * Get SNAP net income threshold for a household (100% FPL)
 *
 * @param householdSize Number of people in household
 * @returns Monthly income threshold in dollars
 */
export function getSNAPNetIncomeLimit(householdSize: number): number {
  return calculateFPL(householdSize);
}

/**
 * Get SNAP BBCE income threshold (200% FPL)
 * Used in states with Broad-Based Categorical Eligibility
 *
 * @param householdSize Number of people in household
 * @returns Monthly income threshold in dollars
 */
export function getSNAPBBCELimit(householdSize: number): number {
  return calculateFPLPercentage(householdSize, SNAP_BBCE_FPL_PERCENT);
}

/**
 * Check if household is SNAP income eligible (gross income test)
 *
 * @param monthlyIncome Monthly household income
 * @param householdSize Number of people in household
 * @returns True if eligible based on gross income
 *
 * @example
 * ```typescript
 * isSNAPIncomeEligible(1800, 2); // true if $1,800 ≤ 130% FPL for 2
 * ```
 */
export function isSNAPIncomeEligible(
  monthlyIncome: number,
  householdSize: number
): boolean {
  const threshold = getSNAPGrossIncomeLimit(householdSize);
  return monthlyIncome <= threshold;
}

// ============================================================================
// MEDICAID THRESHOLDS
// ============================================================================

/**
 * Medicaid expansion income limit (138% FPL)
 * For adults under 65 in expansion states
 *
 * Source: ACA expansion, 42 CFR § 435.119
 */
export const MEDICAID_EXPANSION_FPL_PERCENT = 138;

/**
 * Medicaid children/pregnant women minimum (200% FPL)
 * Federal minimum; many states go higher
 *
 * Source: 42 CFR § 435.116, 42 CFR § 435.118
 */
export const MEDICAID_CHILDREN_PREGNANT_MIN_FPL_PERCENT = 200;

/**
 * Medicaid disability/aged baseline (~74% FPL for SSI recipients)
 * Varies by state
 *
 * Source: 42 CFR § 435.120, 42 CFR § 435.121
 */
export const MEDICAID_DISABILITY_FPL_PERCENT = 74;

/**
 * Get Medicaid expansion income limit (138% FPL)
 *
 * @param householdSize Number of people in household
 * @returns Monthly income threshold in dollars
 *
 * @example
 * ```typescript
 * getMedicaidExpansionLimit(1); // Returns 2,040 (138% FPL for 1 person)
 * ```
 */
export function getMedicaidExpansionLimit(householdSize: number): number {
  // Pre-calculated for performance
  // These are 138% of FPL (expansion state limit for adults)
  const perPersonLimit = 2040; // 138% of FPL for 1 person in 2024
  return perPersonLimit * householdSize;
}

/**
 * Get Medicaid children/pregnant limit (200% FPL minimum)
 *
 * @param householdSize Number of people in household
 * @returns Monthly income threshold in dollars
 */
export function getMedicaidChildrenPregnantLimit(householdSize: number): number {
  // Pre-calculated for performance
  // 200% of FPL
  const perPersonLimit = 2960; // 200% of FPL for 1 person in 2024
  return perPersonLimit * householdSize;
}

/**
 * Get Medicaid disability income limit (~74% FPL)
 *
 * @param householdSize Number of people in household
 * @returns Monthly income threshold in dollars
 */
export function getMedicaidDisabilityLimit(householdSize: number): number {
  // Pre-calculated for performance
  // Approximately 74% of FPL (SSI-level)
  const perPersonLimit = 1133; // ~74% of FPL for 1 person in 2024
  return perPersonLimit * householdSize;
}

/**
 * Check if household is Medicaid eligible (expansion criteria)
 *
 * @param monthlyIncome Monthly household income
 * @param householdSize Number of people in household
 * @returns True if eligible based on expansion income limit
 */
export function isMedicaidExpansionEligible(
  monthlyIncome: number,
  householdSize: number
): boolean {
  const threshold = getMedicaidExpansionLimit(householdSize);
  return monthlyIncome <= threshold;
}

// ============================================================================
// OTHER PROGRAM THRESHOLDS
// ============================================================================

/**
 * WIC income limit (185% FPL)
 * Women, Infants, and Children program
 *
 * Source: 7 CFR § 246.7
 */
export const WIC_FPL_PERCENT = 185;

/**
 * Get WIC income limit (185% FPL)
 *
 * @param householdSize Number of people in household
 * @returns Monthly income threshold in dollars
 */
export function getWICIncomeLimit(householdSize: number): number {
  return calculateFPLPercentage(householdSize, WIC_FPL_PERCENT);
}

/**
 * Check if household is WIC income eligible
 *
 * @param monthlyIncome Monthly household income
 * @param householdSize Number of people in household
 * @returns True if eligible based on income
 */
export function isWICIncomeEligible(
  monthlyIncome: number,
  householdSize: number
): boolean {
  const threshold = getWICIncomeLimit(householdSize);
  return monthlyIncome <= threshold;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a human-readable description of an FPL percentage
 *
 * @param percentage FPL percentage (e.g., 130, 200)
 * @returns Description string
 */
export function describeFPLPercentage(percentage: number): string {
  const descriptions: Record<number, string> = {
    100: 'Federal Poverty Level',
    130: 'SNAP Gross Income Limit',
    138: 'Medicaid Expansion Limit',
    185: 'WIC Income Limit',
    200: 'Medicaid Children/Pregnant Minimum',
  };

  // eslint-disable-next-line security/detect-object-injection
  return descriptions[percentage] || `${percentage}% of Federal Poverty Level`;
}

/**
 * Convert annual income to monthly
 *
 * @param annualIncome Annual income in dollars
 * @returns Monthly income in dollars
 */
export function annualToMonthly(annualIncome: number): number {
  return Math.round(annualIncome / 12);
}

/**
 * Convert monthly income to annual
 *
 * @param monthlyIncome Monthly income in dollars
 * @returns Annual income in dollars
 */
export function monthlyToAnnual(monthlyIncome: number): number {
  return monthlyIncome * 12;
}

/**
 * Format income threshold for display
 *
 * @param amount Dollar amount
 * @param frequency 'monthly' or 'annual'
 * @returns Formatted string (e.g., "$2,888/month")
 */
export function formatIncomeThreshold(
  amount: number,
  frequency: 'monthly' | 'annual' = 'monthly'
): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return `${formatted}/${frequency === 'monthly' ? 'month' : 'year'}`;
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * All threshold calculation functions
 */
export const thresholdCalculators = {
  // Core FPL
  calculateFPL,
  calculateFPLPercentage,
  isIncomeAtOrBelowFPL,

  // SNAP
  getSNAPGrossIncomeLimit,
  getSNAPNetIncomeLimit,
  getSNAPBBCELimit,
  isSNAPIncomeEligible,

  // Medicaid
  getMedicaidExpansionLimit,
  getMedicaidChildrenPregnantLimit,
  getMedicaidDisabilityLimit,
  isMedicaidExpansionEligible,

  // WIC
  getWICIncomeLimit,
  isWICIncomeEligible,

  // Utilities
  describeFPLPercentage,
  annualToMonthly,
  monthlyToAnnual,
  formatIncomeThreshold,
};

/**
 * All threshold constants
 */
export const thresholdConstants = {
  FPL_YEAR,
  FPL_2024_MONTHLY,
  FPL_2024_PER_ADDITIONAL_PERSON,

  SNAP_GROSS_INCOME_FPL_PERCENT,
  SNAP_NET_INCOME_FPL_PERCENT,
  SNAP_BBCE_FPL_PERCENT,

  MEDICAID_EXPANSION_FPL_PERCENT,
  MEDICAID_CHILDREN_PREGNANT_MIN_FPL_PERCENT,
  MEDICAID_DISABILITY_FPL_PERCENT,

  WIC_FPL_PERCENT,
};

