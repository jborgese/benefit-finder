/**
 * LIHTC Housing Programs Data
 *
 * Real LIHTC housing programs with contact information and eligibility details.
 */

import type { BenefitProgram } from '../../db/schemas';

/**
 * Federal LIHTC Program
 */
export const FEDERAL_LIHTC_PROGRAM: BenefitProgram = {
  id: 'lihtc-federal',
  name: 'Low-Income Housing Tax Credit (LIHTC)',
  shortName: 'LIHTC',
  description: 'The Low-Income Housing Tax Credit (LIHTC) program provides tax credits to developers to build affordable rental housing for low-income households. LIHTC properties offer reduced rent to eligible tenants.',
  category: 'housing',
  jurisdiction: 'United States',
  jurisdictionLevel: 'federal',
  website: 'https://www.hud.gov/program_offices/housing/mfh/progdesc/lihtc',
  phoneNumber: '1-800-955-2232',
  applicationUrl: 'https://www.hud.gov/program_offices/housing/mfh/progdesc/lihtc',
  officeAddress: 'U.S. Department of Housing and Urban Development, 451 7th Street SW, Washington, DC 20410',
  eligibilitySummary: 'Household income must be at or below 50-60% of Area Median Income (AMI). Full-time students are generally ineligible unless they are single parents or married students.',
  benefitAmount: 'Reduced rent (typically 30% of income or less)',
  tags: ['housing', 'affordable', 'rental', 'tax-credit', 'low-income'],
  active: true,
  applicationOpen: true,
  source: 'https://www.hud.gov/program_offices/housing/mfh/progdesc/lihtc',
  sourceDate: Date.now(),
  lastUpdated: Date.now(),
  createdAt: Date.now()
};

/**
 * Georgia LIHTC Program
 */
export const GEORGIA_LIHTC_PROGRAM: BenefitProgram = {
  id: 'lihtc-georgia',
  name: 'Georgia LIHTC Housing',
  shortName: 'GA LIHTC',
  description: 'Georgia-specific LIHTC housing program providing affordable rental housing for low-income families and individuals. Managed by the Georgia Department of Community Affairs.',
  category: 'housing',
  jurisdiction: 'Georgia',
  jurisdictionLevel: 'state',
  website: 'https://www.dca.ga.gov/housing-development-and-finance/housing-finance/lihtc',
  phoneNumber: '404-679-4840',
  applicationUrl: 'https://www.dca.ga.gov/housing-development-and-finance/housing-finance/lihtc',
  officeAddress: 'Georgia Department of Community Affairs, 60 Executive Park South NE, Atlanta, GA 30329',
  eligibilitySummary: 'Household income must be at or below 50-60% of Area Median Income for Georgia. Must be U.S. citizen or eligible non-citizen.',
  benefitAmount: 'Reduced rent based on income (typically 30% of income or less)',
  tags: ['housing', 'affordable', 'rental', 'georgia', 'low-income', 'lihtc'],
  active: true,
  applicationOpen: true,
  source: 'https://www.dca.ga.gov/housing-development-and-finance/housing-finance/lihtc',
  sourceDate: Date.now(),
  lastUpdated: Date.now(),
  createdAt: Date.now()
};

/**
 * California LIHTC Program
 */
export const CALIFORNIA_LIHTC_PROGRAM: BenefitProgram = {
  id: 'lihtc-california',
  name: 'California LIHTC Housing',
  shortName: 'CA LIHTC',
  description: 'California LIHTC housing program providing affordable rental housing for low-income families and individuals. Managed by the California Tax Credit Allocation Committee.',
  category: 'housing',
  jurisdiction: 'California',
  jurisdictionLevel: 'state',
  website: 'https://www.treasurer.ca.gov/ctcac/',
  phoneNumber: '916-654-6340',
  applicationUrl: 'https://www.treasurer.ca.gov/ctcac/',
  officeAddress: 'California Tax Credit Allocation Committee, 915 Capitol Mall, Sacramento, CA 95814',
  eligibilitySummary: 'Household income must be at or below 50-60% of Area Median Income for California. Must be U.S. citizen or eligible non-citizen.',
  benefitAmount: 'Reduced rent based on income (typically 30% of income or less)',
  tags: ['housing', 'affordable', 'rental', 'california', 'low-income', 'lihtc'],
  active: true,
  applicationOpen: true,
  source: 'https://www.treasurer.ca.gov/ctcac/',
  sourceDate: Date.now(),
  lastUpdated: Date.now(),
  createdAt: Date.now()
};

/**
 * Florida LIHTC Program
 */
export const FLORIDA_LIHTC_PROGRAM: BenefitProgram = {
  id: 'lihtc-florida',
  name: 'Florida LIHTC Housing',
  shortName: 'FL LIHTC',
  description: 'Florida LIHTC housing program providing affordable rental housing for low-income families and individuals. Managed by the Florida Housing Finance Corporation.',
  category: 'housing',
  jurisdiction: 'Florida',
  jurisdictionLevel: 'state',
  website: 'https://www.floridahousing.org/',
  phoneNumber: '850-488-4197',
  applicationUrl: 'https://www.floridahousing.org/',
  officeAddress: 'Florida Housing Finance Corporation, 227 North Bronough Street, Suite 5000, Tallahassee, FL 32301',
  eligibilitySummary: 'Household income must be at or below 50-60% of Area Median Income for Florida. Must be U.S. citizen or eligible non-citizen.',
  benefitAmount: 'Reduced rent based on income (typically 30% of income or less)',
  tags: ['housing', 'affordable', 'rental', 'florida', 'low-income', 'lihtc'],
  active: true,
  applicationOpen: true,
  source: 'https://www.floridahousing.org/',
  sourceDate: Date.now(),
  lastUpdated: Date.now(),
  createdAt: Date.now()
};

/**
 * Atlanta LIHTC Program
 */
export const ATLANTA_LIHTC_PROGRAM: BenefitProgram = {
  id: 'lihtc-atlanta',
  name: 'Atlanta LIHTC Housing',
  shortName: 'Atlanta LIHTC',
  description: 'Atlanta-specific LIHTC housing program providing affordable rental housing for low-income families and individuals in the Atlanta metropolitan area.',
  category: 'housing',
  jurisdiction: 'Atlanta, GA',
  jurisdictionLevel: 'city',
  website: 'https://www.atlantaga.gov/government/departments/housing',
  phoneNumber: '404-330-6390',
  applicationUrl: 'https://www.atlantaga.gov/government/departments/housing',
  officeAddress: 'Atlanta Housing Authority, 230 John Wesley Dobbs Avenue NE, Atlanta, GA 30303',
  eligibilitySummary: 'Household income must be at or below 50-60% of Area Median Income for Atlanta. Must be U.S. citizen or eligible non-citizen.',
  benefitAmount: 'Reduced rent based on income (typically 30% of income or less)',
  tags: ['housing', 'affordable', 'rental', 'atlanta', 'low-income', 'lihtc', 'georgia'],
  active: true,
  applicationOpen: true,
  source: 'https://www.atlantaga.gov/government/departments/housing',
  sourceDate: Date.now(),
  lastUpdated: Date.now(),
  createdAt: Date.now()
};

/**
 * Los Angeles LIHTC Program
 */
export const LOS_ANGELES_LIHTC_PROGRAM: BenefitProgram = {
  id: 'lihtc-los-angeles',
  name: 'Los Angeles LIHTC Housing',
  shortName: 'LA LIHTC',
  description: 'Los Angeles LIHTC housing program providing affordable rental housing for low-income families and individuals in the Los Angeles metropolitan area.',
  category: 'housing',
  jurisdiction: 'Los Angeles, CA',
  jurisdictionLevel: 'city',
  website: 'https://hcidla.lacity.org/',
  phoneNumber: '213-808-8800',
  applicationUrl: 'https://hcidla.lacity.org/',
  officeAddress: 'Los Angeles Housing and Community Investment Department, 1200 West 7th Street, Los Angeles, CA 90017',
  eligibilitySummary: 'Household income must be at or below 50-60% of Area Median Income for Los Angeles. Must be U.S. citizen or eligible non-citizen.',
  benefitAmount: 'Reduced rent based on income (typically 30% of income or less)',
  tags: ['housing', 'affordable', 'rental', 'los-angeles', 'low-income', 'lihtc', 'california'],
  active: true,
  applicationOpen: true,
  source: 'https://hcidla.lacity.org/',
  sourceDate: Date.now(),
  lastUpdated: Date.now(),
  createdAt: Date.now()
};

/**
 * Miami LIHTC Program
 */
export const MIAMI_LIHTC_PROGRAM: BenefitProgram = {
  id: 'lihtc-miami',
  name: 'Miami LIHTC Housing',
  shortName: 'Miami LIHTC',
  description: 'Miami LIHTC housing program providing affordable rental housing for low-income families and individuals in the Miami metropolitan area.',
  category: 'housing',
  jurisdiction: 'Miami, FL',
  jurisdictionLevel: 'city',
  website: 'https://www.miamidade.gov/housing/',
  phoneNumber: '305-375-4500',
  applicationUrl: 'https://www.miamidade.gov/housing/',
  officeAddress: 'Miami-Dade County Public Housing and Community Development, 701 NW 1st Court, Miami, FL 33136',
  eligibilitySummary: 'Household income must be at or below 50-60% of Area Median Income for Miami. Must be U.S. citizen or eligible non-citizen.',
  benefitAmount: 'Reduced rent based on income (typically 30% of income or less)',
  tags: ['housing', 'affordable', 'rental', 'miami', 'low-income', 'lihtc', 'florida'],
  active: true,
  applicationOpen: true,
  source: 'https://www.miamidade.gov/housing/',
  sourceDate: Date.now(),
  lastUpdated: Date.now(),
  createdAt: Date.now()
};

/**
 * All LIHTC Programs
 */
export const LIHTC_PROGRAMS: BenefitProgram[] = [
  FEDERAL_LIHTC_PROGRAM,
  GEORGIA_LIHTC_PROGRAM,
  CALIFORNIA_LIHTC_PROGRAM,
  FLORIDA_LIHTC_PROGRAM,
  ATLANTA_LIHTC_PROGRAM,
  LOS_ANGELES_LIHTC_PROGRAM,
  MIAMI_LIHTC_PROGRAM
];

/**
 * LIHTC Program by Jurisdiction
 */
export const LIHTC_PROGRAMS_BY_JURISDICTION = {
  federal: [FEDERAL_LIHTC_PROGRAM],
  state: [GEORGIA_LIHTC_PROGRAM, CALIFORNIA_LIHTC_PROGRAM, FLORIDA_LIHTC_PROGRAM],
  city: [ATLANTA_LIHTC_PROGRAM, LOS_ANGELES_LIHTC_PROGRAM, MIAMI_LIHTC_PROGRAM]
};

/**
 * LIHTC Program by State
 */
export const LIHTC_PROGRAMS_BY_STATE = {
  'GA': [GEORGIA_LIHTC_PROGRAM, ATLANTA_LIHTC_PROGRAM],
  'CA': [CALIFORNIA_LIHTC_PROGRAM, LOS_ANGELES_LIHTC_PROGRAM],
  'FL': [FLORIDA_LIHTC_PROGRAM, MIAMI_LIHTC_PROGRAM]
};
