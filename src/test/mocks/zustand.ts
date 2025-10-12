/**
 * Zustand Store Mocks
 *
 * Mock implementations of Zustand stores for testing.
 */

import { vi } from 'vitest';

/**
 * Mock App Settings Store
 */
export const mockAppSettingsStore = {
  theme: 'light' as const,
  fontSize: 'medium' as const,
  highContrast: false,
  language: 'en' as const,
  autoSaveEnabled: true,
  encryptionEnabled: true,
  sessionTimeout: 30,
  reduceMotion: false,
  screenReaderMode: false,
  keyboardNavigationHints: true,
  showTutorial: true,
  showPrivacyNotice: true,
  setTheme: vi.fn(),
  setFontSize: vi.fn(),
  setHighContrast: vi.fn(),
  setLanguage: vi.fn(),
  setAutoSave: vi.fn(),
  setEncryption: vi.fn(),
  setSessionTimeout: vi.fn(),
  setReduceMotion: vi.fn(),
  setScreenReaderMode: vi.fn(),
  setKeyboardNavigationHints: vi.fn(),
  setShowTutorial: vi.fn(),
  setShowPrivacyNotice: vi.fn(),
  resetSettings: vi.fn(),
};

/**
 * Mock UI Store
 */
export const mockUIStore = {
  isLoading: false,
  loadingMessage: null,
  loadingProgress: null,
  modals: [],
  toasts: [],
  sidebarOpen: true,
  mobileMenuOpen: false,
  focusTrapEnabled: false,
  setLoading: vi.fn(),
  openModal: vi.fn(() => 'mock-modal-id'),
  closeModal: vi.fn(),
  closeAllModals: vi.fn(),
  updateModal: vi.fn(),
  addToast: vi.fn(() => 'mock-toast-id'),
  removeToast: vi.fn(),
  clearToasts: vi.fn(),
  setSidebarOpen: vi.fn(),
  toggleSidebar: vi.fn(),
  setMobileMenuOpen: vi.fn(),
  toggleMobileMenu: vi.fn(),
  setFocusTrap: vi.fn(),
};

/**
 * Mock Questionnaire Store
 */
export const mockQuestionnaireStore = {
  sessionId: null,
  isActive: false,
  startedAt: null,
  lastUpdatedAt: null,
  answers: {},
  currentQuestionId: null,
  visitedQuestionIds: [],
  questionHistory: [],
  progress: {
    currentQuestionIndex: 0,
    totalQuestions: 0,
    percentComplete: 0,
    skippedQuestions: [],
    answeredQuestions: [],
  },
  validationErrors: {},
  startQuestionnaire: vi.fn(),
  endQuestionnaire: vi.fn(),
  pauseQuestionnaire: vi.fn(),
  resumeQuestionnaire: vi.fn(),
  setCurrentQuestion: vi.fn(),
  goToNextQuestion: vi.fn(),
  goToPreviousQuestion: vi.fn(),
  skipQuestion: vi.fn(),
  setAnswer: vi.fn(),
  updateAnswer: vi.fn(),
  clearAnswer: vi.fn(),
  clearAllAnswers: vi.fn(),
  updateProgress: vi.fn(),
  setValidationError: vi.fn(),
  clearValidationError: vi.fn(),
  clearAllValidationErrors: vi.fn(),
  loadSavedAnswers: vi.fn(),
  exportAnswers: vi.fn(() => ({})),
  resetQuestionnaire: vi.fn(),
};

/**
 * Helper to reset all store mocks
 */
export function resetAllStoreMocks(): void {
  Object.values(mockAppSettingsStore).forEach((value) => {
    if (typeof value === 'function' && 'mockReset' in value) {
      value.mockReset();
    }
  });

  Object.values(mockUIStore).forEach((value) => {
    if (typeof value === 'function' && 'mockReset' in value) {
      value.mockReset();
    }
  });

  Object.values(mockQuestionnaireStore).forEach((value) => {
    if (typeof value === 'function' && 'mockReset' in value) {
      value.mockReset();
    }
  });
}

