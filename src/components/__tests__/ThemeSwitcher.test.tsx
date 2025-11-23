/**
 * ThemeSwitcher Component Tests
 *
 * Tests for theme switcher component with context mocking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeSwitcher } from '../ThemeSwitcher';
import * as useThemeModule from '../../contexts/useTheme';

// Mock the useTheme hook
const mockSetTheme = vi.fn();
const mockToggleTheme = vi.fn();

vi.mock('../../contexts/useTheme', () => ({
  useTheme: vi.fn(),
}));

describe('ThemeSwitcher Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useThemeModule.useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'light',
      actualTheme: 'light',
      setTheme: mockSetTheme,
      toggleTheme: mockToggleTheme,
    });
  });

  describe('Rendering', () => {
    it('should render theme switcher', () => {
      render(<ThemeSwitcher />);

      expect(screen.getByRole('combobox', { name: /Select theme/i })).toBeInTheDocument();
    });

    it('should display current theme', () => {
      render(<ThemeSwitcher />);

      expect(screen.getByText('Light')).toBeInTheDocument();
    });

    it('should render with light theme icon', () => {
      render(<ThemeSwitcher />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
    });

    it('should render with dark theme when selected', () => {
      (useThemeModule.useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
        theme: 'dark',
        actualTheme: 'dark',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitcher />);

      expect(screen.getByText('Dark')).toBeInTheDocument();
    });

    it('should render with system theme when selected', () => {
      (useThemeModule.useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
        theme: 'system',
        actualTheme: 'light',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeSwitcher />);

      expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<ThemeSwitcher className="custom-class" />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('custom-class');
    });

    it('should apply small size classes', () => {
      render(<ThemeSwitcher size="sm" />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('h-11');
      expect(trigger).toHaveClass('text-sm');
    });

    it('should apply medium size classes', () => {
      render(<ThemeSwitcher size="md" />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('h-11');
      expect(trigger).toHaveClass('text-base');
    });

    it('should apply large size classes', () => {
      render(<ThemeSwitcher size="lg" />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('h-12');
      expect(trigger).toHaveClass('text-lg');
    });

    it('should apply default variant styles', () => {
      render(<ThemeSwitcher variant="default" />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('bg-white');
    });

    it('should apply minimal variant styles', () => {
      render(<ThemeSwitcher variant="minimal" />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('bg-transparent');
    });
  });

  describe('Theme Selection', () => {
    it('should render select component with current theme', () => {
      render(<ThemeSwitcher />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
      // Component uses onValueChange which will call setTheme
      // Direct interaction tests are limited by Radix UI Select Portal behavior in jsdom
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      render(<ThemeSwitcher />);

      const trigger = screen.getByRole('combobox', { name: /Select theme/i });
      expect(trigger).toBeInTheDocument();
    });

    it('should have keyboard navigation', async () => {
      const user = userEvent.setup();

      render(<ThemeSwitcher />);

      const trigger = screen.getByRole('combobox');
      await user.tab();

      expect(trigger).toHaveFocus();
    });
  });

  describe('Theme Options', () => {
    it('should render with light theme option', () => {
      render(<ThemeSwitcher />);

      // Component displays current theme in trigger
      expect(screen.getByText('Light')).toBeInTheDocument();
    });

    it('should render select component structure', () => {
      render(<ThemeSwitcher />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
      // Portal-based dropdown menu is not easily testable in jsdom
    });
  });
});

