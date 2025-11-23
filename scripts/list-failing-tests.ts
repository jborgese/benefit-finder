#!/usr/bin/env tsx

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { validateRulePackage } from '../src/rules/core/schema';
import { testRulePackage } from './validate-rules';
import type { RulePackage } from '../src/rules/core/schema';

function listRuleFiles(): string[] {
  const root = join(process.cwd(), 'src', 'rules');
  const files: string[] = [];
  function walk(dir: string) {
    let entries: string[] = [];
    try { entries = readdirSync(dir); } catch { return; }
    for (const e of entries) {
      const p = join(dir, e);
      if (e.endsWith('.json')) files.push(p);
      else {
        const stat = statSync(p);
        if (stat.isDirectory()) walk(p);
      }
    }
  }
  walk(root);
  return files;
}

function main() {
  const files = listRuleFiles();
  let totalFailed = 0;
  for (const f of files) {
    let pkg: RulePackage | null = null;
    try {
      pkg = JSON.parse(readFileSync(f, 'utf8')) as RulePackage;
    } catch (err) {
      console.error('Failed to parse', f, err);
      continue;
    }
    const struct = validateRulePackage(pkg);
    if (!struct.success) continue;
    const results = testRulePackage(pkg, f);
    const failedRules = results.ruleResults.filter(r => r.testsFailed > 0);
    if (failedRules.length > 0) {
      console.log('File:', f);
      for (const rr of failedRules) {
        for (const fail of rr.failures) {
          totalFailed++;
          console.log(`  Rule: ${rr.ruleName} (${rr.ruleId})`);
          console.log(`    Test ID: ${fail.testId}`);
          console.log(`    Description: ${fail.description}`);
          console.log(`    Expected: ${JSON.stringify(fail.expected)}`);
          console.log(`    Actual: ${JSON.stringify(fail.actual)}`);
        }
      }
      console.log('');
    }
  }
  console.log(`SUMMARY: ${totalFailed} failing tests`);
}

main();
