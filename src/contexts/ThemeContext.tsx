/**
 * Theme Context
 *
 * Provides theme management (light/dark mode) with system preference detection
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Theme } from './themeConstants';
import { THEME_STORAGE_KEY, DEFAULT_THEME } from './themeConstants';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark'; // The resolved theme (light or dark)
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Get saved theme from localStorage or default to 'system'
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved as Theme) || DEFAULT_THEME;
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Function to get system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Function to resolve the actual theme
  const resolveTheme = useCallback((currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  }, []);

  // Update actual theme when theme changes
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setActualTheme(resolved);

    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);

    // Set data attribute for CSS
    document.documentElement.setAttribute('data-theme', resolved);
  }, [theme, resolveTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e: MediaQueryListEvent): void => {
        const resolved = e.matches ? 'dark' : 'light';
        setActualTheme(resolved);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme): void => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const toggleTheme = (): void => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        actualTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
