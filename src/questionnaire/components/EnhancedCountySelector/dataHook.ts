/**
 * Data management hook for EnhancedCountySelector
 */

import { getStateName } from '../../../services/location-data';
import type { CountyOption } from './types';
import { useCountiesForState, usePopularCounties, useProcessedCounties } from './hooks';

export const useCountySelectorData = (
  selectedState: string | undefined,
  showPopularFirst: boolean,
  searchQuery: string,
  value: string | null
): {
  allCounties: CountyOption[];
  popularCounties: CountyOption[];
  processedCounties: CountyOption[];
  selectedCounty: CountyOption | undefined;
  stateName: string | null;
} => {
  const allCounties = useCountiesForState(selectedState);
  const popularCounties = usePopularCounties(selectedState, allCounties, showPopularFirst);
  const processedCounties = useProcessedCounties(allCounties, searchQuery, selectedState, showPopularFirst, popularCounties);
  const selectedCounty = allCounties.find(county => county.value === value);
  const stateName = selectedState ? getStateName(selectedState) : null;

  return {
    allCounties,
    popularCounties,
    processedCounties,
    selectedCounty,
    stateName
  };
};
