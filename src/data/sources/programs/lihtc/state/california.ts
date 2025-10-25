/**
 * California LIHTC Program
 *
 * California state-level LIHTC program data.
 */

import type { BenefitProgram } from '../../../../db/schemas';

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
