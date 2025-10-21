import { evaluateRuleWithDetails } from '../rules/core/detailedEvaluator';
import { registerBenefitOperators } from '../rules/core/evaluator';
import type { JsonLogicRule, JsonLogicData } from '../rules/core/types';

// Register custom operators before tests
beforeAll(() => {
  registerBenefitOperators();
});

describe('Detailed Criteria Flow', () => {
  it('should capture detailed comparison data for SNAP income rule', async () => {
    // SNAP income rule structure (from the logs)
    const snapRule: JsonLogicRule = {
      "snap_income_eligible": [
        {
          "var": "householdIncome"
        },
        {
          "var": "householdSize"
        }
      ]
    };

    // Test data that should fail SNAP income test
    const testData: JsonLogicData = {
      householdIncome: 8333,
      householdSize: 1,
      citizenship: "us_citizen"
    };

    // Execute detailed evaluation
    const result = await evaluateRuleWithDetails(snapRule, testData);

    // Verify detailed evaluation captured the data correctly
    console.log('Test result:', result);

    expect(result.success).toBe(true);
    expect(result.result).toBe(false); // Should fail income test
    expect(result.criteriaResults).toBeDefined();
    expect(result.criteriaResults).toHaveLength(2); // Income + household size

    // Verify income comparison
    const incomeResult = result.criteriaResults?.find(cr => cr.criterion === 'householdIncome');
    expect(incomeResult).toBeDefined();
    expect(incomeResult?.met).toBe(false);
    expect(incomeResult?.value).toBe(8333);
    expect(incomeResult?.threshold).toBe(1696); // 1 person * $1696
    expect(incomeResult?.comparison).toContain('$8,333 exceeds the limit of $1,696');

    // Verify household size comparison
    const sizeResult = result.criteriaResults?.find(cr => cr.criterion === 'householdSize');
    expect(sizeResult).toBeDefined();
    expect(sizeResult?.met).toBe(true);
    expect(sizeResult?.value).toBe(1);
    expect(sizeResult?.comparison).toContain('1 person (determines income limit)');

    console.log('Income result:', incomeResult);
    console.log('Size result:', sizeResult);
  });

  it('should capture detailed comparison data for standard operators', async () => {
    // Standard comparison rule (like Medicaid income limit)
    const medicaidRule: JsonLogicRule = {
      "<=": [
        {
          "var": "householdIncome"
        },
        {
          "*": [
            {
              "var": "householdSize"
            },
            2960
          ]
        }
      ]
    };

    const testData: JsonLogicData = {
      householdIncome: 8333,
      householdSize: 1
    };

    const result = await evaluateRuleWithDetails(medicaidRule, testData);

    console.log('Medicaid test result:', result);

    expect(result.success).toBe(true);
    expect(result.result).toBe(false); // Should fail income test
    expect(result.criteriaResults).toBeDefined();
    expect(result.criteriaResults).toHaveLength(1);

    const incomeResult = result.criteriaResults?.[0];
    expect(incomeResult?.criterion).toBe('householdIncome');
    expect(incomeResult?.met).toBe(false);
    expect(incomeResult?.value).toBe(8333);
    expect(incomeResult?.threshold).toBe(2960); // 1 * 2960
    expect(incomeResult?.comparison).toContain('$8,333 exceeds the limit of $2,960');

    console.log('Medicaid income result:', incomeResult);
  });
});
