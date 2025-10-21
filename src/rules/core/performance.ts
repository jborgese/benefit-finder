/**
 * Rule Performance Monitoring
 *
 * Tracks and analyzes rule evaluation performance.
 * Provides profiling, metrics collection, and performance insights.
 */

import type { JsonLogicRule, JsonLogicData } from './types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Performance metrics for a single evaluation
 */
export interface PerformanceMetrics {
  /** Unique evaluation ID */
  id: string;
  /** Rule ID */
  ruleId?: string;
  /** Total execution time (ms) */
  executionTime: number;
  /** Timestamp */
  timestamp: number;
  /** Rule complexity */
  complexity?: number;
  /** Rule depth */
  depth?: number;
  /** Number of operations */
  operationCount?: number;
  /** Memory usage (if available) */
  memoryUsed?: number;
}

/**
 * Aggregated performance statistics
 */
export interface PerformanceStats {
  /** Total evaluations */
  totalEvaluations: number;
  /** Average execution time */
  averageTime: number;
  /** Median execution time */
  medianTime: number;
  /** Minimum execution time */
  minTime: number;
  /** Maximum execution time */
  maxTime: number;
  /** 95th percentile */
  p95Time: number;
  /** 99th percentile */
  p99Time: number;
  /** Standard deviation */
  stdDeviation: number;
  /** Evaluations per second */
  evaluationsPerSecond: number;
}

/**
 * Performance profile for a specific rule
 */
export interface RulePerformanceProfile {
  /** Rule ID */
  ruleId: string;
  /** Number of times evaluated */
  evaluationCount: number;
  /** Performance statistics */
  stats: PerformanceStats;
  /** Slowest evaluations */
  slowestEvaluations: PerformanceMetrics[];
  /** Fastest evaluations */
  fastestEvaluations: PerformanceMetrics[];
  /** Performance trend */
  trend: 'improving' | 'stable' | 'degrading';
}

/**
 * Performance warning
 */
export interface PerformanceWarning {
  /** Warning message */
  message: string;
  /** Severity */
  severity: 'info' | 'warning' | 'critical';
  /** Rule ID if applicable */
  ruleId?: string;
  /** Metric that triggered warning */
  metric: string;
  /** Current value */
  value: number;
  /** Threshold */
  threshold: number;
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Performance monitor singleton
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 10000; // Keep last 10k evaluations
  private enabled = true;

  /**
   * Record a performance metric
   */
  record(metric: PerformanceMetrics): void {
    if (!this.enabled) return;

    this.metrics.push(metric);

    // Trim old metrics if exceeding limit
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get all metrics
   */
  getAll(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific rule
   */
  getForRule(ruleId: string): PerformanceMetrics[] {
    return this.metrics.filter((m) => m.ruleId === ruleId);
  }

  /**
   * Get recent metrics
   */
  getRecent(count = 100): PerformanceMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Enable monitoring
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable monitoring
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set maximum metrics to keep
   */
  setMaxMetrics(max: number): void {
    this.maxMetrics = max;
    if (this.metrics.length > max) {
      this.metrics = this.metrics.slice(-max);
    }
  }
}

// Global monitor instance
const monitor = new PerformanceMonitor();

/**
 * Get the global performance monitor
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  return monitor;
}

// ============================================================================
// STATISTICS CALCULATION
// ============================================================================

/**
 * Calculate performance statistics from metrics
 *
 * @param metrics Array of performance metrics
 * @returns Performance statistics
 */
export function calculateStats(metrics: PerformanceMetrics[]): PerformanceStats {
  if (metrics.length === 0) {
    return {
      totalEvaluations: 0,
      averageTime: 0,
      medianTime: 0,
      minTime: 0,
      maxTime: 0,
      p95Time: 0,
      p99Time: 0,
      stdDeviation: 0,
      evaluationsPerSecond: 0,
    };
  }

  const times = metrics.map((m) => m.executionTime).sort((a, b) => a - b);
  const sum = times.reduce((a, b) => a + b, 0);
  const average = sum / times.length;

  // Calculate median
  const median = times[Math.floor(times.length / 2)];

  // Calculate percentiles
  const p95Index = Math.floor(times.length * 0.95);
  const p99Index = Math.floor(times.length * 0.99);
  // eslint-disable-next-line security/detect-object-injection -- Array access with computed index is safe here
  const p95 = times[p95Index] ?? times[times.length - 1];
  // eslint-disable-next-line security/detect-object-injection -- Array access with computed index is safe here
  const p99 = times[p99Index] ?? times[times.length - 1];

  // Calculate standard deviation
  const squareDiffs = times.map((time) => (time - average) ** 2);
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / times.length;
  const stdDev = Math.sqrt(avgSquareDiff);

  // Calculate evaluations per second (based on recent metrics)
  const recentMetrics = metrics.slice(-100);
  const timeSpan = recentMetrics.length > 1
    ? (recentMetrics[recentMetrics.length - 1].timestamp - recentMetrics[0].timestamp) / 1000
    : 1;
  const evalPerSec = recentMetrics.length / timeSpan;

  return {
    totalEvaluations: metrics.length,
    averageTime: average,
    medianTime: median,
    minTime: times[0],
    maxTime: times[times.length - 1],
    p95Time: p95,
    p99Time: p99,
    stdDeviation: stdDev,
    evaluationsPerSecond: evalPerSec,
  };
}

/**
 * Get performance profile for a rule
 *
 * @param ruleId Rule ID
 * @returns Performance profile
 */
export function getRulePerformanceProfile(ruleId: string): RulePerformanceProfile {
  const metrics = monitor.getForRule(ruleId);
  const stats = calculateStats(metrics);

  // Get slowest and fastest
  const sorted = [...metrics].sort((a, b) => b.executionTime - a.executionTime);
  const slowest = sorted.slice(0, 10);
  const fastest = sorted.slice(-10).reverse();

  // Determine trend
  const recent = metrics.slice(-50);
  const older = metrics.slice(-100, -50);
  const recentAvg = recent.length > 0
    ? recent.reduce((sum, m) => sum + m.executionTime, 0) / recent.length
    : 0;
  const olderAvg = older.length > 0
    ? older.reduce((sum, m) => sum + m.executionTime, 0) / older.length
    : 0;

  let trend: 'improving' | 'stable' | 'degrading' = 'stable';
  if (recent.length > 10 && older.length > 10) {
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    if (change < -10) trend = 'improving';
    else if (change > 10) trend = 'degrading';
  }

  return {
    ruleId,
    evaluationCount: metrics.length,
    stats,
    slowestEvaluations: slowest,
    fastestEvaluations: fastest,
    trend,
  };
}

/**
 * Get performance warnings
 *
 * @param thresholds Warning thresholds
 * @returns Array of performance warnings
 */
export function getPerformanceWarnings(thresholds: {
  slowEvaluation?: number;
  highComplexity?: number;
  lowCacheHitRate?: number;
} = {}): PerformanceWarning[] {
  const warnings: PerformanceWarning[] = [];

  const defaultThresholds = {
    slowEvaluation: thresholds.slowEvaluation ?? 100, // 100ms
    highComplexity: thresholds.highComplexity ?? 80,
    lowCacheHitRate: thresholds.lowCacheHitRate ?? 0.5, // 50%
  };

  const allMetrics = monitor.getAll();
  const slowEvaluations = allMetrics.filter(
    (m) => m.executionTime > defaultThresholds.slowEvaluation
  );

  if (slowEvaluations.length > 0) {
    warnings.push({
      message: `${slowEvaluations.length} evaluations exceeded ${defaultThresholds.slowEvaluation}ms`,
      severity: 'warning',
      metric: 'executionTime',
      value: slowEvaluations.length,
      threshold: defaultThresholds.slowEvaluation,
    });
  }

  // Group by rule ID to find consistently slow rules
  const byRule = new Map<string, PerformanceMetrics[]>();
  for (const metric of allMetrics) {
    if (metric.ruleId) {
      const existing = byRule.get(metric.ruleId) ?? [];
      existing.push(metric);
      byRule.set(metric.ruleId, existing);
    }
  }

  for (const [ruleId, metrics] of byRule.entries()) {
    const stats = calculateStats(metrics);

    if (stats.averageTime > defaultThresholds.slowEvaluation) {
      warnings.push({
        message: `Rule ${ruleId} has slow average execution time`,
        severity: 'warning',
        ruleId,
        metric: 'averageTime',
        value: stats.averageTime,
        threshold: defaultThresholds.slowEvaluation,
      });
    }
  }

  return warnings;
}

/**
 * Generate performance report
 *
 * @returns Formatted performance report
 */
export function generatePerformanceReport(): string {
  const allMetrics = monitor.getAll();

  if (allMetrics.length === 0) {
    return 'No performance data collected yet.';
  }

  const stats = calculateStats(allMetrics);
  const warnings = getPerformanceWarnings();

  const lines: string[] = [];

  lines.push('=== Performance Report ===');
  lines.push('');
  lines.push(`Total Evaluations: ${stats.totalEvaluations}`);
  lines.push(`Average Time: ${stats.averageTime.toFixed(2)}ms`);
  lines.push(`Median Time: ${stats.medianTime.toFixed(2)}ms`);
  lines.push(`Min Time: ${stats.minTime.toFixed(2)}ms`);
  lines.push(`Max Time: ${stats.maxTime.toFixed(2)}ms`);
  lines.push(`P95 Time: ${stats.p95Time.toFixed(2)}ms`);
  lines.push(`P99 Time: ${stats.p99Time.toFixed(2)}ms`);
  lines.push(`Std Deviation: ${stats.stdDeviation.toFixed(2)}ms`);
  lines.push(`Throughput: ${stats.evaluationsPerSecond.toFixed(2)} eval/sec`);

  if (warnings.length > 0) {
    lines.push('');
    lines.push('=== Warnings ===');
    for (const warning of warnings) {
      lines.push(`[${warning.severity.toUpperCase()}] ${warning.message}`);
    }
  }

  // Group by rule
  const byRule = new Map<string, PerformanceMetrics[]>();
  for (const metric of allMetrics) {
    if (metric.ruleId) {
      const existing = byRule.get(metric.ruleId) ?? [];
      existing.push(metric);
      byRule.set(metric.ruleId, existing);
    }
  }

  if (byRule.size > 0) {
    lines.push('');
    lines.push('=== By Rule ===');

    for (const [ruleId, metrics] of byRule.entries()) {
      const ruleStats = calculateStats(metrics);
      lines.push(`${ruleId}:`);
      lines.push(`  Evaluations: ${metrics.length}`);
      lines.push(`  Avg Time: ${ruleStats.averageTime.toFixed(2)}ms`);
      lines.push(`  P95 Time: ${ruleStats.p95Time.toFixed(2)}ms`);
    }
  }

  return lines.join('\n');
}

/**
 * Export performance data as JSON
 *
 * @returns Performance data object
 */
export function exportPerformanceData(): {
  metrics: PerformanceMetrics[];
  stats: PerformanceStats;
  warnings: PerformanceWarning[];
  exportedAt: number;
} {
  const metrics = monitor.getAll();
  const stats = calculateStats(metrics);
  const warnings = getPerformanceWarnings();

  return {
    metrics,
    stats,
    warnings,
    exportedAt: Date.now(),
  };
}

/**
 * Clear performance data
 */
export function clearPerformanceData(): void {
  monitor.clear();
}

// ============================================================================
// PERFORMANCE PROFILING
// ============================================================================

/**
 * Profile a rule evaluation
 *
 * Executes the rule multiple times and collects detailed performance data
 *
 * @param rule Rule to profile
 * @param data Data context
 * @param iterations Number of iterations
 * @returns Performance profile
 */
export async function profileRule(
  rule: JsonLogicRule,
  data: JsonLogicData,
  iterations = 100
): Promise<{
  iterations: number;
  metrics: PerformanceMetrics[];
  stats: PerformanceStats;
  recommendation: string;
}> {
  const metrics: PerformanceMetrics[] = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();

    try {
      // Import evaluateRule to avoid circular dependency
      const { evaluateRule } = await import('./evaluator');
      await evaluateRule(rule, data, { measureTime: false });
    } catch {
      // Ignore errors during profiling
    }

    const endTime = performance.now();

    metrics.push({
      id: `profile-${i}`,
      executionTime: endTime - startTime,
      timestamp: Date.now(),
    });
  }

  const stats = calculateStats(metrics);

  // Generate recommendation
  let recommendation = 'Performance is good';

  if (stats.averageTime > 100) {
    recommendation = 'Rule is slow - consider optimizing or simplifying';
  } else if (stats.averageTime > 50) {
    recommendation = 'Performance is acceptable but could be improved';
  } else if (stats.averageTime < 10) {
    recommendation = 'Excellent performance';
  }

  if (stats.stdDeviation > stats.averageTime * 0.5) {
    recommendation += '. High variance - results are inconsistent';
  }

  return {
    iterations,
    metrics,
    stats,
    recommendation,
  };
}

/**
 * Compare performance of multiple rules
 *
 * @param rules Array of rules to compare
 * @param data Data context
 * @param iterations Iterations per rule
 * @returns Comparison report
 */
export async function compareRulePerformance(
  rules: Array<{ id: string; rule: JsonLogicRule }>,
  data: JsonLogicData,
  iterations = 50
): Promise<{
  results: Array<{
    id: string;
    stats: PerformanceStats;
  }>;
  fastest: string;
  slowest: string;
}> {
  const results: Array<{ id: string; stats: PerformanceStats }> = [];

  for (const { id, rule } of rules) {
    const profile = await profileRule(rule, data, iterations);
    results.push({
      id,
      stats: profile.stats,
    });
  }

  // Find fastest and slowest
  const sorted = [...results].sort((a, b) => a.stats.averageTime - b.stats.averageTime);
  const fastest = sorted[0]?.id || 'unknown';
  const slowest = sorted[sorted.length - 1]?.id || 'unknown';

  return {
    results,
    fastest,
    slowest,
  };
}

// ============================================================================
// PERFORMANCE OPTIMIZATION
// ============================================================================

/**
 * Analyze rule for performance bottlenecks
 *
 * @param rule Rule to analyze
 * @returns Optimization suggestions
 */
export function analyzePerformance(rule: JsonLogicRule): {
  bottlenecks: string[];
  suggestions: string[];
  estimatedComplexity: number;
} {
  const bottlenecks: string[] = [];
  const suggestions: string[] = [];
  let complexity = 0;

  const analyze = (node: JsonLogicRule, depth: number): void => {
    if (node === null || typeof node !== 'object') {
      complexity += 1;
      return;
    }

    if (Array.isArray(node)) {
      node.forEach((item) => analyze(item, depth + 1));
      return;
    }

    for (const operator of Object.keys(node)) {
      complexity += depth * 2; // Nesting penalty

      // Check for expensive operations
      if (['map', 'filter', 'reduce'].includes(operator)) {
        complexity += 10;
        bottlenecks.push(`Array operation "${operator}" at depth ${depth}`);
        suggestions.push(`Consider pre-computing array operations for "${operator}"`);
      }

      // Check for deep nesting
      if (depth > 5) {
        bottlenecks.push(`Deep nesting (level ${depth})`);
        if (depth > 10) {
          suggestions.push('Deeply nested rule - consider flattening the structure');
        }
      }

      const nodeAsRecord = node as Record<string, unknown>;
      // eslint-disable-next-line security/detect-object-injection -- Dynamic property access is safe here, operator is from Object.keys()
      const value = nodeAsRecord[operator];
      if (value !== undefined) {
        analyze(value as JsonLogicRule, depth + 1);
      }
    }
  };

  analyze(rule, 0);

  // General suggestions based on complexity
  if (complexity > 100) {
    suggestions.push('Very high complexity - break into multiple rules');
  } else if (complexity > 50) {
    suggestions.push('Moderate complexity - consider simplification');
  }

  return {
    bottlenecks,
    suggestions,
    estimatedComplexity: complexity,
  };
}

/**
 * Benchmark a rule against test data
 *
 * @param rule Rule to benchmark
 * @param testDataSets Array of data contexts to test
 * @returns Benchmark results
 */
export async function benchmarkRule(
  rule: JsonLogicRule,
  testDataSets: JsonLogicData[]
): Promise<{
  totalTime: number;
  avgTimePerEvaluation: number;
  dataSetResults: Array<{
    index: number;
    time: number;
    result: unknown;
  }>;
}> {
  const startTime = performance.now();
  const dataSetResults: Array<{ index: number; time: number; result: unknown }> = [];

  const { evaluateRule } = await import('./evaluator');

  for (let i = 0; i < testDataSets.length; i++) {
    const evalStart = performance.now();
    // eslint-disable-next-line security/detect-object-injection -- Array access with loop index is safe here
    const result = await evaluateRule(rule, testDataSets[i]);
    const evalEnd = performance.now();

    dataSetResults.push({
      index: i,
      time: evalEnd - evalStart,
      result: result.result,
    });
  }

  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / testDataSets.length;

  return {
    totalTime,
    avgTimePerEvaluation: avgTime,
    dataSetResults,
  };
}

