/**
 * Next Steps List Component
 *
 * Displays actionable next steps for program application
 */

import React, { useMemo } from 'react';
import { NextStep } from './types';
import * as Checkbox from '@radix-ui/react-checkbox';

interface NextStepsListProps {
  steps: NextStep[];
  onToggle?: (stepIndex: number, completed: boolean) => void;
}

export const NextStepsList: React.FC<NextStepsListProps> = ({
  steps,
  onToggle,
}) => {
  // Sort by priority: high > medium > low (undefined priorities go last)
  const getPriorityOrder = (priority: NextStep['priority']): number => {
    if (!priority) {return 3;}
    switch (priority) {
      case 'high': return 0;
      case 'medium': return 1;
      case 'low': return 2;
      default: return 3;
    }
  };

  const sortedSteps = useMemo(() => {
    return [...steps].sort((a, b) => {
      return getPriorityOrder(a.priority) - getPriorityOrder(b.priority);
    });
  }, [steps]);

  const { completedCount, completionPercentage } = useMemo(() => {
    const completed = steps.filter(s => s.completed).length;
    const percentage = steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;
    return { completedCount: completed, completionPercentage: percentage };
  }, [steps]);

  const getPriorityBadge = (priority: NextStep['priority']): React.ReactElement | null => {
    if (!priority) {
      return null;
    }

    // Type-safe switch statement to avoid object injection warnings
    let color: string;
    let label: string;
    let icon: string;

    switch (priority) {
      case 'high':
        color = 'bg-red-100 text-red-800 border-red-300';
        label = 'High Priority';
        icon = '🔴';
        break;
      case 'medium':
        color = 'bg-yellow-100 text-yellow-800 border-yellow-300';
        label = 'Medium Priority';
        icon = '🟡';
        break;
      case 'low':
        color = 'bg-gray-100 text-gray-800 border-gray-300';
        label = 'Low Priority';
        icon = '⚪';
        break;
      default:
        // TypeScript exhaustiveness check - should never reach here
        return null;
    }

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}
      >
        <span className="mr-1">{icon}</span>
        {label}
      </span>
    );
  };

  const handleCheckboxChange = (index: number, checked: boolean): void => {
    if (onToggle) {
      onToggle(index, checked);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="text-sm text-gray-600">
        <p>
          Follow these steps to apply for this program.
          Check off each step as you complete it.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {sortedSteps.map((step, index) => {
          const originalIndex = steps.indexOf(step);

          return (
            <div
              key={originalIndex}
              className={`
                p-4 border-2 rounded-lg transition-all print:break-inside-avoid
                ${step.completed
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <div className="flex items-start gap-3">
                {/* Step Number & Checkbox */}
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm border-2 border-blue-700">
                    {index + 1}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Step {index + 1}</div>
                  <div className="relative">
                    <Checkbox.Root
                      checked={step.completed ?? false}
                      onCheckedChange={(checked) => handleCheckboxChange(originalIndex, checked === true)}
                      className="w-6 h-6 rounded border-2 border-gray-300 flex items-center justify-center bg-white hover:border-blue-500 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 transition-colors print:hidden min-w-[44px] min-h-[44px]"
                      aria-label={`Mark step ${index + 1} as completed`}
                    >
                      <Checkbox.Indicator>
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                  </div>
                  <div className="text-xs text-gray-500">✓ Complete</div>
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className={`text-gray-900 font-medium ${step.completed ? 'line-through text-gray-500' : ''}`}>
                      {step.step}
                    </p>
                    {getPriorityBadge(step.priority)}
                  </div>

                  {/* URL Link */}
                  {step.url && (
                    <a
                      href={step.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline mt-2"
                      aria-label={`Visit website for ${step.step}`}
                    >
                      <span>Visit website</span>
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}

                  {/* Estimated Time */}
                  {step.estimatedTime && (
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Estimated time: {step.estimatedTime}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Status */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Progress: {completedCount} of {steps.length} completed
          </span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{
                  width: `${completionPercentage}%`
                }}
              />
            </div>
            <span className="font-semibold text-gray-700">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextStepsList;

