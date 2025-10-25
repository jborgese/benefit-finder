/**
 * Federal LIHTC Program
 *
 * Federal-level Low-Income Housing Tax Credit program data.
 */

import type { BenefitProgram } from '../../../db/schemas';

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
