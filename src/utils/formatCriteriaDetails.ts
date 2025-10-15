import { formatFieldName } from './fieldNameMappings';

/**
 * Format criteria results into user-friendly explanations
 * Shows meaningful details for both passing and failing criteria
 */
export function formatCriteriaDetails(
  criteriaResults: Array<{
    criterion: string;
    met: boolean;
    value?: unknown;
    threshold?: unknown;
    comparison?: string;
    message?: string;
  }> | undefined,
  isEligible: boolean
): string[] {
  if (!criteriaResults || criteriaResults.length === 0) {
    return [];
  }

  return criteriaResults.map(cr => {
    const fieldName = formatFieldName(cr.criterion);

    // If we have specific comparison details, use them
    if (cr.comparison) {
      return `${fieldName}: ${cr.comparison}`;
    }

    // If we have value and threshold information, show meaningful comparison
    if (cr.value !== undefined && cr.threshold !== undefined) {
      const valueStr = typeof cr.value === 'number'
        ? cr.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
        : String(cr.value);
      const thresholdStr = typeof cr.threshold === 'number'
        ? cr.threshold.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
        : String(cr.threshold);

      if (cr.met && isEligible) {
        return `${fieldName}: ${valueStr} (within limit of ${thresholdStr})`;
      } else if (!cr.met && !isEligible) {
        // Show why they failed
        if (cr.criterion.toLowerCase().includes('income')) {
          return `${fieldName}: ${valueStr} exceeds limit of ${thresholdStr}`;
        } else {
          return `${fieldName}: ${valueStr} does not meet requirement of ${thresholdStr}`;
        }
      }
    }

    // If we have a specific message, use it
    if (cr.message) {
      return `${fieldName}: ${cr.message}`;
    }

    // Enhanced context-aware descriptions based on field type and eligibility
    if (isEligible) {
      return `${fieldName}: Meets requirements`;
    } else {
      // For failed cases, provide more specific guidance based on field name
      const criterion = cr.criterion.toLowerCase();

      if (criterion.includes('income')) {
        if (cr.met) {
          return `${fieldName}: Too high for program eligibility`;
        } else {
          return `${fieldName}: Income information processed, but exceeds program limits`;
        }
      } else if (criterion.includes('household') && criterion.includes('size')) {
        if (cr.met) {
          return `${fieldName}: Household size contributes to income limit calculation`;
        } else {
          return `${fieldName}: Household size affects your eligibility determination`;
        }
      } else if (criterion.includes('citizenship') || criterion.includes('immigration')) {
        if (cr.met) {
          return `${fieldName}: Citizenship verified but other factors affect eligibility`;
        } else {
          return `${fieldName}: Does not meet citizenship requirements`;
        }
      } else if (criterion.includes('asset') || criterion.includes('resource')) {
        if (cr.met) {
          return `${fieldName}: Assets within limits`;
        } else {
          return `${fieldName}: Assets exceed program limits`;
        }
      } else if (criterion.includes('work') || criterion.includes('employment')) {
        if (cr.met) {
          return `${fieldName}: Work requirements verified`;
        } else {
          return `${fieldName}: Does not meet work requirements`;
        }
      } else {
        // Generic fallback with more helpful context
        if (cr.met) {
          return `${fieldName}: Information verified, but other factors prevent qualification`;
        } else {
          return `${fieldName}: Does not meet program requirements`;
        }
      }
    }
  });
}

