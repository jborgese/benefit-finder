/**
 * useDynamicCountyOptions Hook
 *
 * Provides dynamic county options based on the selected state.
 * Updates the county question options when the state changes.
 * Includes safeguards for when state changes after location detection.
 */

import { useEffect, useRef } from 'react';
import { getCountiesForState } from '../../services/location-data';
import { useQuestionFlowStore } from '../store';

/**
 * Hook to dynamically update county options based on selected state
 * with safeguards for state changes after location detection
 */
export function useDynamicCountyOptions(): void {
  const { answers, updateQuestion, answerQuestion } = useQuestionFlowStore();
  const previousStateRef = useRef<string | null>(null);

  useEffect(() => {
    const selectedState = answers.get('state')?.value as string;
    const currentCounty = answers.get('county')?.value as string;

    // Check if state has changed
    const stateChanged = previousStateRef.current !== null &&
                        previousStateRef.current !== selectedState;

    if (selectedState) {
      const countyOptions = getCountiesForState(selectedState);

      // If state changed and we have a county value, check if it's still valid
      if (stateChanged && currentCounty) {
        const validCounties = countyOptions.map(option => option.value);
        const isCountyValid = validCounties.includes(currentCounty);

        if (!isCountyValid) {
          // Clear the invalid county value
          console.log(`County "${currentCounty}" is not valid for state "${selectedState}". Clearing county selection.`);
          answerQuestion('county', 'county', null);

          // Show user-friendly message in console for debugging
          console.log(`🔄 State changed from "${previousStateRef.current}" to "${selectedState}". County selection cleared.`);
        } else {
          console.log(`✅ County "${currentCounty}" is valid for state "${selectedState}". Keeping county selection.`);
        }
      }

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

      // Update the previous state reference
      previousStateRef.current = selectedState;
    }
  }, [answers, updateQuestion, answerQuestion]);
}
