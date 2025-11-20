/**
 * Location Data Service
 *
 * Centralized service for accessing location data with caching, validation,
 * and type safety. Provides a clean API for location-based operations.
 */

import type {
  LocationData,
  StateOption,
  CountyOption,
  LocationSearchResult,
  LocationValidationResult
} from '../types/location';

import statesCountiesData from '../sources/locations/states-counties.json';

/**
 * Cache entry structure
 */
interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

/**
 * Location Data Service
 *
 * Singleton service for managing location data with caching and validation.
 */
export class LocationDataService {
  private static instance: LocationDataService | undefined;
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour
  private readonly MAX_CACHE_SIZE = 1000;

  private constructor() {}

  /**
   * Safely get property from object to prevent injection attacks
   */
  private safeGetProperty<T>(obj: Record<string, T>, key: string): T | null {
    // Use a type-safe approach to check for property existence
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Use Object.getOwnPropertyDescriptor to safely access property
      const descriptor = Object.getOwnPropertyDescriptor(obj, key);
      return descriptor?.value ?? null;
    }
    return null;
  }

  static getInstance(): LocationDataService {
    this.instance ??= new LocationDataService();
    return this.instance;
  }

  /**
   * Get all available states
   */
  getStates(): StateOption[] {
    const cacheKey = 'states';
    const cached = this.getFromCache<StateOption[]>(cacheKey);
    if (cached) {return cached;}

    const states = Object.entries(statesCountiesData.states).map(([code, data]) => ({
      value: code,
      label: data.name
    }));

    this.setCache(cacheKey, states);
    return states;
  }

  /**
   * Get counties for a specific state
   */
  getCountiesForState(stateCode: string): CountyOption[] {
    const cacheKey = `counties-${stateCode}`;
    const cached = this.getFromCache<CountyOption[]>(cacheKey);
    if (cached) {return cached;}

    // Use type guard to prevent object injection
    const states = statesCountiesData.states as Record<string, { name: string; counties: string[] }>;
    const stateData = this.safeGetProperty(states, stateCode);
    if (!stateData) {
      return [];
    }

    const counties = stateData.counties.map(county => ({
      value: county,
      label: county
    }));

    this.setCache(cacheKey, counties);
    return counties;
  }

  /**
   * Get state name by code
   */
  getStateName(stateCode: string): string | null {
    // Use type guard to prevent object injection
    const states = statesCountiesData.states as Record<string, { name: string; counties: string[] }>;
    const stateData = this.safeGetProperty(states, stateCode);
    return stateData?.name ?? null;
  }

  /**
   * Check if a county exists in a state
   */
  isCountyValid(stateCode: string, countyName: string): boolean {
    const counties = this.getCountiesForState(stateCode);
    return counties.some(county => county.value === countyName);
  }

  /**
   * Search counties within a state by partial name match
   */
  searchCounties(stateCode: string, searchTerm: string): CountyOption[] {
    const counties = this.getCountiesForState(stateCode);

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
  getLocationData(): LocationData {
    return statesCountiesData as LocationData;
  }

  /**
   * Validate location data
   */
  validateLocation(stateCode: string, countyName?: string): LocationValidationResult {
    const errors: string[] = [];

    if (!stateCode) {
      errors.push('State code is required');
      return { isValid: false, errors };
    }

    // Use type guard to prevent object injection
    const states = statesCountiesData.states as Record<string, { name: string; counties: string[] }>;
    const stateData = this.safeGetProperty(states, stateCode);
    if (!stateData) {
      errors.push(`Invalid state code: ${stateCode}`);
      return { isValid: false, errors };
    }

    if (countyName && !this.isCountyValid(stateCode, countyName)) {
      errors.push(`Invalid county: ${countyName} for state: ${stateCode}`);
      return { isValid: false, state: stateCode, county: countyName, errors };
    }

    return {
      isValid: true,
      state: stateCode,
      county: countyName,
      errors: []
    };
  }

  /**
   * Search for locations by partial name
   */
  searchLocations(searchTerm: string): LocationSearchResult[] {
    if (!searchTerm.trim()) {return [];}

    const normalizedSearch = searchTerm.toLowerCase().trim();
    const results: LocationSearchResult[] = [];

    // Search states
    const states = this.getStates();
    states.forEach(state => {
      if (state.label.toLowerCase().includes(normalizedSearch)) {
        results.push({
          state,
          county: { value: '', label: '' },
          fullName: state.label
        });
      }
    });

    // Search counties
    Object.entries(statesCountiesData.states).forEach(([stateCode, stateData]) => {
      stateData.counties.forEach(countyName => {
        if (countyName.toLowerCase().includes(normalizedSearch)) {
          const state = { value: stateCode, label: stateData.name };
          const county = { value: countyName, label: countyName };
          results.push({
            state,
            county,
            fullName: `${countyName}, ${stateData.name}`
          });
        }
      });
    });

    return results;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  private getFromCache<T = unknown>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {return null;}

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private setCache(key: string, data: unknown): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL
    });
  }
}
