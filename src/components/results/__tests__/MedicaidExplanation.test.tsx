import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MedicaidExplanation } from '../MedicaidExplanation';
import type { EligibilityStatus } from '../types';
import * as Dialog from '@radix-ui/react-dialog';

// Mock SpecificReasonsSection to avoid dependency complexity
vi.mock('../SpecificReasonsSection', () => ({
  SpecificReasonsSection: (props: any) => (
    <div data-testid="specific-reasons-section">Specific Reasons Section - {props.programId}</div>
  )
}));

// Helper to render component inside Dialog root for Radix Title/Close semantics
function renderExplanation(status: EligibilityStatus | string, userProfile: any = {}, explanation: any = {}, onClose: () => void = () => { }) {
  return render(
    <Dialog.Root open>
      <MedicaidExplanation
        programName="Medicaid"
        status={status as EligibilityStatus}
        explanation={explanation}
        userProfile={userProfile}
        onClose={onClose}
      />
    </Dialog.Root>
  );
}

describe('MedicaidExplanation Component', () => {
  afterEach(() => cleanup());

  describe('Status messaging variations', () => {
    it('shows qualified status message', () => {
      renderExplanation('qualified');
      expect(screen.getByText('You are eligible for Medicaid! You can receive comprehensive health coverage.')).toBeInTheDocument();
    });

    it('shows likely status message', () => {
      renderExplanation('likely');
      expect(screen.getByText(/You appear to be eligible for Medicaid/)).toBeInTheDocument();
    });

    it('shows maybe status message', () => {
      renderExplanation('maybe');
      expect(screen.getByText(/You may be eligible for Medicaid/)).toBeInTheDocument();
    });

    it('shows unlikely status message', () => {
      renderExplanation('unlikely');
      expect(screen.getByText(/You may not currently qualify for Medicaid, but eligibility can change/)).toBeInTheDocument();
    });

    it('shows not-qualified with pregnancy extra guidance', () => {
      renderExplanation('not-qualified', { isPregnant: true });
      // Combined string includes base message plus guidance
      expect(screen.getByText(/You may not currently qualify for Medicaid/)).toBeInTheDocument();
      expect(screen.getByText(/pregnancy and health coverage needs/)).toBeInTheDocument();
    });

    it('shows not-qualified with children extra guidance', () => {
      renderExplanation('not-qualified', { hasChildren: true });
      expect(screen.getByText(/You may not currently qualify for Medicaid/)).toBeInTheDocument();
      expect(screen.getByText(/children and health coverage needs/)).toBeInTheDocument();
    });

    it('shows not-qualified with age >= 65 Medicare guidance', () => {
      renderExplanation('not-qualified', { age: 70 });
      expect(screen.getByText(/You may not currently qualify for Medicaid/)).toBeInTheDocument();
      expect(screen.getByText(/eligible for Medicare instead/)).toBeInTheDocument();
    });

    it('shows not-qualified without special profile additions', () => {
      renderExplanation('not-qualified', {});
      const items = screen.getAllByText(/You may not currently qualify for Medicaid/);
      // One inside base message and maybe in other sections, assert at least 1
      expect(items.length).toBeGreaterThanOrEqual(1);
      // Should not include pregnancy/children/medicare phrases
      expect(screen.queryByText(/pregnancy and health/)).toBeNull();
      expect(screen.queryByText(/children and health/)).toBeNull();
      expect(screen.queryByText(/eligible for Medicare instead/)).toBeNull();
    });

    it('shows fallback message for unknown status', () => {
      renderExplanation('unknown-status');
      expect(screen.getByText(/Contact your state Medicaid office to discuss your eligibility/)).toBeInTheDocument();
    });
  });

  describe('Status badge visuals', () => {
    const cases: Array<{ status: EligibilityStatus; icon: string; classFragment: string }> = [
      { status: 'qualified', icon: '✅', classFragment: 'bg-green-50' },
      { status: 'likely', icon: '✔️', classFragment: 'bg-blue-50' },
      { status: 'maybe', icon: '❓', classFragment: 'bg-yellow-50' },
      { status: 'unlikely', icon: '⚠️', classFragment: 'bg-orange-50' },
      { status: 'not-qualified', icon: '❌', classFragment: 'bg-gray-50' }
    ];

    cases.forEach(({ status, icon, classFragment }) => {
      it(`renders correct icon and color for ${status}`, () => {
        renderExplanation(status);
        expect(screen.getByText(icon)).toBeInTheDocument();
        const badge = screen.getByText(status.replace('-', ' ')).closest('div')?.parentElement?.parentElement;
        expect(badge?.className).toContain(classFragment);
      });
    });
  });

  describe('Next steps list', () => {
    it('includes pregnancy and children additional steps when qualified', () => {
      renderExplanation('qualified', { isPregnant: true, hasChildren: true });
      expect(screen.getByText(/Contact your state Medicaid office to apply/)).toBeInTheDocument();
      expect(screen.getByText(/Schedule an appointment with your healthcare provider/)).toBeInTheDocument();
      expect(screen.getByText(/Make sure your children are up to date/)).toBeInTheDocument();
      expect(screen.getByText(/Choose a health plan and enroll/)).toBeInTheDocument();
    });

    it('contains alternative health and check-back message when maybe', () => {
      renderExplanation('maybe');
      expect(screen.getByText(/Consider alternative health coverage options/)).toBeInTheDocument();
      expect(screen.getByText(/Check back if your situation changes/)).toBeInTheDocument();
    });

    it('contains other health and reapply when not-qualified', () => {
      renderExplanation('not-qualified');
      expect(screen.getByText(/Consider other health coverage options available to you/)).toBeInTheDocument();
      expect(screen.getByText(/Consider reapplying if your situation changes/)).toBeInTheDocument();
    });
  });

  describe('Benefit information', () => {
    it('includes base benefit items', () => {
      renderExplanation('qualified');
      expect(screen.getByText(/Comprehensive health insurance coverage/)).toBeInTheDocument();
      expect(screen.getByText(/Doctor visits and specialist care/)).toBeInTheDocument();
      expect(screen.getByText(/Hospital stays and emergency care/)).toBeInTheDocument();
      expect(screen.getByText(/Prescription medications/)).toBeInTheDocument();
      expect(screen.getByText(/Preventive care and screenings/)).toBeInTheDocument();
      expect(screen.getByText(/Mental health and substance abuse treatment/)).toBeInTheDocument();
      expect(screen.getByText(/Dental and vision care/)).toBeInTheDocument();
      expect(screen.getByText(/Transportation to medical appointments/)).toBeInTheDocument();
    });

    it('adds pregnancy-specific benefits', () => {
      renderExplanation('qualified', { isPregnant: true });
      expect(screen.getByText(/Prenatal care and delivery services/)).toBeInTheDocument();
      expect(screen.getByText(/Postpartum care and support/)).toBeInTheDocument();
    });

    it('adds children-specific benefits', () => {
      renderExplanation('qualified', { hasChildren: true });
      expect(screen.getByText(/Children's health services and immunizations/)).toBeInTheDocument();
      expect(screen.getByText(/Pediatric care and specialist services/)).toBeInTheDocument();
    });
  });

  describe('Requirements explanation', () => {
    it('uses pregnancy requirement when pregnant', () => {
      renderExplanation('qualified', { isPregnant: true });
      expect(screen.getByText(/Pregnancy status/)).toBeInTheDocument();
      expect(screen.queryByText(/Children in household/)).toBeNull();
    });

    it('uses children requirement when has children and not pregnant', () => {
      renderExplanation('qualified', { hasChildren: true });
      expect(screen.getByText(/Children in household/)).toBeInTheDocument();
      expect(screen.queryByText(/Pregnancy status/)).toBeNull();
    });

    it('uses age requirement when neither pregnant nor has children', () => {
      renderExplanation('qualified');
      expect(screen.getByText(/Age requirements vary by state/)).toBeInTheDocument();
    });

    it('always includes citizenship, residence, income, disability requirements', () => {
      renderExplanation('qualified');
      expect(screen.getByText(/U\.S\. citizen or qualified immigrant/)).toBeInTheDocument();
      expect(screen.getByText(/Must live in the state where you apply/)).toBeInTheDocument();
      expect(screen.getByText(/Must meet income guidelines/)).toBeInTheDocument();
      expect(screen.getByText(/Disability status/)).toBeInTheDocument();
    });
  });

  describe('Resources & links', () => {
    it('renders Medicaid website link with attributes', () => {
      renderExplanation('qualified');
      const link = screen.getByRole('link', { name: /Visit Medicaid.gov official website/i });
      expect(link).toHaveAttribute('href', 'https://www.medicaid.gov');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });
  });

  describe('Close interactions', () => {
    it('invokes onClose when header close button clicked', () => {
      const onClose = vi.fn();
      renderExplanation('qualified', {}, {}, onClose);
      const closeBtn = screen.getByLabelText('Close explanation');
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('invokes onClose when bottom Close button clicked', () => {
      const onClose = vi.fn();
      renderExplanation('qualified', {}, {}, onClose);
      const btn = screen.getByRole('button', { name: 'Close' });
      fireEvent.click(btn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Structure basics', () => {
    it('renders section titles and specific reasons section', () => {
      renderExplanation('qualified');
      expect(screen.getByText('Why this result?')).toBeInTheDocument();
      expect(screen.getByTestId('specific-reasons-section')).toBeInTheDocument();
      expect(screen.getByText('What Medicaid provides:')).toBeInTheDocument();
      expect(screen.getByText('Medicaid requirements:')).toBeInTheDocument();
      expect(screen.getByText('Next steps:')).toBeInTheDocument();
      expect(screen.getByText('How to apply for Medicaid:')).toBeInTheDocument();
      expect(screen.getByText('Additional resources:')).toBeInTheDocument();
    });

    it('includes privacy note text', () => {
      renderExplanation('qualified');
      expect(screen.getByText(/Privacy Note:/)).toBeInTheDocument();
      expect(screen.getByText(/eligibility calculations happen locally/)).toBeInTheDocument();
    });
  });
});
