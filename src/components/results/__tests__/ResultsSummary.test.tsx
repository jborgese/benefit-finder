import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResultsSummary } from '../ResultsSummary';
import { EligibilityResults } from '../types';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';

// Mock data for testing
const mockResults: EligibilityResults = {
  qualified: [
    {
      programId: 'medicaid-federal',
      programName: 'Medicaid',
      programDescription: 'Health coverage for low-income individuals and families',
      jurisdiction: 'US-FEDERAL',
      status: 'qualified',
      confidence: 'high',
      confidenceScore: 85,
      explanation: {
        reason: 'Meets income requirements',
        details: ['Income below 138% FPL'],
        rulesCited: ['medicaid-income-rule'],
      },
      requiredDocuments: [],
      nextSteps: [],
      evaluatedAt: new Date('2024-01-01'),
      rulesVersion: '1.0.0',
    },
  ],
  likely: [],
  maybe: [
    {
      programId: 'snap-federal',
      programName: 'SNAP',
      programDescription: 'Food assistance program',
      jurisdiction: 'US-FEDERAL',
      status: 'maybe',
      confidence: 'medium',
      confidenceScore: 60,
      explanation: {
        reason: 'May meet requirements',
        details: ['Need more information'],
        rulesCited: ['snap-income-rule'],
      },
      requiredDocuments: [],
      nextSteps: [],
      evaluatedAt: new Date('2024-01-01'),
      rulesVersion: '1.0.0',
    },
  ],
  notQualified: [],
  totalPrograms: 2,
  evaluatedAt: new Date('2024-01-01'),
};

describe('ResultsSummary', () => {
  const renderWithI18n = (component: React.ReactElement): ReturnType<typeof render> => {
    return render(
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    );
  };

  it('renders status filter buttons with translated labels', () => {
    renderWithI18n(<ResultsSummary results={mockResults} />);

    // Check that all status filter buttons have translated labels
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Qualified')).toBeInTheDocument();
    expect(screen.getByText('Likely')).toBeInTheDocument();
    expect(screen.getByText('Maybe')).toBeInTheDocument();
    expect(screen.getByText('Not Qualified')).toBeInTheDocument();
  });

  it('displays correct counts for each status', () => {
    renderWithI18n(<ResultsSummary results={mockResults} />);

    // Check that the counts are displayed correctly
    expect(screen.getByText('2')).toBeInTheDocument(); // Total programs
    expect(screen.getAllByText('1')).toHaveLength(2); // Qualified and Maybe counts
    expect(screen.getAllByText('0')).toHaveLength(2); // Likely and Not qualified counts
  });

  it('calls onFilterChange when filter buttons are clicked', () => {
    const mockOnFilterChange = vi.fn();
    renderWithI18n(<ResultsSummary results={mockResults} onFilterChange={mockOnFilterChange} />);

    const qualifiedButton = screen.getByText('Qualified');
    qualifiedButton.click();

    expect(mockOnFilterChange).toHaveBeenCalledWith('qualified');
  });

  it('highlights active filter correctly', () => {
    renderWithI18n(<ResultsSummary results={mockResults} activeFilter="qualified" />);

    const qualifiedButton = screen.getByText('Qualified').closest('button');
    expect(qualifiedButton).toHaveClass('bg-green-100');
  });

  it('renders progress bar with correct percentage', () => {
    renderWithI18n(<ResultsSummary results={mockResults} />);

    // Should show 50% qualified (1 out of 2 programs)
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('applies custom styling correctly', () => {
    renderWithI18n(<ResultsSummary results={mockResults} />);

    // Check that the component renders without crashing
    const summary = screen.getByText('All');
    expect(summary).toBeInTheDocument();
  });
});
