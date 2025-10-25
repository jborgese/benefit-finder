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
  console.log('🔍 getCountiesForState: Function called', {
    stateCode,
    hasStateCode: !!stateCode
  });

  const stateData = statesCountiesData.states[stateCode];
  console.log('🔍 getCountiesForState: State data retrieved', {
    stateCode,
    hasStateData: !!stateData,
    stateName: stateData?.name,
    countyCount: stateData?.counties?.length || 0
  });

  if (!stateData) {
    console.log('🔍 getCountiesForState: No state data found', {
      stateCode,
      availableStates: Object.keys(statesCountiesData.states)
    });
    return [];
  }

  const counties = stateData.counties.map(county => ({
    value: county,
    label: county
  }));

  console.log('🔍 getCountiesForState: Counties mapped', {
    stateCode,
    stateName: stateData.name,
    countyCount: counties.length,
    firstFiveCounties: counties.slice(0, 5).map(c => c.label)
  });

  return counties;
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
  console.log('🔍 searchCounties: Function called', {
    stateCode,
    searchTerm,
    hasStateCode: !!stateCode,
    hasSearchTerm: !!searchTerm.trim()
  });

  const counties = getCountiesForState(stateCode);
  console.log('🔍 searchCounties: Counties retrieved', {
    stateCode,
    countyCount: counties.length,
    firstFiveCounties: counties.slice(0, 5).map(c => c.label)
  });

  if (!searchTerm.trim()) {
    console.log('🔍 searchCounties: No search term, returning all counties', {
      stateCode,
      countyCount: counties.length
    });
    return counties;
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();
  console.log('🔍 searchCounties: Normalized search term', {
    originalSearchTerm: searchTerm,
    normalizedSearch,
    stateCode
  });

  const filteredCounties = counties.filter(county => {
    const countyLabel = county.label.toLowerCase();
    const matches = countyLabel.includes(normalizedSearch);

    if (matches) {
      console.log('🔍 searchCounties: Match found', {
        countyLabel: county.label,
        normalizedSearch,
        matches
      });
    }

    return matches;
  });

  console.log('🔍 searchCounties: Search results', {
    stateCode,
    searchTerm,
    normalizedSearch,
    totalCounties: counties.length,
    filteredCount: filteredCounties.length,
    filteredCounties: filteredCounties.map(c => c.label)
  });

  return filteredCounties;
}

/**
 * Get the complete location data structure
 */
export function getLocationData(): LocationData {
  return statesCountiesData;
}
