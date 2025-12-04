/**
 * Miami LIHTC Program
 *
 * Miami city-level LIHTC program data.
 */

import type { BenefitProgram } from '../../../../../db/schemas';

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
