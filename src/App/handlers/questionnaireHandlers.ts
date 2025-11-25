/**
 * Questionnaire completion handler
 * Processes questionnaire answers and evaluates eligibility
 */

import type { AppState } from '../types';
import type { EligibilityResults } from '../../components/results';
import { initializeApp } from '../../utils/initializeApp';
import { createUserProfile } from '../../db/utils';
import { evaluateAllPrograms, getAllProgramRuleIds } from '../../rules';
import {
  convertAnswersToProfileData,
  importRulesWithLogging,
  createResultFromEvaluation,
  categorizeResults,
} from '../utils';

export function createQuestionnaireHandlers(
  setIsProcessingResults: (processing: boolean) => void,
  setAnnouncementMessage: (message: string) => void,
  setErrorMessage: (message: string) => void,
  setAppState: (state: AppState) => void,
  setCurrentUserProfile: (profile: { state?: string; [key: string]: unknown } | null) => void,
  setCurrentResults: (results: EligibilityResults | null) => void,
  setHasResults: (hasResults: boolean) => void,
  saveResults: (params: { results: EligibilityResults }) => Promise<void>
) {
  const handleCompleteQuestionnaire = async (answers: Record<string, unknown>): Promise<void> => {
    console.log('🔍 [DEBUG] handleCompleteQuestionnaire: Function called with answers:', answers);

    setIsProcessingResults(true);
    setAnnouncementMessage('Assessment completed. Preparing results...');

    try {
      await initializeApp();
    } catch (dbError) {
      console.error('Database initialization failed:', dbError);
      setErrorMessage('Unable to initialize the application database. Please try refreshing the page or contact support if the issue persists.');
      setIsProcessingResults(false);
      setAppState('error');
      return;
    }

    try {
      const { profileData, userProfile } = convertAnswersToProfileData(answers);
      const { state } = profileData;

      let profile;
      let batchResult;

      try {
        console.log('🔍 [DEBUG] handleCompleteQuestionnaire: Creating user profile with data:', profileData);
        profile = await createUserProfile(profileData);
        console.log('🔍 [DEBUG] handleCompleteQuestionnaire: User profile created successfully:', {
          id: profile.id,
          householdIncome: profile.householdIncome,
          householdSize: profile.householdSize,
          state: profile.state
        });

        if (import.meta.env.DEV) {
          console.warn(`🔍 [SNAP DEBUG] User profile created:`);
          console.warn(`  - Profile ID: ${profile.id}`);
          console.warn(`  - Household Income: $${profile.householdIncome?.toLocaleString()}/year`);
          console.warn(`  - Household Size: ${profile.householdSize}`);
          console.warn(`  - Income Period: ${profileData.incomePeriod}`);
          console.warn(`  - State: ${profile.state}`);
          console.warn(`  - Citizenship: ${profile.citizenship}`);
        }

        setCurrentUserProfile({ ...userProfile });
        await importRulesWithLogging(state);

        console.log('🔍 [DEBUG] handleCompleteQuestionnaire: About to evaluate all programs for profile:', profile.id);
        batchResult = await evaluateAllPrograms(profile.id);
        console.log('🔍 [DEBUG] handleCompleteQuestionnaire: Program evaluation completed');
      } catch (dbError) {
        console.error('[TEST DEBUG] Database operations failed:', dbError);
        setErrorMessage('Unable to calculate eligibility results at this time. Please try refreshing the page or contact support if the issue persists.');
        setIsProcessingResults(false);
        setAppState('error');
        return;
      }

      console.log('[DEBUG] App.tsx - batchResult', batchResult);

      const evaluationResults = Array.from(batchResult.programResults.values());
      console.log('[DEBUG] App.tsx - evaluationResults', evaluationResults);

      if (import.meta.env.DEV) {
        const snapResults = evaluationResults.filter(result => result.programId.includes('snap'));
        if (snapResults.length > 0) {
          console.warn(`🔍 [SNAP DEBUG] Evaluation results for SNAP:`);
          snapResults.forEach(result => {
            console.warn(`  - Program ID: ${result.programId}`);
            console.warn(`  - Eligible: ${result.eligible}`);
            console.warn(`  - Confidence: ${result.confidence}`);
            console.warn(`  - Reason: ${result.reason}`);
          });
        } else {
          console.warn(`🔍 [SNAP DEBUG] No SNAP results found in evaluation`);
        }
      }

      const programRulesMap = new Map<string, string[]>();
      for (const result of evaluationResults) {
        if (!programRulesMap.has(result.programId)) {
          const allRules = await getAllProgramRuleIds(result.programId);
          programRulesMap.set(result.programId, allRules);
        }
      }
      console.log('[DEBUG] App.tsx - programRulesMap', programRulesMap);

      const { qualified, maybe, incomeHardStops, notQualified } = categorizeResults(evaluationResults);

      const qualifiedResults = qualified.map((result) => ({
        ...createResultFromEvaluation(result, programRulesMap),
        status: 'qualified' as const,
        confidence: result.confidence > 80 ? 'high' as const : 'medium' as const,
      }));

      const maybeResults = maybe.map((result) => ({
        ...createResultFromEvaluation(result, programRulesMap),
        status: 'maybe' as const,
        confidence: result.confidence < 50 ? 'low' as const : 'medium' as const,
      }));

      const incomeHardStopResults = incomeHardStops.map((result) => ({
        ...createResultFromEvaluation(result, programRulesMap),
        status: 'not-qualified' as const,
        confidence: 'high' as const,
      }));

      const notQualifiedResults = notQualified.map((result) => ({
        ...createResultFromEvaluation(result, programRulesMap),
        status: 'not-qualified' as const,
        confidence: result.confidence >= 90 ? 'high' as const : 'medium' as const,
      }));

      const results = {
        qualified: qualifiedResults,
        likely: [],
        maybe: maybeResults,
        notQualified: [...incomeHardStopResults, ...notQualifiedResults],
        totalPrograms: evaluationResults.length,
        evaluatedAt: new Date()
      };

      console.log('🔍 [UI CATEGORIZATION] Final categorization results:', {
        qualified: qualifiedResults.length,
        maybe: maybeResults.length,
        incomeHardStops: incomeHardStopResults.length,
        notQualified: notQualifiedResults.length,
        totalNotQualified: results.notQualified.length,
        totalPrograms: evaluationResults.length,
      });

      await saveResults({ results });
      setCurrentResults(results);
      setHasResults(true);
      setIsProcessingResults(false);
      setAnnouncementMessage('Results are ready.');
      setAppState('results');
    } catch (error) {
      console.error('Error evaluating eligibility:', error);
      setIsProcessingResults(false);
      setAnnouncementMessage('Error evaluating eligibility. Please try again.');
    }
  };

  return {
    handleCompleteQuestionnaire,
  };
}
