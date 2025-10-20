import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgramCard } from '../ProgramCard';
import { ProgramEligibilityResult } from '../types';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';

// Mock data for testing
const mockProgramResult: ProgramEligibilityResult = {
  programId: 'medicaid-federal',
  programName: 'Medicaid',
  programDescription: 'Health coverage for low-income individuals and families',
  jurisdiction: 'US-FEDERAL',
  status: 'qualified',
  confidence: 'high',
  confidenceScore: 85,
  explanation: {
    reason: 'Meets income requirements',
    details: ['Income below 138% FPL', 'Resident of US'],
    rulesCited: ['medicaid-income-rule'],
  },
  estimatedBenefit: {
    amount: 500,
    frequency: 'month',
    currency: 'USD',
  },
  requiredDocuments: [],
  nextSteps: [],
  evaluatedAt: new Date('2024-01-01'),
  rulesVersion: '1.0.0',
};

describe('ProgramCard', () => {
  const renderWithI18n = (component: React.ReactElement) => {
    return render(
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    );
  };

  it('renders program name using translation', () => {
    renderWithI18n(<ProgramCard result={mockProgramResult} />);

    // Should render the translated program name
    expect(screen.getByText('Medicaid')).toBeInTheDocument();
  });

  it('renders program description using translation', () => {
    renderWithI18n(<ProgramCard result={mockProgramResult} />);

    // Should render the translated description
    expect(screen.getByText('Health coverage for low-income individuals and families')).toBeInTheDocument();
  });

  it('renders status badge using translation', () => {
    renderWithI18n(<ProgramCard result={mockProgramResult} />);

    // Should render the translated status
    expect(screen.getByText('You Qualify')).toBeInTheDocument();
  });

  it('renders action buttons using translation', () => {
    renderWithI18n(<ProgramCard result={mockProgramResult} />);

    // Should render the translated action text
    expect(screen.getByText('Why this result?')).toBeInTheDocument();
  });

  it('renders different status badges correctly', () => {
    const likelyResult = { ...mockProgramResult, status: 'likely' as const };
    renderWithI18n(<ProgramCard result={likelyResult} />);

    expect(screen.getByText('Likely Qualify')).toBeInTheDocument();
  });

  it('renders maybe status correctly', () => {
    const maybeResult = { ...mockProgramResult, status: 'maybe' as const };
    renderWithI18n(<ProgramCard result={maybeResult} />);

    expect(screen.getByText('May Qualify')).toBeInTheDocument();
  });

  it('renders not qualified status correctly', () => {
    const notQualifiedResult = { ...mockProgramResult, status: 'not-qualified' as const };
    renderWithI18n(<ProgramCard result={notQualifiedResult} />);

    expect(screen.getByText('Not Qualified')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    renderWithI18n(<ProgramCard result={mockProgramResult} className="custom-class" />);

    // Find the outermost div that contains the custom class
    const card = document.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });
});
