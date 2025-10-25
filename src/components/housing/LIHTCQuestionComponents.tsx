/**
 * LIHTC-Specific Question Components
 *
 * Specialized UI components for LIHTC housing questionnaire questions.
 */

import React from 'react';
import type { QuestionDefinition } from '../../types/question';

// Constants for repeated CSS classes
const SELECTED_STYLES = 'border-blue-500 bg-blue-50';
const DEFAULT_STYLES = 'border-gray-300 hover:border-gray-400';

// Type for AMI data structure
interface AMIData {
  incomeLimit50: number;
}

// Helper function to get unit size className
const getUnitSizeClassName = (
  value: unknown,
  optionValue: string,
  isRecommended: boolean,
  isTooSmall: boolean
): string => {
  if (value === optionValue) {
    return SELECTED_STYLES;
  }
  if (isRecommended) {
    return 'border-green-500 bg-green-50';
  }
  if (isTooSmall) {
    return 'border-red-300 bg-red-50';
  }
  return DEFAULT_STYLES;
};

interface QuestionProps {
  question: QuestionDefinition;
  value: unknown;
  onChange: (fieldName: string, value: unknown) => void;
  context?: Record<string, unknown>;
}

/**
 * Student Status Question Component
 */
export const StudentStatusQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{question.question}</h3>
        {question.subtitle && (
          <p className="text-sm text-gray-600 mt-1">{question.subtitle}</p>
        )}
      </div>

      <div className="space-y-3">
        {question.options?.map((option) => (
          <label
            key={option.value}
            className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${value === option.value
              ? SELECTED_STYLES
              : DEFAULT_STYLES
              }`}
          >
            <input
              type="radio"
              name={question.key}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(question.key, e.target.value)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">{option.label}</span>
              {option.description && (
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              )}
              {option.value === 'full_time_student' && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                  <p className="text-sm text-amber-800">
                    ⚠️ Full-time students may be ineligible for LIHTC housing
                  </p>
                </div>
              )}
            </div>
          </label>
        ))}
      </div>

      {question.helpText && (
        <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
          {question.helpText}
        </p>
      )}
    </div>
  );
};

/**
 * Unit Size Question Component
 */
export const UnitSizeQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
  context
}) => {
  const householdSize = (context?.householdSize as number) || 1;

  const getRecommendedUnitSize = (size: number): string => {
    if (size === 1) return 'studio';
    if (size <= 2) return '1br';
    if (size <= 4) return '2br';
    if (size <= 6) return '3br';
    return '4br';
  };

  const isUnitTooSmall = (householdSize: number, unitSize: string): boolean => {
    const sizeLimits = {
      'studio': 1,
      '1br': 2,
      '2br': 4,
      '3br': 6,
      '4br': 8
    };
    return householdSize > (sizeLimits[unitSize as keyof typeof sizeLimits] || 8);
  };

  const recommendedUnit = getRecommendedUnitSize(householdSize);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{question.question}</h3>
        {question.subtitle && (
          <p className="text-sm text-gray-600 mt-1">{question.subtitle}</p>
        )}
        <p className="text-sm text-blue-600 mt-2">
          For a household of {householdSize} people, we recommend: {recommendedUnit}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options?.map((option) => {
          const isRecommended = recommendedUnit === option.value;
          const isTooSmall = isUnitTooSmall(householdSize, option.value as string);

          return (
            <label
              key={option.value}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${getUnitSizeClassName(value, option.value, isRecommended, isTooSmall)}`}
            >
              <input
                type="radio"
                name={question.key}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(question.key, e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">{option.label}</span>
                  {option.description && (
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {isRecommended && (
                    <span className="text-green-600 text-sm font-medium">✓ Recommended</span>
                  )}
                  {isTooSmall && (
                    <span className="text-red-600 text-sm font-medium">⚠️ Too small</span>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {question.helpText && (
        <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
          {question.helpText}
        </p>
      )}
    </div>
  );
};

/**
 * Housing History Question Component
 */
export const HousingHistoryQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{question.question}</h3>
        {question.subtitle && (
          <p className="text-sm text-gray-600 mt-1">{question.subtitle}</p>
        )}
      </div>

      <div className="space-y-3">
        {question.options?.map((option) => (
          <label
            key={option.value}
            className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${value === option.value
              ? SELECTED_STYLES
              : DEFAULT_STYLES
              }`}
          >
            <input
              type="radio"
              name={question.key}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(question.key, e.target.value)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">{option.label}</span>
              {option.description && (
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>

      {question.helpText && (
        <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
          {question.helpText}
        </p>
      )}
    </div>
  );
};

/**
 * Income Sources Question Component
 */
export const IncomeSourcesQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange
}) => {
  const selectedSources = (value as string[]) || [];

  const handleSourceChange = (sourceValue: string, checked: boolean): void => {
    if (checked) {
      onChange(question.key, [...selectedSources, sourceValue]);
    } else {
      onChange(question.key, selectedSources.filter(s => s !== sourceValue));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{question.question}</h3>
        {question.subtitle && (
          <p className="text-sm text-gray-600 mt-1">{question.subtitle}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options?.map((option) => (
          <label
            key={option.value}
            className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedSources.includes(option.value as string)
              ? SELECTED_STYLES
              : DEFAULT_STYLES
              }`}
          >
            <input
              type="checkbox"
              name={question.key}
              value={option.value}
              checked={selectedSources.includes(option.value as string)}
              onChange={(e) => handleSourceChange(option.value as string, e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">{option.label}</span>
              {option.description && (
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>

      {question.helpText && (
        <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
          {question.helpText}
        </p>
      )}
    </div>
  );
};

/**
 * Rent Affordability Question Component
 */
export const RentAffordabilityQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
  context
}) => {
  const amiData = context?.amiData as AMIData | undefined;
  const maxAffordableRent = amiData ? Math.floor(amiData.incomeLimit50 * 0.3) : 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{question.question}</h3>
        {question.subtitle && (
          <p className="text-sm text-gray-600 mt-1">{question.subtitle}</p>
        )}
      </div>

      {amiData && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">LIHTC Rent Information</h4>
          <p className="text-sm text-blue-800">
            Maximum LIHTC rent (30% of 50% AMI): <strong>${maxAffordableRent.toLocaleString()}/month</strong>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            This is the maximum rent for LIHTC units in your area
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor={question.key} className="block text-sm font-medium text-gray-700">
          Maximum Monthly Rent ($)
        </label>
        <input
          type="number"
          id={question.key}
          name={question.key}
          value={value as number || ''}
          onChange={(e) => onChange(question.key, parseFloat(e.target.value) || 0)}
          min={question.min}
          max={question.max}
          step={question.step}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Enter maximum affordable rent"
        />
        {question.min !== undefined && (
          <p className="text-xs text-gray-500">
            Minimum: ${question.min.toLocaleString()}
          </p>
        )}
        {question.max !== undefined && (
          <p className="text-xs text-gray-500">
            Maximum: ${question.max.toLocaleString()}
          </p>
        )}
      </div>

      {question.helpText && (
        <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
          {question.helpText}
        </p>
      )}
    </div>
  );
};

/**
 * Housing Preferences Question Component
 */
export const HousingPreferencesQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange
}) => {
  const selectedPreferences = (value as string[]) || [];

  const handlePreferenceChange = (preferenceValue: string, checked: boolean): void => {
    if (checked) {
      onChange(question.key, [...selectedPreferences, preferenceValue]);
    } else {
      onChange(question.key, selectedPreferences.filter(p => p !== preferenceValue));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{question.question}</h3>
        {question.subtitle && (
          <p className="text-sm text-gray-600 mt-1">{question.subtitle}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options?.map((option) => (
          <label
            key={option.value}
            className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedPreferences.includes(option.value as string)
              ? SELECTED_STYLES
              : DEFAULT_STYLES
              }`}
          >
            <input
              type="checkbox"
              name={question.key}
              value={option.value}
              checked={selectedPreferences.includes(option.value as string)}
              onChange={(e) => handlePreferenceChange(option.value as string, e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">{option.label}</span>
              {option.description && (
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>

      {question.helpText && (
        <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
          {question.helpText}
        </p>
      )}
    </div>
  );
};

/**
 * Contact Preferences Question Component
 */
export const ContactPreferencesQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange
}) => {
  const selectedMethods = (value as string[]) || [];

  const handleMethodChange = (methodValue: string, checked: boolean): void => {
    if (checked) {
      onChange(question.key, [...selectedMethods, methodValue]);
    } else {
      onChange(question.key, selectedMethods.filter(m => m !== methodValue));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{question.question}</h3>
        {question.subtitle && (
          <p className="text-sm text-gray-600 mt-1">{question.subtitle}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options?.map((option) => (
          <label
            key={option.value}
            className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedMethods.includes(option.value as string)
              ? SELECTED_STYLES
              : DEFAULT_STYLES
              }`}
          >
            <input
              type="checkbox"
              name={question.key}
              value={option.value}
              checked={selectedMethods.includes(option.value as string)}
              onChange={(e) => handleMethodChange(option.value as string, e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">{option.label}</span>
              {option.description && (
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>

      {question.helpText && (
        <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
          {question.helpText}
        </p>
      )}
    </div>
  );
};
