/**
 * Data context preparation functions
 */

import type { UserProfileDocument } from '../../../../db/schemas';
import type { JsonLogicData } from '../../types';
import {
  debugLog,
  normalizeStateToCode,
  isMedicaidExpansionState,
  calculateAgeFromDateOfBirth
} from './utils';
import { getAMIDataForContext } from './amiData';

/**
 * Convert annual income to monthly
 */
function convertAnnualIncomeToMonthly(processedData: Record<string, unknown>): Record<string, unknown> {
  if (processedData.householdIncome && typeof processedData.householdIncome === 'number') {
    const incomePeriod = processedData.incomePeriod as string;

    console.warn(`🔍 [SNAP DEBUG] Income Conversion Check:`);
    console.warn(`  - Original Income: $${processedData.householdIncome.toLocaleString()}`);
    console.warn(`  - Income Period: ${incomePeriod || 'unknown'}`);
    console.warn(`  - Household Size: ${processedData.householdSize}`);

    // Only convert if income was entered as annual
    if (incomePeriod === 'annual') {
      const originalAnnualIncome = processedData.householdIncome;
      const monthlyIncome = Math.round(processedData.householdIncome / 12);
      const updatedData = { ...processedData, householdIncome: monthlyIncome };

      console.warn(`🔍 [SNAP DEBUG] Converting annual to monthly:`);
      console.warn(`  - Annual Income: $${originalAnnualIncome.toLocaleString()}/year`);
      console.warn(`  - Monthly Income: $${monthlyIncome.toLocaleString()}/month`);
      console.warn(`  - Conversion Factor: 12 (annual ÷ 12 = monthly)`);

      debugLog('Converted annual income to monthly', {
        originalAnnualIncome: `$${originalAnnualIncome.toLocaleString()}`,
        convertedMonthlyIncome: `$${monthlyIncome.toLocaleString()}`,
        householdSize: processedData.householdSize,
        citizenship: processedData.citizenship
      });

      if (import.meta.env.DEV) {
        console.warn('🔍 [DEBUG] prepareDataContext: Income conversion:', {
          originalAnnualIncome: `$${originalAnnualIncome.toLocaleString()}`,
          convertedMonthlyIncome: `$${monthlyIncome.toLocaleString()}`,
          householdSize: processedData.householdSize,
          citizenship: processedData.citizenship
        });
      }

      return updatedData;
    } else {
      // Income is already monthly, no conversion needed
      console.warn(`🔍 [SNAP DEBUG] Income already in monthly format:`);
      console.warn(`  - Monthly Income: $${processedData.householdIncome.toLocaleString()}/month`);
      console.warn(`  - No conversion needed`);

      debugLog('Income already in monthly format', {
        monthlyIncome: `$${processedData.householdIncome.toLocaleString()}`,
        incomePeriod: incomePeriod || 'unknown',
        householdSize: processedData.householdSize,
        citizenship: processedData.citizenship
      });
    }
  } else {
    console.warn(`🔍 [SNAP DEBUG] No income data to convert:`);
    console.warn(`  - householdIncome: ${processedData.householdIncome}`);
    console.warn(`  - Type: ${typeof processedData.householdIncome}`);
  }
  return processedData;
}

/**
 * Add state-specific variables to processed data
 */
async function addStateSpecificVariables(
  processedData: Record<string, unknown>,
  stateValue: string
): Promise<Record<string, unknown>> {
  // Normalize state value to 2-character code
  const stateCode = normalizeStateToCode(stateValue);

  // Create new object with state-specific variables
  const stateVariables = {
    stateHasExpanded: isMedicaidExpansionState(stateCode),
    livesInState: true,
    livesInGeorgia: stateCode === 'GA',
    livesInCalifornia: stateCode === 'CA',
    livesInTexas: stateCode === 'TX',
    livesInFlorida: stateCode === 'FL'
  };

  // Add Area Median Income (AMI) data for housing programs
  let amiData = {};
  if (processedData.householdSize) {
    // Use default county if not provided
    const county = processedData.county as string || 'default';
    amiData = await getAMIDataForContext(
      stateCode,
      county,
      processedData.householdSize as number
    );
  }

  const updatedData = { ...processedData, ...stateVariables, ...amiData };

  debugLog('Added state-specific variables', {
    originalState: stateValue,
    normalizedStateCode: stateCode,
    stateHasExpanded: stateVariables.stateHasExpanded,
    livesInState: stateVariables.livesInState,
    livesInGeorgia: stateVariables.livesInGeorgia
  });

  if (import.meta.env.DEV) {
    console.warn('🔍 [DEBUG] prepareDataContext: State-specific variables:', {
      originalState: stateValue,
      normalizedStateCode: stateCode,
      stateHasExpanded: stateVariables.stateHasExpanded,
      livesInState: stateVariables.livesInState,
      livesInGeorgia: stateVariables.livesInGeorgia,
      isExpansionState: isMedicaidExpansionState(stateCode)
    });
  }

  return updatedData;
}

/**
 * Log final processed data for debugging
 */
function logFinalProcessedData(processedData: Record<string, unknown>): void {
  debugLog('🔍 [DEBUG] Final processed data context', {
    householdIncome: processedData.householdIncome,
    householdSize: processedData.householdSize,
    citizenship: processedData.citizenship,
    state: processedData.state,
    county: processedData.county,
    age: processedData.age,
    hasChildren: processedData.hasChildren,
    hasDisability: processedData.hasDisability,
    isPregnant: processedData.isPregnant,
    employmentStatus: processedData.employmentStatus,
    areaMedianIncome: processedData.areaMedianIncome,
    ami50: processedData.ami50,
    ami60: processedData.ami60,
    ami80: processedData.ami80,
    allKeys: Object.keys(processedData)
  });

  if (import.meta.env.DEV) {
    const timestampValue = processedData._timestamp;
    const timestampStr = timestampValue !== undefined && (typeof timestampValue === 'string' || typeof timestampValue === 'number')
      ? new Date(timestampValue).toISOString()
      : 'N/A';

    console.warn('🔍 [DEBUG] prepareDataContext: Final processed data:', {
      householdIncome: processedData.householdIncome,
      householdSize: processedData.householdSize,
      citizenship: processedData.citizenship,
      dateOfBirth: processedData.dateOfBirth,
      state: processedData.state,
      county: processedData.county,
      age: processedData.age,
      hasChildren: processedData.hasChildren,
      hasDisability: processedData.hasDisability,
      isPregnant: processedData.isPregnant,
      employmentStatus: processedData.employmentStatus,
      areaMedianIncome: processedData.areaMedianIncome,
      ami50: processedData.ami50,
      ami60: processedData.ami60,
      ami80: processedData.ami80,
      stateHasExpanded: processedData.stateHasExpanded,
      livesInState: processedData.livesInState,
      livesInGeorgia: processedData.livesInGeorgia,
      timestamp: timestampStr,
      allKeys: Object.keys(processedData)
    });
  }
}

/**
 * Prepare data context from user profile
 */
export async function prepareDataContext(profile: UserProfileDocument): Promise<JsonLogicData> {
  debugLog('Preparing data context from user profile', profile.id);
  const data = profile.toJSON();

  // Add computed fields
  const processedData: Record<string, unknown> = {
    ...data,
    // Add any derived fields here
    _timestamp: Date.now(),
  };

  // Calculate age from dateOfBirth
  if (processedData.dateOfBirth && typeof processedData.dateOfBirth === 'string') {
    const age = calculateAgeFromDateOfBirth(processedData.dateOfBirth);
    processedData.age = age;

    debugLog('Calculated age from dateOfBirth', {
      dateOfBirth: processedData.dateOfBirth,
      calculatedAge: age
    });
  }

  // Convert annual income to monthly
  const dataWithIncome = convertAnnualIncomeToMonthly(processedData);

  // Add state-specific variables for benefit eligibility
  const stateValue = dataWithIncome.state as string;
  if (stateValue) {
    const finalData = await addStateSpecificVariables(dataWithIncome, stateValue);
    logFinalProcessedData(finalData);
    return finalData;
  }

  // Log final processed data for debugging (no state case)
  logFinalProcessedData(dataWithIncome);
  return dataWithIncome;
}
