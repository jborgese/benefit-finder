/**
 * Georgia LIHTC Program
 *
 * Georgia state-level LIHTC program data.
 */

import type { BenefitProgram } from '../../../../db/schemas';

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
