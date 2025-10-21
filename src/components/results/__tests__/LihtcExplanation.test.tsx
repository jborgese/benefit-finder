import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import * as Dialog from '@radix-ui/react-dialog';
import { LihtcExplanation } from '../LihtcExplanation';
import { EligibilityStatus, EligibilityExplanation } from '../types';

// Mock the i18n hook
vi.mock('../../../i18n/hooks', () => ({
  useI18n: () => ({
    t: (key: string) => key, // Mock returns the key itself
  }),
}));

describe('LihtcExplanation', () => {
  const mockExplanation: EligibilityExplanation = {
    confidence: 0.85,
    reasoning: 'Based on income and family composition',
    missingInfo: [],
    recommendations: ['Contact local housing providers'],
  };

  const mockUserProfile = {
    state: 'CA',
    age: 35,
    householdSize: 3,
    householdIncome: 30000,
    isDisabled: false,
    isElderly: false,
    hasChildren: true,
  };

  const elderlyProfile = { ...mockUserProfile, age: 70, isElderly: true };
  const disabledProfile = { ...mockUserProfile, isDisabled: true };
  const familyProfile = { ...mockUserProfile, hasChildren: true };

  const mockOnClose = vi.fn();

  const renderWithDialog = (props: any) => {
    return render(
      <Dialog.Root open={true}>
        <Dialog.Content>
          <LihtcExplanation {...props} />
        </Dialog.Content>
      </Dialog.Root>
    );
  };

  it('renders without crashing', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByText('Why this result?')).toBeInTheDocument();
  });

  it('displays the program name', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByText('LIHTC')).toBeInTheDocument();
  });

  it('shows the status badge', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByText('qualified')).toBeInTheDocument();
    expect(screen.getByText('results.lihtc.statusMessages.qualified')).toBeInTheDocument();
  });

  it('displays benefits section', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByText('results.lihtc.benefits.title')).toBeInTheDocument();
    expect(screen.getByText('results.lihtc.benefits.affordableHousing')).toBeInTheDocument();
  });

  it('displays requirements section', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByText('results.lihtc.requirements.title')).toBeInTheDocument();
    expect(screen.getByText('results.lihtc.requirements.income')).toBeInTheDocument();
  });

  it('displays next steps section', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.lihtc.nextSteps.title')).toBeInTheDocument();
    expect(screen.getByText('results.lihtc.nextSteps.contact')).toBeInTheDocument();
  });

  it('displays how to apply section', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.lihtc.howToApply.title')).toBeInTheDocument();
    expect(screen.getByText('results.lihtc.howToApply.step1')).toBeInTheDocument();
  });

  it('displays resources section', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.lihtc.resources.title')).toBeInTheDocument();
    expect(screen.getByText(/results\.lihtc\.resources\.website/)).toBeInTheDocument();
  });

  it('shows privacy note', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByText('Privacy Note:')).toBeInTheDocument();
  });

  it('has accessible close button', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByLabelText('Close explanation')).toBeInTheDocument();
  });

  it('adapts content based on user profile', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: elderlyProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.lihtc.benefits.elderly')).toBeInTheDocument();
  });

  it('shows disability-specific benefits for disabled users', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: disabledProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.lihtc.benefits.disability')).toBeInTheDocument();
  });

  it('shows family-specific benefits for families with children', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: familyProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.lihtc.benefits.families')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderWithDialog({
      programName: 'LIHTC',
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
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByRole('dialog', { name: 'Why this result?' })).toBeInTheDocument();
  });

  it('handles different status types', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'unlikely',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });
    expect(screen.getByText('unlikely')).toBeInTheDocument();
    expect(screen.getByText('results.lihtc.statusMessages.unlikely')).toBeInTheDocument();
  });

  it('shows status-specific messaging', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'likely',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.lihtc.statusMessages.likely')).toBeInTheDocument();
  });

  it('displays all required sections', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });

    // Check all main sections are present
    expect(screen.getByText('results.lihtc.benefits.title')).toBeInTheDocument();
    expect(screen.getByText('results.lihtc.requirements.title')).toBeInTheDocument();
    expect(screen.getByText('results.lihtc.nextSteps.title')).toBeInTheDocument();
    expect(screen.getByText('results.lihtc.howToApply.title')).toBeInTheDocument();
    expect(screen.getByText('results.lihtc.resources.title')).toBeInTheDocument();
  });

  it('shows housing-specific benefits', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.lihtc.benefits.reducedRent')).toBeInTheDocument();
    expect(screen.getByText('results.lihtc.benefits.qualityHousing')).toBeInTheDocument();
    expect(screen.getByText('results.lihtc.benefits.locationChoice')).toBeInTheDocument();
    expect(screen.getByText('results.lihtc.benefits.longTermStability')).toBeInTheDocument();
  });

  it('shows housing-specific requirements', () => {
    renderWithDialog({
      programName: 'LIHTC',
      status: 'qualified',
      explanation: mockExplanation,
      userProfile: mockUserProfile,
      onClose: mockOnClose,
    });

    expect(screen.getByText('results.lihtc.requirements.familySize')).toBeInTheDocument();
    expect(screen.getByText('results.lihtc.requirements.backgroundCheck')).toBeInTheDocument();
    expect(screen.getByText('results.lihtc.requirements.rentalHistory')).toBeInTheDocument();
  });
});

