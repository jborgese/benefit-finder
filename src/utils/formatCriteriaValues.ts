/**
 * Format criteria values and thresholds for user display
 * Provides context-aware formatting based on field type
 */

/**
 * Format a criterion value for display
 * Automatically detects the appropriate format based on field name and value type
 */
export function formatCriteriaValue(
  value: unknown,
  fieldName?: string
): string {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return 'Not provided';
  }

  // Handle boolean values
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Handle numbers
  if (typeof value === 'number') {
    return formatNumericValue(value, fieldName);
  }

  // Handle dates
  if (value instanceof Date) {
    return value.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  // Handle objects
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  // Default: convert to string
  return String(value);
}

/**
 * Format a numeric value based on field context
 */
function formatNumericValue(value: number, fieldName?: string): string {
  const lowerFieldName = fieldName?.toLowerCase() ?? '';

  // Currency formatting for financial fields
  if (shouldFormatAsCurrency(lowerFieldName)) {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  // Percentage formatting
  if (shouldFormatAsPercentage(lowerFieldName)) {
    return `${value}%`;
  }

  // Age formatting
  if (lowerFieldName.includes('age')) {
    return `${value} years`;
  }

  // Household size formatting
  if (lowerFieldName.includes('household') && lowerFieldName.includes('size')) {
    return `${value} ${value === 1 ? 'person' : 'people'}`;
  }

  // Default number formatting with commas
  return value.toLocaleString('en-US');
}

/**
 * Determine if a field should be formatted as currency
 */
function shouldFormatAsCurrency(fieldName: string): boolean {
  const currencyKeywords = [
    'income',
    'salary',
    'wage',
    'asset',
    'resource',
    'balance',
    'amount',
    'cost',
    'rent',
    'mortgage',
    'payment',
    'value',
    'price',
    'fpl', // Federal Poverty Level
  ];

  return currencyKeywords.some(keyword => fieldName.includes(keyword));
}

/**
 * Determine if a field should be formatted as percentage
 */
function shouldFormatAsPercentage(fieldName: string): boolean {
  const percentageKeywords = [
    'percent',
    'percentage',
    'rate',
  ];

  return percentageKeywords.some(keyword => fieldName.includes(keyword));
}

/**
 * Format a threshold value for display
 * Uses the same logic as formatCriteriaValue but can have different defaults
 */
export function formatThreshold(
  threshold: unknown,
  fieldName?: string
): string {
  // Thresholds use the same formatting as regular values
  return formatCriteriaValue(threshold, fieldName);
}

/**
 * Format a comparison string between a value and threshold
 * Used for generating user-friendly comparison statements
 */
export function formatComparison(
  value: unknown,
  threshold: unknown,
  fieldName: string,
  met: boolean,
  isEligible: boolean
): string {
  const valueStr = formatCriteriaValue(value, fieldName);
  const thresholdStr = formatThreshold(threshold, fieldName);

  // For eligible results
  if (met && isEligible) {
    return `${valueStr} (within limit of ${thresholdStr})`;
  }

  // For ineligible results
  if (!met && !isEligible) {
    const lowerFieldName = fieldName.toLowerCase();

    // Income typically needs to be BELOW threshold
    if (lowerFieldName.includes('income')) {
      return `${valueStr} exceeds limit of ${thresholdStr}`;
    }

    // Age typically needs to be ABOVE threshold (minimum age)
    if (lowerFieldName.includes('age')) {
      if (typeof value === 'number' && typeof threshold === 'number') {
        if (value < threshold) {
          return `${valueStr} is below minimum of ${thresholdStr}`;
        } else {
          return `${valueStr} exceeds maximum of ${thresholdStr}`;
        }
      }
    }

    // Assets typically need to be BELOW threshold
    if (lowerFieldName.includes('asset') || lowerFieldName.includes('resource')) {
      return `${valueStr} exceeds limit of ${thresholdStr}`;
    }

    // Generic comparison
    return `${valueStr} does not meet requirement of ${thresholdStr}`;
  }

  // Special handling for household size
  if (fieldName.toLowerCase().includes('household') && fieldName.toLowerCase().includes('size')) {
    return `${valueStr} (determines income limit)`;
  }

  // Default case
  return `${valueStr} vs ${thresholdStr}`;
}

