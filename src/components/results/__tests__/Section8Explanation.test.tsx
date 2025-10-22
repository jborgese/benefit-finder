import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import * as Dialog from '@radix-ui/react-dialog';
import { Section8Explanation } from '../Section8Explanation';
import { EligibilityExplanation } from '../types';

// Mock the i18n hook
vi.mock('../../../i18n/hooks', () => ({
  useI18n: () => ({
    t: (key: string) => key, // Mock returns the key itself
  }),
}));

describe('Section8Explanation', () => {
  const mockExplanation: EligibilityExplanation = {
    confidence: 0.85,
    reasoning: 'Based on income and family composition',
    missingInfo: [],
    recommendations: ['Contact local housing authority'],
  };

  const mockUserProfile = {
    state: 'CA',
    age: 35,
    householdSize: 3,
    householdIncome: 25000,
    isDisabled: false,
    isElderly: false,
    hasChildren: true,
  };

  const elderlyProfile = { ...mockUserProfile, age: 70, isElderly: true };
  const disabledProfile = { ...mockUserProfile, isDisabled: true };
  const familyProfile = { ...mockUserProfile, hasChildren: true };

  const mockOnClose = vi.fn();

  const renderWithDialog = (props: any): ReturnType<typeof render> => {
    return render(
      <Dialog.Root open>
        <Dialog.Content>
          <Section8Explanation {...props} />
        </Dialog.Content>
      </Dialog.Root>
    );
  };

  it('renders without crashing', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByText('Why this result?')).toBeInTheDocument();
  });

  it('displays the program name', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByText('Section 8')).toBeInTheDocument();
  });

  it('shows the status badge', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByText('qualified')).toBeInTheDocument();
    expect(screen.getByText('results.section8.statusMessages.qualified')).toBeInTheDocument();
  });

  it('displays benefits section', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByText('results.section8.benefits.title')).toBeInTheDocument();
    expect(screen.getByText('results.section8.benefits.rentalAssistance')).toBeInTheDocument();
  });

  it('displays requirements section', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByText('results.section8.requirements.title')).toBeInTheDocument();
    expect(screen.getByText('results.section8.requirements.income')).toBeInTheDocument();
  });

  it('displays next steps section', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.section8.nextSteps.title')).toBeInTheDocument();
    expect(screen.getByText('results.section8.nextSteps.contact')).toBeInTheDocument();
  });

  it('displays how to apply section', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.section8.howToApply.title')).toBeInTheDocument();
    expect(screen.getByText('results.section8.howToApply.step1')).toBeInTheDocument();
  });

  it('displays resources section', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.section8.resources.title')).toBeInTheDocument();
    expect(screen.getByText(/results\.section8\.resources\.website/)).toBeInTheDocument();
  });

  it('shows privacy note', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByText('Privacy Note:')).toBeInTheDocument();
  });

  it('has accessible close button', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByLabelText('Close explanation')).toBeInTheDocument();
  });

  it('adapts content based on user profile', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: elderlyProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.section8.benefits.elderly')).toBeInTheDocument();
  });

  it('shows disability-specific benefits for disabled users', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: disabledProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.section8.benefits.disability')).toBeInTheDocument();
  });

  it('shows family-specific benefits for families with children', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: familyProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.section8.benefits.families')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose,
    });
    const closeButton = screen.getByLabelText('Close explanation');
    closeButton.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has proper ARIA labels', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByRole('dialog', { name: 'Why this result?' })).toBeInTheDocument();
  });

  it('handles different status types', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'unlikely',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByText('unlikely')).toBeInTheDocument();
    expect(screen.getByText('results.section8.statusMessages.unlikely')).toBeInTheDocument();
  });

  it('shows status-specific messaging', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'likely',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.section8.statusMessages.likely')).toBeInTheDocument();
  });

  it('displays all required sections', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });

    // Check all main sections are present
    expect(screen.getByText('results.section8.benefits.title')).toBeInTheDocument();
    expect(screen.getByText('results.section8.requirements.title')).toBeInTheDocument();
    expect(screen.getByText('results.section8.nextSteps.title')).toBeInTheDocument();
    expect(screen.getByText('results.section8.howToApply.title')).toBeInTheDocument();
    expect(screen.getByText('results.section8.resources.title')).toBeInTheDocument();
  });

  it('shows housing-specific benefits', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.section8.benefits.housingChoice')).toBeInTheDocument();
    expect(screen.getByText('results.section8.benefits.portability')).toBeInTheDocument();
    expect(screen.getByText('results.section8.benefits.fairMarketRent')).toBeInTheDocument();
  });

  it('shows housing-specific requirements', () => {
    renderWithDialog({
      programName: 'Section 8',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.section8.requirements.housingNeed')).toBeInTheDocument();
    expect(screen.getByText('results.section8.requirements.backgroundCheck')).toBeInTheDocument();
  });
});
