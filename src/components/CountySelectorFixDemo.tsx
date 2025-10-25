/**
 * County Selector Fix Demo Component
 *
 * Demonstrates the fix for the dropdown closing immediately
 */

import React, { useState } from 'react';
import { EnhancedCountySelector } from '../questionnaire/components/EnhancedCountySelector';

interface DemoQuestion {
  id: string;
  text: string;
  description: string;
  fieldName: string;
  required: boolean;
  helpText?: string;
}

const demoQuestion: DemoQuestion = {
  id: 'demo-county-fix',
  text: 'What county do you live in?',
  description: 'County information helps us provide accurate Area Median Income (AMI) data for housing programs.',
  fieldName: 'county',
  required: true,
  helpText: 'Select your county to see available benefits and programs.'
};

export const CountySelectorFixDemo: React.FC = () => {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [selectedState] = useState<string>('GA'); // Default to Georgia for testing

  const handleCountyChange = (value: string | null): void => {
    setSelectedCounty(value);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          County Selector Fix Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Testing the fix for the dropdown closing immediately issue
        </p>
      </div>

      {/* State Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Current State: Georgia
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          The county selector should now stay open when you click on it.
        </p>
      </div>

      {/* Enhanced County Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Enhanced County Selector (Fixed)
        </h2>

        <EnhancedCountySelector
          question={demoQuestion}
          value={selectedCounty}
          onChange={handleCountyChange}
          selectedState={selectedState}
          placeholder="Search for your county..."
          showPopularFirst
          showStateContext
          enableSearch
          mobileOptimized={false}
          maxHeight="300px"
        />

        {selectedCounty && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              Selected County
            </h3>
            <p className="text-green-800 dark:text-green-200">
              You selected: <strong>{selectedCounty}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Fix Details */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          🔧 Fixes Applied
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>✅ Improved blur handling to prevent immediate closing</li>
          <li>✅ Added click outside detection with proper event handling</li>
          <li>✅ Added click event propagation prevention</li>
          <li>✅ Increased focus timeout for better interaction</li>
          <li>✅ Added container refs for proper event delegation</li>
        </ul>
      </div>

      {/* Testing Instructions */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
          🧪 Testing Instructions
        </h3>
        <ol className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
          <li>1. Click on the county dropdown - it should stay open</li>
          <li>2. Try typing in the search box - results should appear</li>
          <li>3. Click on a county option - it should select and close</li>
          <li>4. Click outside the dropdown - it should close</li>
          <li>5. Try the keyboard navigation (arrow keys) - it should work</li>
        </ol>
      </div>
    </div>
  );
};
