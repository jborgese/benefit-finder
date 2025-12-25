/**
 * Results Export Component
 *
 * UI for exporting results as PDF or encrypted file
 */

import React, { useState, useRef, useEffect } from 'react';
import type { EligibilityResults } from './types';
import * as Dialog from '@radix-ui/react-dialog';
// Lazy wrappers are exported from the results index to avoid bundling heavy export logic
import { exportToPDF, exportEncrypted, downloadBlob, generateExportFilename } from './index';
import { useI18n } from '../../i18n/hooks';

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
  const { t } = useI18n();
  const [showEncryptDialog, setShowEncryptDialog] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // Validate passwords in real-time
  useEffect(() => {
    const isValid = password.length >= 8 && password === confirmPassword;
    setIsPasswordValid(isValid);
  }, [password, confirmPassword]);

  // Clear password state when dialog closes
  useEffect(() => {
    if (!showEncryptDialog) {
      setPassword('');
      setConfirmPassword('');
      setExportError(null);
    }
  }, [showEncryptDialog]);

  const handlePasswordChange = (value: string): void => {
    setPassword(value);
    if (passwordRef.current) {
      passwordRef.current.value = value;
    }
  };

  const handleConfirmPasswordChange = (value: string): void => {
    setConfirmPassword(value);
    if (confirmPasswordRef.current) {
      confirmPasswordRef.current.value = value;
    }
  };

  const handlePDFExport = (): void => {
    try {
      setIsExporting(true);
      void exportToPDF(results, {
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

    // Additional validation (shouldn't be needed since button is disabled, but good for safety)
    if (!isPasswordValid) {
      setExportError('Password must be at least 8 characters and passwords must match');
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
      const filename = `${(await generateExportFilename('benefit-results'))}.bfx`;
      await downloadBlob(blob, filename);

      setIsExporting(false);
      setShowEncryptDialog(false);

      // Clear password fields (handled by useEffect when dialog closes)
    } catch (err) {
      console.error('Encrypted export failed:', err);
      setExportError('Failed to export encrypted file');
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* PDF Export Button */}
      <button
        onClick={handlePDFExport}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-full sm:w-auto min-h-[44px] touch-manipulation"
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        <span className="whitespace-nowrap">{isExporting ? t('results.export.exporting') : t('results.export.exportToPdf')}</span>
      </button>

      {/* Encrypted Export Button */}
      <button
        onClick={() => setShowEncryptDialog(true)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-full sm:w-auto min-h-[44px] touch-manipulation"
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span className="whitespace-nowrap">{t('results.export.exportEncrypted')}</span>
      </button>

      {/* Encrypted Export Dialog */}
      <Dialog.Root open={showEncryptDialog} onOpenChange={setShowEncryptDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto z-50 p-6 mx-4">
            <Dialog.Title className="text-xl font-bold mb-4">
              {t('results.export.exportEncryptedResults')}
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
                    ref={passwordRef}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
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
                    ref={confirmPasswordRef}
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
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

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <Dialog.Close asChild>
                <button
                  disabled={isExporting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 min-h-[44px] touch-manipulation"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={() => {
                  void handleEncryptedExport();
                }}
                disabled={isExporting || !isPasswordValid}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
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
    </>
  );
};

export default ResultsExport;

