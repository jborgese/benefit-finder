/**
 * Area Median Income (AMI) Data Service
 *
 * Provides access to HUD Area Median Income data for LIHTC eligibility calculations.
 * Uses real HUD data with offline-first caching strategy.
 *
 * @deprecated Use AMIDataService from @/data instead
 */

import { useState, useEffect } from 'react';
import { AMIDataService } from '../data/services/AMIDataService';
import type { ProcessedAMIData } from '../data/types/ami';

/**
 * Hook for using AMI data in React components
 */
export function useAMIData(
  state: string | undefined,
  county: string | undefined,
  householdSize: number | undefined
): {
  amiData: ProcessedAMIData | null;
  loading: boolean;
  error: string | null;
} {
  const [amiData, setAmiData] = useState<ProcessedAMIData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state || !county || !householdSize) {
      setAmiData(null);
      setError(null);
      return;
    }

    const loadAMIData = async (): Promise<void> => {
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

    void loadAMIData();
  }, [state, county, householdSize]);

  return { amiData, loading, error };
}
