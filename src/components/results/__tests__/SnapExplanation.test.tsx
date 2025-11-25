import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SnapExplanation } from '../SnapExplanation';

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

function renderSnap(status: any, profile: any = baseProfile, onClose = vi.fn()) {
  return render(
    <SnapExplanation
      programName="SNAP"
      status={status}
      explanation={explanationStub}
      userProfile={profile}
      onClose={onClose}
    />
  );
}

describe('SnapExplanation', () => {
  it('renders qualified status with correct badge and next steps (no extras)', () => {
    renderSnap('qualified');
    expect(screen.getByText('qualified')).toBeInTheDocument();
    // Icon ✅ and color class
    const badge = screen.getByText('qualified').closest('div')!.parentElement!.parentElement!;
    expect(badge.className).toMatch(/bg-green-50/);
    expect(screen.getByText('✅')).toBeInTheDocument();
    // Next steps list includes base steps and ebtCard
    const nextStepsHeader = screen.getByText('results.snap.nextSteps.title');
    const list = nextStepsHeader.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const items = within(list!).getAllByRole('listitem');
    const texts = items.map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.snap.nextSteps.contact'))).toBe(true);
    expect(texts.some(t => t.includes('results.snap.nextSteps.ebtCard'))).toBe(true);
    expect(texts.some(t => t.includes('results.snap.additionalSteps.prenatalNutrition'))).toBe(false);
    expect(texts.some(t => t.includes('results.snap.additionalSteps.familyNutrition'))).toBe(false);
  });

  it('adds pregnancy and children next steps & benefits when applicable', () => {
    renderSnap('likely', { ...baseProfile, isPregnant: true, hasChildren: true });
    // Status
    expect(screen.getByText('likely')).toBeInTheDocument();
    // Next steps
    const nextStepsHeader = screen.getByText('results.snap.nextSteps.title');
    const list = nextStepsHeader.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const items = within(list!).getAllByRole('listitem');
    const texts = items.map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.snap.additionalSteps.prenatalNutrition'))).toBe(true);
    expect(texts.some(t => t.includes('results.snap.additionalSteps.familyNutrition'))).toBe(true);
    // Benefits include pregnancy and children extras
    const benefitsHeader = screen.getByText('results.snap.benefits.title');
    const benefitsList = benefitsHeader.parentElement?.querySelector('ul');
    expect(benefitsList).not.toBeNull();
    const benefitItems = within(benefitsList!).getAllByRole('listitem');
    const benefitTexts = benefitItems.map(li => li.textContent || '');
    expect(benefitTexts.some(t => t.includes('Nutrition education for pregnant women'))).toBe(true);
    expect(benefitTexts.some(t => t.includes('Prenatal nutrition counseling'))).toBe(true);
    expect(benefitTexts.some(t => t.includes("Nutrition education for families with children"))).toBe(true);
    expect(benefitTexts.some(t => t.includes("Children's nutrition programs"))).toBe(true);
  });

  it('renders maybe status with expected icon and alternative steps', () => {
    renderSnap('maybe');
    expect(screen.getByText('maybe')).toBeInTheDocument();
    expect(screen.getByText('❓')).toBeInTheDocument();
    const nextStepsHeader = screen.getByText('results.snap.nextSteps.title');
    const list = nextStepsHeader.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const texts = within(list!).getAllByRole('listitem').map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.snap.additionalSteps.alternativeFood'))).toBe(true);
    expect(texts.some(t => t.includes('Check back if your situation changes'))).toBe(true);
  });

  it('renders unlikely status with expected icon and steps', () => {
    renderSnap('unlikely');
    expect(screen.getByText('unlikely')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    const nextStepsHeaderUnlikely = screen.getByText('results.snap.nextSteps.title');
    const list = nextStepsHeaderUnlikely.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const texts = within(list!).getAllByRole('listitem').map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.snap.additionalSteps.alternativeFood'))).toBe(true);
  });

  it('renders not-qualified with pregnancy message extension', () => {
    renderSnap('not-qualified', { ...baseProfile, isPregnant: true });
    const statusPara = screen.getByText(/Contact your local SNAP office to discuss your pregnancy/);
    expect(statusPara).toBeInTheDocument();
    // Steps include otherFood and reapply guidance
    const nextStepsHeaderNotQualifiedPregnancy = screen.getByText('results.snap.nextSteps.title');
    const list = nextStepsHeaderNotQualifiedPregnancy.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const texts = within(list!).getAllByRole('listitem').map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.snap.additionalSteps.otherFood'))).toBe(true);
    expect(texts.some(t => t.includes('Consider reapplying if your situation changes'))).toBe(true);
  });

  it('renders not-qualified with children message extension', () => {
    renderSnap('not-qualified', { ...baseProfile, hasChildren: true });
    const statusPara = screen.getByText(/Contact your local SNAP office to discuss your children/);
    expect(statusPara).toBeInTheDocument();
    const nextStepsHeaderNotQualifiedChildren = screen.getByText('results.snap.nextSteps.title');
    const list = nextStepsHeaderNotQualifiedChildren.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const texts = within(list!).getAllByRole('listitem').map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.snap.additionalSteps.otherFood'))).toBe(true);
  });

  it('renders default message for unknown status', () => {
    renderSnap('mystery-status');
    expect(screen.getByText('mystery status')).toBeInTheDocument();
    expect(screen.getByText('Contact your local SNAP office to discuss your eligibility.')).toBeInTheDocument();
  });

  it('lists requirements always', () => {
    renderSnap('qualified');
    const reqHeader = screen.getByText('results.snap.requirements.title');
    const list = reqHeader.parentElement?.querySelector('ul');
    expect(list).not.toBeNull();
    const reqItems = within(list!).getAllByRole('listitem');
    const texts = reqItems.map(li => li.textContent || '');
    expect(texts.some(t => t.includes('results.snap.requirements.citizenship'))).toBe(true);
    expect(texts.some(t => t.includes('results.snap.requirements.work'))).toBe(true);
  });

  it('renders SpecificReasonsSection with correct props', () => {
    renderSnap('maybe', { ...baseProfile, isPregnant: true });
    const reasons = screen.getByTestId('specific-reasons');
    expect(reasons.getAttribute('data-program')).toBe('snap-federal');
    expect(reasons.getAttribute('data-status')).toBe('maybe');
  });

  it('triggers onClose when Close button clicked', () => {
    const onClose = vi.fn();
    renderSnap('qualified', baseProfile, onClose);
    const closeBtn = screen.getByRole('button', { name: 'Close' });
    closeBtn.click();
    expect(onClose).toHaveBeenCalled();
  });
});
