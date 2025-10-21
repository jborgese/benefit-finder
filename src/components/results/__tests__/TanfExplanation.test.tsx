/**
 * TANF Explanation Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import * as Dialog from '@radix-ui/react-dialog';
import { TanfExplanation } from '../TanfExplanation';
import { EligibilityStatus, EligibilityExplanation } from '../types';

// Mock the i18n hook
vi.mock('../../../i18n/hooks', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'results.tanf.benefits.title': 'What TANF provides:',
        'results.tanf.benefits.cashAssistance': 'Temporary cash assistance for families with children',
        'results.tanf.benefits.familySupport': 'Family support services and case management',
        'results.tanf.benefits.childcare': 'Childcare assistance for work or education',
        'results.tanf.requirements.title': 'TANF requirements:',
        'results.tanf.requirements.citizenship': 'Must be a U.S. citizen or qualified immigrant',
        'results.tanf.requirements.residence': 'Must live in the state where you apply',
        'results.tanf.requirements.income': 'Must meet income guidelines (varies by state and household size)',
        'results.tanf.requirements.children': 'Must have children under 18 (or 19 if still in high school)',
        'results.tanf.nextSteps.title': 'Next steps:',
        'results.tanf.nextSteps.contact': 'Contact your local TANF office to apply',
        'results.tanf.nextSteps.schedule': 'Schedule an appointment for application and interview',
        'results.tanf.nextSteps.documents': 'Gather required documents (ID, proof of income, proof of children)',
        'results.tanf.howToApply.title': 'How to apply for TANF:',
        'results.tanf.howToApply.findOffice': 'Find your local TANF office or apply online',
        'results.tanf.howToApply.schedule': 'Schedule an appointment for application and interview',
        'results.tanf.howToApply.bringDocuments': 'Bring required documents (ID, proof of income, proof of children)',
        'results.tanf.howToApply.interview': 'Complete application and participate in interview',
        'results.tanf.howToApply.workPlan': 'Develop and agree to work plan and requirements',
        'results.tanf.howToApply.receiveBenefits': 'Receive benefits and participate in required activities',
        'results.tanf.resources.title': 'Additional resources:',
        'results.tanf.resources.website': 'TANF website: acf.hhs.gov/ofa',
        'results.tanf.resources.hotline': 'TANF hotline: Contact your local office for assistance',
        'results.tanf.resources.workServices': 'Work support services and job training programs',
        'results.tanf.resources.childcare': 'Childcare assistance programs',
        'results.tanf.resources.statePrograms': 'State-specific TANF programs and services'
      };
      return translations[key] || key;
    }
  })
}));

describe('TanfExplanation', () => {
  const mockExplanation: EligibilityExplanation = {
    criteria: [],
    reasoning: 'Test reasoning',
    confidence: 0.8
  };

  const defaultProps = {
    programName: 'TANF',
    status: 'qualified' as EligibilityStatus,
    explanation: mockExplanation,
    userProfile: {
      hasChildren: true,
      householdSize: 3,
      householdIncome: 2500
    },
    onClose: vi.fn()
  };

  // Helper function to render component with Dialog context
  const renderWithDialog = (props = defaultProps): ReturnType<typeof render> => {
    return render(
      <Dialog.Root open>
        <Dialog.Content>
          <TanfExplanation {...props} />
        </Dialog.Content>
      </Dialog.Root>
    );
  };

  it('renders without crashing', () => {
    renderWithDialog();
    expect(screen.getByText('Why this result?')).toBeInTheDocument();
  });

  it('displays program name', () => {
    renderWithDialog();
    expect(screen.getByText('TANF')).toBeInTheDocument();
  });

  it('shows status badge for qualified status', () => {
    renderWithDialog();
    expect(screen.getByText('qualified')).toBeInTheDocument();
  });

  it('displays benefits section', () => {
    renderWithDialog();
    expect(screen.getByText('What TANF provides:')).toBeInTheDocument();
  });

  it('displays requirements section', () => {
    renderWithDialog();
    expect(screen.getByText('TANF requirements:')).toBeInTheDocument();
  });

  it('displays next steps section', () => {
    renderWithDialog();
    expect(screen.getByText('Next steps:')).toBeInTheDocument();
  });

  it('displays how to apply section', () => {
    renderWithDialog();
    expect(screen.getByText('How to apply for TANF:')).toBeInTheDocument();
  });

  it('displays additional resources section', () => {
    renderWithDialog();
    expect(screen.getByText('Additional resources:')).toBeInTheDocument();
  });

  it('shows privacy note', () => {
    renderWithDialog();
    expect(screen.getByText(/Privacy Note:/)).toBeInTheDocument();
  });

  it('has accessible close button', () => {
    renderWithDialog();
    const closeButton = screen.getByLabelText('Close explanation');
    expect(closeButton).toBeInTheDocument();
  });

  it('handles different status types', () => {
    const { rerender } = renderWithDialog();
    expect(screen.getByText('qualified')).toBeInTheDocument();

    rerender(
      <Dialog.Root open>
        <Dialog.Content>
          <TanfExplanation {...defaultProps} status="likely" />
        </Dialog.Content>
      </Dialog.Root>
    );
    expect(screen.getByText('likely')).toBeInTheDocument();

    rerender(
      <Dialog.Root open>
        <Dialog.Content>
          <TanfExplanation {...defaultProps} status="not-qualified" />
        </Dialog.Content>
      </Dialog.Root>
    );
    expect(screen.getByText('not qualified')).toBeInTheDocument();
  });

  it('adapts content based on user profile', () => {
    const propsWithChildren = {
      ...defaultProps,
      userProfile: {
        hasChildren: true,
        householdSize: 4,
        isEmployed: false
      }
    };

    renderWithDialog(propsWithChildren);
    expect(screen.getByText('What TANF provides:')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderWithDialog({ ...defaultProps, onClose });

    const closeButton = screen.getByLabelText('Close explanation');
    closeButton.click();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has proper ARIA labels', () => {
    renderWithDialog();

    const closeButton = screen.getByLabelText('Close explanation');
    expect(closeButton).toBeInTheDocument();
  });

  it('displays status-specific messaging', () => {
    const { rerender } = renderWithDialog();

    // Test qualified status
    expect(screen.getByText('qualified')).toBeInTheDocument();

    // Test not-qualified status
    rerender(
      <Dialog.Root open>
        <Dialog.Content>
          <TanfExplanation {...defaultProps} status="not-qualified" />
        </Dialog.Content>
      </Dialog.Root>
    );
    expect(screen.getByText('not qualified')).toBeInTheDocument();
  });
});
