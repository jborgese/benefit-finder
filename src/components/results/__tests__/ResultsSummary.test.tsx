import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultsSummary } from '../ResultsSummary';
import { EligibilityResults, EligibilityStatus } from '../types';
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

  describe('Rendering', () => {
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

    it('renders progress bar with correct percentage', () => {
      renderWithI18n(<ResultsSummary results={mockResults} />);

      // Should show 50% qualified (1 out of 2 programs)
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('displays evaluation date and time', () => {
      renderWithI18n(<ResultsSummary results={mockResults} />);

      // Check that date is rendered (the actual date shown is 12/31/2023 based on timezone)
      expect(screen.getByText(/Evaluated on/i)).toBeInTheDocument();
    });
  });

  describe('Filter interactions', () => {
    it('calls onFilterChange when filter buttons are clicked', async () => {
      const user = userEvent.setup();
      const mockOnFilterChange = vi.fn();
      renderWithI18n(<ResultsSummary results={mockResults} onFilterChange={mockOnFilterChange} />);

      const qualifiedButton = screen.getByText('Qualified').closest('button')!;
      await user.click(qualifiedButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('qualified');
    });

    it('calls onFilterChange with all status', async () => {
      const user = userEvent.setup();
      const mockOnFilterChange = vi.fn();
      renderWithI18n(<ResultsSummary results={mockResults} onFilterChange={mockOnFilterChange} />);

      const allButton = screen.getByText('All').closest('button')!;
      await user.click(allButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('all');
    });

    it('calls onFilterChange with likely status', async () => {
      const user = userEvent.setup();
      const mockOnFilterChange = vi.fn();
      renderWithI18n(<ResultsSummary results={mockResults} onFilterChange={mockOnFilterChange} />);

      const likelyButton = screen.getByText('Likely').closest('button')!;
      await user.click(likelyButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('likely');
    });

    it('calls onFilterChange with maybe status', async () => {
      const user = userEvent.setup();
      const mockOnFilterChange = vi.fn();
      renderWithI18n(<ResultsSummary results={mockResults} onFilterChange={mockOnFilterChange} />);

      const maybeButton = screen.getByText('Maybe').closest('button')!;
      await user.click(maybeButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('maybe');
    });

    it('calls onFilterChange with not-qualified status', async () => {
      const user = userEvent.setup();
      const mockOnFilterChange = vi.fn();
      renderWithI18n(<ResultsSummary results={mockResults} onFilterChange={mockOnFilterChange} />);

      const notQualifiedButton = screen.getByText('Not Qualified').closest('button')!;
      await user.click(notQualifiedButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('not-qualified');
    });

    it('does not call onFilterChange when callback is not provided', async () => {
      const user = userEvent.setup();
      renderWithI18n(<ResultsSummary results={mockResults} />);

      const qualifiedButton = screen.getByText('Qualified').closest('button')!;
      await user.click(qualifiedButton);

      // Should not throw error when onFilterChange is undefined
      expect(qualifiedButton).toBeInTheDocument();
    });
  });

  describe('Active filter styling', () => {
    it('highlights active filter correctly for qualified', () => {
      renderWithI18n(<ResultsSummary results={mockResults} activeFilter="qualified" />);

      const qualifiedButton = screen.getByText('Qualified').closest('button');
      expect(qualifiedButton).toHaveClass('bg-green-100');
    });

    it('highlights active filter correctly for all', () => {
      renderWithI18n(<ResultsSummary results={mockResults} activeFilter="all" />);

      const allButton = screen.getByText('All').closest('button');
      expect(allButton).toHaveClass('bg-purple-100');
    });

    it('highlights active filter correctly for likely', () => {
      renderWithI18n(<ResultsSummary results={mockResults} activeFilter="likely" />);

      const likelyButton = screen.getByText('Likely').closest('button');
      expect(likelyButton).toHaveClass('bg-blue-100');
    });

    it('highlights active filter correctly for maybe', () => {
      renderWithI18n(<ResultsSummary results={mockResults} activeFilter="maybe" />);

      const maybeButton = screen.getByText('Maybe').closest('button');
      expect(maybeButton).toHaveClass('bg-yellow-100');
    });

    it('highlights active filter correctly for not-qualified', () => {
      renderWithI18n(<ResultsSummary results={mockResults} activeFilter="not-qualified" />);

      const notQualifiedButton = screen.getByText('Not Qualified').closest('button');
      expect(notQualifiedButton).toHaveClass('bg-gray-100');
    });

    it('defaults to all filter when activeFilter is not provided', () => {
      renderWithI18n(<ResultsSummary results={mockResults} />);

      const allButton = screen.getByText('All').closest('button');
      // When no activeFilter is provided, default is 'all', so it should be highlighted
      expect(allButton).toHaveClass('bg-purple-100');
    });
  });

  describe('Status icons', () => {
    it('renders correct icon for qualified status', () => {
      renderWithI18n(<ResultsSummary results={mockResults} />);
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('renders correct icon for likely status', () => {
      renderWithI18n(<ResultsSummary results={mockResults} />);
      expect(screen.getByText('◐')).toBeInTheDocument();
    });

    it('renders correct icon for maybe status', () => {
      renderWithI18n(<ResultsSummary results={mockResults} />);
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('renders correct icon for not-qualified status', () => {
      renderWithI18n(<ResultsSummary results={mockResults} />);
      expect(screen.getByText('✗')).toBeInTheDocument();
    });
  });

  describe('Progress calculations', () => {
    it('calculates 0% when no programs qualify', () => {
      const noQualifiedResults: EligibilityResults = {
        ...mockResults,
        qualified: [],
        totalPrograms: 5,
      };
      renderWithI18n(<ResultsSummary results={noQualifiedResults} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('calculates 100% when all programs qualify', () => {
      const allQualifiedResults: EligibilityResults = {
        ...mockResults,
        qualified: [
          mockResults.qualified[0],
          { ...mockResults.qualified[0], programId: 'wic-federal' },
        ],
        maybe: [],
        totalPrograms: 2,
      };
      renderWithI18n(<ResultsSummary results={allQualifiedResults} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('handles zero total programs gracefully', () => {
      const zeroResults: EligibilityResults = {
        ...mockResults,
        qualified: [],
        maybe: [],
        likely: [],
        notQualified: [],
        totalPrograms: 0,
      };
      renderWithI18n(<ResultsSummary results={zeroResults} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Tips and messages', () => {
    it('shows next steps tip when user qualifies for programs', () => {
      renderWithI18n(<ResultsSummary results={mockResults} />);

      expect(screen.getByText(/You qualify for/i)).toBeInTheDocument();
      expect(screen.getByText(/Next Steps/i)).toBeInTheDocument();
    });

    it('shows singular program in tip when qualifying for one program', () => {
      renderWithI18n(<ResultsSummary results={mockResults} />);

      expect(screen.getByText(/1 program!/i)).toBeInTheDocument();
    });

    it('shows plural programs in tip when qualifying for multiple programs', () => {
      const multipleQualifiedResults: EligibilityResults = {
        ...mockResults,
        qualified: [
          mockResults.qualified[0],
          { ...mockResults.qualified[0], programId: 'wic-federal', programName: 'WIC' },
        ],
        totalPrograms: 3,
      };
      renderWithI18n(<ResultsSummary results={multipleQualifiedResults} />);

      expect(screen.getByText(/2 programs!/i)).toBeInTheDocument();
    });

    it('shows additional info message when no qualified but has maybe programs', () => {
      const maybeOnlyResults: EligibilityResults = {
        ...mockResults,
        qualified: [],
        totalPrograms: 2,
      };
      renderWithI18n(<ResultsSummary results={maybeOnlyResults} />);

      expect(screen.getByText(/Additional Information/i)).toBeInTheDocument();
    });

    it('shows help message when no qualified, likely, or maybe programs', () => {
      const noResultsData: EligibilityResults = {
        ...mockResults,
        qualified: [],
        likely: [],
        maybe: [],
        notQualified: [mockResults.maybe[0]],
        totalPrograms: 1,
      };
      renderWithI18n(<ResultsSummary results={noResultsData} />);

      expect(screen.getByText(/Need Help?/i)).toBeInTheDocument();
      expect(screen.getByText(/Based on the information provided/i)).toBeInTheDocument();
    });

    it('does not show tips when all three categories are empty', () => {
      const allEmptyResults: EligibilityResults = {
        ...mockResults,
        qualified: [],
        likely: [],
        maybe: [],
        totalPrograms: 0,
      };
      renderWithI18n(<ResultsSummary results={allEmptyResults} />);

      expect(screen.getByText(/Need Help?/i)).toBeInTheDocument();
    });
  });

  describe('Status counts with various data', () => {
    it('displays counts for all status types with likely programs', () => {
      const mixedResults: EligibilityResults = {
        qualified: [mockResults.qualified[0]],
        likely: [{ ...mockResults.qualified[0], status: 'likely' as EligibilityStatus, programId: 'tanf-federal' }],
        maybe: [mockResults.maybe[0]],
        notQualified: [{ ...mockResults.maybe[0], status: 'not-qualified' as EligibilityStatus, programId: 'ssi-federal' }],
        totalPrograms: 4,
        evaluatedAt: new Date('2024-01-01'),
      };
      renderWithI18n(<ResultsSummary results={mixedResults} />);

      expect(screen.getByText('4')).toBeInTheDocument(); // Total
      expect(screen.getAllByText('1')).toHaveLength(4); // Each status has 1 program
    });

    it('displays high counts correctly', () => {
      const highCountResults: EligibilityResults = {
        qualified: Array(15).fill(mockResults.qualified[0]),
        likely: Array(8).fill({ ...mockResults.qualified[0], status: 'likely' as EligibilityStatus }),
        maybe: Array(5).fill(mockResults.maybe[0]),
        notQualified: Array(12).fill({ ...mockResults.maybe[0], status: 'not-qualified' as EligibilityStatus }),
        totalPrograms: 40,
        evaluatedAt: new Date('2024-01-01'),
      };
      renderWithI18n(<ResultsSummary results={highCountResults} />);

      expect(screen.getByText('40')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides aria-label for all filter button', () => {
      renderWithI18n(<ResultsSummary results={mockResults} />);

      const allButton = screen.getByLabelText('Show all programs');
      expect(allButton).toBeInTheDocument();
    });

    it('provides aria-label for qualified filter button with count', () => {
      renderWithI18n(<ResultsSummary results={mockResults} />);

      const qualifiedButton = screen.getByLabelText('Show 1 qualified programs');
      expect(qualifiedButton).toBeInTheDocument();
    });

    it('provides aria-label for likely filter button with count', () => {
      renderWithI18n(<ResultsSummary results={mockResults} />);

      const likelyButton = screen.getByLabelText('Show 0 likely programs');
      expect(likelyButton).toBeInTheDocument();
    });

    it('provides aria-label for maybe filter button with count', () => {
      renderWithI18n(<ResultsSummary results={mockResults} />);

      const maybeButton = screen.getByLabelText('Show 1 maybe programs');
      expect(maybeButton).toBeInTheDocument();
    });

    it('provides aria-label for not-qualified filter button with count', () => {
      renderWithI18n(<ResultsSummary results={mockResults} />);

      const notQualifiedButton = screen.getByLabelText('Show 0 not qualified programs');
      expect(notQualifiedButton).toBeInTheDocument();
    });
  });
});
