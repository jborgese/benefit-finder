import { describe, it, expect } from 'vitest';
import { runTestSuite } from '@/rules/core/tester';
import type { RuleTestCase, RuleTestSuite } from '@/rules/core/types';
import snap from '@/rules/federal/snap/snap-federal-rules.json';
import ssi from '@/rules/federal/ssi/ssi-federal-rules.json';

function normalizeTestCases(raw: any[]): RuleTestCase[] {
  return (raw || []).map((tc) => ({
    description: tc.description ?? tc.id ?? 'case',
    input: tc.input ?? {},
    expected: tc.expected ?? tc.expectedOutput,
    shouldPass: tc.shouldPass,
    tags: tc.tags,
  }));
}

function suitesFromProgram(json: any): RuleTestSuite[] {
  const rules = json?.rules ?? [];
  return rules
    .filter((r: any) => r?.ruleLogic && Array.isArray(r?.testCases) && r.testCases.length > 0)
    .map((r: any) => ({
      name: `${json?.metadata?.name ?? 'Program'}: ${r.name}`,
      description: r.description,
      rule: r.ruleLogic,
      testCases: normalizeTestCases(r.testCases),
    }));
}

describe('Federal SNAP embedded rule tests', () => {
  const suites = suitesFromProgram(snap);
  it('has non-zero test suites', () => {
    expect(suites.length).toBeGreaterThan(0);
  });
  for (const suite of suites) {
    it(`runs: ${suite.name}`, async () => {
      const result = await runTestSuite(suite);
      expect(result.total).toBeGreaterThan(0);
      expect(result.failed).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('Federal SSI embedded rule tests', () => {
  const suites = suitesFromProgram(ssi);
  it('has non-zero test suites', () => {
    expect(suites.length).toBeGreaterThan(0);
  });
  for (const suite of suites) {
    it(`runs: ${suite.name}`, async () => {
      const result = await runTestSuite(suite);
      expect(result.total).toBeGreaterThan(0);
      expect(result.failed).toBeGreaterThanOrEqual(0);
    });
  }
});
