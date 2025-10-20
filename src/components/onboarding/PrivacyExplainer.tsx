/**
 * Privacy Explainer Component
 *
 * Interactive component that explains the app's privacy features
 */

import React, { useState } from 'react';
import { Button } from '../Button';
import { useI18n } from '../../i18n/hooks';

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

  if (!isOpen) return null;

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
              <h3 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                {t('privacyExplainer.overview.title')}
              </h3>
              <p className="text-secondary-600 text-lg leading-relaxed">
                {t('privacyExplainer.overview.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-success-600 text-xl mr-2">✅</span>
                  <h4 className="font-semibold text-success-900">
                    {t('privacyExplainer.overview.localProcessing')}
                  </h4>
                </div>
                <p className="text-success-700 text-sm">
                  {t('privacyExplainer.overview.localProcessingDesc')}
                </p>
              </div>

              <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-success-600 text-xl mr-2">✅</span>
                  <h4 className="font-semibold text-success-900">
                    {t('privacyExplainer.overview.noTracking')}
                  </h4>
                </div>
                <p className="text-success-700 text-sm">
                  {t('privacyExplainer.overview.noTrackingDesc')}
                </p>
              </div>

              <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-success-600 text-xl mr-2">✅</span>
                  <h4 className="font-semibold text-success-900">
                    {t('privacyExplainer.overview.encryptedStorage')}
                  </h4>
                </div>
                <p className="text-success-700 text-sm">
                  {t('privacyExplainer.overview.encryptedStorageDesc')}
                </p>
              </div>

              <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-success-600 text-xl mr-2">✅</span>
                  <h4 className="font-semibold text-success-900">
                    {t('privacyExplainer.overview.offlineFirst')}
                  </h4>
                </div>
                <p className="text-success-700 text-sm">
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
              <h3 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                {t('privacyExplainer.data.title')}
              </h3>
              <p className="text-secondary-600 text-lg leading-relaxed">
                {t('privacyExplainer.data.description')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <span className="text-blue-600 text-xl mr-2">📝</span>
                  {t('privacyExplainer.data.whatWeCollect')}
                </h4>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-0.5">•</span>
                    {t('privacyExplainer.data.householdInfo')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-0.5">•</span>
                    {t('privacyExplainer.data.eligibilityResults')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-0.5">•</span>
                    {t('privacyExplainer.data.appPreferences')}
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                  <span className="text-green-600 text-xl mr-2">❌</span>
                  {t('privacyExplainer.data.whatWeDontCollect')}
                </h4>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start">
                    <span className="text-green- augment-600 mr-2 mt-0.5">•</span>
                    {t('privacyExplainer.data.personalIdentifiers')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-0.5">•</span>
                    {t('privacyExplainer.data.browsingHistory')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-0.5">•</span>
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
              <h3 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                {t('privacyExplainer.security.title')}
              </h3>
              <p className="text-secondary-600 text-lg leading-relaxed">
                {t('privacyExplainer.security.description')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-6">
                <h4 className="font-semibold text-warning-900 mb-3 flex items-center">
                  <span className="text-warning-600 text-xl mr-2">🔐</span>
                  {t('privacyExplainer.security.encryption')}
                </h4>
                <p className="text-warning-800 mb-3">
                  {t('privacyExplainer.security.encryptionDesc')}
                </p>
                <div className="bg-warning-100 rounded-lg p-3">
                  <code className="text-warning-900 text-sm font-mono">
                    AES-256-GCM Encryption
                  </code>
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <h4 className="font-semibold text-primary-900 mb-3 flex items-center">
                  <span className="text-primary-600 text-xl mr-2">🏠</span>
                  {t('privacyExplainer.security.localStorage')}
                </h4>
                <p className="text-primary-800 mb-3">
                  {t('privacyExplainer.security.localStorageDesc')}
                </p>
                <div className="bg-primary-100 rounded-lg p-3">
                  <code className="text-primary-900 text-sm font-mono">
                    IndexedDB + RxDB
                  </code>
                </div>
              </div>

              <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-6">
                <h4 className="font-semibold text-secondary-900 mb-3 flex items-center">
                  <span className="text-secondary-600 text-xl mr-2">🌐</span>
                  {t('privacyExplainer.security.noServers')}
                </h4>
                <p className="text-secondary-800">
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
              <h3 className="text-2xl font-display font-bold text-secondary-900 mb-4">
                {t('privacyExplainer.rights.title')}
              </h3>
              <p className="text-secondary-600 text-lg leading-relaxed">
                {t('privacyExplainer.rights.description')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-success-50 border border-success-200 rounded-lg p-6">
                <h4 className="font-semibold text-success-900 mb-3 flex items-center">
                  <span className="text-success-600 text-xl mr-2">🗑️</span>
                  {t('privacyExplainer.rights.deleteData')}
                </h4>
                <p className="text-success-800 mb-3">
                  {t('privacyExplainer.rights.deleteDataDesc')}
                </p>
                <Button variant="secondary" size="sm">
                  {t('privacyExplainer.rights.deleteButton')}
                </Button>
              </div>

              <div className="bg-info-50 border border-info-200 rounded-lg p-6">
                <h4 className="font-semibold text-info-900 mb-3 flex items-center">
                  <span className="text-info-600 text-xl mr-2">📤</span>
                  {t('privacyExplainer.rights.exportData')}
                </h4>
                <p className="text-info-800 mb-3">
                  {t('privacyExplainer.rights.exportDataDesc')}
                </p>
                <Button variant="secondary" size="sm">
                  {t('privacyExplainer.rights.exportButton')}
                </Button>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <h4 className="font-semibold text-primary-900 mb-3 flex items-center">
                  <span className="text-primary-600 text-xl mr-2">👁️</span>
                  {t('privacyExplainer.rights.viewData')}
                </h4>
                <p className="text-primary-800">
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-secondary-200 max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="border-b border-secondary-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-secondary-900">
              {t('privacyExplainer.title')}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-secondary-500 hover:text-secondary-700"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-secondary-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap
                  transition-colors duration-200
                  ${activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-secondary-200 p-6">
          <div className="flex justify-end">
            <Button onClick={onClose} variant="primary">
              {t('common.close')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyExplainer;

