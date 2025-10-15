/**
 * Confidence Score Component
 *
 * Displays context-aware confidence labels for eligibility determination
 */

import React from 'react';
import { ConfidenceLevel, EligibilityStatus } from './types';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ConfidenceScoreProps {
  level: ConfidenceLevel;
  score: number; // 0-100 (for future use)
  status: EligibilityStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceScore: React.FC<ConfidenceScoreProps> = ({
  level,
  score: _score, // Renamed to indicate it's unused for now
  status,
  showLabel = true,
  size = 'md',
}) => {
  /**
   * Get context-aware label based on eligibility status and confidence
   */
  const getContextualLabel = (): { text: string; icon: string } => {
    // For qualified results
    if (status === 'qualified') {
      switch (level) {
        case 'high':
          return { text: 'Strong Match', icon: '👍' };
        case 'medium':
          return { text: 'Good Match', icon: '✓' };
        case 'low':
          return { text: 'Possible Match', icon: '?' };
      }
    }

    // For not qualified results
    if (status === 'not-qualified') {
      switch (level) {
        case 'high':
          return { text: 'Clear Mismatch', icon: '' };
        case 'medium':
          return { text: 'Likely Ineligible', icon: '' };
        case 'low':
          return { text: 'Insufficient Data', icon: '?' };
      }
    }

    // For uncertain results (likely, maybe, unlikely)
    if (status === 'likely') {
      switch (level) {
        case 'high':
          return { text: 'Strong Match', icon: '👍' };
        case 'medium':
          return { text: 'Good Match', icon: '✓' };
        case 'low':
          return { text: 'Needs Verification', icon: '?' };
      }
    }

    if (status === 'maybe') {
      switch (level) {
        case 'high':
        case 'medium':
          return { text: 'Needs Verification', icon: '?' };
        case 'low':
          return { text: 'More Info Required', icon: '❓' };
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (status === 'unlikely') {
      switch (level) {
        case 'high':
        case 'medium':
          return { text: 'Likely Ineligible', icon: '' };
        case 'low':
          return { text: 'Insufficient Data', icon: '?' };
        default:
          return { text: 'Uncertain', icon: '?' };
      }
    }

    // Fallback
    return { text: 'Uncertain', icon: '?' };
  };

  const getColorClass = (): string => {
    // Color based on status, not just confidence level
    if (status === 'qualified' || status === 'likely') {
      return 'text-green-700 bg-green-100 border-green-300';
    }

    if (status === 'maybe') {
      return 'text-blue-700 bg-blue-100 border-blue-300';
    }

    if (status === 'unlikely') {
      return 'text-orange-700 bg-orange-100 border-orange-300';
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (status === 'not-qualified') {
      return 'text-gray-700 bg-gray-100 border-gray-300';
    }

    // Fallback
    return 'text-gray-600 bg-gray-100 border-gray-300';
  };

  const getSizeClass = (): string => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      case 'md':
      default:
        return 'text-sm px-3 py-1.5';
    }
  };

  const getTooltipText = (): string => {
    // Context-aware explanations
    if (status === 'qualified' || status === 'likely') {
      if (level === 'high') {
        return 'You meet all the requirements we can verify. This is a reliable match.';
      } else if (level === 'medium') {
        return 'You appear to qualify, but some information may need verification during application.';
      } else {
        return 'You might qualify, but we need more complete information to be certain.';
      }
    }

    if (status === 'not-qualified') {
      if (level === 'high') {
        return 'Based on the information provided, you clearly do not meet the requirements.';
      } else if (level === 'medium') {
        return 'You likely do not qualify, but double-check with the program directly.';
      } else {
        return 'We cannot determine eligibility with the available information.';
      }
    }

    if (status === 'maybe') {
      return 'Your eligibility is uncertain. Consider contacting the program for clarification or provide more information.';
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (status === 'unlikely') {
      return 'You probably do not qualify, but there may be special circumstances or additional programs to consider.';
    }

    return 'Eligibility determination is uncertain. Contact the program for more information.';
  };

  const contextualLabel = getContextualLabel();

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div
            className={`
              inline-flex items-center rounded-full border-2 font-semibold cursor-help
              ${getColorClass()}
              ${getSizeClass()}
            `}
            role="status"
            aria-label={`Result confidence: ${contextualLabel.text}`}
          >
            {showLabel && contextualLabel.icon && (
              <span className="mr-1.5">{contextualLabel.icon}</span>
            )}
            <span>{contextualLabel.text}</span>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm max-w-xs z-50"
            sideOffset={5}
          >
            {getTooltipText()}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default ConfidenceScore;

