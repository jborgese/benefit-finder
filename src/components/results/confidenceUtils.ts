/**
 * Confidence Display Utilities
 *
 * Shared utilities for converting confidence data to user-friendly labels
 */

/**
 * Get contextual label from basic eligibility data (for components without detailed status)
 */
export function getContextualLabelFromBasicData(
  eligible: boolean,
  confidence: number,
  incomplete?: boolean
): { text: string; icon: string } {
  if (incomplete) {
    return { text: 'Incomplete Data', icon: '?' };
  }

  if (eligible) {
    if (confidence >= 90) {
      return { text: 'Strong Match', icon: '👍' };
    } else if (confidence >= 70) {
      return { text: 'Good Match', icon: '✓' };
    } else {
      return { text: 'Possible Match', icon: '?' };
    }
  } else if (confidence >= 90) {
    return { text: 'Clear Mismatch', icon: '' };
  } else if (confidence >= 70) {
    return { text: 'Likely Ineligible', icon: '' };
  } else {
    return { text: 'Insufficient Data', icon: '?' };
  }
}
