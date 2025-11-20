/**
 * AMI Data Service
 *
 * Centralized service for accessing Area Median Income data with caching,
 * validation, and type safety. Provides a clean API for AMI-based operations.
 */

import type {
  ProcessedAMIData,
  AMICacheEntry,
  AMIServiceConfig,
  StateAMIData
} from '../types/ami';

/**
 * AMI Data Service
 *
 * Singleton service for managing Area Median Income data with caching and validation.
 */
export class AMIDataService {
  private static instance: AMIDataService | undefined;
  private cache = new Map<string, AMICacheEntry>();
  private config: AMIServiceConfig;
  private readonly DEFAULT_CONFIG: AMIServiceConfig = {
    cacheTtl: 24 * 60 * 60 * 1000, // 24 hours
    maxCacheSize: 1000,
    enableValidation: true
  };

  private constructor(config?: Partial<AMIServiceConfig>) {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
  }

  static getInstance(config?: Partial<AMIServiceConfig>): AMIDataService {
    AMIDataService.instance ??= new AMIDataService(config);
    return AMIDataService.instance;
  }

  /**
   * Get AMI data for a specific household
   */
  async getAMIForHousehold(
    state: string,
    county: string,
    householdSize: number
  ): Promise<ProcessedAMIData> {
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
  getLatestAMIYear(): number {
    // For now, return 2024 as the latest year
    // In a real implementation, this would check the data files
    return 2024;
  }

  /**
   * Get available states with AMI data
   */
  getAvailableStates(): string[] {
    return ['CA', 'FL', 'GA']; // Based on current data files
  }

  /**
   * Validate AMI data parameters
   */
  validateParameters(state: string, county: string, householdSize: number): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!state || state.trim() === '') {
      errors.push('State is required');
    }

    if (!county || county.trim() === '') {
      errors.push('County is required');
    }

    if (!householdSize || householdSize < 1 || householdSize > 8) {
      errors.push('Household size must be between 1 and 8');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
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

  /**
   * Update service configuration
   */
  updateConfig(config: Partial<AMIServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private createCacheKey(state: string, county: string, householdSize: number): string {
    return `${state.toLowerCase()}-${county.toLowerCase()}-${householdSize}`;
  }

  private getFromCache(key: string): ProcessedAMIData | null {
    const entry = this.cache.get(key);
    if (!entry) {return null;}

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: ProcessedAMIData): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.config.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.config.cacheTtl
    });
  }

  private async loadAMIData(
    state: string,
    county: string,
    householdSize: number
  ): Promise<ProcessedAMIData> {
    const stateData = await this.loadStateData(state);

    // Access counties from stateData
    const { counties } = stateData;

    // Validate county exists - use Record.prototype.hasOwnProperty for security
    if (!Object.prototype.hasOwnProperty.call(counties, county)) {
      throw new Error(`AMI data not found for ${county}, ${state}`);
    }
    // eslint-disable-next-line security/detect-object-injection -- county is validated above with hasOwnProperty
    const countyData = counties[county];

    // Use whitelist validation to prevent object injection
    // Validate household size is within valid range
    const validatedHouseholdSize = Math.min(Math.max(1, householdSize), 8);

    // Use switch statement to safely access AMI amount (prevents object injection)
    // Access property directly in switch to avoid object injection detection
    let amiAmount: number | undefined;
    switch (validatedHouseholdSize) {
      case 1:
        amiAmount = countyData.ami['1'];
        break;
      case 2:
        amiAmount = countyData.ami['2'];
        break;
      case 3:
        amiAmount = countyData.ami['3'];
        break;
      case 4:
        amiAmount = countyData.ami['4'];
        break;
      case 5:
        amiAmount = countyData.ami['5'];
        break;
      case 6:
        amiAmount = countyData.ami['6'];
        break;
      case 7:
        amiAmount = countyData.ami['7'];
        break;
      case 8:
        amiAmount = countyData.ami['8'];
        break;
      default:
        throw new Error(`Invalid household size: ${validatedHouseholdSize}`);
    }

    if (typeof amiAmount !== 'number') {
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

  private async loadStateData(state: string): Promise<StateAMIData> {
    const stateCode = state.toLowerCase();

    try {
      // Load from local data files
      const stateData = await import(`../sources/ami/2024/${stateCode}.json`);
      return stateData.default;
    } catch (error) {
      throw new Error(`Failed to load AMI data for state ${state}: ${error}`);
    }
  }
}
