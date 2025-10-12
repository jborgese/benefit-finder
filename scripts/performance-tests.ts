/**
 * Performance Testing Script
 *
 * Tests database performance, rule evaluation speed, and component render times
 */

import jsonLogic from 'json-logic-js';
import { nanoid } from 'nanoid';

// ============================================================================
// TYPES
// ============================================================================

interface PerformanceResult {
  name: string;
  avgTime: number;
  minTime: number;
  maxTime: number;
  iterations: number;
  unit: string;
}

// ============================================================================
// RULE EVALUATION PERFORMANCE
// ============================================================================

/**
 * Test rule evaluation performance
 */
async function testRuleEvaluation(): Promise<PerformanceResult[]> {
  console.log('\n📊 Testing Rule Evaluation Performance...\n');

  const results: PerformanceResult[] = [];

  // Simple rule test
  const simpleRule = {
    '<=': [
      { var: 'income' },
      2000
    ]
  };

  const simpleData = { income: 1500 };
  const simpleTimes = await measurePerformance('Simple Rule (income check)', 1000, () => {
    jsonLogic.apply(simpleRule, simpleData);
  });
  results.push(simpleTimes);

  // Complex rule test
  const complexRule = {
    'and': [
      { '<=': [{ var: 'householdIncome' }, { '*': [{ var: 'householdSize' }, 1923] }] },
      { 'in': [{ var: 'citizenship' }, ['us_citizen', 'permanent_resident', 'refugee']] },
      { '<=': [{ var: 'assets' }, 2750] },
      { 'var': 'livesInState' }
    ]
  };

  const complexData = {
    householdIncome: 2000,
    householdSize: 3,
    citizenship: 'us_citizen',
    assets: 2000,
    livesInState: true,
  };

  const complexTimes = await measurePerformance('Complex Rule (SNAP eligibility)', 1000, () => {
    jsonLogic.apply(complexRule, complexData);
  });
  results.push(complexTimes);

  // Multiple rules (typical evaluation)
  const multipleRulesTimes = await measurePerformance('7 Rules (SNAP package)', 100, () => {
    for (let i = 0; i < 7; i++) {
      jsonLogic.apply(complexRule, complexData);
    }
  });
  results.push(multipleRulesTimes);

  return results;
}

// ============================================================================
// DATA GENERATION PERFORMANCE
// ============================================================================

/**
 * Test large dataset generation and handling
 */
async function testDataGeneration(): Promise<PerformanceResult[]> {
  console.log('\n📊 Testing Data Generation Performance...\n');

  const results: PerformanceResult[] = [];

  // Generate small dataset
  const smallDatasetTimes = await measurePerformance('Generate 100 results', 10, () => {
    const results = [];
    for (let i = 0; i < 100; i++) {
      results.push({
        id: nanoid(),
        qualifiedCount: Math.floor(Math.random() * 5),
        totalPrograms: 10,
        evaluatedAt: Date.now(),
        state: 'GA',
      });
    }
    return results;
  });
  results.push(smallDatasetTimes);

  // Generate medium dataset
  const mediumDatasetTimes = await measurePerformance('Generate 1,000 results', 10, () => {
    const results = [];
    for (let i = 0; i < 1000; i++) {
      results.push({
        id: nanoid(),
        qualifiedCount: Math.floor(Math.random() * 5),
        totalPrograms: 10,
        evaluatedAt: Date.now(),
        state: 'GA',
      });
    }
    return results;
  });
  results.push(mediumDatasetTimes);

  return results;
}

// ============================================================================
// JSON OPERATIONS PERFORMANCE
// ============================================================================

/**
 * Test JSON parsing and stringifying (for localStorage/export)
 */
async function testJSONOperations(): Promise<PerformanceResult[]> {
  console.log('\n📊 Testing JSON Operations Performance...\n');

  const results: PerformanceResult[] = [];

  // Create test data
  const testData = {
    results: {
      qualified: Array(5).fill(null).map((_, i) => ({
        programId: `program-${i}`,
        programName: `Program ${i}`,
        status: 'qualified',
        confidence: 'high',
        confidenceScore: 95,
        explanation: { reason: 'Test', details: [], rulesCited: [] },
        requiredDocuments: Array(5).fill(null).map((_, j) => ({
          id: `doc-${j}`,
          name: `Document ${j}`,
          required: true,
        })),
        nextSteps: [],
        evaluatedAt: new Date(),
      })),
      likely: [],
      maybe: [],
      notQualified: [],
      totalPrograms: 5,
      evaluatedAt: new Date(),
    },
  };

  // Test stringify
  const stringifyTimes = await measurePerformance('JSON.stringify (results)', 1000, () => {
    JSON.stringify(testData);
  });
  results.push(stringifyTimes);

  // Test parse
  const jsonString = JSON.stringify(testData);
  const parseTimes = await measurePerformance('JSON.parse (results)', 1000, () => {
    JSON.parse(jsonString);
  });
  results.push(parseTimes);

  return results;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Measure performance of a function over multiple iterations
 */
async function measurePerformance(
  name: string,
  iterations: number,
  fn: () => any
): Promise<PerformanceResult> {
  const times: number[] = [];

  // Warmup
  for (let i = 0; i < Math.min(10, iterations); i++) {
    fn();
  }

  // Measure
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  return {
    name,
    avgTime: Number(avgTime.toFixed(3)),
    minTime: Number(minTime.toFixed(3)),
    maxTime: Number(maxTime.toFixed(3)),
    iterations,
    unit: 'ms',
  };
}

/**
 * Print performance results
 */
function printResults(results: PerformanceResult[]): void {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('Performance Test Results');
  console.log('═══════════════════════════════════════════════════\n');

  console.log('Test Name                                  Avg      Min      Max     Iterations');
  console.log('─────────────────────────────────────────────────────────────────────────────');

  results.forEach(result => {
    const name = result.name.padEnd(40);
    const avg = `${result.avgTime}ms`.padStart(8);
    const min = `${result.minTime}ms`.padStart(8);
    const max = `${result.maxTime}ms`.padStart(8);
    const iter = `${result.iterations}`.padStart(10);

    console.log(`${name} ${avg} ${min} ${max} ${iter}`);
  });

  console.log('\n═══════════════════════════════════════════════════\n');
}

/**
 * Check if performance meets targets
 */
function checkPerformanceTargets(results: PerformanceResult[]): boolean {
  console.log('Checking Performance Targets...\n');

  let allPassed = true;

  const targets = {
    'Simple Rule (income check)': 1, // < 1ms
    'Complex Rule (SNAP eligibility)': 5, // < 5ms
    '7 Rules (SNAP package)': 50, // < 50ms for 7 rules
    'JSON.stringify (results)': 10, // < 10ms
    'JSON.parse (results)': 10, // < 10ms
  };

  for (const result of results) {
    const target = targets[result.name as keyof typeof targets];
    if (target) {
      const passed = result.avgTime < target;
      const status = passed ? '✓ PASS' : '✗ FAIL';
      const color = passed ? '\x1b[32m' : '\x1b[31m';
      const reset = '\x1b[0m';

      console.log(`${color}${status}${reset} ${result.name}: ${result.avgTime}ms (target: <${target}ms)`);

      if (!passed) allPassed = false;
    }
  }

  console.log();
  return allPassed;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║         BenefitFinder Performance Tests          ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  const allResults: PerformanceResult[] = [];

  // Run tests
  const ruleResults = await testRuleEvaluation();
  allResults.push(...ruleResults);

  const dataResults = await testDataGeneration();
  allResults.push(...dataResults);

  const jsonResults = await testJSONOperations();
  allResults.push(...jsonResults);

  // Print results
  printResults(allResults);

  // Check targets
  const passed = checkPerformanceTargets(allResults);

  if (passed) {
    console.log('\x1b[32m✓ All performance targets met!\x1b[0m\n');
    process.exit(0);
  } else {
    console.log('\x1b[33m⚠ Some performance targets not met\x1b[0m\n');
    process.exit(1);
  }
}

// Run tests
main().catch(error => {
  console.error('Performance tests failed:', error);
  process.exit(1);
});

