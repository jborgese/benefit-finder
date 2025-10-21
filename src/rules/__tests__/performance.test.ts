/**
 * Performance Monitoring Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPerformanceMonitor,
  calculateStats,
  getRulePerformanceProfile,
  getPerformanceWarnings,
  generatePerformanceReport,
  clearPerformanceData,
  profileRule,
  analyzePerformance,
  type PerformanceMetrics,
} from '../core/performance';
import type { JsonLogicRule, JsonLogicData } from '../core/types';

describe('Performance Monitoring', () => {
  beforeEach(() => {
    clearPerformanceData();
  });

  describe('PerformanceMonitor', () => {
    it('should record metrics', () => {
      const monitor = getPerformanceMonitor();

      const metric: PerformanceMetrics = {
        id: 'test-1',
        ruleId: 'rule-1',
        executionTime: 15.5,
        timestamp: Date.now(),
      };

      monitor.record(metric);

      const all = monitor.getAll();
      expect(all).toContain(metric);
    });

    it('should get metrics for specific rule', () => {
      const monitor = getPerformanceMonitor();

      monitor.record({
        id: 'test-1',
        ruleId: 'rule-1',
        executionTime: 10,
        timestamp: Date.now(),
      });

      monitor.record({
        id: 'test-2',
        ruleId: 'rule-2',
        executionTime: 20,
        timestamp: Date.now(),
      });

      const forRule1 = monitor.getForRule('rule-1');
      expect(forRule1.length).toBe(1);
      expect(forRule1[0].ruleId).toBe('rule-1');
    });

    it('should enable/disable monitoring', () => {
      const monitor = getPerformanceMonitor();

      expect(monitor.isEnabled()).toBe(true);

      monitor.disable();
      expect(monitor.isEnabled()).toBe(false);

      monitor.enable();
      expect(monitor.isEnabled()).toBe(true);
    });

    it('should clear metrics', () => {
      const monitor = getPerformanceMonitor();

      monitor.record({
        id: 'test-1',
        executionTime: 10,
        timestamp: Date.now(),
      });

      expect(monitor.getAll().length).toBeGreaterThan(0);

      monitor.clear();
      expect(monitor.getAll().length).toBe(0);
    });
  });

  describe('calculateStats', () => {
    it('should calculate statistics from metrics', () => {
      const metrics: PerformanceMetrics[] = [
        { id: '1', executionTime: 10, timestamp: 1000 },
        { id: '2', executionTime: 20, timestamp: 2000 },
        { id: '3', executionTime: 30, timestamp: 3000 },
        { id: '4', executionTime: 40, timestamp: 4000 },
        { id: '5', executionTime: 50, timestamp: 5000 },
      ];

      const stats = calculateStats(metrics);

      expect(stats.totalEvaluations).toBe(5);
      expect(stats.averageTime).toBe(30);
      expect(stats.medianTime).toBe(30);
      expect(stats.minTime).toBe(10);
      expect(stats.maxTime).toBe(50);
    });

    it('should handle empty metrics', () => {
      const stats = calculateStats([]);

      expect(stats.totalEvaluations).toBe(0);
      expect(stats.averageTime).toBe(0);
    });
  });

  describe('getRulePerformanceProfile', () => {
    it('should get performance profile for rule', () => {
      const monitor = getPerformanceMonitor();

      // Add test data
      for (let i = 0; i < 10; i++) {
        monitor.record({
          id: `test-${i}`,
          ruleId: 'rule-1',
          executionTime: 10 + i,
          timestamp: Date.now() + i * 1000,
        });
      }

      const profile = getRulePerformanceProfile('rule-1');

      expect(profile.ruleId).toBe('rule-1');
      expect(profile.evaluationCount).toBe(10);
      expect(profile.stats.averageTime).toBeGreaterThan(0);
      expect(profile.trend).toBeDefined();
    });
  });

  describe('getPerformanceWarnings', () => {
    it('should detect slow evaluations', () => {
      const monitor = getPerformanceMonitor();

      monitor.record({
        id: 'slow-1',
        ruleId: 'rule-1',
        executionTime: 150, // Exceeds default 100ms threshold
        timestamp: Date.now(),
      });

      const warnings = getPerformanceWarnings();

      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some((w) => w.metric === 'executionTime')).toBe(true);
    });
  });

  describe('generatePerformanceReport', () => {
    it('should generate readable report', () => {
      const monitor = getPerformanceMonitor();

      monitor.record({
        id: 'test-1',
        executionTime: 15,
        timestamp: Date.now(),
      });

      const report = generatePerformanceReport();

      expect(report).toContain('Performance Report');
      expect(report).toContain('Total Evaluations');
      expect(report).toContain('Average Time');
    });

    it('should handle no data', () => {
      const report = generatePerformanceReport();

      expect(report).toContain('No performance data');
    });
  });

  describe('profileRule', () => {
    it('should profile rule execution', async () => {
      const rule: JsonLogicRule = { '>': [{ var: 'value' }, 10] };
      const data: JsonLogicData = { value: 15 };

      const profile = await profileRule(rule, data, 10);

      expect(profile.iterations).toBe(10);
      expect(profile.metrics.length).toBe(10);
      expect(profile.stats.averageTime).toBeGreaterThan(0);
      expect(profile.recommendation).toBeDefined();
    });
  });

  describe('analyzePerformance', () => {
    it('should analyze rule for bottlenecks', () => {
      const rule: JsonLogicRule = {
        and: [
          {
            map: [
              { var: 'items' },
              { '>': [{ var: '' }, 10] },
            ],
          },
          { '<': [{ var: 'total' }, 100] },
        ],
      };

      const analysis = analyzePerformance(rule);

      expect(analysis.estimatedComplexity).toBeGreaterThan(0);
      expect(analysis.bottlenecks.length).toBeGreaterThan(0);
      expect(analysis.suggestions.length).toBeGreaterThan(0);
    });

    it('should detect deep nesting', () => {
      let rule: JsonLogicRule = { var: 'value' };

      // Create deeply nested rule
      for (let i = 0; i < 12; i++) {
        rule = { '!': [rule] };
      }

      const analysis = analyzePerformance(rule);

      expect(analysis.bottlenecks.some((b) => b.includes('Deep nesting'))).toBe(true);
    });
  });
});

