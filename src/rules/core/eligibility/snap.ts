/**
 * SNAP Rule Verification Helpers
 *
 * Functions for verifying SNAP rule consistency and correctness.
 */

import { getDatabase } from '../../../db/database';

// Global debug log utility
function debugLog(...args: unknown[]): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[SNAP Rules Debug]', ...args);
  }
}

/**
 * Ensure SNAP rules are correct and consistent
 */
export async function ensureSNAPRulesAreCorrect(): Promise<void> {
  debugLog('Verifying SNAP rules consistency.');
  if (import.meta.env.DEV) {
    console.warn('🔍 [DEBUG] ensureSNAPRulesAreCorrect: Checking SNAP rules...');
  }

  const db = getDatabase();

  try {
    // Get SNAP rules from database
    const snapRules = await db.eligibility_rules.findRulesByProgram('snap-federal');
    debugLog('SNAP rules fetched', snapRules.map(r => r.id));

    if (snapRules.length === 0) {
      debugLog('No SNAP rules found.');
      if (import.meta.env.DEV) {
        console.warn('🔍 [DEBUG] ensureSNAPRulesAreCorrect: No SNAP rules found in database');
      }
      return;
    }

    // Check for incorrect logic
    const hasIncorrectRule = snapRules.some(rule => {
      const { ruleLogic } = rule;
      if (typeof ruleLogic !== 'object' || ruleLogic === null || Array.isArray(ruleLogic)) return false;
      const lessOrEqual = ruleLogic['<='];
      if (!Array.isArray(lessOrEqual)) return false;
      const [_incomeVar, thresholdCalc] = lessOrEqual;
      if (thresholdCalc && typeof thresholdCalc === 'object' && thresholdCalc['*']) {
        const [_sizeVar, multiplier] = thresholdCalc['*'];
        if (multiplier === 1500) {
          debugLog('Incorrect SNAP rule logic detected', { ruleId: rule.id });
          return true;
        }
      }
      return false;
    });

    if (hasIncorrectRule) {
      debugLog('Incorrect SNAP rules detected.');
      console.warn('🚨 [WARNING] ensureSNAPRulesAreCorrect: Found SNAP rules with incorrect logic! Rules need to be reloaded.');
      console.warn('🔧 [INFO] To fix this, run: window.clearBenefitFinderDatabase() then refresh the page');
      console.warn('🔧 [INFO] This will clear the database and reload rules from the updated JSON files.');
    } else if (import.meta.env.DEV) {
      debugLog('All SNAP rules appear correct.');
      console.warn('✅ [DEBUG] ensureSNAPRulesAreCorrect: SNAP rules appear to be correct');
    }

    if (import.meta.env.DEV) {
      snapRules.forEach(rule => {
        debugLog('SNAP Rule', rule.id, rule.ruleLogic);
        console.warn(`🔍 [DEBUG] SNAP Rule ${rule.id}:`, {
          name: rule.name,
          ruleLogic: JSON.stringify(rule.ruleLogic, null, 2),
          priority: rule.priority,
          active: rule.active
        });
      });
    }

  } catch (error) {
    debugLog('Error occurred during SNAP rule verification', error);
    console.error('🚨 [ERROR] ensureSNAPRulesAreCorrect: Failed to check SNAP rules:', error);
  }
}
