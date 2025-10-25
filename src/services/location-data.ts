/**
 * Location Data Service
 *
 * Provides access to US states and counties data for location-based
 * benefit eligibility calculations.
 *
 * @deprecated Use LocationDataService from @/data instead
 */

import { LocationDataService } from '../data/services/LocationDataService';

export interface StateData {
  name: string;
  counties: string[];
}

export interface LocationData {
  metadata: {
    version: string;
    lastUpdated: string;
    description: string;
  };
  states: Record<string, StateData>;
}

// Create service instance
const locationService = LocationDataService.getInstance();

/**
 * Get all available states
 * @deprecated Use LocationDataService.getInstance().getStates() instead
 */
export function getStates(): Array<{ value: string; label: string }> {
  return locationService.getStates();
}

/**
 * Get counties for a specific state
 * @deprecated Use LocationDataService.getInstance().getCountiesForState() instead
 */
export function getCountiesForState(stateCode: string): Array<{ value: string; label: string }> {
  return locationService.getCountiesForState(stateCode);
}

/**
 * Get state name by code
 * @deprecated Use LocationDataService.getInstance().getStateName() instead
 */
export function getStateName(stateCode: string): string | null {
  return locationService.getStateName(stateCode);
}

/**
 * Check if a county exists in a state
 * @deprecated Use LocationDataService.getInstance().isCountyValid() instead
 */
export function isCountyValid(stateCode: string, countyName: string): boolean {
  return locationService.isCountyValid(stateCode, countyName);
}

/**
 * Search counties within a state by partial name match
 * @deprecated Use LocationDataService.getInstance().searchCounties() instead
 */
export function searchCounties(stateCode: string, searchTerm: string): Array<{ value: string; label: string }> {
  return locationService.searchCounties(stateCode, searchTerm);
}

/**
 * Get the complete location data structure
 * @deprecated Use LocationDataService.getInstance().getLocationData() instead
 */
export function getLocationData(): LocationData {
  return locationService.getLocationData();
}
