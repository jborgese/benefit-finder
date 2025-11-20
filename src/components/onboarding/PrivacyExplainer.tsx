/**
 * Privacy Explainer Component
 *
 * Interactive component that explains the app's privacy features
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '../Button';
import { useI18n } from '../../i18n/hooks';
import { useDatabase } from '../../db/hooks';
import { isDatabaseInitialized } from '../../db/database';
import type {
  UserProfileDocument,
  EligibilityResultDocument,
  AppSettingDocument
} from '../../db/schemas';

interface PrivacyExplainerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyExplainer: React.FC<PrivacyExplainerProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'security' | 'your-rights'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Always call the hook, but handle the case where database is not initialized
  const database = useDatabase();
  const isDbInitialized = isDatabaseInitialized();

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const tabIds: readonly ('overview' | 'data' | 'security' | 'your-rights')[] = ['overview', 'data', 'security', 'your-rights'];
      const currentIndex = tabIds.indexOf(activeTab);
      const nextIndex = event.key === 'ArrowLeft'
        ? (currentIndex - 1 + tabIds.length) % tabIds.length
        : (currentIndex + 1) % tabIds.length;
       
      setActiveTab(tabIds[nextIndex]);
    }
  }, [activeTab, onClose]);

  // Handle data export
  const handleExportData = useCallback(async () => {
    if (!isDbInitialized || !database) {
      console.warn('Database not available for export');
      return;
    }

    setIsLoading(true);
    try {
      // Export all user data
      const userData = await database.user_profiles.find().exec();
      const resultsData = await database.eligibility_results.find().exec();
      const settingsData = await database.app_settings.find().exec();

      const exportData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        userProfiles: userData.map((doc: UserProfileDocument) => doc.toJSON()),
        eligibilityResults: resultsData.map((doc: EligibilityResultDocument) => doc.toJSON()),
        appSettings: settingsData.map((doc: AppSettingDocument) => doc.toJSON()),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `benefit-finder-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [database, isDbInitialized]);

  // Handle data deletion
  const handleDeleteData = useCallback(async () => {
    if (!isDbInitialized || !database) {
      console.warn('Database not available for deletion');
      return;
    }

    setIsLoading(true);
    try {
      // Delete all user data
      await database.user_profiles.find().remove();
      await database.eligibility_results.find().remove();
      await database.app_settings.find().remove();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [database, isDbInitialized]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
       
      const modal = document.querySelector('[role="dialog"]') as HTMLElement | null;
      if (modal) {
        modal.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) {return null;}

  const tabs = [
    { id: 'overview', label: t('privacyExplainer.tabs.overview'), icon: '🔍' },
    { id: 'data', label: t('privacyExplainer.tabs.data'), icon: '📊' },
    { id: 'security', label: t('privacyExplainer.tabs.security'), icon: '🔒' },
    { id: 'your-rights', label: t('privacyExplainer.tabs.rights'), icon: '⚖️' },
  ];

  const renderContent = (): React.ReactNode => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-4">
                {t('privacyExplainer.overview.title')}
              </h3>
              <p className="text-secondary-600 dark:text-secondary-300 text-lg leading-relaxed">
                {t('privacyExplainer.overview.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-success-600 dark:text-success-400 text-xl mr-2">✅</span>
                  <h4 className="font-semibold text-success-900 dark:text-success-100">
                    {t('privacyExplainer.overview.localProcessing')}
                  </h4>
                </div>
                <p className="text-success-700 dark:text-success-200 text-sm">
                  {t('privacyExplainer.overview.localProcessingDesc')}
                </p>
              </div>

              <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-success-600 dark:text-success-400 text-xl mr-2">✅</span>
                  <h4 className="font-semibold text-success-900 dark:text-success-100">
                    {t('privacyExplainer.overview.noTracking')}
                  </h4>
                </div>
                <p className="text-success-700 dark:text-success-200 text-sm">
                  {t('privacyExplainer.overview.noTrackingDesc')}
                </p>
              </div>

              <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-success-600 dark:text-success-400 text-xl mr-2">✅</span>
                  <h4 className="font-semibold text-success-900 dark:text-success-100">
                    {t('privacyExplainer.overview.encryptedStorage')}
                  </h4>
                </div>
                <p className="text-success-700 dark:text-success-200 text-sm">
                  {t('privacyExplainer.overview.encryptedStorageDesc')}
                </p>
              </div>

              <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-success-600 dark:text-success-400 text-xl mr-2">✅</span>
                  <h4 className="font-semibold text-success-900 dark:text-success-100">
                    {t('privacyExplainer.overview.offlineFirst')}
                  </h4>
                </div>
                <p className="text-success-700 dark:text-success-200 text-sm">
                  {t('privacyExplainer.overview.offlineFirstDesc')}
                </p>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-info-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-4">
                {t('privacyExplainer.data.title')}
              </h3>
              <p className="text-secondary-600 dark:text-secondary-300 text-lg leading-relaxed">
                {t('privacyExplainer.data.description')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                  <span className="text-blue-600 dark:text-blue-400 text-xl mr-2">📝</span>
                  {t('privacyExplainer.data.whatWeCollect')}
                </h4>
                <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2 mt-0.5">•</span>
                    {t('privacyExplainer.data.householdInfo')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2 mt-0.5">•</span>
                    {t('privacyExplainer.data.eligibilityResults')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2 mt-0.5">•</span>
                    {t('privacyExplainer.data.appPreferences')}
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
                  <span className="text-green-600 dark:text-green-400 text-xl mr-2">❌</span>
                  {t('privacyExplainer.data.whatWeDontCollect')}
                </h4>
                <ul className="space-y-2 text-green-800 dark:text-green-200">
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2 mt-0.5">•</span>
                    {t('privacyExplainer.data.personalIdentifiers')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2 mt-0.5">•</span>
                    {t('privacyExplainer.data.browsingHistory')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2 mt-0.5">•</span>
                    {t('privacyExplainer.data.analytics')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-4">
                {t('privacyExplainer.security.title')}
              </h3>
              <p className="text-secondary-600 dark:text-secondary-300 text-lg leading-relaxed">
                {t('privacyExplainer.security.description')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-6">
                <h4 className="font-semibold text-warning-900 dark:text-warning-100 mb-3 flex items-center">
                  <span className="text-warning-600 dark:text-warning-400 text-xl mr-2">🔐</span>
                  {t('privacyExplainer.security.encryption')}
                </h4>
                <p className="text-warning-800 dark:text-warning-200 mb-3">
                  {t('privacyExplainer.security.encryptionDesc')}
                </p>
                <div className="bg-warning-100 dark:bg-warning-800/30 rounded-lg p-3">
                  <code className="text-warning-900 dark:text-warning-100 text-sm font-mono">
                    AES-256-GCM Encryption
                  </code>
                </div>
              </div>

              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
                <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-3 flex items-center">
                  <span className="text-primary-600 dark:text-primary-400 text-xl mr-2">🏠</span>
                  {t('privacyExplainer.security.localStorage')}
                </h4>
                <p className="text-primary-800 dark:text-primary-200 mb-3">
                  {t('privacyExplainer.security.localStorageDesc')}
                </p>
                <div className="bg-primary-100 dark:bg-primary-800/30 rounded-lg p-3">
                  <code className="text-primary-900 dark:text-primary-100 text-sm font-mono">
                    IndexedDB + RxDB
                  </code>
                </div>
              </div>

              <div className="bg-secondary-50 dark:bg-secondary-700 border border-secondary-200 dark:border-secondary-600 rounded-lg p-6">
                <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-3 flex items-center">
                  <span className="text-secondary-600 dark:text-secondary-400 text-xl mr-2">🌐</span>
                  {t('privacyExplainer.security.noServers')}
                </h4>
                <p className="text-secondary-800 dark:text-secondary-200">
                  {t('privacyExplainer.security.noServersDesc')}
                </p>
              </div>
            </div>
          </div>
        );

      case 'your-rights':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚖️</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-4">
                {t('privacyExplainer.rights.title')}
              </h3>
              <p className="text-secondary-600 dark:text-secondary-300 text-lg leading-relaxed">
                {t('privacyExplainer.rights.description')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-6">
                <h4 className="font-semibold text-success-900 dark:text-success-100 mb-3 flex items-center">
                  <span className="text-success-600 dark:text-success-400 text-xl mr-2">🗑️</span>
                  {t('privacyExplainer.rights.deleteData')}
                </h4>
                <p className="text-success-800 dark:text-success-200 mb-3">
                  {t('privacyExplainer.rights.deleteDataDesc')}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading || !isDbInitialized}
                  className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  {isLoading ? 'Deleting...' : t('privacyExplainer.rights.deleteButton')}
                </Button>
              </div>

              <div className="bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 rounded-lg p-6">
                <h4 className="font-semibold text-info-900 dark:text-info-100 mb-3 flex items-center">
                  <span className="text-info-600 dark:text-info-400 text-xl mr-2">📤</span>
                  {t('privacyExplainer.rights.exportData')}
                </h4>
                <p className="text-info-800 dark:text-info-200 mb-3">
                  {t('privacyExplainer.rights.exportDataDesc')}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    void handleExportData();
                  }}
                  disabled={isLoading || !isDbInitialized}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  {isLoading ? 'Exporting...' : t('privacyExplainer.rights.exportButton')}
                </Button>
              </div>

              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
                <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-3 flex items-center">
                  <span className="text-primary-600 dark:text-primary-400 text-xl mr-2">👁️</span>
                  {t('privacyExplainer.rights.viewData')}
                </h4>
                <p className="text-primary-800 dark:text-primary-200">
                  {t('privacyExplainer.rights.viewDataDesc')}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div
          className="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl border border-secondary-200 dark:border-secondary-600 max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
          role="dialog"
          aria-labelledby="privacy-modal-title"
          aria-describedby="privacy-modal-description"
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="border-b border-secondary-200 dark:border-secondary-600 p-6">
            <div className="flex items-center justify-between">
              <h2
                id="privacy-modal-title"
                className="text-2xl font-display font-bold text-secondary-900 dark:text-secondary-100"
              >
                {t('privacyExplainer.title')}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200"
                aria-label="Close privacy modal"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-secondary-200 dark:border-secondary-600">
            <div className="flex overflow-x-auto" role="tablist" aria-label="Privacy information tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'data' | 'security' | 'your-rights')}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`tabpanel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap
                  transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset
                  ${activeTab === tab.id
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                    }
                `}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div
            className="p-6 overflow-y-auto max-h-[60vh]"
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
          >
            {renderContent()}
          </div>

          {/* Footer */}
          <div className="border-t border-secondary-200 dark:border-secondary-600 p-6">
            <div className="flex justify-end">
              <Button onClick={onClose} variant="primary">
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div
            className="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl border border-secondary-200 dark:border-secondary-600 max-w-md w-full p-6"
            role="dialog"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-description"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 id="delete-confirm-title" className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
                Confirm Data Deletion
              </h3>
              <p id="delete-confirm-description" className="text-secondary-600 dark:text-secondary-300">
                This will permanently delete all your stored data including questionnaire responses and eligibility results. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  void handleDeleteData();
                }}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white border-red-600 hover:border-red-700 dark:border-red-500 dark:hover:border-red-600"
              >
                {isLoading ? 'Deleting...' : 'Delete All Data'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrivacyExplainer;

