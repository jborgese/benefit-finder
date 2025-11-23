/**
 * EligibilityResultExplanation Component Tests
 *
 * Comprehensive tests for the EligibilityResultExplanation component
 * and its sub-components including EligibilityResultSummary
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  EligibilityResultExplanation,
  EligibilityResultSummary,
} from '../components/EligibilityResultExplanation';
import type { EligibilityEvaluationResult } from '../rules/core/eligibility';
import type { JsonLogicRule, JsonLogicData } from '../rules/core/types';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockEligibleResult: EligibilityEvaluationResult = {
  eligible: true,
  confidence: 85,
  incomplete: false,
  executionTime: 45,
  needsReview: false,
  requiredDocuments: [
    { document: 'Proof of Income', description: 'Pay stubs or tax returns' },
    { document: 'ID', description: 'Driver\'s license or passport' },
  ],
  // Required base fields
  profileId: 'test-profile',
  programId: 'test-program',
  ruleId: 'rule-eligible-1',
  reason: '',
  evaluatedAt: Date.now(),
};

const mockIneligibleResult: EligibilityEvaluationResult = {
  eligible: false,
  confidence: 95,
  incomplete: false,
  executionTime: 32,
  needsReview: false,
  requiredDocuments: [],
  // Required base fields
  profileId: 'test-profile',
  programId: 'test-program',
  ruleId: 'rule-ineligible-1',
  reason: '',
  evaluatedAt: Date.now(),
};

const mockIncompleteResult: EligibilityEvaluationResult = {
  eligible: false,
  confidence: 60,
  incomplete: true,
  executionTime: 28,
  needsReview: true,
  requiredDocuments: [],
  // Required base fields
  profileId: 'test-profile',
  programId: 'test-program',
  ruleId: 'rule-incomplete-1',
  reason: '',
  evaluatedAt: Date.now(),
};

const mockRule: JsonLogicRule = {
  and: [
    { '>': [{ var: 'age' }, 18] },
    { '<': [{ var: 'income' }, 2000] },
  ],
};

const mockData: JsonLogicData = {
  age: 25,
  income: 1500,
  state: 'CA',
};

const mockExplanation = {
  summary: 'Based on your information, you appear to be eligible for this program.',
  reasoning: [
    'You meet the age requirement (25 years old)',
    'Your income is below the threshold ($1,500/month)',
  ],
  criteriaChecked: ['Age requirement', 'Income threshold'],
  criteriaPassed: ['Age requirement', 'Income threshold'],
  criteriaFailed: [],
  missingInformation: [],
  whatWouldChange: ['Increasing your income above $2,000/month'],
  plainLanguage: 'You meet all the basic requirements for this program. Your age and income are within the allowed limits.',
};

// ============================================================================
// MOCKS
// ============================================================================

// Mock the explanation function
vi.mock('../rules/core/explanation', () => ({
  explainResult: vi.fn(),
}));

// Mock the confidence utils
vi.mock('../components/results/confidenceUtils', () => ({
  getContextualLabelFromBasicData: vi.fn(),
}));

// ============================================================================
// TEST SUITE
// ============================================================================

describe('EligibilityResultExplanation', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { explainResult } = await import('../rules/core/explanation');
    const { getContextualLabelFromBasicData } = await import('../components/results/confidenceUtils');

    vi.mocked(explainResult).mockReturnValue(mockExplanation);
    vi.mocked(getContextualLabelFromBasicData).mockReturnValue({
      text: 'Good Match',
      icon: '✓',
    });
  });

  describe('Basic Rendering', () => {
    it('renders with eligible result', () => {
      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByText('You May Be Eligible')).toBeInTheDocument();
      expect(screen.getByText(mockExplanation.summary)).toBeInTheDocument();
      expect(screen.getByText(mockExplanation.plainLanguage)).toBeInTheDocument();
    });

    it('renders with ineligible result', () => {
      render(
        <EligibilityResultExplanation
          result={mockIneligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(screen.getByText('Not Eligible at This Time')).toBeInTheDocument();
    });

    it('renders with incomplete result', () => {
      render(
        <EligibilityResultExplanation
          result={mockIncompleteResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(screen.getByText('More Information Needed')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('calls explainResult with correct parameters', async () => {
      const { explainResult } = await import('../rules/core/explanation');

      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
          languageLevel="simple"
        />
      );

      expect(vi.mocked(explainResult)).toHaveBeenCalledWith(
        mockEligibleResult,
        mockRule,
        mockData,
        {
          languageLevel: 'simple',
          includeSuggestions: true,
        }
      );
    });
  });

  describe('Status Display', () => {
    it('shows correct status icon for eligible result', () => {
      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      // Check for the main status icon (not the confidence icon)
      const statusIcon = screen.getByRole('region').querySelector('.text-2xl');
      expect(statusIcon).toHaveTextContent('✓');
    });

    it('shows correct status icon for ineligible result', () => {
      render(
        <EligibilityResultExplanation
          result={mockIneligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      const statusIcon = screen.getByRole('region').querySelector('.text-2xl');
      expect(statusIcon).toHaveTextContent('✗');
    });

    it('shows correct status icon for incomplete result', () => {
      render(
        <EligibilityResultExplanation
          result={mockIncompleteResult}
          rule={mockRule}
          data={mockData}
        />
      );

      const statusIcon = screen.getByRole('region').querySelector('.text-2xl');
      expect(statusIcon).toHaveTextContent('⚠');
    });

    it('applies correct status colors for eligible result', () => {
      const { container } = render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(container.firstChild).toHaveClass('text-green-700', 'bg-green-50', 'border-green-200');
    });

    it('applies correct status colors for ineligible result', () => {
      const { container } = render(
        <EligibilityResultExplanation
          result={mockIneligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(container.firstChild).toHaveClass('text-red-700', 'bg-red-50', 'border-red-200');
    });

    it('applies correct status colors for incomplete result', () => {
      const { container } = render(
        <EligibilityResultExplanation
          result={mockIncompleteResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(container.firstChild).toHaveClass('text-yellow-700', 'bg-yellow-50', 'border-yellow-200');
    });
  });

  describe('Accordion Functionality', () => {
    it('renders accordion when showDetails is true', () => {
      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
          showDetails
        />
      );

      expect(screen.getByText('Why This Result?')).toBeInTheDocument();
      expect(screen.getByText('What Was Checked')).toBeInTheDocument();
    });

    it('does not render accordion when showDetails is false', () => {
      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
          showDetails={false}
        />
      );

      expect(screen.queryByText('Why This Result?')).not.toBeInTheDocument();
      expect(screen.queryByText('What Was Checked')).not.toBeInTheDocument();
    });

    it('expands and collapses accordion items', async () => {
      const user = userEvent.setup();
      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      const reasoningTrigger = screen.getByText('Why This Result?');
      await user.click(reasoningTrigger);

      await waitFor(() => {
        expect(screen.getByText('You meet the age requirement (25 years old)')).toBeInTheDocument();
      });
    });

    it('renders reasoning section when available', () => {
      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(screen.getByText('Why This Result?')).toBeInTheDocument();
    });

    it('renders criteria section when available', () => {
      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(screen.getByText('What Was Checked')).toBeInTheDocument();

      // Click to expand the criteria section
      fireEvent.click(screen.getByText('What Was Checked'));

      expect(screen.getByText('Requirements You Meet:')).toBeInTheDocument();
    });

    it('renders missing information section when available', async () => {
      const { explainResult } = await import('../rules/core/explanation');
      const explanationWithMissing = {
        ...mockExplanation,
        missingInformation: ['age', 'income'],
      };
      vi.mocked(explainResult).mockReturnValue(explanationWithMissing);

      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(screen.getByText('Information We Still Need')).toBeInTheDocument();
    });

    it('renders what would change section when available', () => {
      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(screen.getByText('What Would Change the Result?')).toBeInTheDocument();
    });

    it('renders required documents section when available', () => {
      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(screen.getByText('Required Documents')).toBeInTheDocument();

      // Click to expand the required documents section
      fireEvent.click(screen.getByText('Required Documents'));

      expect(screen.getByText('Proof of Income')).toBeInTheDocument();
      expect(screen.getByText(/Pay stubs or tax returns/)).toBeInTheDocument();
    });
  });

  describe('Confidence and Execution Info', () => {
    it('displays confidence information', async () => {
      const { getContextualLabelFromBasicData } = await import('../components/results/confidenceUtils');

      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(screen.getByText('Good Match')).toBeInTheDocument();
      expect(vi.mocked(getContextualLabelFromBasicData)).toHaveBeenCalledWith(
        true,
        85,
        false
      );
    });

    it('displays execution time when available', () => {
      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(screen.getByText(/Evaluated in 45ms/)).toBeInTheDocument();
    });

    it('displays needs review indicator when true', () => {
      render(
        <EligibilityResultExplanation
          result={mockIncompleteResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(screen.getByText(/Needs Manual Review/)).toBeInTheDocument();
    });

    it('does not display needs review indicator when false', () => {
      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(screen.queryByText('Needs Manual Review')).not.toBeInTheDocument();
    });
  });

  describe('Language Level Variations', () => {
    it('passes simple language level to explainResult', async () => {
      const { explainResult } = await import('../rules/core/explanation');

      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
          languageLevel="simple"
        />
      );

      expect(vi.mocked(explainResult)).toHaveBeenCalledWith(
        mockEligibleResult,
        mockRule,
        mockData,
        {
          languageLevel: 'simple',
          includeSuggestions: true,
        }
      );
    });

    it('passes technical language level to explainResult', async () => {
      const { explainResult } = await import('../rules/core/explanation');

      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
          languageLevel="technical"
        />
      );

      expect(vi.mocked(explainResult)).toHaveBeenCalledWith(
        mockEligibleResult,
        mockRule,
        mockData,
        {
          languageLevel: 'technical',
          includeSuggestions: true,
        }
      );
    });

    it('defaults to standard language level', async () => {
      const { explainResult } = await import('../rules/core/explanation');

      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(vi.mocked(explainResult)).toHaveBeenCalledWith(
        mockEligibleResult,
        mockRule,
        mockData,
        {
          languageLevel: 'standard',
          includeSuggestions: true,
        }
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles empty explanation gracefully', async () => {
      const { explainResult } = await import('../rules/core/explanation');
      const emptyExplanation = {
        summary: '',
        reasoning: [],
        criteriaChecked: [],
        criteriaPassed: [],
        criteriaFailed: [],
        missingInformation: [],
        plainLanguage: '',
      };
      vi.mocked(explainResult).mockReturnValue(emptyExplanation);

      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('handles result without execution time', () => {
      const resultWithoutTime = { ...mockEligibleResult, executionTime: undefined };

      render(
        <EligibilityResultExplanation
          result={resultWithoutTime}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(screen.queryByText(/Evaluated in/)).not.toBeInTheDocument();
    });

    it('handles result without required documents', () => {
      const resultWithoutDocs = { ...mockEligibleResult, requiredDocuments: [] };

      render(
        <EligibilityResultExplanation
          result={resultWithoutDocs}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(screen.queryByText('Required Documents')).not.toBeInTheDocument();
    });

    it('handles result with undefined incomplete flag', () => {
      const resultWithUndefinedIncomplete = { ...mockEligibleResult, incomplete: undefined };

      render(
        <EligibilityResultExplanation
          result={resultWithUndefinedIncomplete}
          rule={mockRule}
          data={mockData}
        />
      );

      expect(screen.getByText('You May Be Eligible')).toBeInTheDocument();
    });
  });
});

describe('EligibilityResultSummary', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { getContextualLabelFromBasicData } = await import('../components/results/confidenceUtils');

    vi.mocked(getContextualLabelFromBasicData).mockReturnValue({
      text: 'Good Match',
      icon: '✓',
    });
  });

  describe('Basic Rendering', () => {
    it('renders eligible summary', () => {
      render(
        <EligibilityResultSummary
          result={mockEligibleResult}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Eligible')).toBeInTheDocument();
      expect(screen.getByText('Good Match')).toBeInTheDocument();
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('renders ineligible summary', () => {
      render(
        <EligibilityResultSummary
          result={mockIneligibleResult}
        />
      );

      expect(screen.getByText('Not Eligible')).toBeInTheDocument();
    });

    it('renders incomplete summary', () => {
      render(
        <EligibilityResultSummary
          result={mockIncompleteResult}
        />
      );

      expect(screen.getByText('Incomplete')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <EligibilityResultSummary
          result={mockEligibleResult}
          className="custom-summary-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-summary-class');
    });

    it('has correct aria-label for eligible result', () => {
      render(
        <EligibilityResultSummary
          result={mockEligibleResult}
        />
      );

      expect(screen.getByLabelText('Eligibility status: Eligible')).toBeInTheDocument();
    });

    it('has correct aria-label for ineligible result', () => {
      render(
        <EligibilityResultSummary
          result={mockIneligibleResult}
        />
      );

      expect(screen.getByLabelText('Eligibility status: Not eligible')).toBeInTheDocument();
    });
  });

  describe('Status Colors', () => {
    it('applies correct colors for eligible result', () => {
      const { container } = render(
        <EligibilityResultSummary
          result={mockEligibleResult}
        />
      );

      expect(container.firstChild).toHaveClass('text-green-700', 'bg-green-50', 'border-green-200');
    });

    it('applies correct colors for ineligible result', () => {
      const { container } = render(
        <EligibilityResultSummary
          result={mockIneligibleResult}
        />
      );

      expect(container.firstChild).toHaveClass('text-red-700', 'bg-red-50', 'border-red-200');
    });

    it('applies correct colors for incomplete result', () => {
      const { container } = render(
        <EligibilityResultSummary
          result={mockIncompleteResult}
        />
      );

      expect(container.firstChild).toHaveClass('text-yellow-700', 'bg-yellow-50', 'border-yellow-200');
    });
  });

  describe('Confidence Display', () => {
    it('calls getContextualLabelFromBasicData with correct parameters', async () => {
      const { getContextualLabelFromBasicData } = await import('../components/results/confidenceUtils');

      render(
        <EligibilityResultSummary
          result={mockEligibleResult}
        />
      );

      expect(vi.mocked(getContextualLabelFromBasicData)).toHaveBeenCalledWith(
        true,
        85,
        false
      );
    });

    it('displays confidence text and icon', () => {
      render(
        <EligibilityResultSummary
          result={mockEligibleResult}
        />
      );

      expect(screen.getByText('Good Match')).toBeInTheDocument();
      expect(screen.getByText('✓')).toBeInTheDocument();
    });
  });
});

describe('Utility Functions', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { explainResult } = await import('../rules/core/explanation');
    const { getContextualLabelFromBasicData } = await import('../components/results/confidenceUtils');

    vi.mocked(explainResult).mockReturnValue(mockExplanation);
    vi.mocked(getContextualLabelFromBasicData).mockReturnValue({
      text: 'Good Match',
      icon: '✓',
    });
  });

  // Test the utility functions by importing them indirectly through the component
  describe('getStatusColor', () => {
    it('returns correct colors for eligible result', () => {
      const { container } = render(
        <EligibilityResultSummary result={mockEligibleResult} />
      );
      expect(container.firstChild).toHaveClass('text-green-700', 'bg-green-50', 'border-green-200');
    });

    it('returns correct colors for ineligible result', () => {
      const { container } = render(
        <EligibilityResultSummary result={mockIneligibleResult} />
      );
      expect(container.firstChild).toHaveClass('text-red-700', 'bg-red-50', 'border-red-200');
    });

    it('returns correct colors for incomplete result', () => {
      const { container } = render(
        <EligibilityResultSummary result={mockIncompleteResult} />
      );
      expect(container.firstChild).toHaveClass('text-yellow-700', 'bg-yellow-50', 'border-yellow-200');
    });
  });

  describe('getStatusIcon', () => {
    it('returns correct icon for eligible result', () => {
      render(<EligibilityResultSummary result={mockEligibleResult} />);
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('returns correct icon for ineligible result', () => {
      render(<EligibilityResultSummary result={mockIneligibleResult} />);
      expect(screen.getByText('✗')).toBeInTheDocument();
    });

    it('returns correct icon for incomplete result', () => {
      render(<EligibilityResultSummary result={mockIncompleteResult} />);
      expect(screen.getByText('⚠')).toBeInTheDocument();
    });
  });

  describe('getStatusHeading', () => {
    it('returns correct heading for eligible result', () => {
      render(<EligibilityResultExplanation result={mockEligibleResult} rule={mockRule} data={mockData} />);
      expect(screen.getByText('You May Be Eligible')).toBeInTheDocument();
    });

    it('returns correct heading for ineligible result', () => {
      render(<EligibilityResultExplanation result={mockIneligibleResult} rule={mockRule} data={mockData} />);
      expect(screen.getByText('Not Eligible at This Time')).toBeInTheDocument();
    });

    it('returns correct heading for incomplete result', () => {
      render(<EligibilityResultExplanation result={mockIncompleteResult} rule={mockRule} data={mockData} />);
      expect(screen.getByText('More Information Needed')).toBeInTheDocument();
    });
  });

  describe('getStatusLabel', () => {
    it('returns correct label for eligible result', () => {
      render(<EligibilityResultSummary result={mockEligibleResult} />);
      expect(screen.getByText('Eligible')).toBeInTheDocument();
    });

    it('returns correct label for ineligible result', () => {
      render(<EligibilityResultSummary result={mockIneligibleResult} />);
      expect(screen.getByText('Not Eligible')).toBeInTheDocument();
    });

    it('returns correct label for incomplete result', () => {
      render(<EligibilityResultSummary result={mockIncompleteResult} />);
      expect(screen.getByText('Incomplete')).toBeInTheDocument();
    });
  });

  describe('formatFieldName', () => {
    it('formats known field names correctly', async () => {
      const { explainResult } = await import('../rules/core/explanation');
      const explanationWithMissing = {
        ...mockExplanation,
        missingInformation: ['age', 'income'],
      };
      vi.mocked(explainResult).mockReturnValue(explanationWithMissing);

      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      // Expand the missing information section
      fireEvent.click(screen.getByText('Information We Still Need'));

      expect(screen.getByText('your age')).toBeInTheDocument();
      expect(screen.getByText('your income')).toBeInTheDocument();
    });

    it('formats unknown field names using fallback logic', async () => {
      const { explainResult } = await import('../rules/core/explanation');
      const explanationWithMissing = {
        ...mockExplanation,
        missingInformation: ['unknownField', 'anotherField'],
      };
      vi.mocked(explainResult).mockReturnValue(explanationWithMissing);

      render(
        <EligibilityResultExplanation
          result={mockEligibleResult}
          rule={mockRule}
          data={mockData}
        />
      );

      // Expand the missing information section
      fireEvent.click(screen.getByText('Information We Still Need'));

      expect(screen.getByText('Unknown Field')).toBeInTheDocument();
      expect(screen.getByText('Another Field')).toBeInTheDocument();
    });
  });
});
