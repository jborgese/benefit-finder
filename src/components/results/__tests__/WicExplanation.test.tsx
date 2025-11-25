import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WicExplanation } from '../WicExplanation';

// Mock i18n hook to return key directly
vi.mock('../../i18n/hooks', () => ({
  useI18n: () => ({ t: (k: string) => k })
}));

// Mock SpecificReasonsSection to avoid complex logic; just verify props
vi.mock('../SpecificReasonsSection', () => ({
  SpecificReasonsSection: (props: any) => (
    <div data-testid="specific-reasons" data-status={props.status} data-program={props.programId} />
  )
}));

const baseProfile = { state: 'CA', householdIncome: 1000, householdSize: 1 };
const explanationStub: any = { eligible: true, criteriaResults: [], reason: 'stub' };

function renderWic(status: any, profile: any = baseProfile, onClose = vi.fn()) {
  return render(
    <WicExplanation
      programName="WIC"
      status={status}
      explanation={explanationStub}
      userProfile={profile}
      onClose={onClose}
    />
  );
}

describe('WicExplanation', () => {
  it('renders qualified status with correct badge and next steps (no extras)', () => {
    renderWic('qualified');
    expect(screen.getByText('qualified')).toBeInTheDocument();
    // Icon ✅ and color class
    const badge = screen.getByText('qualified').closest('div')!.parentElement!.parentElement!;
    expect(badge.className).toMatch(/bg-green-50/);
    expect(screen.getByText('✅')).toBeInTheDocument();
    // Next steps list includes base steps
    const nextStepsHeader = screen.getByText('results.wic.nextSteps.title');
    const list = nextStepsHeader.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const items = within(list!).getAllByRole('listitem');
    const texts = items.map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.wic.nextSteps.contact'))).toBe(true);
    expect(texts.some(t => t.includes('results.wic.nextSteps.schedule'))).toBe(true);
    expect(texts.some(t => t.includes('results.wic.nextSteps.documents'))).toBe(true);
    // No pregnancy or children steps
    expect(texts.some(t => t.includes('results.wic.nextSteps.prenatalCounseling'))).toBe(false);
    expect(texts.some(t => t.includes('results.wic.nextSteps.childGuidance'))).toBe(false);
  });

  it('adds pregnancy next steps & benefits when applicable', () => {
    renderWic('likely', { ...baseProfile, isPregnant: true });
    // Status
    expect(screen.getByText('likely')).toBeInTheDocument();
    expect(screen.getByText('✔️')).toBeInTheDocument();
    // Next steps include prenatal counseling
    const nextStepsHeader = screen.getByText('results.wic.nextSteps.title');
    const list = nextStepsHeader.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const items = within(list!).getAllByRole('listitem');
    const texts = items.map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.wic.nextSteps.prenatalCounseling'))).toBe(true);
    // Benefits include pregnancy-specific
    const benefitsHeader = screen.getByText('results.wic.benefits.title');
    const benefitsList = benefitsHeader.parentElement?.querySelector('ul');
    expect(benefitsList).not.toBeNull();
    const benefitItems = within(benefitsList!).getAllByRole('listitem');
    const benefitTexts = benefitItems.map(li => li.textContent || '');
    expect(benefitTexts.some(t => t.includes('results.wic.benefits.prenatal'))).toBe(true);
    expect(benefitTexts.some(t => t.includes('results.wic.benefits.monthlyFood'))).toBe(true);
  });

  it('adds children next steps & benefits when applicable', () => {
    renderWic('qualified', { ...baseProfile, hasChildren: true });
    // Next steps include child guidance
    const nextStepsHeader = screen.getByText('results.wic.nextSteps.title');
    const list = nextStepsHeader.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const items = within(list!).getAllByRole('listitem');
    const texts = items.map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.wic.nextSteps.childGuidance'))).toBe(true);
    // Benefits include child-specific
    const benefitsHeader = screen.getByText('results.wic.benefits.title');
    const benefitsList = benefitsHeader.parentElement?.querySelector('ul');
    expect(benefitsList).not.toBeNull();
    const benefitItems = within(benefitsList!).getAllByRole('listitem');
    const benefitTexts = benefitItems.map(li => li.textContent || '');
    expect(benefitTexts.some(t => t.includes('results.wic.benefits.childNutrition'))).toBe(true);
    expect(benefitTexts.some(t => t.includes('results.wic.benefits.childFood'))).toBe(true);
  });

  it('renders general benefits when no pregnancy or children', () => {
    renderWic('qualified');
    const benefitsHeader = screen.getByText('results.wic.benefits.title');
    const benefitsList = benefitsHeader.parentElement?.querySelector('ul');
    expect(benefitsList).not.toBeNull();
    const benefitItems = within(benefitsList!).getAllByRole('listitem');
    const benefitTexts = benefitItems.map(li => li.textContent || '');
    expect(benefitTexts.some(t => t.includes('results.wic.benefits.generalNutrition'))).toBe(true);
    expect(benefitTexts.some(t => t.includes('results.wic.benefits.generalFood'))).toBe(true);
    expect(benefitTexts.some(t => t.includes('results.wic.benefits.referrals'))).toBe(true);
  });

  it('renders maybe status with expected icon and alternative steps', () => {
    renderWic('maybe');
    expect(screen.getByText('maybe')).toBeInTheDocument();
    expect(screen.getByText('❓')).toBeInTheDocument();
    const nextStepsHeader = screen.getByText('results.wic.nextSteps.title');
    const list = nextStepsHeader.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const texts = within(list!).getAllByRole('listitem').map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.wic.nextSteps.discuss'))).toBe(true);
    expect(texts.some(t => t.includes('results.wic.nextSteps.alternatives'))).toBe(true);
    expect(texts.some(t => t.includes('results.wic.nextSteps.checkBack'))).toBe(true);
  });

  it('renders unlikely status with expected icon and steps', () => {
    renderWic('unlikely');
    expect(screen.getByText('unlikely')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    const nextStepsHeaderUnlikely = screen.getByText('results.wic.nextSteps.title');
    const list = nextStepsHeaderUnlikely.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const texts = within(list!).getAllByRole('listitem').map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.wic.nextSteps.discuss'))).toBe(true);
    expect(texts.some(t => t.includes('results.wic.nextSteps.alternatives'))).toBe(true);
  });

  it('renders not-qualified with pregnancy message extension', () => {
    renderWic('not-qualified', { ...baseProfile, isPregnant: true });
    const statusPara = screen.getByText(/Contact your local WIC office to discuss your pregnancy/);
    expect(statusPara).toBeInTheDocument();
    // Steps include reapply guidance
    const nextStepsHeaderNotQualifiedPregnancy = screen.getByText('results.wic.nextSteps.title');
    const list = nextStepsHeaderNotQualifiedPregnancy.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const texts = within(list!).getAllByRole('listitem').map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.wic.nextSteps.reapply'))).toBe(true);
  });

  it('renders not-qualified with children message extension', () => {
    renderWic('not-qualified', { ...baseProfile, hasChildren: true });
    const statusPara = screen.getByText(/Contact your local WIC office to discuss your children/);
    expect(statusPara).toBeInTheDocument();
    const nextStepsHeaderNotQualifiedChildren = screen.getByText('results.wic.nextSteps.title');
    const list = nextStepsHeaderNotQualifiedChildren.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const texts = within(list!).getAllByRole('listitem').map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.wic.nextSteps.discuss'))).toBe(true);
  });

  it('renders default message for unknown status', () => {
    renderWic('mystery-status');
    expect(screen.getByText('mystery status')).toBeInTheDocument();
    expect(screen.getByText('Contact your local WIC office to discuss your eligibility.')).toBeInTheDocument();
  });

  it('lists requirements with pregnancy category', () => {
    renderWic('qualified', { ...baseProfile, isPregnant: true });
    const reqHeader = screen.getByText('results.wic.requirements.title');
    const list = reqHeader.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const reqItems = within(list!).getAllByRole('listitem');
    const texts = reqItems.map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.wic.requirements.citizenship'))).toBe(true);
    expect(texts.some(t => t.includes('results.wic.requirements.pregnant'))).toBe(true);
    expect(texts.some(t => t.includes('results.wic.requirements.income'))).toBe(true);
  });

  it('lists requirements with children category', () => {
    renderWic('qualified', { ...baseProfile, hasChildren: true });
    const reqHeader = screen.getByText('results.wic.requirements.title');
    const list = reqHeader.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const reqItems = within(list!).getAllByRole('listitem');
    const texts = reqItems.map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.wic.requirements.children'))).toBe(true);
  });

  it('lists requirements with general category', () => {
    renderWic('qualified');
    const reqHeader = screen.getByText('results.wic.requirements.title');
    const list = reqHeader.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const reqItems = within(list!).getAllByRole('listitem');
    const texts = reqItems.map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.wic.requirements.category'))).toBe(true);
  });

  it('renders SpecificReasonsSection with correct props', () => {
    renderWic('maybe', { ...baseProfile, isPregnant: true });
    const reasons = screen.getByTestId('specific-reasons');
    expect(reasons.getAttribute('data-program')).toBe('wic-federal');
    expect(reasons.getAttribute('data-status')).toBe('maybe');
  });

  it('triggers onClose when Close button clicked', () => {
    const onClose = vi.fn();
    renderWic('qualified', baseProfile, onClose);
    const closeBtn = screen.getByRole('button', { name: 'Close' });
    closeBtn.click();
    expect(onClose).toHaveBeenCalled();
  });
});
