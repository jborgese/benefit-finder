/**
 * Database Performance Testing
 *
 * Tests RxDB/IndexedDB performance with large datasets
 */

import { nanoid } from 'nanoid';

// ============================================================================
// TYPES
// ============================================================================

interface PerformanceMetric {
  operation: string;
  recordCount: number;
  avgTime: number;
  totalTime: number;
  unit: string;
}

interface PerformanceResult {
  name: string;
  avgTime: number;
  minTime: number;
  maxTime: number;
  iterations: number;
  unit: string;
}

// ============================================================================
// MOCK DATABASE OPERATIONS
// ============================================================================

/**
 * Simulate database insert performance
 */
function testInsertPerformance(): PerformanceMetric[] {
  console.log('\n📊 Testing Database Insert Performance...\n');

  const results: PerformanceMetric[] = [];

  // Test with different record counts
  for (const count of [10, 100, 1000]) {
    const start = performance.now();

    // Simulate inserting records
    const records = [];
    for (let i = 0; i < count; i++) {
      records.push({
        id: nanoid(),
        data: {
          qualified: Array(3).fill(null).map(() => ({ program: 'test', status: 'qualified' })),
          likely: [],
          maybe: [],
          notQualified: [],
          totalPrograms: 3,
          evaluatedAt: new Date().toISOString(),
        },
        evaluatedAt: Date.now(),
        qualifiedCount: 3,
        programsEvaluated: ['snap', 'medicaid', 'wic'],
      });
    }

    // Simulate localStorage write
    localStorage.setItem('perf_test', JSON.stringify(records));

    const end = performance.now();
    const totalTime = end - start;

    results.push({
      operation: `Insert ${count} records`,
      recordCount: count,
      avgTime: Number((totalTime / count).toFixed(2)),
      totalTime: Number(totalTime.toFixed(2)),
      unit: 'ms',
    });

    // Cleanup
    localStorage.removeItem('perf_test');
  }

  return results;
}

/**
 * Test database query performance
 */
function testQueryPerformance(): PerformanceMetric[] {
  console.log('\n📊 Testing Database Query Performance...\n');

  const results: PerformanceMetric[] = [];

  // Create test dataset
  for (const count of [100, 1000, 5000]) {
    const records = [];
    for (let i = 0; i < count; i++) {
      records.push({
        id: nanoid(),
        qualifiedCount: Math.floor(Math.random() * 5),
        evaluatedAt: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
        state: ['GA', 'CA', 'NY'][Math.floor(Math.random() * 3)],
      });
    }

    localStorage.setItem('perf_test', JSON.stringify(records));

    // Test: Find by ID
    const findStart = performance.now();
    const testId = records[Math.floor(records.length / 2)].id;
    const _found = records.find(r => r.id === testId);
    const findEnd = performance.now();

    results.push({
      operation: `Find by ID (${count} records)`,
      recordCount: count,
      avgTime: Number((findEnd - findStart).toFixed(2)),
      totalTime: Number((findEnd - findStart).toFixed(2)),
      unit: 'ms',
    });

    // Test: Filter by state
    const filterStart = performance.now();
    const _filtered = records.filter(r => r.state === 'GA');
    const filterEnd = performance.now();

    results.push({
      operation: `Filter by state (${count} records)`,
      recordCount: count,
      avgTime: Number((filterEnd - filterStart).toFixed(2)),
      totalTime: Number((filterEnd - filterStart).toFixed(2)),
      unit: 'ms',
    });

    // Test: Sort by date
    const sortStart = performance.now();
    const _sorted = [...records].sort((a, b) => b.evaluatedAt - a.evaluatedAt);
    const sortEnd = performance.now();

    results.push({
      operation: `Sort by date (${count} records)`,
      recordCount: count,
      avgTime: Number((sortEnd - sortStart).toFixed(2)),
      totalTime: Number((sortEnd - sortStart).toFixed(2)),
      unit: 'ms',
    });

    // Cleanup
    localStorage.removeItem('perf_test');
  }

  return results;
}

/**
 * Test large data serialization
 */
function testSerializationPerformance(): PerformanceMetric[] {
  console.log('\n📊 Testing Serialization Performance...\n');

  const results: PerformanceMetric[] = [];

  for (const count of [10, 100, 500]) {
    // Create large eligibility result
    const largeResult = {
      qualified: Array(count).fill(null).map((_, i) => ({
        programId: `program-${i}`,
        programName: `Test Program ${i}`,
        programDescription: 'A comprehensive benefit program that helps families and individuals access essential services including food assistance, healthcare coverage, and financial support during difficult times.',
        jurisdiction: 'US-FEDERAL',
        status: 'qualified',
        confidence: 'high',
        confidenceScore: 95,
        explanation: {
          reason: 'You meet all eligibility requirements based on the information provided.',
          details: [
            'Your household income is below the required threshold for this program',
            'You meet the citizenship requirements',
            'Your household size qualifies you for benefits',
            'You have provided all necessary documentation',
          ],
          rulesCited: ['rule-income', 'rule-citizenship', 'rule-household'],
        },
        requiredDocuments: Array(10).fill(null).map((_, j) => ({
          id: `doc-${j}`,
          name: `Required Document ${j}`,
          description: 'Proof of income, residence, or identity',
          required: true,
          alternatives: ['Alternative 1', 'Alternative 2'],
          where: 'Government office or employer',
        })),
        nextSteps: Array(5).fill(null).map((_, k) => ({
          step: `Complete step ${k} of the application process`,
          url: `https://example.gov/step-${k}`,
          priority: 'high',
          estimatedTime: '30 minutes',
        })),
        evaluatedAt: new Date(),
        rulesVersion: '1.0.0',
      })),
      likely: [],
      maybe: [],
      notQualified: [],
      totalPrograms: count,
      evaluatedAt: new Date(),
    };

    // Test stringify
    const stringifyStart = performance.now();
    const serialized = JSON.stringify(largeResult);
    const stringifyEnd = performance.now();

    results.push({
      operation: `Stringify ${count} programs`,
      recordCount: count,
      avgTime: Number((stringifyEnd - stringifyStart).toFixed(2)),
      totalTime: Number((stringifyEnd - stringifyStart).toFixed(2)),
      unit: 'ms',
    });

    // Test parse
    const parseStart = performance.now();
    JSON.parse(serialized);
    const parseEnd = performance.now();

    results.push({
      operation: `Parse ${count} programs`,
      recordCount: count,
      avgTime: Number((parseEnd - parseStart).toFixed(2)),
      totalTime: Number((parseEnd - parseStart).toFixed(2)),
      unit: 'ms',
    });

    // Report size
    const sizeKB = (serialized.length / 1024).toFixed(2);
    console.log(`  ${count} programs: ${sizeKB} KB serialized`);
  }

  return results;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generic performance measurement function
 */
function _measurePerformance(
  name: string,
  iterations: number,
  fn: () => void
): PerformanceResult {
  const times: number[] = [];

  // Warmup (10% of iterations)
  for (let i = 0; i < Math.ceil(iterations * 0.1); i++) {
    fn();
  }

  // Actual measurement
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
 * Print performance metrics table
 */
function printMetricsTable(metrics: PerformanceMetric[]): void {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                    Performance Metrics                            ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  console.log('Operation                          Records    Avg Time    Total Time');
  console.log('─────────────────────────────────────────────────────────────────────');

  metrics.forEach(metric => {
    const op = metric.operation.padEnd(35);
    const records = metric.recordCount.toString().padStart(7);
    const avg = `${metric.avgTime}ms`.padStart(11);
    const total = `${metric.totalTime}ms`.padStart(13);

    console.log(`${op} ${records} ${avg} ${total}`);
  });

  console.log();
}

/**
 * Check performance targets
 */
function checkTargets(allMetrics: PerformanceMetric[]): boolean {
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                    Performance Targets                            ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  const targets = {
    'Insert 10 records': 50,
    'Insert 100 records': 200,
    'Find by ID (1000 records)': 5,
    'Filter by state (1000 records)': 20,
    'Sort by date (1000 records)': 30,
    'Stringify 10 programs': 10,
    'Parse 10 programs': 10,
  };

  let allPassed = true;

  for (const metric of allMetrics) {
    const target = targets[metric.operation as keyof typeof targets];
    if (target) {
      const passed = metric.avgTime < target;
      const status = passed ? '\x1b[32m✓ PASS\x1b[0m' : '\x1b[31m✗ FAIL\x1b[0m';

      console.log(`${status} ${metric.operation}: ${metric.avgTime}ms (target: <${target}ms)`);

      if (!passed) allPassed = false;
    }
  }

  console.log();
  return allPassed;
}

// ============================================================================
// MAIN
// ============================================================================

function runAllTests(): void {
  console.log('\n🚀 Starting Performance Tests...\n');

  const allMetrics: PerformanceMetric[] = [];

  // Run all test suites
  const insertResults = testInsertPerformance();
  const queryResults = testQueryPerformance();
  const jsonResults = testSerializationPerformance();

  allMetrics.push(...insertResults);
  allMetrics.push(...queryResults);
  allMetrics.push(...jsonResults);

  // Print consolidated results
  printMetricsTable(allMetrics);

  // Check targets
  const passed = checkTargets(allMetrics);

  if (passed) {
    console.log('\x1b[32m\n✓ All performance targets met!\x1b[0m\n');
    process.exit(0);
  } else {
    console.log('\x1b[33m\n⚠ Some performance targets not met - optimization needed\x1b[0m\n');
    process.exit(1);
  }
}

// Execute
runAllTests();

