/**
 * useDynamicCountyOptions Hook
 *
 * Provides dynamic county options based on the selected state.
 * Updates the county question options when the state changes.
 */

import { useEffect } from 'react';
import { getCountiesForState } from '../../services/location-data';
import { useQuestionFlowStore } from '../store';

/**
 * Hook to dynamically update county options based on selected state
 */
export function useDynamicCountyOptions(): void {
  const { answers, updateQuestion } = useQuestionFlowStore();

  useEffect(() => {
    const selectedState = answers.get('state') as string;

    if (selectedState) {
      const countyOptions = getCountiesForState(selectedState);

      // Update the county question with the new options
      updateQuestion('county', {
        id: 'county',
        text: 'What county do you live in?',
        description: 'County information helps us provide accurate Area Median Income (AMI) data for housing programs.',
        inputType: 'searchable-select',
        fieldName: 'county',
        required: true,
        placeholder: 'Search for your county...',
        helpText: 'This helps determine accurate income limits for LIHTC and other housing programs',
        options: countyOptions
      });
    }
  }, [answers, updateQuestion]);
}
