/**
 * Profile conversion utilities
 * Converts questionnaire answers to profile data format
 */

import type { ProfileData, UserProfile } from '../types';

export function convertAnswersToProfileData(answers: Record<string, unknown>): {
  profileData: ProfileData;
  userProfile: UserProfile;
} {
  const rawIncome = answers.householdIncome as unknown;
  const incomePeriod = (answers.incomePeriod as string) ?? 'annual';
  const householdSize = Number(answers.householdSize) || 1;

  // Normalize income: accept numbers or numeric strings, default to 0 when null/invalid
  let householdIncome = 0;
  if (rawIncome == null) {
    householdIncome = 0;
  } else if (typeof rawIncome === 'number' && !Number.isNaN(rawIncome)) {
    householdIncome = rawIncome;
  } else {
    const parsed = Number(String(rawIncome).replace(/[,\s]+/g, ''));
    householdIncome = Number.isFinite(parsed) ? parsed : 0;
  }
  const dateOfBirth = answers.dateOfBirth as string;
  const state = answers.state as string;
  const county = answers.county as string;
  const citizenship = answers.citizenship as string;
  const employmentStatus = answers.employmentStatus as string;
  const isBlind = answers.isBlind === 'true' || answers.isBlind === true;

  // Convert string boolean values to actual booleans
  const hasQualifyingDisability = answers.hasQualifyingDisability === 'true' || answers.hasQualifyingDisability === true;
  const isPregnant = answers.isPregnant === 'true' || answers.isPregnant === true;
  const hasChildren = answers.hasChildren === 'true' || answers.hasChildren === true;

  // Convert income to annual amount based on user's selection
  const annualIncome = incomePeriod === 'monthly' ? householdIncome * 12 : householdIncome;

  // Compute age and elderly flag (65+)
  let isElderly = false;
  try {
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (!Number.isNaN(dob.getTime())) {
        const ageMs = Date.now() - dob.getTime();
        const ageYears = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25));
        isElderly = ageYears >= 65;
      }
    }
  } catch {
    // ignore and keep isElderly false
  }

  // Add SNAP-specific debug logging for income conversion
  if (import.meta.env.DEV) {
    console.warn(`🔍 [SNAP DEBUG] Income conversion in convertAnswersToProfileData:`);
    console.warn(`  - Original Income (normalized): $${householdIncome.toLocaleString()}`);
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
      isBlind,
      isElderly,
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
      hasChildren,
      isBlind,
      isElderly
    }
  };
}
