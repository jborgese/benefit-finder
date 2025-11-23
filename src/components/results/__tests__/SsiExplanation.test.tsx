import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Dialog from '@radix-ui/react-dialog';
import { SsiExplanation } from '../SsiExplanation';
import { EligibilityStatus } from '../types';

// Mock the i18n hook
vi.mock('../../i18n/hooks', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations = new Map<string, string>([
        ['results.ssi.statusMessages.qualified', 'You are eligible for SSI! You can receive monthly cash assistance and other benefits.'],
        ['results.ssi.statusMessages.likely', 'You appear to be eligible for SSI. Contact Social Security to confirm and apply.'],
        ['results.ssi.statusMessages.maybe', 'You may be eligible for SSI. Contact Social Security to discuss your situation.'],
        ['results.ssi.statusMessages.unlikely', 'You may not currently qualify for SSI, but eligibility can change. Contact Social Security to discuss.'],
        ['results.ssi.statusMessages.notQualified', 'You may not currently qualify for SSI. Contact Social Security to discuss your situation and see if you qualify.'],
        ['results.ssi.benefits.title', 'What SSI provides:'],
        ['results.ssi.benefits.monthlyCash', 'Monthly cash assistance (up to $943 for individuals, $1,415 for couples in 2024)'],
        ['results.ssi.benefits.medicaid', 'Automatic Medicaid eligibility in most states'],
        ['results.ssi.benefits.snap', 'Automatic SNAP eligibility in most states'],
        ['results.ssi.benefits.housing', 'Housing assistance and rent subsidies'],
        ['results.ssi.benefits.workIncentives', 'Work incentives and employment support programs'],
        ['results.ssi.benefits.elderly', 'Additional benefits for elderly recipients'],
        ['results.ssi.benefits.disability', 'Disability-specific services and supports'],
        ['results.ssi.requirements.title', 'SSI requirements:'],
        ['results.ssi.requirements.age', 'Must be 65 or older, OR blind, OR disabled'],
        ['results.ssi.requirements.disability', 'Must have a qualifying disability (if under 65 and not blind)'],
        ['results.ssi.requirements.income', 'Must have limited income (varies by state and living situation)'],
        ['results.ssi.requirements.assets', 'Must have limited resources (under $2,000 for individuals, $3,000 for couples)'],
        ['results.ssi.requirements.citizenship', 'Must be a U.S. citizen or qualified immigrant'],
        ['results.ssi.requirements.residence', 'Must live in the United States or Northern Mariana Islands'],
        ['results.ssi.nextSteps.title', 'Next steps:'],
        ['results.ssi.nextSteps.contact', 'Contact Social Security at 1-800-772-1213 or visit ssa.gov'],
        ['results.ssi.nextSteps.gather', 'Gather required documents (birth certificate, medical records, financial statements)'],
        ['results.ssi.nextSteps.apply', 'Apply online at ssa.gov or visit your local Social Security office'],
        ['results.ssi.nextSteps.urgent', 'Apply as soon as possible - benefits are not retroactive'],
        ['results.ssi.nextSteps.review', 'Review your situation with a Social Security representative'],
        ['results.ssi.howToApply.title', 'How to apply for SSI:'],
        ['results.ssi.howToApply.step1', 'Contact Social Security at 1-800-772-1213 or visit ssa.gov'],
        ['results.ssi.howToApply.step2', 'Schedule an appointment at your local Social Security office'],
        ['results.ssi.howToApply.step3', 'Gather required documents (birth certificate, medical records, financial statements)'],
        ['results.ssi.howToApply.step4', 'Complete the SSI application with a Social Security representative'],
        ['results.ssi.howToApply.step5', 'Wait for a decision (usually 3-5 months)'],
        ['results.ssi.resources.title', 'Additional resources:'],
        ['results.ssi.resources.website', 'SSI website: ssa.gov/ssi'],
        ['results.ssi.resources.hotline', 'Social Security hotline: 1-800-772-1213'],
        ['results.ssi.resources.localOffice', 'Find your local Social Security office at ssa.gov/locator'],
        ['results.ssi.resources.advocacy', 'Get help from disability advocacy organizations']
      ]);
      return translations.get(key) ?? key;
    }
  })
}));

// Helper function to render with Dialog context
const renderWithDialog = (component: React.ReactElement): ReturnType<typeof render> => {
  return render(
    <Dialog.Root open>
      <Dialog.Content>
        {component}
      </Dialog.Content>
    </Dialog.Root>
  );
};

describe('SsiExplanation', () => {
  const mockOnClose = vi.fn();
  const mockUserProfile = {
    age: 67,
    disability: true,
    income: 800,
    assets: 1500,
    state: 'CA'
  };

  const mockExplanation = {
    reasoning: 'Based on your age and income, you appear to be eligible for SSI.',
    confidence: 0.85,
    factors: [
      { factor: 'age', value: 67, weight: 0.3 },
      { factor: 'income', value: 800, weight: 0.4 },
      { factor: 'assets', value: 1500, weight: 0.3 }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithDialog(
      <SsiExplanation
        programName="SSI"
        status="qualified"
        explanation={mockExplanation}
        userProfile={mockUserProfile}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Why this result?')).toBeInTheDocument();
  });

  it('displays the program name', () => {
    renderWithDialog(
      <SsiExplanation
        programName="SSI"
        status="qualified"
        explanation={mockExplanation}
        userProfile={mockUserProfile}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('SSI')).toBeInTheDocument();
  });

  it('shows the status badge', () => {
    renderWithDialog(
      <SsiExplanation
        programName="SSI"
        status="qualified"
        explanation={mockExplanation}
        userProfile={mockUserProfile}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('qualified')).toBeInTheDocument();
    expect(screen.getByText('results.ssi.statusMessages.qualified')).toBeInTheDocument();
  });

  it('displays benefits section', () => {
    renderWithDialog(
      <SsiExplanation
        programName="SSI"
        status="qualified"
        explanation={mockExplanation}
        userProfile={mockUserProfile}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('results.ssi.benefits.title')).toBeInTheDocument();
    expect(screen.getByText('results.ssi.benefits.monthlyCash')).toBeInTheDocument();
  });

  it('displays requirements section', () => {
    renderWithDialog(
      <SsiExplanation
        programName="SSI"
        status="qualified"
        explanation={mockExplanation}
        userProfile={mockUserProfile}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('results.ssi.requirements.title')).toBeInTheDocument();
    expect(screen.getByText('results.ssi.requirements.age')).toBeInTheDocument();
  });

  it('displays next steps section', () => {
    renderWithDialog(
      <SsiExplanation
        programName="SSI"
        status="qualified"
        explanation={mockExplanation}
        userProfile={mockUserProfile}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('results.ssi.nextSteps.title')).toBeInTheDocument();
    expect(screen.getByText('results.ssi.nextSteps.contact')).toBeInTheDocument();
  });

  it('displays how to apply section', () => {
    renderWithDialog(
      <SsiExplanation
        programName="SSI"
        status="qualified"
        explanation={mockExplanation}
        userProfile={mockUserProfile}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('results.ssi.howToApply.title')).toBeInTheDocument();
    expect(screen.getByText('results.ssi.howToApply.step1')).toBeInTheDocument();
  });

  it('displays resources section', () => {
    renderWithDialog(
      <SsiExplanation
        programName="SSI"
        status="qualified"
        explanation={mockExplanation}
        userProfile={mockUserProfile}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('results.ssi.resources.title')).toBeInTheDocument();
    expect(screen.getByText(/results\.ssi\.resources\.website/)).toBeInTheDocument();
  });

  it('shows privacy note', () => {
    renderWithDialog(
      <SsiExplanation
        programName="SSI"
        status="qualified"
        explanation={mockExplanation}
        userProfile={mockUserProfile}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Privacy Note:')).toBeInTheDocument();
    expect(screen.getByText(/All eligibility calculations happen locally on your device/)).toBeInTheDocument();
  });

  it('has accessible close button', () => {
    renderWithDialog(
      <SsiExplanation
        programName="SSI"
        status="qualified"
        explanation={mockExplanation}
        userProfile={mockUserProfile}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close explanation');
    expect(closeButton).toBeInTheDocument();
  });

  it('handles different status types', () => {
    const statuses: EligibilityStatus[] = ['qualified', 'likely', 'maybe', 'unlikely', 'not-qualified'];

    statuses.forEach(status => {
      const { unmount } = renderWithDialog(
        <SsiExplanation
          programName="SSI"
          status={status}
          explanation={mockExplanation}
          userProfile={mockUserProfile}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(status.replace('-', ' '))).toBeInTheDocument();
      unmount();
    });
  });

  it('adapts content based on user profile', () => {
    const elderlyProfile = { ...mockUserProfile, age: 70 };

    renderWithDialog(
      <SsiExplanation
        programName="SSI"
        status="qualified"
        explanation={mockExplanation}
        userProfile={elderlyProfile}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('results.ssi.benefits.elderly')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    renderWithDialog(
      <SsiExplanation
        programName="SSI"
        status="qualified"
        explanation={mockExplanation}
        userProfile={mockUserProfile}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close explanation');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('has proper ARIA labels', () => {
    renderWithDialog(
      <SsiExplanation
        programName="SSI"
        status="qualified"
        explanation={mockExplanation}
        userProfile={mockUserProfile}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByLabelText('Close explanation')).toBeInTheDocument();
  });

  it('shows status-specific messaging', () => {
    renderWithDialog(
      <SsiExplanation
        programName="SSI"
        status="likely"
        explanation={mockExplanation}
        userProfile={mockUserProfile}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('results.ssi.statusMessages.likely')).toBeInTheDocument();
  });
});
