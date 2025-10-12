/**
 * Accessibility Module
 *
 * Complete accessibility utilities for questionnaires
 */

// Keyboard Navigation
export {
  Keys,
  useKeyboardShortcuts,
  useQuestionnaireKeyboard,
  useArrowNavigation,
  useFocusTrap,
  useRovingTabIndex,
  type KeyboardShortcut,
} from './keyboard';

// Focus Management
export {
  useAutoFocus,
  useRestoreFocus,
  useFocusVisible,
  useModalFocus,
  useFocusError,
  useFocusHistory,
  scrollIntoViewAndFocus,
  getNextFocusable,
} from './focus';

// ARIA Utilities
export {
  useAriaIds,
  buildAriaDescribedBy,
  AriaAnnouncer,
  useAnnouncer,
  ariaLabels,
  getFieldAriaProps,
  getNavigationAriaProps,
  getProgressAriaProps,
  landmarkRoles,
  createSkipLink,
} from './aria';

// Announcements
export {
  LiveRegion,
  StatusAnnouncer,
  VisuallyHidden,
  SRDescription,
  useNavigationAnnouncements,
  useValidationAnnouncements,
  useProgressAnnouncements,
} from './announcements';

// Skip Links & Landmarks
export {
  SkipLink,
  SkipLinks,
  QuestionnaireLandmarks,
  ProgressLandmark,
  NavigationLandmark,
  type SkipLinkProps,
} from './SkipLinks';

