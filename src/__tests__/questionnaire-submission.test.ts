import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import the handler factory after we set up mocks
vi.mock('../utils/initializeApp', () => ({ initializeApp: vi.fn().mockResolvedValue(undefined) }));

// We'll rely on the shared test setup's mock for `../db/utils` and override createUserProfile in tests when needed
import { createUserProfile } from '../db/utils';

// Mock rules evaluation to return 5 crafted program results
const makeEvalResult = (programId: string, opts: Partial<any>) => ({
  profileId: 'test-profile-123',
  programId,
  ruleId: opts.ruleId ?? `${programId}-rule`,
  eligible: opts.eligible ?? false,
  confidence: opts.confidence ?? 50,
  incomplete: opts.incomplete ?? false,
  reason: opts.reason ?? '',
  evaluatedAt: Date.now(),
  requiredDocuments: opts.requiredDocuments ?? [],
  nextSteps: opts.nextSteps ?? [],
  criteriaResults: opts.criteriaResults ?? [],
  ruleVersion: '1.0.0',
  estimatedBenefit: opts.estimatedBenefit,
});

// We'll stub rule evaluation functions in the per-test setup below to avoid clashing with shared test setup

import { createQuestionnaireHandlers } from '../App/handlers/questionnaireHandlers';

describe('Questionnaire submission flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    // Ensure createUserProfile resolves to a usable profile object for each test
    if (vi.isMockFunction(createUserProfile)) {
      vi.mocked(createUserProfile).mockImplementation(async (profileData: any) => ({
        id: 'test-profile-123',
        ...profileData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any));
    }
  });

  beforeEach(async () => {
    // Stub rules functions used by handler to return our controlled batch result
    const rules = await import('../rules');
    // Always spy and mock implementations so tests don't invoke real rule evaluation
    vi.spyOn(rules as any, 'evaluateAllPrograms').mockImplementation(async () => {
      const programResults = new Map<string, any>();
      programResults.set('snap-federal', makeEvalResult('snap-federal', { eligible: false, confidence: 60 }));
      programResults.set('medicaid-ga', makeEvalResult('medicaid-ga', { eligible: false, confidence: 65 }));
      programResults.set('housing-local', makeEvalResult('housing-local', { eligible: false, confidence: 50, incomplete: true }));
      programResults.set('wic-federal', makeEvalResult('wic-federal', { eligible: false, confidence: 95, reason: 'not pregnant or no children' }));
      programResults.set('ssi-federal', makeEvalResult('ssi-federal', { eligible: false, confidence: 90, reason: 'no disability' }));
      return { profileId: 'test-profile-123', programResults };
    });

    vi.spyOn(rules as any, 'getAllProgramRuleIds').mockResolvedValue([]);
    vi.spyOn(rules as any, 'importRulesDynamically').mockResolvedValue({ success: true, imported: 0, errors: [], loadTime: 0 });
  });

  it('categorizes five program results into maybe (3) and notQualified (2)', async () => {
    const setIsProcessingResults = vi.fn();
    const setAnnouncementMessage = vi.fn();
    const setErrorMessage = vi.fn();
    const setAppState = vi.fn();
    const setCurrentUserProfile = vi.fn();
    const setCurrentResults = vi.fn();
    const setHasResults = vi.fn();
    const saveResults = vi.fn().mockResolvedValue(undefined);

    const { handleCompleteQuestionnaire } = createQuestionnaireHandlers(
      setIsProcessingResults,
      setAnnouncementMessage,
      setErrorMessage,
      setAppState,
      setCurrentUserProfile,
      setCurrentResults,
      setHasResults,
      saveResults
    );

    // Answers based on provided screenshot
    const answers = {
      householdSize: '1',
      incomePeriod: 'monthly',
      householdIncome: 0,
      dateOfBirth: '1996-01-07',
      citizenship: 'us_citizen',
      employmentStatus: 'unemployed',
      state: 'GA',
      county: 'Cobb',
      hasQualifyingDisability: false,
      isPregnant: false,
      hasChildren: false,
      incomeVerification: 'other',
    } as Record<string, unknown>;

    await handleCompleteQuestionnaire(answers);

    // Expect results saved and set on state
    expect(saveResults).toHaveBeenCalled();
    expect(setCurrentResults).toHaveBeenCalled();
    expect(setHasResults).toHaveBeenCalledWith(true);
    expect(setAppState).toHaveBeenCalledWith('results');

    // Inspect the saved results payload
    const savedArg = saveResults.mock.calls[0][0];
    expect(savedArg).toBeTruthy();
    const results = savedArg.results;
    expect(results.totalPrograms).toBe(5);
    expect(results.maybe.length).toBe(3);
    expect(results.notQualified.length).toBe(2);

    // Verify SSI is not-qualified due to missing disability/elderly/blind flags
    const ssiEntry = results.notQualified.find((r: any) => r.programId === 'ssi-federal');
    expect(ssiEntry).toBeTruthy();
    expect(ssiEntry.explanation.reason.toLowerCase()).toContain('no disability');
  });

  it('marks SSI as qualified when evaluation returns eligible true (sanity)', async () => {
    // Override evaluateAllPrograms to return an SSI-eligible result for this run
    const rules = await import('../rules');
    const evalMock = vi.mocked(rules.evaluateAllPrograms as any);
    evalMock.mockImplementationOnce(() => Promise.resolve({
      profileId: 'test-profile-123',
      programResults: new Map([['ssi-federal', makeEvalResult('ssi-federal', { eligible: true, confidence: 95 })]])
    }));

    const setIsProcessingResults = vi.fn();
    const setAnnouncementMessage = vi.fn();
    const setErrorMessage = vi.fn();
    const setAppState = vi.fn();
    const setCurrentUserProfile = vi.fn();
    const setCurrentResults = vi.fn();
    const setHasResults = vi.fn();
    const saveResults = vi.fn().mockResolvedValue(undefined);

    const { handleCompleteQuestionnaire } = createQuestionnaireHandlers(
      setIsProcessingResults,
      setAnnouncementMessage,
      setErrorMessage,
      setAppState,
      setCurrentUserProfile,
      setCurrentResults,
      setHasResults,
      saveResults
    );

    const answers = {
      householdSize: '1',
      incomePeriod: 'monthly',
      householdIncome: 0,
      dateOfBirth: '1996-01-07',
      citizenship: 'us_citizen',
      employmentStatus: 'unemployed',
      state: 'GA',
      county: 'Cobb',
      hasQualifyingDisability: false,
      isPregnant: false,
      hasChildren: false,
      incomeVerification: 'other',
    } as Record<string, unknown>;

    await handleCompleteQuestionnaire(answers);

    expect(saveResults).toHaveBeenCalled();
    const saved = saveResults.mock.calls[0][0].results;
    expect(saved.totalPrograms).toBe(1);
    expect(saved.qualified.length).toBe(1);
    expect(saved.qualified[0].programId).toBe('ssi-federal');
  });
});
