/**
 * Shared test setup for App component tests
 * 
 * Contains all mocks and utilities used across App test files
 */

import { vi } from 'vitest';
import React from 'react';
import type { RxDocument } from 'rxdb';
import type { UserProfile } from '../db/schemas';

// Helper to flush all pending promises
export const flushPromises = (): Promise<void> => new Promise(resolve => {
  // Use setTimeout(0) as fallback for environments without setImmediate
  if (typeof setImmediate !== 'undefined') {
    setImmediate(resolve);
  } else {
    setTimeout(resolve, 0);
  }
});

// Mock all dependencies
vi.mock('../i18n/hooks', () => ({
  useI18n: () => ({
    t: (key: string) => {
      // Return actual translated text for common keys used in tests
      const translations: Record<string, string> = {
        'app.title': 'BenefitFinder',
        'app.subtitle': 'Find Your Government Benefits',
        'questionnaire.title': 'Eligibility Questionnaire',
        'startAssessment': 'Start Assessment',
        'processing.title': 'Processing Your Results',
        'results.processing.title': 'Processing Your Results',
        'results.summary.title': 'Your Benefit Eligibility Results',
        'navigation.home': 'Home',
        'navigation.tour': 'Tour',
        'navigation.privacy': 'Privacy',
        'navigation.guide': 'Guide',
        'error': 'Error',
        'Go Home': 'Go Home',
        'New Assessment': 'New Assessment',
        'Import': 'Import',
        'Complete': 'Complete',
      };
      // Use Map for secure lookup to avoid object injection
      const translationMap = new Map(Object.entries(translations));
      return translationMap.get(key) ?? key;
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn().mockResolvedValue(undefined),
    },
    changeLanguage: vi.fn().mockResolvedValue(undefined),
  }),
}));

// Create mocks that resolve IMMEDIATELY (same tick) to prevent async delays
// Using Promise.resolve() ensures the promise is already resolved when returned
// This prevents React from waiting for async operations to complete
export const mockLoadAllResults = vi.fn(() => {
  // Return a promise that's already resolved (same microtask tick)
  return Promise.resolve([]);
});
export const mockLoadResult = vi.fn(() => Promise.resolve(null));
export const mockSaveResults = vi.fn(() => Promise.resolve('mock-id'));

export const mockUseResultsManagement = vi.fn(() => ({
  saveResults: mockSaveResults,
  loadAllResults: mockLoadAllResults,
  loadResult: mockLoadResult,
  deleteResult: vi.fn(() => Promise.resolve()),
  updateResult: vi.fn(() => Promise.resolve()),
  savedResults: [],
  isLoading: false,
  error: null,
}));

vi.mock('../components/results/useResultsManagement', () => ({
  useResultsManagement: () => mockUseResultsManagement(),
}));

vi.mock('../questionnaire/ui', () => ({
  EnhancedQuestionnaire: ({ onComplete }: { onComplete: (answers: Record<string, unknown>) => void }) => (
    <div data-testid="questionnaire">
      <button onClick={() => onComplete({})}>Complete</button>
    </div>
  ),
}));

vi.mock('../components/results', () => ({
  ResultsSummary: () => <div data-testid="results-summary">Results Summary</div>,
  ProgramCard: () => <div data-testid="program-card">Program Card</div>,
  ResultsExport: () => <div data-testid="results-export">Export</div>,
  ResultsImport: ({ onImport }: { onImport: (results: unknown) => void }) => (
    <button onClick={() => onImport({})}>Import</button>
  ),
  QuestionnaireAnswersCard: () => <div data-testid="questionnaire-answers">Answers</div>,
}));

vi.mock('../components/onboarding', () => ({
  WelcomeTour: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div data-testid="welcome-tour">Tour</div> : null,
  HelpTooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PrivacyExplainer: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div data-testid="privacy-explainer">Privacy</div> : null,
  QuickStartGuide: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div data-testid="quick-start-guide">Guide</div> : null,
}));

vi.mock('../components/ShortcutsHelp', () => ({
  ShortcutsHelp: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div data-testid="shortcuts-help">Shortcuts</div> : null,
}));

vi.mock('../components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language</div>,
}));

vi.mock('../components/ThemeSwitcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher">Theme</div>,
}));

vi.mock('../components/TextSizeControls', () => ({
  TextSizeControls: () => <div data-testid="text-size-controls">Text Size</div>,
}));

vi.mock('../components/KeyboardShortcuts', () => ({
  KeyboardShortcuts: () => null,
}));

vi.mock('../questionnaire/accessibility', () => ({
  LiveRegion: () => null,
}));

// CRITICAL: Mock database module BEFORE any imports that use it
// This prevents RxDB instances from being created, which causes memory leaks
vi.mock('../db', () => {
  const mockDb = {
    name: 'benefitfinder',
    user_profiles: {
      find: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue([]),
      }),
      findOne: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      }),
      insert: vi.fn().mockResolvedValue({}),
    },
    benefit_programs: {
      find: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue([]),
      }),
      findOne: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      }),
    },
    eligibility_rules: {
      find: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue([]),
      }),
    },
    eligibility_results: {
      find: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue([]),
      }),
      insert: vi.fn().mockResolvedValue({}),
    },
    app_settings: {
      find: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue([]),
      }),
    },
  };

  return {
    // Mock initializeDatabase to return immediately without creating RxDB instance
    initializeDatabase: vi.fn().mockResolvedValue(mockDb),
    // Mock getDatabase to return mock database instance
    getDatabase: vi.fn().mockReturnValue(mockDb),
    // Mock isDatabaseInitialized to return true (avoids initialization attempts)
    isDatabaseInitialized: vi.fn().mockReturnValue(true),
    // Mock clearDatabase to do nothing
    clearDatabase: vi.fn().mockResolvedValue(undefined),
    // Mock destroyDatabase to do nothing (prevents RxDB cleanup from running)
    destroyDatabase: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('../db/utils', () => ({
  createUserProfile: vi.fn().mockResolvedValue({
    id: 'test-profile-id',
    householdSize: 3,
    householdIncome: 30000,
    state: 'GA',
  } as unknown as RxDocument<UserProfile>),
}));

vi.mock('../utils/clearAndReinitialize', () => ({
  clearAndReinitialize: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../utils/forceFixProgramNames', () => ({
  forceFixProgramNames: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../utils/encryption', () => ({
  deriveKeyFromPassphrase: vi.fn().mockResolvedValue({
    key: new CryptoKey(),
    salt: 'test-salt',
    iterations: 1000,
  }),
  encrypt: vi.fn().mockResolvedValue({
    ciphertext: 'test-ciphertext',
    iv: 'test-iv',
    algorithm: 'AES-GCM',
    timestamp: Date.now(),
  }),
  decrypt: vi.fn().mockResolvedValue(JSON.stringify({
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    results: {
      qualified: [],
      maybe: [],
      likely: [],
      notQualified: [],
      totalPrograms: 0,
      evaluatedAt: new Date().toISOString(),
    },
  })),
}));

vi.mock('../components/results/exportUtils', () => ({
  importEncrypted: vi.fn().mockResolvedValue({
    results: {
      qualified: [],
      maybe: [],
      likely: [],
      notQualified: [],
      totalPrograms: 0,
      evaluatedAt: new Date(),
    },
    profileSnapshot: {},
    metadata: {},
    exportedAt: new Date(),
  }),
  exportEncrypted: vi.fn().mockResolvedValue(new Blob(['test'], { type: 'application/octet-stream' })),
  exportToPDF: vi.fn(),
  downloadBlob: vi.fn(),
  generateExportFilename: vi.fn().mockReturnValue('test-filename'),
}));

vi.mock('../components/Routes', () => ({
  Routes: {
    Home: vi.fn(({ onStartQuestionnaire }: { onStartQuestionnaire: () => void }) => (
      <div data-testid="home-page">
        <button onClick={onStartQuestionnaire}>Start Assessment</button>
      </div>
    )),
    Questionnaire: vi.fn(({ onComplete }: { onComplete: (answers: Record<string, unknown>) => void }) => (
      <div data-testid="questionnaire-page">
        <button onClick={() => onComplete({})}>Complete</button>
      </div>
    )),
    Results: vi.fn(({ onNewAssessment, onImportResults }: {
      onNewAssessment: () => void;
      onImportResults: (results: unknown) => Promise<void>;
    }) => (
      <div data-testid="results-page">
        <button onClick={onNewAssessment}>New Assessment</button>
        <button onClick={() => void onImportResults({})}>Import</button>
      </div>
    )),
    Error: vi.fn(({ onGoHome }: { onGoHome: () => void }) => (
      <div data-testid="error-page">
        <button onClick={onGoHome}>Go Home</button>
      </div>
    )),
  },
}));

vi.mock('../pages/HomePage', () => ({
  HomePage: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('../pages/QuestionnairePage', () => ({
  QuestionnairePage: () => <div data-testid="questionnaire-page">Questionnaire Page</div>,
}));

vi.mock('../pages/ResultsPage', () => ({
  ResultsPage: () => <div data-testid="results-page">Results Page</div>,
}));

vi.mock('../pages/ErrorPage', () => ({
  ErrorPage: () => <div data-testid="error-page">Error Page</div>,
}));

vi.mock('../components/RoutePreloader', () => ({
  RoutePreloader: {
    preloadAll: vi.fn(),
    preloadRoute: vi.fn(),
    preloadUserJourney: vi.fn(),
  },
}));

vi.mock('../components/RouteComponent', () => ({
  RouteComponent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../components/RouteLoadingFallback', () => ({
  RouteLoadingFallback: () => <div data-testid="loading-fallback">Loading...</div>,
}));

// Mock lazy-loaded onboarding components
vi.mock('../components/onboarding', () => ({
  WelcomeTour: ({ isOpen, onClose: _onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? <div data-testid="welcome-tour">Welcome Tour</div> : null
  ),
  HelpTooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="help-tooltip">{children}</div>
  ),
  PrivacyExplainer: ({ isOpen, onClose: _onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? <div data-testid="privacy-explainer">Privacy Explainer</div> : null
  ),
  QuickStartGuide: ({ isOpen, onClose: _onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? <div data-testid="quick-start-guide">Quick Start Guide</div> : null
  ),
  ShortcutsHelp: ({ isOpen, onClose: _onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? <div data-testid="shortcuts-help">Shortcuts Help</div> : null
  ),
}));

vi.mock('../rules', () => ({
  evaluateAllPrograms: vi.fn().mockResolvedValue({
    profileId: 'test-profile',
    programResults: new Map(),
    summary: {
      total: 0,
      eligible: 0,
      ineligible: 0,
      incomplete: 0,
      needsReview: 0,
    },
    totalTime: 0,
  }),
  getAllProgramRuleIds: vi.fn().mockResolvedValue([]),
  importRulesDynamically: vi.fn().mockImplementation(() =>
    Promise.resolve({
      success: true,
      imported: 0,
      errors: [],
      loadTime: 0,
    })
  ),
}));

vi.mock('../services/ImportManager', () => ({
  importManager: {
    importRules: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock('../utils/initializeApp', () => ({
  initializeApp: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../utils/programHelpers', () => ({
  getProgramName: (id: string) => `Program ${id}`,
  getProgramDescription: (id: string) => `Description for ${id}`,
}));

vi.mock('../utils/createSampleResults', () => ({
  createSampleResults: () => ({
    qualified: [],
    likely: [],
    maybe: [],
    notQualified: [],
    totalPrograms: 0,
    evaluatedAt: new Date(),
  }),
}));

vi.mock('../questionnaire/enhanced-flow', () => ({
  createEnhancedFlow: () => ({
    questions: [],
    startQuestionId: 'q1',
  }),
}));

vi.mock('../contexts/ThemeContext', async () => {
  const actual = await vi.importActual('../contexts/ThemeContext');
  return {
    ...actual,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('../contexts/TextSizeContext', async () => {
  const actual = await vi.importActual('../contexts/TextSizeContext');
  return {
    ...actual,
    TextSizeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock window.location
export const mockLocation = {
  pathname: '/',
  hostname: 'localhost',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

