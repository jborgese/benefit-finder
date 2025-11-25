/**
 * Shared test setup for App component tests
 *
 * Contains all mocks and utilities used across App test files
 */

import { vi } from 'vitest';
import type { RxDocument } from 'rxdb';
import type { UserProfile } from '../db/schemas';

// Provide a minimal non-suspending React.lazy mock so tests never hit Suspense fallbacks.
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    lazy: (_factory: unknown) => {
      // Return a stable stub component (renders nothing, but never suspends)
      return ((/* props */) => null) as any;
    },
  };
});

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
  // Simple in-memory mock DB that mimics enough RxDB APIs used in tests
  const store: Record<string, any[]> = {
    user_profiles: [],
    benefit_programs: [],
    eligibility_rules: [],
    eligibility_results: [],
    app_settings: [],
  };

  // Seed the store with a canonical WIC program and one minimal eligibility rule
  const seededWicProgram = {
    id: 'wic-federal',
    name: 'Special Supplemental Nutrition Program for Women, Infants, and Children (WIC)',
    shortName: 'WIC',
    category: 'food',
    active: true,
    // other fields tests might inspect
  };

  const seededWicRule = {
    id: 'wic-rule-2024-eligibility',
    programId: seededWicProgram.id,
    name: 'WIC Federal Eligibility Rules (2024)',
    ruleType: 'eligibility',
    // minimal rule payload so code that reads basic fields won't crash
    jsonLogic: { if: [{ var: 'householdIncome' }, true, false] },
  };

  // push seeds into store so collections find them
  store.benefit_programs.push(seededWicProgram);
  store.eligibility_rules.push(seededWicRule);

  const makeCollection = (name: string) => ({
    find: vi.fn().mockImplementation(({ selector } = {}) => ({
      exec: vi.fn().mockResolvedValue(
        // If selector provided, do a simple filter
        selector && selector.programId
          ? store[name].filter((d) => d.programId === selector.programId)
          : selector && selector.id
            ? store[name].filter((d) => d.id === selector.id)
            : store[name].slice()
      ),
    })),
    findOne: vi.fn().mockImplementation(({ selector } = {}) => ({
      exec: vi.fn().mockResolvedValue(
        store[name].find((d) => (selector && selector.id ? d.id === selector.id : false)) ?? null
      ),
    })),
    insert: vi.fn().mockImplementation(async (doc: Record<string, unknown>) => {
      const entry = { ...(doc as any) } as any;
      if (!entry.id) {
        entry.id = Math.random().toString(36).slice(2, 22);
      }
      store[name].push(entry);
      // add simple remove method for cleanup
      entry.remove = async () => {
        const idx = store[name].findIndex((d) => d.id === entry.id);
        if (idx >= 0) store[name].splice(idx, 1);
      };
      return entry;
    }),
    // Provide a findActivePrograms helper used by evaluateAllPrograms
    findActivePrograms: vi.fn().mockImplementation(async () => {
      return store[name].filter((p) => p.active);
    }),
    // Provide generic find({}).exec()
    // (already handled by find above)
  });

  const mockDb = {
    name: 'benefitfinder',
    user_profiles: makeCollection('user_profiles'),
    benefit_programs: makeCollection('benefit_programs'),
    eligibility_rules: makeCollection('eligibility_rules'),
    eligibility_results: makeCollection('eligibility_results'),
    app_settings: makeCollection('app_settings'),
    // utility to inspect store in tests if needed
    __internal_store: store,
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
    Home: ({ onStartQuestionnaire }: { onStartQuestionnaire: () => void }) => (
      <div data-testid="home-page">
        <button type="button" aria-label="Start Assessment" role="button" onClick={onStartQuestionnaire}>Start Assessment</button>
      </div>
    ),
    Questionnaire: ({ onComplete }: { onComplete: (answers: Record<string, unknown>) => void }) => (
      <div data-testid="questionnaire-page">
        <button type="button" aria-label="Complete" role="button" onClick={() => onComplete({})}>Complete</button>
      </div>
    ),
    Results: ({ onNewAssessment, onImportResults }: {
      onNewAssessment: () => void;
      onImportResults: (results: unknown) => Promise<void>;
    }) => (
      <div data-testid="results-page">
        <button type="button" aria-label="New Assessment" role="button" onClick={onNewAssessment}>New Assessment</button>
        <button type="button" aria-label="Import" role="button" onClick={() => void onImportResults({})}>Import</button>
      </div>
    ),
    Error: ({ onGoHome }: { onGoHome: () => void }) => (
      <div data-testid="error-page">
        <h2>Error</h2>
        <button type="button" aria-label="Return to Home" role="button" onClick={onGoHome}>
          Return to Home
        </button>
        <button type="button" aria-label="Refresh Page" role="button" onClick={() => window.location.reload()}>
          Refresh Page
        </button>
      </div>
    ),
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
  ErrorPage: ({ onGoHome }: { onGoHome: () => void }) => (
    <div data-testid="error-page">
      <h2>Error</h2>
      <button type="button" aria-label="Return to Home" role="button" onClick={onGoHome}>
        Return to Home
      </button>
      <button type="button" aria-label="Refresh Page" role="button" onClick={() => window.location.reload()}>
        Refresh Page
      </button>
    </div>
  ),
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

// Bypass ErrorBoundary so suspension-like errors do not swallow route rendering during tests
vi.mock('../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

// Make ThemeContext/TextSizeContext mocks synchronous passthroughs
vi.mock('../contexts/ThemeContext', () => ({
  // Provide a simple ThemeProvider wrapper for tests that doesn't suspend
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  // Keep any other exports if tests import them
}));

vi.mock('../contexts/TextSizeContext', () => ({
  // Provide a simple TextSizeProvider wrapper for tests that doesn't suspend
  TextSizeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock window.location
export const mockLocation = {
  pathname: '/',
  hostname: 'localhost',
};

// Make window.location configurable so tests can override it
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
  configurable: true, // Allow tests to redefine it
});

// Preload modules that App uses via React.lazy so imports resolve before
// any synchronous updates in tests (prevents Suspense during event handlers)
// These imports use the mocked module implementations above and will
// populate Node's module cache so `import()` resolves immediately.
void import('../components/onboarding');
void import('../components/ShortcutsHelp');

