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
  Title: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 className={className}>{children}</h2>
  ),
  Close: ({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean;[key: string]: any }) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, props);
    }
    return <button {...props}>{children}</button>;
  },
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Overlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Trigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  Description: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
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
    // Use getAllByText since this text appears in both Calculations and Program requirements sections
    const requirements = screen.getAllByText('Monthly income limit: $4,500 (Your income: $3,200 (qualifies))');
    expect(requirements.length).toBeGreaterThan(0);
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
    expect(screen.getByText('Gross monthly income must be below 130% of federal poverty level')).toBeInTheDocument();
    expect(screen.getByText('Household size eligibility requirements')).toBeInTheDocument();
  });

  it('should handle program identifier format like "medicaid federal"', () => {
    const explanationWithProgramId: EligibilityExplanation = {
      reason: 'You may qualify based on your household size and income',
      details: ['Income verification needed'],
      rulesCited: ['medicaid federal'],
      calculations: undefined
    };

    render(
      <WhyExplanation
        programName="Medicaid"
        status="maybe"
        explanation={explanationWithProgramId}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Program requirements:')).toBeInTheDocument();
    // Should show user-friendly description for "medicaid federal"
    expect(screen.getByText('Federal Medicaid eligibility requirements including income limits, household size requirements, and citizenship status')).toBeInTheDocument();
  });

  it('should handle specific medicaid rule IDs like "medicaid-federal-expansion-income"', () => {
    const explanationWithSpecificRule: EligibilityExplanation = {
      reason: 'You may qualify based on Medicaid expansion in your state',
      details: ['Income within expansion limits'],
      rulesCited: ['medicaid-federal-expansion-income'],
      calculations: undefined
    };

    render(
      <WhyExplanation
        programName="Medicaid"
        status="likely"
        explanation={explanationWithSpecificRule}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Program requirements:')).toBeInTheDocument();
    // Should show specific description for expansion income rule
    expect(screen.getByText('Federal Medicaid expansion income eligibility (138% of federal poverty level for adults under 65 in expansion states)')).toBeInTheDocument();
  });

  it('should display all program rules when multiple rules are cited', () => {
    const explanationWithMultipleRules: EligibilityExplanation = {
      reason: 'You may qualify based on various Medicaid pathways',
      details: ['Multiple eligibility pathways available'],
      rulesCited: [
        'medicaid-federal-expansion-income',
        'medicaid-federal-children',
        'medicaid-federal-pregnant-women',
        'medicaid-federal-citizenship',
        'medicaid-federal-residence-requirement'
      ],
      calculations: undefined
    };

    render(
      <WhyExplanation
        programName="Medicaid"
        status="maybe"
        explanation={explanationWithMultipleRules}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Program requirements:')).toBeInTheDocument();

    // Should show all the different Medicaid eligibility pathways
    expect(screen.getByText('Federal Medicaid expansion income eligibility (138% of federal poverty level for adults under 65 in expansion states)')).toBeInTheDocument();
    expect(screen.getByText('Federal Medicaid eligibility for children (up to 200% FPL for children under 19)')).toBeInTheDocument();
    expect(screen.getByText('Federal Medicaid eligibility for pregnant women (up to 200% FPL minimum)')).toBeInTheDocument();
    expect(screen.getByText('Federal Medicaid citizenship and immigration status requirements')).toBeInTheDocument();
    expect(screen.getByText('Federal Medicaid state residence requirements')).toBeInTheDocument();
  });

  it('should display all SNAP rules when multiple rules are cited', () => {
    const explanationWithSnapRules: EligibilityExplanation = {
      reason: 'You may qualify based on various SNAP requirements',
      details: ['Multiple SNAP eligibility pathways available'],
      rulesCited: [
        'snap-federal-gross-income',
        'snap-federal-net-income',
        'snap-federal-citizenship',
        'snap-federal-asset-limit',
        'snap-federal-work-requirement',
        'snap-federal-social-security',
        'snap-federal-residence'
      ],
      calculations: undefined
    };

    render(
      <WhyExplanation
        programName="SNAP"
        status="maybe"
        explanation={explanationWithSnapRules}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Program requirements:')).toBeInTheDocument();

    // Should show all the different SNAP eligibility requirements
    expect(screen.getByText('Federal SNAP gross income eligibility (130% of federal poverty level for most households)')).toBeInTheDocument();
    expect(screen.getByText('Federal SNAP net income eligibility (100% of federal poverty level after deductions)')).toBeInTheDocument();
    expect(screen.getByText('Federal SNAP citizenship and immigration status requirements')).toBeInTheDocument();
    expect(screen.getByText('Federal SNAP asset limits ($2,750 for most households, $4,250 for elderly/disabled)')).toBeInTheDocument();
    expect(screen.getByText('Federal SNAP work requirements for able-bodied adults without dependents (ABAWD)')).toBeInTheDocument();
    expect(screen.getByText('Federal SNAP Social Security Number requirements for all household members')).toBeInTheDocument();
    expect(screen.getByText('Federal SNAP state residence requirements')).toBeInTheDocument();
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
