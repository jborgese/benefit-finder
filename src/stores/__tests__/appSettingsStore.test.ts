/**
 * App Settings Store Tests
 * 
 * Example test suite for the appSettingsStore.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAppSettingsStore } from '../appSettingsStore';

describe('appSettingsStore', () => {
  // Reset store to initial state before each test
  beforeEach(() => {
    useAppSettingsStore.getState().resetSettings();
  });
  
  describe('Theme Settings', () => {
    it('should have default theme as system', () => {
      const { theme } = useAppSettingsStore.getState();
      expect(theme).toBe('system');
    });
    
    it('should update theme to dark', () => {
      const { setTheme } = useAppSettingsStore.getState();
      
      setTheme('dark');
      
      const { theme } = useAppSettingsStore.getState();
      expect(theme).toBe('dark');
    });
    
    it('should update theme to light', () => {
      const { setTheme } = useAppSettingsStore.getState();
      
      setTheme('light');
      
      const { theme } = useAppSettingsStore.getState();
      expect(theme).toBe('light');
    });
  });
  
  describe('Language Settings', () => {
    it('should have default language as English', () => {
      const { language } = useAppSettingsStore.getState();
      expect(language).toBe('en');
    });
    
    it('should update language to Spanish', () => {
      const { setLanguage } = useAppSettingsStore.getState();
      
      setLanguage('es');
      
      const { language } = useAppSettingsStore.getState();
      expect(language).toBe('es');
    });
  });
  
  describe('Accessibility Settings', () => {
    it('should have keyboard navigation hints enabled by default', () => {
      const { keyboardNavigationHints } = useAppSettingsStore.getState();
      expect(keyboardNavigationHints).toBe(true);
    });
    
    it('should toggle reduce motion', () => {
      const { setReduceMotion } = useAppSettingsStore.getState();
      
      setReduceMotion(true);
      
      const { reduceMotion } = useAppSettingsStore.getState();
      expect(reduceMotion).toBe(true);
    });
    
    it('should toggle screen reader mode', () => {
      const { setScreenReaderMode } = useAppSettingsStore.getState();
      
      setScreenReaderMode(true);
      
      const { screenReaderMode } = useAppSettingsStore.getState();
      expect(screenReaderMode).toBe(true);
    });
  });
  
  describe('Privacy Settings', () => {
    it('should have encryption enabled by default', () => {
      const { encryptionEnabled } = useAppSettingsStore.getState();
      expect(encryptionEnabled).toBe(true);
    });
    
    it('should have auto-save enabled by default', () => {
      const { autoSaveEnabled } = useAppSettingsStore.getState();
      expect(autoSaveEnabled).toBe(true);
    });
    
    it('should update session timeout', () => {
      const { setSessionTimeout } = useAppSettingsStore.getState();
      
      setSessionTimeout(60);
      
      const { sessionTimeout } = useAppSettingsStore.getState();
      expect(sessionTimeout).toBe(60);
    });
  });
  
  describe('Reset Settings', () => {
    it('should reset all settings to defaults', () => {
      const { setTheme, setLanguage, setReduceMotion, resetSettings } = 
        useAppSettingsStore.getState();
      
      // Change multiple settings
      setTheme('dark');
      setLanguage('es');
      setReduceMotion(true);
      
      // Reset
      resetSettings();
      
      // Verify all back to defaults
      const state = useAppSettingsStore.getState();
      expect(state.theme).toBe('system');
      expect(state.language).toBe('en');
      expect(state.reduceMotion).toBe(false);
    });
  });
});

