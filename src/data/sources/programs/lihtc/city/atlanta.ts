/**
 * Atlanta LIHTC Program
 *
 * Atlanta city-level LIHTC program data.
 */

import type { BenefitProgram } from '../../../../db/schemas';

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
