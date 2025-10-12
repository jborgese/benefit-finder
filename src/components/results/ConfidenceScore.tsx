/**
 * Confidence Score Component
 *
 * Displays confidence level and score for eligibility determination
 */

import React from 'react';
import { ConfidenceLevel } from './types';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ConfidenceScoreProps {
  level: ConfidenceLevel;
  score: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceScore: React.FC<ConfidenceScoreProps> = ({
  level,
  score,
  showLabel = true,
  size = 'md',
}) => {
  const getColorClass = () => {
    switch (level) {
      case 'high':
        return 'text-green-600 bg-green-100 border-green-300';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'low':
        return 'text-orange-600 bg-orange-100 border-orange-300';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getSizeClass = () => {
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

  const getTooltipText = () => {
    const explanations = {
      high: 'We have high confidence in this determination based on clear eligibility rules and complete information.',
      medium: 'We have moderate confidence in this determination. Some factors may need verification.',
      low: 'We have lower confidence in this determination. Additional information or verification may be needed.',
    };
    return explanations[level];
  };

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
            aria-label={`Confidence: ${level}, ${score}%`}
          >
            {showLabel && (
              <span className="mr-1.5 capitalize">{level}</span>
            )}
            <span>{score}%</span>
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

