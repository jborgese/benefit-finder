/**
 * WhyExplanation Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WhyExplanation } from '../WhyExplanation';
import type { EligibilityExplanation } from '../types';

// Mock the Dialog component
vi.mock('@radix-ui/react-dialog', () => ({
  Dialog: {
    Title: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <h2 className={className}>{children}</h2>
    ),
    Close: ({ children }: { children: React.ReactNode }) => (
      <button>{children}</button>
    ),
  },
}));

describe('WhyExplanation Component', () => {
  const mockOnClose = vi.fn();

  const mockExplanation: EligibilityExplanation = {
    reason: 'You qualify based on your household size and income',
    details: ['Income is below the threshold', 'Household size qualifies'],
    rulesCited: ['SNAP-INCOME-001', 'SNAP-HOUSEHOLD-001'],
    calculations: [
      {
        label: 'Monthly income limit',
        value: '$4,500',
        comparison: 'Your income: $3,200 (qualifies)'
      },
      {
        label: 'Household size',
        value: 3,
        comparison: '3 people'
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the modal with program name and status', () => {
    render(
      <WhyExplanation
        programName="Supplemental Nutrition Assistance Program (SNAP)"
        status="qualified"
        explanation={mockExplanation}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Why this result?')).toBeInTheDocument();
    expect(screen.getByText('Supplemental Nutrition Assistance Program (SNAP)')).toBeInTheDocument();
    expect(screen.getByText('qualified')).toBeInTheDocument();
  });

  it('should display the reason and details', () => {
    render(
      <WhyExplanation
        programName="SNAP"
        status="qualified"
        explanation={mockExplanation}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('You qualify based on your household size and income')).toBeInTheDocument();
    expect(screen.getByText('How we determined this:')).toBeInTheDocument();
    expect(screen.getByText('Income is below the threshold')).toBeInTheDocument();
    expect(screen.getByText('Household size qualifies')).toBeInTheDocument();
  });

  it('should display calculations with specific values', () => {
    render(
      <WhyExplanation
        programName="SNAP"
        status="qualified"
        explanation={mockExplanation}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Calculations:')).toBeInTheDocument();
    expect(screen.getByText('Monthly income limit:')).toBeInTheDocument();
    expect(screen.getByText('$4,500')).toBeInTheDocument();
    expect(screen.getByText('Your income: $3,200 (qualifies)')).toBeInTheDocument();
    expect(screen.getByText('Household size:')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('3 people')).toBeInTheDocument();
  });

  it('should display program requirements with specific values when calculations are available', () => {
    render(
      <WhyExplanation
        programName="SNAP"
        status="qualified"
        explanation={mockExplanation}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Program requirements:')).toBeInTheDocument();
    // Should show specific calculation values instead of generic descriptions
    expect(screen.getByText('Monthly income limit: $4,500 (Your income: $3,200 (qualifies))')).toBeInTheDocument();
  });

  it('should fall back to generic descriptions when no calculations are available', () => {
    const explanationWithoutCalculations: EligibilityExplanation = {
      ...mockExplanation,
      calculations: undefined
    };

    render(
      <WhyExplanation
        programName="SNAP"
        status="qualified"
        explanation={explanationWithoutCalculations}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Program requirements:')).toBeInTheDocument();
    // Should show generic descriptions
    expect(screen.getByText('Income must be below 130% of federal poverty level')).toBeInTheDocument();
    expect(screen.getByText('Household size eligibility requirements')).toBeInTheDocument();
  });

  it('should display privacy note', () => {
    render(
      <WhyExplanation
        programName="SNAP"
        status="qualified"
        explanation={mockExplanation}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Privacy Note:')).toBeInTheDocument();
    expect(screen.getByText(/All eligibility calculations happen locally on your device/)).toBeInTheDocument();
  });

  it('should render close button', () => {
    render(
      <WhyExplanation
        programName="SNAP"
        status="qualified"
        explanation={mockExplanation}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Close')).toBeInTheDocument();
  });
});
