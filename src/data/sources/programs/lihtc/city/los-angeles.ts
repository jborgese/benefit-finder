/**
 * Los Angeles LIHTC Program
 *
 * Los Angeles city-level LIHTC program data.
 */

import type { BenefitProgram } from '../../../../db/schemas';

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
