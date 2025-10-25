/**
 * Location Data Service
 *
 * Provides access to US states and counties data for location-based
 * benefit eligibility calculations.
 */

import statesCountiesData from '../data/locations/states-counties.json';

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

/**
 * Get all available states
 */
export function getStates(): Array<{ value: string; label: string }> {
  return Object.entries(statesCountiesData.states).map(([code, data]) => ({
    value: code,
    label: data.name
  }));
}

/**
 * Get counties for a specific state
 */
export function getCountiesForState(stateCode: string): Array<{ value: string; label: string }> {
  const stateData = statesCountiesData.states[stateCode];
  if (!stateData) {
    return [];
  }

  return stateData.counties.map(county => ({
    value: county,
    label: county
  }));
}

/**
 * Get state name by code
 */
export function getStateName(stateCode: string): string | null {
  const stateData = statesCountiesData.states[stateCode];
  return stateData?.name || null;
}

/**
 * Check if a county exists in a state
 */
export function isCountyValid(stateCode: string, countyName: string): boolean {
  const counties = getCountiesForState(stateCode);
  return counties.some(county => county.value === countyName);
}

/**
 * Search counties within a state by partial name match
 */
export function searchCounties(stateCode: string, searchTerm: string): Array<{ value: string; label: string }> {
  const counties = getCountiesForState(stateCode);
  if (!searchTerm.trim()) {
    return counties;
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();
  return counties.filter(county =>
    county.label.toLowerCase().includes(normalizedSearch)
  );
}

/**
 * Get the complete location data structure
 */
export function getLocationData(): LocationData {
  return statesCountiesData;
}
