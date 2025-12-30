/**
 * Results Summary Component
 *
 * Displays overview of eligibility results across all programs
 */

import React, { useMemo } from 'react';
import { EligibilityResults, EligibilityStatus } from './types';
import * as Progress from '@radix-ui/react-progress';
import { useI18n } from '../../i18n/hooks';

interface ResultsSummaryProps {
  results: EligibilityResults;
  onFilterChange?: (status: EligibilityStatus | 'all') => void;
  activeFilter?: EligibilityStatus | 'all';
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  results,
  onFilterChange,
  activeFilter = 'all',
}) => {
  const { t } = useI18n();
  const { qualified, likely, maybe, notQualified, totalPrograms, evaluatedAt } = results;

  // Constants for repeated style classes and status values
  const GRAY_STYLE = 'bg-gray-100 text-gray-800 border-gray-300';
  const ACTIVE_FILTER_RING = ' border-current ring-2';
  const DEFAULT_BUTTON_STYLE = 'bg-white border-gray-200 hover:border-gray-300 text-gray-700';
  const NOT_QUALIFIED_STATUS = 'not-qualified' as const;

  const { statusCounts, qualifiedPercentage } = useMemo(() => {
    const counts = {
      qualified: qualified.length,
      likely: likely.length,
      maybe: maybe.length,
      [NOT_QUALIFIED_STATUS]: notQualified.length,
    };

    const percentage = totalPrograms > 0
      ? Math.round((qualified.length / totalPrograms) * 100)
      : 0;

    return { statusCounts: counts, qualifiedPercentage: percentage };
  }, [qualified.length, likely.length, maybe.length, notQualified.length, totalPrograms]);

  const getStatusColor = (status: EligibilityStatus | 'all'): string => {
    switch (status) {
      case 'qualified':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'likely':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'maybe':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case NOT_QUALIFIED_STATUS:
        return GRAY_STYLE;
      case 'all':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return GRAY_STYLE;
    }
  };

  const getStatusIcon = (status: EligibilityStatus): string => {
    switch (status) {
      case 'qualified':
        return '✓';
      case 'likely':
        return '◐';
      case 'maybe':
        return '?';
      case 'not-qualified':
        return '✗';
      default:
        return '○';
    }
  };

  const handleFilterClick = (status: EligibilityStatus | 'all'): void => {
    if (onFilterChange) {
      onFilterChange(status);
    }
  };



  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none">
      {/* Header */}
      <div className="mb-6">
        <p className="text-gray-600 text-sm">
          {t('results.summary.evaluatedOn', {
            date: evaluatedAt.toLocaleDateString(),
            time: evaluatedAt.toLocaleTimeString()
          })}
        </p>
        <div className="mt-6 flex flex-col items-center">
          <p className="mt-4 text-lg font-semibold text-gray-800">{t('results.processingMessage')}</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {t('results.summary.qualifiedFor', { count: qualified.length, total: totalPrograms })}
          </span>
          <span className="text-sm font-semibold text-green-600">
            {qualifiedPercentage}%
          </span>
        </div>
        <Progress.Root
          className="relative overflow-hidden bg-gray-200 rounded-full w-full h-3 z-0"
          value={qualifiedPercentage}
        >
          <Progress.Indicator
            className="bg-green-500 w-full h-full transition-transform duration-300 ease-out relative z-0"
            style={{ transform: `translateX(-${100 - qualifiedPercentage}%)` }}
          />
        </Progress.Root>
      </div>

      {/* Status Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 print:gap-2">
        {/* All Programs */}
        <button
          onClick={() => handleFilterClick('all')}
          className={`
            flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
            ${activeFilter === 'all' ? `${getStatusColor('all')}${ACTIVE_FILTER_RING} ring-purple-200` : DEFAULT_BUTTON_STYLE}
            print:p-2 print:border
          `}
          aria-label="Show all programs"
        >
          <span className="text-2xl mb-1">📋</span>
          <span className="text-sm font-medium">{t('results.summary.all')}</span>
          <span className="text-xl font-bold">{totalPrograms}</span>
        </button>

        {/* Qualified */}
        <button
          onClick={() => handleFilterClick('qualified')}
          className={`
            flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
            ${activeFilter === 'qualified' ? `${getStatusColor('qualified')}${ACTIVE_FILTER_RING} ring-green-200` : DEFAULT_BUTTON_STYLE}
            print:p-2 print:border
          `}
          aria-label={`Show ${statusCounts.qualified} qualified programs`}
        >
          <span className={`text-2xl mb-1 ${activeFilter === 'qualified' ? 'text-green-800' : 'text-green-600'}`}>{getStatusIcon('qualified')}</span>
          <span className="text-sm font-medium">{t('results.summary.qualified')}</span>
          <span className="text-xl font-bold text-green-600">{statusCounts.qualified}</span>
        </button>

        {/* Likely */}
        <button
          onClick={() => handleFilterClick('likely')}
          className={`
            flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
            ${activeFilter === 'likely' ? `${getStatusColor('likely')}${ACTIVE_FILTER_RING} ring-blue-200` : DEFAULT_BUTTON_STYLE}
            print:p-2 print:border
          `}
          aria-label={`Show ${statusCounts.likely} likely programs`}
        >
          <span className={`text-2xl mb-1 ${activeFilter === 'likely' ? 'text-blue-800' : 'text-blue-600'}`}>{getStatusIcon('likely')}</span>
          <span className="text-sm font-medium">{t('results.summary.likely')}</span>
          <span className="text-xl font-bold text-blue-600">{statusCounts.likely}</span>
        </button>

        {/* Maybe */}
        <button
          onClick={() => handleFilterClick('maybe')}
          className={`
            flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
            ${activeFilter === 'maybe' ? `${getStatusColor('maybe')}${ACTIVE_FILTER_RING} ring-yellow-200` : DEFAULT_BUTTON_STYLE}
            print:p-2 print:border
          `}
          aria-label={`Show ${statusCounts.maybe} maybe programs`}
        >
          <span className={`text-2xl mb-1 ${activeFilter === 'maybe' ? 'text-yellow-800' : 'text-yellow-600'}`}>{getStatusIcon('maybe')}</span>
          <span className="text-sm font-medium">{t('results.summary.maybe')}</span>
          <span className="text-xl font-bold text-yellow-600">{statusCounts.maybe}</span>
        </button>

        {/* Not Qualified */}
        <button
          onClick={() => handleFilterClick(NOT_QUALIFIED_STATUS)}
          className={`
            flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
            ${activeFilter === NOT_QUALIFIED_STATUS ? `${getStatusColor(NOT_QUALIFIED_STATUS)}${ACTIVE_FILTER_RING} ring-gray-200` : DEFAULT_BUTTON_STYLE}
            print:p-2 print:border
          `}
          aria-label={`Show ${statusCounts[NOT_QUALIFIED_STATUS]
            } not qualified programs`}
        >
          <span className={`text-2xl mb-1 ${activeFilter === NOT_QUALIFIED_STATUS ? 'text-gray-800' : 'text-gray-600'}`}>{getStatusIcon(NOT_QUALIFIED_STATUS)}</span>
          <span className="text-sm font-medium">{t('results.summary.notQualified')}</span>
          <span className="text-xl font-bold text-gray-600">{

            statusCounts[NOT_QUALIFIED_STATUS]
          }</span>
        </button>
      </div>

      {/* Quick Tips */}
      {qualified.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg print:border print:mt-4">
          <h3 className="font-semibold text-green-900 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Next Steps
          </h3>
          <p className="text-sm text-green-800">
            You qualify for {qualified.length} program{qualified.length !== 1 ? 's' : ''}!
            Review each program card below for specific application instructions and required documents.
          </p>
        </div>
      )}

      {qualified.length === 0 && maybe.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg print:border print:mt-4">
          <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
            <span className="mr-2">ℹ️</span>
            {t('results.additionalInfo.title')}
          </h3>
          <p className="text-sm text-yellow-800">
            {t('results.additionalInfo.message')}
          </p>
        </div>
      )}

      {qualified.length === 0 && likely.length === 0 && maybe.length === 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg print:border print:mt-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
            <span className="mr-2">📞</span>
            Need Help?
          </h3>
          <p className="text-sm text-blue-800">
            Based on the information provided, you may not qualify for these programs.
            However, circumstances change and you may become eligible in the future.
            Contact a local benefits counselor or community organization for personalized assistance.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultsSummary;

