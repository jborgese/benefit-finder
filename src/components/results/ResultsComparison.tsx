/**
 * Results Comparison Component
 *
 * Compares multiple eligibility results side-by-side
 */

import React from 'react';
import type { EligibilityResults } from './types';

interface SavedResultSummary {
  id: string;
  results: EligibilityResults;
  evaluatedAt: Date;
  state?: string;
  notes?: string;
}

interface ResultsComparisonProps {
  savedResults: SavedResultSummary[];
  onClose?: () => void;
}

export const ResultsComparison: React.FC<ResultsComparisonProps> = ({
  savedResults,
  onClose,
}) => {
  if (savedResults.length < 2) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Select at least 2 results to compare.</p>
      </div>
    );
  }

  // Get all unique programs across all results
  const allPrograms = new Set<string>();
  savedResults.forEach(saved => {
    [...saved.results.qualified, ...saved.results.likely, ...saved.results.maybe, ...saved.results.notQualified]
      .forEach(p => allPrograms.add(p.programName));
  });

  const getProgramStatus = (results: EligibilityResults, programName: string) => {
    const allPrograms = [
      ...results.qualified,
      ...results.likely,
      ...results.maybe,
      ...results.notQualified,
    ];

    const program = allPrograms.find(p => p.programName === programName);
    return program?.status || 'not-evaluated';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: string; text: string }> = {
      'qualified': { color: 'bg-green-100 text-green-800', icon: '✓', text: 'Qualified' },
      'likely': { color: 'bg-blue-100 text-blue-800', icon: '◐', text: 'Likely' },
      'maybe': { color: 'bg-yellow-100 text-yellow-800', icon: '?', text: 'Maybe' },
      'unlikely': { color: 'bg-orange-100 text-orange-800', icon: '◔', text: 'Unlikely' },
      'not-qualified': { color: 'bg-gray-100 text-gray-800', icon: '✗', text: 'Not Qualified' },
      'not-evaluated': { color: 'bg-gray-50 text-gray-500', icon: '-', text: 'N/A' },
    };

    const badge = badges[status] || badges['not-evaluated'];

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
        <span className="mr-1">{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compare Results</h2>
          <p className="text-sm text-gray-600">
            Comparing {savedResults.length} saved results
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50">
                Program
              </th>
              {savedResults.map((result) => (
                <th key={result.id} className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="mb-1">{result.evaluatedAt.toLocaleDateString()}</div>
                  <div className="text-xs font-normal text-gray-500 normal-case">
                    {result.state && <span className="block">{result.state}</span>}
                    <span className="block text-gray-400">{result.evaluatedAt.toLocaleTimeString()}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from(allPrograms).map((programName) => (
              <tr key={programName} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                  {programName}
                </td>
                {savedResults.map((result) => {
                  const status = getProgramStatus(result.results, programName);
                  return (
                    <td key={result.id} className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(status)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {savedResults.map((result, idx) => (
            <div key={result.id} className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">
                Result {idx + 1}
              </div>
              <div className="text-lg font-bold text-green-600">
                {result.results.qualified.length}
              </div>
              <div className="text-xs text-gray-500">
                of {result.results.totalPrograms} qualified
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis */}
      <div className="p-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Changes Over Time</h3>
        <div className="space-y-2 text-sm text-gray-700">
          {savedResults.length > 1 && (
            <>
              <div className="flex items-center gap-2">
                <span className="font-medium">Qualified programs change:</span>
                <span>
                  {savedResults[0].results.qualified.length} → {savedResults[savedResults.length - 1].results.qualified.length}
                  {savedResults[savedResults.length - 1].results.qualified.length > savedResults[0].results.qualified.length ? (
                    <span className="text-green-600 ml-2">📈 +{savedResults[savedResults.length - 1].results.qualified.length - savedResults[0].results.qualified.length}</span>
                  ) : savedResults[savedResults.length - 1].results.qualified.length < savedResults[0].results.qualified.length ? (
                    <span className="text-red-600 ml-2">📉 {savedResults[savedResults.length - 1].results.qualified.length - savedResults[0].results.qualified.length}</span>
                  ) : (
                    <span className="text-gray-600 ml-2">→ No change</span>
                  )}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Changes may be due to updated income, household size, or program rule updates.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsComparison;

