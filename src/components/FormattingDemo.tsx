import React from 'react';
import { useI18n } from '../i18n/hooks';

/**
 * Demo component showing locale-specific formatting
 */
export const FormattingDemo: React.FC = () => {
  const { t, formatCurrency, formatDate, formatNumber, currentLanguage } = useI18n();

  // Sample data for demonstration
  const sampleIncome = 2500;
  const sampleDate = new Date('2024-12-25T15:30:00');
  const sampleNumber = 1234567.89;
  const samplePercent = 0.15;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">{t('formatting.examples.currency')}</h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Currency:</span>
          <span className="font-mono">{formatCurrency(sampleIncome)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Number:</span>
          <span className="font-mono">{formatNumber(sampleNumber)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Date:</span>
          <span className="font-mono">{formatDate(sampleDate)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Date & Time:</span>
          <span className="font-mono">{formatDate(sampleDate, {
            dateStyle: 'short',
            timeStyle: 'short'
          })}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Percentage:</span>
          <span className="font-mono">{formatNumber(samplePercent, {
            style: 'percent'
          })}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Current Language:</span>
          <span className="font-mono">{currentLanguage}</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
        <p className="text-blue-800">
          <strong>Note:</strong> All formatting automatically adapts to the selected language locale.
        </p>
      </div>
    </div>
  );
};

export default FormattingDemo;
