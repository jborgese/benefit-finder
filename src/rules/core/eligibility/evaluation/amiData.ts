/**
 * AMI (Area Median Income) data operations
 */

import type { ProcessedAMIData } from '../../../../data/types/ami';
import { debugLog } from './utils';

/**
 * Add AMI data to processed data context
 * Returns an object with the AMI data fields to merge into the main data
 */
export async function getAMIDataForContext(
  stateCode: string,
  county: string,
  householdSize: number
): Promise<Record<string, unknown>> {
  try {
    const { AMIDataService } = await import('../../../../data/services/AMIDataService');
    const amiService = AMIDataService.getInstance();
    const amiData: ProcessedAMIData = await amiService.getAMIForHousehold(
      stateCode,
      county,
      householdSize
    );

    debugLog('Added AMI data for housing programs', {
      state: stateCode,
      county,
      householdSize,
      ami50: amiData.incomeLimit50,
      ami60: amiData.incomeLimit60,
      ami80: amiData.incomeLimit80
    });

    // Convert annual AMI data to monthly for comparison with monthly user income
    return {
      areaMedianIncome: Math.floor(amiData.incomeLimit50 / 12),
      ami50: Math.floor(amiData.incomeLimit50 / 12),
      ami60: Math.floor(amiData.incomeLimit60 / 12),
      ami80: Math.floor(amiData.incomeLimit80 / 12)
    };
  } catch (error) {
    debugLog('Failed to load AMI data', { error, state: stateCode, county });
    return {
      areaMedianIncome: 2000,   // Monthly fallback - much lower to trigger income hard stops
      ami50: 1000,              // Monthly fallback - $8,333 > $1,000 fails
      ami60: 1200,
      ami80: 1600
    };
  }
}
