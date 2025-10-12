/**
 * Results History Component
 *
 * Displays saved eligibility results with filtering and management
 */

import React, { useState } from 'react';
import { useResultsManagement } from './useResultsManagement';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { ResultsSummary } from './ResultsSummary';
import { ProgramCard } from './ProgramCard';
import type { EligibilityResults, ProgramEligibilityResult } from './types';

interface ResultsHistoryProps {
  onCompareResults?: (ids: string[]) => void;
}

export const ResultsHistory: React.FC<ResultsHistoryProps> = ({
  onCompareResults,
}) => {
  const {
    savedResults,
    isLoading,
    error,
    loadResult,
    deleteResult,
    updateResult,
  } = useResultsManagement();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());
  const [loadedResults, setLoadedResults] = useState<EligibilityResults | null>(null);

  const handleView = async (id: string): Promise<void> => {
    setSelectedId(id);
    const results = await loadResult(id);
    setLoadedResults(results);
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteResult(id);
      setDeleteConfirmId(null);
      if (selectedId === id) {
        setSelectedId(null);
        setLoadedResults(null);
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleEdit = (id: string, currentNotes?: string, currentTags?: string[]): void => {
    setEditingId(id);
    setEditNotes(currentNotes ?? '');
    setEditTags(currentTags?.join(', ') ?? '');
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!editingId) return;

    try {
      await updateResult(editingId, {
        notes: editNotes,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  const handleToggleCompare = (id: string): void => {
    const newSet = new Set(selectedForCompare);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedForCompare(newSet);
  };

  const handleCompare = (): void => {
    if (onCompareResults && selectedForCompare.size >= 2) {
      onCompareResults(Array.from(selectedForCompare));
    }
  };

  if (isLoading && savedResults.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-900 mb-2">Error Loading History</h3>
        <p className="text-sm text-red-700">{error.message}</p>
      </div>
    );
  }

  if (savedResults.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Saved Results</h3>
        <p className="text-gray-600">
          Complete an eligibility screening and save your results to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Results History</h2>
          <p className="text-sm text-gray-600">
            {savedResults.length} saved {savedResults.length === 1 ? 'result' : 'results'}
          </p>
        </div>

        {selectedForCompare.size >= 2 && onCompareResults && (
          <button
            onClick={handleCompare}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Compare Selected ({selectedForCompare.size})
          </button>
        )}
      </div>

      {/* Results List */}
      <div className="grid gap-4">
        {savedResults.map((result) => (
          <div
            key={result.id}
            className={`
              bg-white rounded-lg shadow-md border-2 p-6 transition-all
              ${selectedForCompare.has(result.id) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
            `}
          >
            <div className="flex items-start justify-between mb-4">
              {/* Result Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {result.evaluatedAt.toLocaleDateString()}
                  </h3>
                  {result.state && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {result.state}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {result.evaluatedAt.toLocaleTimeString()}
                </p>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-semibold">
                      ✓ {result.qualifiedCount}
                    </span>
                    <span className="text-gray-600">qualified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                      of {result.totalPrograms} programs
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {result.tags && result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {result.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {result.notes && (
                  <p className="text-sm text-gray-700 mt-3 italic border-l-2 border-gray-300 pl-3">
                    &ldquo;{result.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    void handleView(result.id);
                  }}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  View
                </button>

                <button
                  onClick={() => handleEdit(result.id, result.notes, result.tags)}
                  className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Edit
                </button>

                {onCompareResults && (
                  <button
                    onClick={() => handleToggleCompare(result.id)}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                      selectedForCompare.has(result.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-500'
                    }`}
                  >
                    {selectedForCompare.has(result.id) ? 'Selected' : 'Compare'}
                  </button>
                )}

                <button
                  onClick={() => setDeleteConfirmId(result.id)}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Dialog */}
      <Dialog.Root open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto z-50 p-6">
            <div className="flex items-start justify-between mb-4">
              <Dialog.Title className="text-2xl font-bold">
                Saved Results
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Dialog.Close>
            </div>

            {loadedResults && (
              <div className="space-y-6">
                <ResultsSummary results={loadedResults} />
                <div className="space-y-4">
                  {loadedResults.qualified.map((program: ProgramEligibilityResult) => (
                    <ProgramCard key={program.programId} result={program} />
                  ))}
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit Dialog */}
      <Dialog.Root open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full z-50 p-6">
            <Dialog.Title className="text-xl font-bold mb-4">Edit Result</Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Add notes about this result..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="family, 2024, recheck"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Dialog.Close asChild>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  onClick={() => {
                    void handleSaveEdit();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation */}
      <AlertDialog.Root open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full z-50 p-6">
            <AlertDialog.Title className="text-xl font-bold mb-2">
              Delete Result?
            </AlertDialog.Title>
            <AlertDialog.Description className="text-gray-600 mb-6">
              Are you sure you want to delete this saved result? This action cannot be undone.
            </AlertDialog.Description>

            <div className="flex gap-3 justify-end">
              <AlertDialog.Cancel asChild>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={() => {
                    if (deleteConfirmId) {
                      void handleDelete(deleteConfirmId);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
};

export default ResultsHistory;

