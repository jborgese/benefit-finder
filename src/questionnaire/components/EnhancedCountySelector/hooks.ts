/**
 * Custom hooks for EnhancedCountySelector data management
 */

import { useMemo } from 'react';
import { getCountiesForState, searchCounties } from '../../../services/location-data';
import type { CountyOption } from './types';
import { POPULAR_COUNTIES } from './constants';

// Helper function to get counties for a state
export const useCountiesForState = (selectedState: string | undefined): CountyOption[] => {
  return useMemo(() => {
    if (!selectedState) { return []; }
    return getCountiesForState(selectedState);
  }, [selectedState]);
};

// Helper function to get popular counties
export const usePopularCounties = (
  selectedState: string | undefined,
  allCounties: CountyOption[],
  showPopularFirst: boolean
): CountyOption[] => {
  return useMemo(() => {
    if (!selectedState || !showPopularFirst) { return []; }

    const popular = selectedState && selectedState in POPULAR_COUNTIES ? POPULAR_COUNTIES[selectedState] ?? [] : [];
    return allCounties.filter(county =>
      popular.some(popularName =>
        county.label.toLowerCase().includes(popularName.toLowerCase()) ||
        popularName.toLowerCase().includes(county.label.toLowerCase())
      )
    );
  }, [selectedState, allCounties, showPopularFirst]);
};

// Helper function to process counties based on search
export const useProcessedCounties = (
  allCounties: CountyOption[],
  searchQuery: string,
  selectedState: string | undefined,
  showPopularFirst: boolean,
  popularCounties: CountyOption[]
): CountyOption[] => {
  return useMemo(() => {
    let counties = allCounties;

    if (searchQuery.trim()) {
      if (!selectedState) { return []; }
      counties = searchCounties(selectedState, searchQuery);
    }

    if (showPopularFirst && !searchQuery.trim()) {
      const popular = popularCounties;
      const other = counties.filter(county =>
        !popular.some(popularCounty => popularCounty.value === county.value)
      );
      return [...popular, ...other.sort((a, b) => a.label.localeCompare(b.label))];
    }

    return counties.sort((a, b) => a.label.localeCompare(b.label));
  }, [allCounties, searchQuery, selectedState, showPopularFirst, popularCounties]);
};
