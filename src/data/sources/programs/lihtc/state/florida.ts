/**
 * Florida LIHTC Program
 *
 * Florida state-level LIHTC program data.
 */

import type { BenefitProgram } from '../../../../../db/schemas';

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
