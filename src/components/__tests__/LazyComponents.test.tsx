/**
 * Tests for Lazy Components
 */

import { describe, it, expect, vi } from 'vitest';
import * as LazyComponents from '../LazyComponents';

// Mock the lazy imports to avoid actually loading the components
vi.mock('../results/ResultsSummary', () => ({
  ResultsSummary: () => <div>ResultsSummary</div>
}));

vi.mock('../results/ProgramCard', () => ({
  ProgramCard: () => <div>ProgramCard</div>
}));

vi.mock('../results/ResultsExport', () => ({
  ResultsExport: () => <div>ResultsExport</div>
}));

vi.mock('../results/ResultsImport', () => ({
  ResultsImport: () => <div>ResultsImport</div>
}));

vi.mock('../results/QuestionnaireAnswersCard', () => ({
  QuestionnaireAnswersCard: () => <div>QuestionnaireAnswersCard</div>
}));

vi.mock('../onboarding/WelcomeTour', () => ({
  WelcomeTour: () => <div>WelcomeTour</div>
}));

vi.mock('../onboarding/PrivacyExplainer', () => ({
  PrivacyExplainer: () => <div>PrivacyExplainer</div>
}));

vi.mock('../onboarding/QuickStartGuide', () => ({
  QuickStartGuide: () => <div>QuickStartGuide</div>
}));

vi.mock('../ShortcutsHelp', () => ({
  ShortcutsHelp: () => <div>ShortcutsHelp</div>
}));

vi.mock('../../questionnaire/ui', () => ({
  EnhancedQuestionnaire: () => <div>EnhancedQuestionnaire</div>
}));

describe('LazyComponents', () => {
  describe('Results Components', () => {
    it('should export LazyResultsSummary as a lazy component', () => {
      expect(LazyComponents.LazyResultsSummary).toBeDefined();
      // React lazy components can be functions or objects depending on environment
      expect(['object', 'function']).toContain(typeof LazyComponents.LazyResultsSummary);
    });

    it('should export LazyProgramCard as a lazy component', () => {
      expect(LazyComponents.LazyProgramCard).toBeDefined();
      expect(['object', 'function']).toContain(typeof LazyComponents.LazyProgramCard);
    });

    it('should export LazyResultsExport as a lazy component', () => {
      expect(LazyComponents.LazyResultsExport).toBeDefined();
      expect(['object', 'function']).toContain(typeof LazyComponents.LazyResultsExport);
    });

    it('should export LazyResultsImport as a lazy component', () => {
      expect(LazyComponents.LazyResultsImport).toBeDefined();
      expect(['object', 'function']).toContain(typeof LazyComponents.LazyResultsImport);
    });

    it('should export LazyQuestionnaireAnswersCard as a lazy component', () => {
      expect(LazyComponents.LazyQuestionnaireAnswersCard).toBeDefined();
      expect(['object', 'function']).toContain(typeof LazyComponents.LazyQuestionnaireAnswersCard);
    });
  });

  describe('Onboarding Components', () => {
    it('should export LazyWelcomeTour as a lazy component', () => {
      expect(LazyComponents.LazyWelcomeTour).toBeDefined();
      expect(['object', 'function']).toContain(typeof LazyComponents.LazyWelcomeTour);
    });

    it('should export LazyPrivacyExplainer as a lazy component', () => {
      expect(LazyComponents.LazyPrivacyExplainer).toBeDefined();
      expect(['object', 'function']).toContain(typeof LazyComponents.LazyPrivacyExplainer);
    });

    it('should export LazyQuickStartGuide as a lazy component', () => {
      expect(LazyComponents.LazyQuickStartGuide).toBeDefined();
      expect(['object', 'function']).toContain(typeof LazyComponents.LazyQuickStartGuide);
    });

    it('should export LazyShortcutsHelp as a lazy component', () => {
      expect(LazyComponents.LazyShortcutsHelp).toBeDefined();
      expect(['object', 'function']).toContain(typeof LazyComponents.LazyShortcutsHelp);
    });
  });

  describe('Questionnaire Components', () => {
    it('should export LazyEnhancedQuestionnaire as a lazy component', () => {
      expect(LazyComponents.LazyEnhancedQuestionnaire).toBeDefined();
      expect(['object', 'function']).toContain(typeof LazyComponents.LazyEnhancedQuestionnaire);
    });
  });

  describe('Component Structure', () => {
    it('should have all lazy components as React lazy objects', () => {
      const lazyComponents = [
        LazyComponents.LazyResultsSummary,
        LazyComponents.LazyProgramCard,
        LazyComponents.LazyResultsExport,
        LazyComponents.LazyResultsImport,
        LazyComponents.LazyQuestionnaireAnswersCard,
        LazyComponents.LazyWelcomeTour,
        LazyComponents.LazyPrivacyExplainer,
        LazyComponents.LazyQuickStartGuide,
        LazyComponents.LazyShortcutsHelp,
        LazyComponents.LazyEnhancedQuestionnaire,
      ];

      lazyComponents.forEach(component => {
        expect(component).toBeDefined();
        // React lazy components can be functions or objects
        expect(['object', 'function']).toContain(typeof component);
      });
    });

    it('should export exactly 10 lazy components', () => {
      const exportedKeys = Object.keys(LazyComponents);
      expect(exportedKeys).toHaveLength(10);
      expect(exportedKeys).toContain('LazyResultsSummary');
      expect(exportedKeys).toContain('LazyProgramCard');
      expect(exportedKeys).toContain('LazyResultsExport');
      expect(exportedKeys).toContain('LazyResultsImport');
      expect(exportedKeys).toContain('LazyQuestionnaireAnswersCard');
      expect(exportedKeys).toContain('LazyWelcomeTour');
      expect(exportedKeys).toContain('LazyPrivacyExplainer');
      expect(exportedKeys).toContain('LazyQuickStartGuide');
      expect(exportedKeys).toContain('LazyShortcutsHelp');
      expect(exportedKeys).toContain('LazyEnhancedQuestionnaire');
    });
  });

  describe('Import Paths', () => {
    it('should have correct naming convention for results components', () => {
      const resultsComponents = [
        'LazyResultsSummary',
        'LazyProgramCard',
        'LazyResultsExport',
        'LazyResultsImport',
        'LazyQuestionnaireAnswersCard',
      ];

      resultsComponents.forEach(name => {
        expect(Object.keys(LazyComponents)).toContain(name);
        expect(name.startsWith('Lazy')).toBe(true);
      });
    });

    it('should have correct naming convention for onboarding components', () => {
      const onboardingComponents = [
        'LazyWelcomeTour',
        'LazyPrivacyExplainer',
        'LazyQuickStartGuide',
        'LazyShortcutsHelp',
      ];

      onboardingComponents.forEach(name => {
        expect(Object.keys(LazyComponents)).toContain(name);
        expect(name.startsWith('Lazy')).toBe(true);
      });
    });

    it('should have correct naming convention for questionnaire components', () => {
      const questionnaireComponents = ['LazyEnhancedQuestionnaire'];

      questionnaireComponents.forEach(name => {
        expect(Object.keys(LazyComponents)).toContain(name);
        expect(name.startsWith('Lazy')).toBe(true);
      });
    });
  });

  describe('Component Grouping', () => {
    it('should have 5 results-related lazy components', () => {
      const resultsComponents = Object.keys(LazyComponents).filter(
        key =>
          key.includes('Results') ||
          key.includes('Program') ||
          key.includes('Questionnaire')
      );
      expect(resultsComponents.length).toBeGreaterThanOrEqual(5);
    });

    it('should have onboarding-related lazy components', () => {
      const onboardingComponents = Object.keys(LazyComponents).filter(
        key =>
          key.includes('Welcome') ||
          key.includes('Privacy') ||
          key.includes('QuickStart') ||
          key.includes('Shortcuts')
      );
      expect(onboardingComponents.length).toBeGreaterThanOrEqual(4);
    });

    it('should have questionnaire-related lazy components', () => {
      const questionnaireComponents = Object.keys(LazyComponents).filter(
        key => key.includes('Questionnaire') && key.includes('Enhanced')
      );
      expect(questionnaireComponents.length).toBeGreaterThanOrEqual(1);
    });
  });
});
