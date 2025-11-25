/**
 * Rule import utilities with logging
 */

import { importRulesDynamically } from '../../rules';

export async function importRulesWithLogging(state?: string): Promise<void> {
  console.log('🔍 [DEBUG] handleCompleteQuestionnaire: Starting dynamic rule import');

  try {
    const result = await importRulesDynamically(state, {
      force: false,
      retryOnFailure: true,
      maxRetries: 2,
      timeout: 15000
    });

    if (result.success) {
      console.log(`✅ [DEBUG] Dynamic rule import completed successfully:`, {
        imported: result.imported,
        loadTime: `${result.loadTime.toFixed(2)}ms`,
        state: state ?? 'federal-only'
      });
    } else {
      console.warn(`⚠️ [DEBUG] Dynamic rule import completed with errors:`, {
        imported: result.imported,
        errors: result.errors,
        loadTime: `${result.loadTime.toFixed(2)}ms`,
        state: state ?? 'federal-only'
      });
    }
  } catch (error) {
    console.error('❌ [DEBUG] Dynamic rule import failed:', error);
    // Don't throw - this shouldn't block the user's experience
  }
}
