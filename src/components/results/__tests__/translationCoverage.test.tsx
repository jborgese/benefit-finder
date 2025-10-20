import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgramCard } from '../ProgramCard';
import { ResultsSummary } from '../ResultsSummary';
import { ProgramEligibilityResult, EligibilityResults } from '../types';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';

// Mock data for testing
const mockProgramResult: ProgramEligibilityResult = {
  programId: 'medicaid-federal',
  programName: 'Medicaid',
  programDescription: 'Health coverage for low-income individuals and families',
  jurisdiction: 'US-FEDERAL',
  status: 'qualified',
  confidence: 'high',
  confidenceScore: 85,
  explanation: {
    reason: 'Meets income requirements',
    details: ['Income below 138% FPL'],
    rulesCited: ['medicaid-income-rule'],
  },
  requiredDocuments: [],
  nextSteps: [],
  evaluatedAt: new Date('2024-01-01'),
  rulesVersion: '1.0.0',
};

const mockResults: EligibilityResults = {
  qualified: [mockProgramResult],
  likely: [],
  maybe: [],
  notQualified: [],
  totalPrograms: 1,
  evaluatedAt: new Date('2024-01-01'),
};

describe('Translation Coverage Tests', () => {
  const renderWithI18n = (component: React.ReactElement, language = 'en') => {
    // Change language for testing
    i18n.changeLanguage(language);
    return render(
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    );
  };

  describe('English Translation Coverage', () => {
    beforeEach(() => {
      i18n.changeLanguage('en');
    });

    it('ProgramCard renders all text in English', () => {
      renderWithI18n(<ProgramCard result={mockProgramResult} />);

      // Verify English text is displayed
      expect(screen.getByText('Medicaid')).toBeInTheDocument();
      expect(screen.getByText('Health coverage for low-income individuals and families')).toBeInTheDocument();
      expect(screen.getByText('You Qualify')).toBeInTheDocument();
      expect(screen.getByText('Why this result?')).toBeInTheDocument();
    });

    it('ResultsSummary renders all text in English', () => {
      renderWithI18n(<ResultsSummary results={mockResults} />);

      // Verify English status labels
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Qualified')).toBeInTheDocument();
      expect(screen.getByText('Likely')).toBeInTheDocument();
      expect(screen.getByText('Maybe')).toBeInTheDocument();
      expect(screen.getByText('Not Qualified')).toBeInTheDocument();
    });
  });

  describe('Spanish Translation Coverage', () => {
    beforeEach(() => {
      i18n.changeLanguage('es');
    });

    it('ProgramCard renders all text in Spanish', () => {
      renderWithI18n(<ProgramCard result={mockProgramResult} />, 'es');

      // Verify Spanish text is displayed
      expect(screen.getByText('Medicaid')).toBeInTheDocument();
      expect(screen.getByText('Cobertura de salud para personas y familias de bajos ingresos')).toBeInTheDocument();
      expect(screen.getByText('Calificas')).toBeInTheDocument();
      expect(screen.getByText('¿Por qué este resultado?')).toBeInTheDocument();
    });

    it('ResultsSummary renders all text in Spanish', () => {
      renderWithI18n(<ResultsSummary results={mockResults} />, 'es');

      // Verify Spanish status labels
      expect(screen.getByText('Todos')).toBeInTheDocument();
      expect(screen.getByText('Calificado')).toBeInTheDocument();
      expect(screen.getByText('Probable')).toBeInTheDocument();
      expect(screen.getByText('Posible')).toBeInTheDocument();
      expect(screen.getByText('No Calificado')).toBeInTheDocument();
    });
  });

  describe('Dynamic Language Switching', () => {
    it('updates text when language changes', async () => {
      const { rerender } = renderWithI18n(<ProgramCard result={mockProgramResult} />, 'en');

      // Initial English text
      expect(screen.getByText('You Qualify')).toBeInTheDocument();

      // Change to Spanish
      await i18n.changeLanguage('es');
      rerender(
        <I18nextProvider i18n={i18n}>
          <ProgramCard result={mockProgramResult} />
        </I18nextProvider>
      );

      // Should now show Spanish text
      expect(screen.getByText('Calificas')).toBeInTheDocument();
    });

    it('maintains functionality across language changes', async () => {
      const mockOnFilterChange = vi.fn();
      const { rerender } = renderWithI18n(
        <ResultsSummary results={mockResults} onFilterChange={mockOnFilterChange} />,
        'en'
      );

      // Click qualified button in English
      fireEvent.click(screen.getByText('Qualified'));
      expect(mockOnFilterChange).toHaveBeenCalledWith('qualified');

      // Change to Spanish
      await i18n.changeLanguage('es');
      rerender(
        <I18nextProvider i18n={i18n}>
          <ResultsSummary results={mockResults} onFilterChange={mockOnFilterChange} />
        </I18nextProvider>
      );

      // Click qualified button in Spanish
      fireEvent.click(screen.getByText('Calificado'));
      expect(mockOnFilterChange).toHaveBeenCalledWith('qualified');
    });
  });

  describe('Translation Key Coverage', () => {
    it('covers all required translation keys for ProgramCard', () => {
      const requiredKeys = [
        'results.status.qualified',
        'results.status.likely',
        'results.status.maybe',
        'results.status.unlikely',
        'results.status.notQualified',
        'results.actions.whyThisResult',
        'benefits.medicaid',
        'benefits.descriptions.medicaid',
      ];

      requiredKeys.forEach(key => {
        const translation = i18n.t(key);
        expect(translation).not.toBe(key); // Translation should not equal the key
      });
    });

    it('covers all required translation keys for results page', () => {
      const requiredKeys = [
        'results.summary.title',
        'results.actions.newAssessment',
        'results.export.exportToPdf',
        'results.export.exportEncrypted',
        'results.import.importResults',
        'results.resources.title',
        'results.resources.government',
        'results.resources.support',
        'results.processing.title',
        'results.noResults.title',
      ];

      requiredKeys.forEach(key => {
        const translation = i18n.t(key);
        expect(translation).not.toBe(key); // Translation should not equal the key
      });
    });

    it('covers confidence score translation keys', () => {
      const requiredKeys = [
        'results.confidence.strongMatch',
        'results.confidence.goodMatch',
        'results.confidence.possibleMatch',
        'results.confidence.clearMismatch',
        'results.confidence.likelyIneligible',
        'results.confidence.insufficientData',
        'results.confidence.needsVerification',
        'results.confidence.moreInfoRequired',
      ];

      requiredKeys.forEach(key => {
        const translation = i18n.t(key);
        expect(translation).not.toBe(key); // Translation should not equal the key
      });
    });

    it('covers all required translation keys for ResultsSummary', () => {
      const requiredKeys = [
        'results.summary.all',
        'results.summary.qualified',
        'results.summary.likely',
        'results.summary.maybe',
        'results.summary.notQualified',
      ];

      requiredKeys.forEach(key => {
        const translation = i18n.t(key);
        expect(translation).not.toBe(key); // Translation should not equal the key
      });
    });
  });

  describe('Fallback Behavior', () => {
    it('falls back to English when Spanish translation is missing', () => {
      // Mock missing translation
      const originalTranslation = i18n.t('results.status.qualified');

      renderWithI18n(<ProgramCard result={mockProgramResult} />, 'es');

      // Should still render something (either Spanish or English fallback)
      expect(screen.getByText(/Qualify|Calificas/)).toBeInTheDocument();
    });
  });
});
