/**
 * Location Data Types
 *
 * Type definitions for geographic location data including states, counties,
 * and metadata for location-based benefit eligibility.
 */

/**
 * State data structure
 */
export interface StateData {
  name: string;
  counties: string[];
}

/**
 * Location data metadata
 */
export interface LocationMetadata {
  version: string;
  lastUpdated: string;
  description: string;
  source: string;
  totalStates: number;
  totalCounties: number;
}

/**
 * Complete location data structure
 */
export interface LocationData {
  metadata: LocationMetadata;
  states: Record<string, StateData>;
}

/**
 * State option for UI components
 */
export interface StateOption {
  value: string;
  label: string;
}

/**
 * County option for UI components
 */
export interface CountyOption {
  value: string;
  label: string;
}

/**
 * Location search result
 */
export interface LocationSearchResult {
  state: StateOption;
  county: CountyOption;
  fullName: string;
}

/**
 * Location validation result
 */
export interface LocationValidationResult {
  isValid: boolean;
  state?: string;
  county?: string;
  errors: string[];
}
