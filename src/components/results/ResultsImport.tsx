/**
 * Results Import Component
 *
 * UI for importing encrypted results files
 */

import React, { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { importEncrypted } from './exportUtils';
import type { EligibilityResults } from './types';

interface ResultsImportProps {
  onImport: (results: EligibilityResults, metadata?: Record<string, unknown>) => void;
  trigger?: React.ReactNode;
}

export const ResultsImport: React.FC<ResultsImportProps> = ({
  onImport,
  trigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportError(null);
    }
  };

  const handleImport = async (): Promise<void> => {
    const password = passwordRef.current?.value ?? '';

    if (!selectedFile || !password) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const imported = await importEncrypted(selectedFile, password);

      onImport(imported.results, imported.metadata);

      // Reset and close
      setIsOpen(false);
      setSelectedFile(null);
      if (passwordRef.current) passwordRef.current.value = '';
      setIsImporting(false);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import file');
      setIsImporting(false);
    }
  };

  const handleReset = (): void => {
    setSelectedFile(null);
    if (passwordRef.current) passwordRef.current.value = '';
    setImportError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        {trigger ?? (
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto min-h-[44px] touch-manipulation">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="whitespace-nowrap">Import Results</span>
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto z-50 p-6 mx-4">
          <Dialog.Title className="text-xl font-bold mb-4">
            Import Encrypted Results
          </Dialog.Title>

          <div className="mb-6">
            {/* Info Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-purple-600 text-xl">📥</span>
                <div className="text-sm text-purple-900">
                  <p className="font-semibold mb-1">Import Saved Results</p>
                  <p>
                    Load previously exported results file (.bfx).
                    You&apos;ll need the password used when exporting.
                  </p>
                </div>
              </div>
            </div>

            {/* File Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File (.bfx)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".bfx"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      cursor-pointer"
                  />
                  {selectedFile && (
                    <button
                      onClick={handleReset}
                      className="text-gray-400 hover:text-gray-600"
                      title="Clear selection"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {selectedFile && (
                  <p className="text-xs text-gray-600 mt-2">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  ref={passwordRef}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter file password"
                  disabled={!selectedFile}
                />
              </div>

              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{importError}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Dialog.Close asChild>
              <button
                disabled={isImporting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 min-h-[44px] touch-manipulation"
                onClick={handleReset}
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={() => void handleImport()}
              disabled={isImporting || !selectedFile}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
            >
              {isImporting ? 'Importing...' : 'Import'}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              🔒 <strong>Security:</strong> Files are decrypted locally on your device.
              The password never leaves your browser.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ResultsImport;

