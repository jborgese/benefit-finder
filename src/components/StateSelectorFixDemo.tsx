/**
 * State Selector Fix Demo Component
 *
 * Demonstrates the fix for the state selector dropdown closing immediately
 */

import React, { useState } from 'react';
import { EnhancedStateSelector } from '../questionnaire/components/EnhancedStateSelector';

interface DemoQuestion {
  id: string;
  text: string;
  description: string;
  fieldName: string;
  required: boolean;
  helpText?: string;
}

const demoQuestion: DemoQuestion = {
  id: 'demo-state-fix',
  text: 'What state do you live in?',
  description: 'Benefits vary by state, so this helps us give you accurate information.',
  fieldName: 'state',
  required: true,
  helpText: 'Select your state to see available benefits and programs.'
};

export const StateSelectorFixDemo: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const handleStateChange = (value: string | number | null): void => {
    setSelectedState(value == null ? null : String(value));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          State Selector Fix Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Testing the fix for the state selector dropdown closing immediately issue
        </p>
      </div>

      {/* Enhanced State Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Enhanced State Selector (Fixed)
        </h2>

        <EnhancedStateSelector
          question={demoQuestion}
          value={selectedState}
          onChange={handleStateChange}
          placeholder="Search for your state..."
          showPopularFirst
          groupByRegion
          enableSearch
          enableAutoDetection={false}
          mobileOptimized={false}
          maxHeight="300px"
        />

        {selectedState && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              Selected State
            </h3>
            <p className="text-green-800 dark:text-green-200">
              You selected: <strong>{selectedState}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Fix Details */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          🔧 Fixes Applied to State Selector
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>✅ Improved blur handling to prevent immediate closing</li>
          <li>✅ Added click outside detection with proper event handling</li>
          <li>✅ Added click event propagation prevention</li>
          <li>✅ Increased focus timeout for better interaction</li>
          <li>✅ Added container refs for proper event delegation</li>
          <li>✅ Enhanced keyboard navigation support</li>
        </ul>
      </div>

      {/* Testing Instructions */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
          🧪 Testing Instructions
        </h3>
        <ol className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
          <li>1. Click on the state dropdown - it should stay open</li>
          <li>2. Try typing in the search box - results should appear</li>
          <li>3. Click on a state option - it should select and close</li>
          <li>4. Click outside the dropdown - it should close</li>
          <li>5. Try the keyboard navigation (arrow keys) - it should work</li>
          <li>6. Test the popular states first feature</li>
          <li>7. Test the regional grouping (if enabled)</li>
        </ol>
      </div>

      {/* Comparison */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
        <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">
          🔄 Before vs After
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">❌ Before (Broken)</h4>
            <ul className="space-y-1 text-red-700 dark:text-red-300">
              <li>• Dropdown closes immediately on click</li>
              <li>• No search functionality</li>
              <li>• Poor mobile experience</li>
              <li>• No keyboard navigation</li>
              <li>• No popular states prioritization</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">✅ After (Fixed)</h4>
            <ul className="space-y-1 text-green-700 dark:text-green-300">
              <li>• Dropdown stays open for interaction</li>
              <li>• Full search functionality</li>
              <li>• Mobile-optimized interface</li>
              <li>• Complete keyboard navigation</li>
              <li>• Popular states shown first</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
