/**
 * Profile conversion utilities
 * Converts questionnaire answers to profile data format
 */

import type { ProfileData, UserProfile } from '../types';

export function convertAnswersToProfileData(answers: Record<string, unknown>): {
  profileData: ProfileData;
  userProfile: UserProfile;
} {
  const householdIncome = answers.householdIncome as number;
  const incomePeriod = answers.incomePeriod as string;
  const householdSize = answers.householdSize as number;
  const dateOfBirth = answers.dateOfBirth as string;
  const state = answers.state as string;
  const county = answers.county as string;
  const citizenship = answers.citizenship as string;
  const employmentStatus = answers.employmentStatus as string;

  // Convert string boolean values to actual booleans
  const hasQualifyingDisability = answers.hasQualifyingDisability === 'true' || answers.hasQualifyingDisability === true;
  const isPregnant = answers.isPregnant === 'true' || answers.isPregnant === true;
  const hasChildren = answers.hasChildren === 'true' || answers.hasChildren === true;

  // Convert income to annual amount based on user's selection
  const annualIncome = incomePeriod === 'monthly' ? householdIncome * 12 : householdIncome;

  // Add SNAP-specific debug logging for income conversion
  if (import.meta.env.DEV && typeof householdIncome === 'number') {
    console.warn(`🔍 [SNAP DEBUG] Income conversion in convertAnswersToProfileData:`);
    console.warn(`  - Original Income: $${householdIncome.toLocaleString()}`);
    console.warn(`  - Income Period: ${incomePeriod}`);
    console.warn(`  - Converted Annual Income: $${annualIncome.toLocaleString()}`);
    console.warn(`  - Household Size: ${householdSize}`);
    console.warn(`  - State: ${state}`);
  }

  return {
    profileData: {
      householdSize,
      householdIncome: annualIncome,
      incomePeriod: incomePeriod as 'monthly' | 'annual',
      dateOfBirth,
      citizenship: citizenship as 'us_citizen' | 'permanent_resident' | 'refugee' | 'asylee' | 'other',
      employmentStatus: employmentStatus as 'employed' | 'unemployed' | 'self_employed' | 'retired' | 'disabled' | 'student',
      state,
      county,
      hasDisability: hasQualifyingDisability,
      isPregnant,
      hasChildren,
    },
    userProfile: {
      state,
      householdSize,
      householdIncome: annualIncome,
      incomePeriod: incomePeriod as 'monthly' | 'annual',
      citizenship,
      employmentStatus,
      hasDisability: hasQualifyingDisability,
      isPregnant,
      hasChildren
    }
  };
}
