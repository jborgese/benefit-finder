/**
 * Area Median Income (AMI) Data Service
 *
 * Provides access to HUD Area Median Income data for LIHTC eligibility calculations.
 * Uses real HUD data with offline-first caching strategy.
 */

import type { AMIData } from '../types/housing';

/**
 * AMI Data Cache Entry
 */
interface AMICacheEntry {
  data: AMIData;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * AMI Data Service
 *
 * Singleton service for managing Area Median Income data with caching and offline support.
 */
export class AMIDataService {
  private static instance: AMIDataService;
  private cache = new Map<string, AMICacheEntry>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 1000;

  private constructor() {}

  static getInstance(): AMIDataService {
    if (!this.instance) {
      this.instance = new AMIDataService();
    }
    return this.instance;
  }

  /**
   * Get AMI data for a specific household
   */
  async getAMIForHousehold(
    state: string,
    county: string,
    householdSize: number
  ): Promise<AMIData> {
    const cacheKey = this.createCacheKey(state, county, householdSize);

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Load from data files
    const amiData = await this.loadAMIData(state, county, householdSize);

    // Cache the result
    this.setCache(cacheKey, amiData);

    return amiData;
  }

  /**
   * Get all available counties for a state
   */
  async getCountiesForState(state: string): Promise<string[]> {
    try {
      const stateData = await this.loadStateData(state);
      return Object.keys(stateData.counties);
    } catch (error) {
      console.warn(`Failed to load counties for state ${state}:`, error);
      return [];
    }
  }

  /**
   * Check if AMI data is available for a location
   */
  async isAMIAvailable(state: string, county: string): Promise<boolean> {
    try {
      const stateData = await this.loadStateData(state);
      return county in stateData.counties;
    } catch {
      return false;
    }
  }

  /**
   * Get the latest year of AMI data available
   */
  async getLatestAMIYear(): Promise<number> {
    // For now, return 2024 as the latest year
    // In a real implementation, this would check the data files
    return 2024;
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

  private createCacheKey(state: string, county: string, householdSize: number): string {
    return `${state.toLowerCase()}-${county.toLowerCase()}-${householdSize}`;
  }

  private getFromCache(key: string): AMIData | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: AMIData): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL
    });
  }

  private async loadAMIData(
    state: string,
    county: string,
    householdSize: number
  ): Promise<AMIData> {
    const stateData = await this.loadStateData(state);
    const countyData = stateData.counties[county];

    if (!countyData) {
      throw new Error(`AMI data not found for ${county}, ${state}`);
    }

    // Get AMI amount for household size, use 8+ person limit as fallback
    const amiAmount = countyData.ami[householdSize] || countyData.ami[8];

    if (!amiAmount) {
      throw new Error(`AMI data not available for household size ${householdSize}`);
    }

    return {
      state: state.toUpperCase(),
      county,
      year: stateData.year,
      householdSize,
      amiAmount,
      incomeLimit50: Math.floor(amiAmount * 0.5),
      incomeLimit60: Math.floor(amiAmount * 0.6),
      incomeLimit80: Math.floor(amiAmount * 0.8),
      lastUpdated: Date.now()
    };
  }

  private async loadStateData(state: string): Promise<any> {
    const stateCode = state.toLowerCase();

    try {
      // Load from local data files
      const stateData = await import(`../data/ami/${stateCode}.json`);
      return stateData.default;
    } catch (error) {
      throw new Error(`Failed to load AMI data for state ${state}: ${error}`);
    }
  }
}

/**
 * Hook for using AMI data in React components
 */
export function useAMIData(
  state: string | undefined,
  county: string | undefined,
  householdSize: number | undefined
): {
  amiData: AMIData | null;
  loading: boolean;
  error: string | null;
} {
  const [amiData, setAmiData] = useState<AMIData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state || !county || !householdSize) {
      setAmiData(null);
      setError(null);
      return;
    }

    const loadAMIData = async () => {
      setLoading(true);
      setError(null);

      try {
        const service = AMIDataService.getInstance();
        const data = await service.getAMIForHousehold(state, county, householdSize);
        setAmiData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load AMI data');
        setAmiData(null);
      } finally {
        setLoading(false);
      }
    };

    loadAMIData();
  }, [state, county, householdSize]);

  return { amiData, loading, error };
}

// Import React hooks
import { useState, useEffect } from 'react';
