import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { NextStepsList } from '../NextStepsList';
import type { NextStep } from '../types';

// Utility to render and optionally re-render with updated steps
function setup(steps: NextStep[], onToggle?: (i: number, c: boolean) => void) {
  const utils = render(<NextStepsList steps={steps} onToggle={onToggle} />);
  return { ...utils, rerenderWith: (newSteps: NextStep[]) => utils.rerender(<NextStepsList steps={newSteps} onToggle={onToggle} />) };
}

describe('NextStepsList Component', () => {
  afterEach(() => cleanup());

  const sampleSteps: NextStep[] = [
    { step: 'Upload income documents', priority: 'medium', completed: false },
    { step: 'Create online account', priority: 'high', completed: false, url: 'https://example.com/create' },
    { step: 'Schedule interview', priority: 'low', completed: true, estimatedTime: '15 minutes' },
    { step: 'Optional survey', completed: false },
  ];

  describe('Priority sorting', () => {
    it('sorts steps high > medium > low > undefined', () => {
      setup(sampleSteps);
      // Step numbering after sort should reflect sorted order
      const numberedBadges = screen.getAllByText(/Step \d+/);
      expect(numberedBadges).toHaveLength(4);
      // Extract displayed step texts in visual order
      const renderedSteps = screen.getAllByText(/Upload income documents|Create online account|Schedule interview|Optional survey/).map(el => el.textContent);
      // Expected order: high (Create online account), medium (Upload income documents), low (Schedule interview), undefined (Optional survey)
      expect(renderedSteps[0]).toBe('Create online account');
      expect(renderedSteps[1]).toBe('Upload income documents');
      expect(renderedSteps[2]).toBe('Schedule interview');
      expect(renderedSteps[3]).toBe('Optional survey');
    });

    it('calls onToggle with original unsorted index when toggled', () => {
      const onToggle = vi.fn();
      setup(sampleSteps, onToggle);
      // First rendered checkbox corresponds to original index 1 (high priority)
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(firstCheckbox);
      expect(onToggle).toHaveBeenCalledTimes(1);
      // original index should be 1 (second item of original array)
      expect(onToggle).toHaveBeenCalledWith(1, true);
    });
  });

  describe('Priority badges', () => {
    it('renders badge for high priority with correct icon and classes', () => {
      setup(sampleSteps);
      const highBadge = screen.getByText('High Priority');
      expect(highBadge).toBeInTheDocument();
      expect(highBadge.className).toMatch(/bg-red-100/);
      expect(within(highBadge).getByText('🔴')).toBeInTheDocument();
    });

    it('renders badge for medium priority', () => {
      setup(sampleSteps);
      const badge = screen.getByText('Medium Priority');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toMatch(/bg-yellow-100/);
    });

    it('renders badge for low priority', () => {
      setup(sampleSteps);
      const badge = screen.getByText('Low Priority');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toMatch(/bg-gray-100/);
    });

    it('does not render badge when priority undefined', () => {
      setup(sampleSteps);
      // Optional survey is last and has no badge
      const optionalCard = screen.getByText('Optional survey').closest('div');
      expect(optionalCard).toBeTruthy();
      const badge = within(optionalCard as HTMLElement).queryByText(/Priority/);
      expect(badge).toBeNull();
    });

    it('returns null for unknown priority value', () => {
      const steps: NextStep[] = [{ step: 'Mystery step', priority: 'unknown' as any }];
      setup(steps);
      expect(screen.getByText('Mystery step')).toBeInTheDocument();
      // No badge should appear
      const card = screen.getByText('Mystery step').closest('div');
      const badge = within(card as HTMLElement).queryByText(/Priority/);
      expect(badge).toBeNull();
    });
  });

  describe('Progress calculation', () => {
    it('shows 0% when no steps are completed', () => {
      const steps: NextStep[] = [{ step: 'A' }, { step: 'B' }];
      setup(steps);
      expect(screen.getByText(/Progress: 0 of 2 completed/)).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('rounds percentage correctly (1 of 3 -> 33%)', () => {
      const steps: NextStep[] = [{ step: 'A', completed: true }, { step: 'B' }, { step: 'C' }];
      setup(steps);
      expect(screen.getByText(/Progress: 1 of 3 completed/)).toBeInTheDocument();
      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('shows 100% when all completed and bar width style matches', () => {
      const steps: NextStep[] = [{ step: 'A', completed: true }, { step: 'B', completed: true }];
      setup(steps);
      expect(screen.getByText(/Progress: 2 of 2 completed/)).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      const bar = screen.getByText('100%').previousElementSibling?.querySelector('div div');
      expect(bar).toBeTruthy();
      expect((bar as HTMLElement).style.width).toBe('100%');
    });
  });

  describe('Interactions & completion styling', () => {
    it('applies completed styling and line-through for completed step', () => {
      setup(sampleSteps);
      const completedText = screen.getByText('Schedule interview');
      expect(completedText.className).toMatch(/line-through/);
      // Card container is the outer div with border classes; traverse up until we find a border-* class
      let node: HTMLElement | null = completedText as HTMLElement;
      let found: HTMLElement | null = null;
      while (node) {
        if (/border-green-300/.test(node.className)) { found = node; break; }
        node = node.parentElement;
      }
      expect(found).not.toBeNull();
    });

    it('toggles a step and re-render shows completed styling', () => {
      const steps: NextStep[] = [{ step: 'Do thing', completed: false }];
      const onToggle = vi.fn();
      const { rerenderWith } = setup(steps, onToggle);
      fireEvent.click(screen.getByRole('checkbox'));
      expect(onToggle).toHaveBeenCalledWith(0, true);
      // Simulate parent updating steps
      rerenderWith([{ step: 'Do thing', completed: true }]);
      const text = screen.getByText('Do thing');
      expect(text.className).toMatch(/line-through/);
    });

    it('does not throw if onToggle omitted', () => {
      setup(sampleSteps);
      fireEvent.click(screen.getAllByRole('checkbox')[0]);
      // If no error thrown, test passes
      expect(true).toBe(true);
    });

    it('checkbox has accessible aria-label with correct numbering', () => {
      setup(sampleSteps);
      const firstCheckbox = screen.getByLabelText('Mark step 1 as completed');
      expect(firstCheckbox).toBeInTheDocument();
    });
  });

  describe('Conditional content', () => {
    it('renders external link when url provided', () => {
      setup(sampleSteps);
      const link = screen.getByRole('link', { name: /Visit website for Create online account/ });
      expect(link).toHaveAttribute('href', 'https://example.com/create');
    });

    it('renders estimated time when provided', () => {
      setup(sampleSteps);
      expect(screen.getByText(/Estimated time: 15 minutes/)).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('handles empty steps array gracefully', () => {
      setup([]);
      expect(screen.getByText(/Progress: 0 of 0 completed/)).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
      // No cards
      const stepNumbers = screen.queryAllByText(/Step \d+/);
      expect(stepNumbers).toHaveLength(0);
    });
  });
});
