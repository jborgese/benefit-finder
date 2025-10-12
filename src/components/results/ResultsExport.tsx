/**
 * Results Export Component
 *
 * UI for exporting results as PDF or encrypted file
 */

import React, { useState } from 'react';
import type { EligibilityResults } from './types';
import * as Dialog from '@radix-ui/react-dialog';
import { exportToPDF, exportEncrypted, downloadBlob, generateExportFilename } from './exportUtils';

interface ResultsExportProps {
  results: EligibilityResults;
  profileSnapshot?: Record<string, unknown>;
  userInfo?: {
    name?: string;
    state?: string;
  };
}

export const ResultsExport: React.FC<ResultsExportProps> = ({
  results,
  profileSnapshot,
  userInfo,
}) => {
  const [showEncryptDialog, setShowEncryptDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handlePDFExport = async (): Promise<void> => {
    try {
      setIsExporting(true);
      await exportToPDF(results, {
        userInfo: {
          name: userInfo?.name,
          evaluationDate: results.evaluatedAt,
        },
      });
      setIsExporting(false);
    } catch (err) {
      console.error('PDF export failed:', err);
      setExportError('Failed to export PDF');
      setIsExporting(false);
    }
  };

  const handleEncryptedExport = async (): Promise<void> => {
    setExportError(null);

    // Validate password
    if (!password || password.length < 8) {
      setExportError('Password must be at least 8 characters');
      return;
    }

    // Note: Timing attack not a concern here as comparison happens locally in browser
    // eslint-disable-next-line security/detect-possible-timing-attacks
    if (password !== confirmPassword) {
      setExportError('Passwords do not match');
      return;
    }

    try {
      setIsExporting(true);

      // Export encrypted
      const blob = await exportEncrypted(results, password, {
        profileSnapshot,
        metadata: {
          userName: userInfo?.name,
          state: userInfo?.state,
        },
      });

      // Download
      const filename = `${generateExportFilename('benefit-results')}.bfx`;
      downloadBlob(blob, filename);

      setIsExporting(false);
      setShowEncryptDialog(false);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Encrypted export failed:', err);
      setExportError('Failed to export encrypted file');
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-3 flex-wrap">
      {/* PDF Export Button */}
      <button
        onClick={() => {
          void handlePDFExport();
        }}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        <span>{isExporting ? 'Exporting...' : 'Export to PDF'}</span>
      </button>

      {/* Encrypted Export Button */}
      <button
        onClick={() => setShowEncryptDialog(true)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Export Encrypted File</span>
      </button>

      {/* Encrypted Export Dialog */}
      <Dialog.Root open={showEncryptDialog} onOpenChange={setShowEncryptDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full z-50 p-6">
            <Dialog.Title className="text-xl font-bold mb-4">
              Export Encrypted Results
            </Dialog.Title>

            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 text-xl">🔒</span>
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Privacy & Security</p>
                    <p>
                      Your results will be encrypted with AES-256 encryption.
                      You&apos;ll need the password to open this file later.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password (minimum 8 characters)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a strong password"
                    minLength={8}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Re-enter password"
                    minLength={8}
                  />
                </div>

                {exportError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{exportError}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <button
                  disabled={isExporting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={() => {
                  void handleEncryptedExport();
                }}
                disabled={isExporting || !password || password.length < 8}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isExporting ? 'Exporting...' : 'Export File'}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 <strong>Tip:</strong> Save your password securely! You cannot recover the file without it.
              </p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default ResultsExport;

