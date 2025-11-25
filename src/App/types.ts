/**
 * App-level type definitions
 */

export type AppState = 'home' | 'questionnaire' | 'results' | 'error';

export interface ProfileData {
  householdSize: number;
  householdIncome: number;
  incomePeriod: 'monthly' | 'annual';
  dateOfBirth: string;
  citizenship: 'us_citizen' | 'permanent_resident' | 'refugee' | 'asylee' | 'other';
  employmentStatus: 'employed' | 'unemployed' | 'self_employed' | 'retired' | 'disabled' | 'student';
  state: string;
  county: string;
  hasDisability: boolean;
  isPregnant: boolean;
  hasChildren: boolean;
}

export interface UserProfile {
  state: string;
  householdSize: number;
  householdIncome: number;
  incomePeriod: 'monthly' | 'annual';
  citizenship: string;
  employmentStatus: string;
  hasDisability: boolean;
  isPregnant: boolean;
  hasChildren: boolean;
}
