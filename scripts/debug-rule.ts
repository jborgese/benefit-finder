#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, no-prototype-builtins */

import { readFileSync } from 'fs';
import jsonLogic from 'json-logic-js';
import { registerBenefitOperators } from '../src/rules/core/evaluator';

function collectVars(node: any, out: Set<string>) {
  if (node == null) return;
  if (Array.isArray(node)) {
    node.forEach(n => collectVars(n, out));
    return;
  }
  if (typeof node === 'object') {
    if (Object.keys(node).length === 1 && node.hasOwnProperty('var')) {
      const v = node.var;
      if (typeof v === 'string') out.add(v);
      else if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') out.add(v[0]);
      return;
    }
    Object.values(node).forEach(v => collectVars(v, out));
  }
}

function getDeep(obj: any, path: string) {
  if (!path) return obj;
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

async function main() {
  registerBenefitOperators();

  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: debug-rule.ts <rule-file> [test-id]');
    process.exit(2);
  }

  const filepath = args[0];
  const testId = args[1];

  const content = readFileSync(filepath, 'utf8');
  const pkg = JSON.parse(content);

  for (const rule of pkg.rules || []) {
    const failures: any[] = [];
    for (const t of rule.testCases || []) {
      if (testId && t.id !== testId) continue;

      console.log('='.repeat(80));
      console.log(`Rule: ${rule.name} (${rule.id})`);
      console.log(`Test: ${t.id} - ${t.description}`);
      console.log('Input:', JSON.stringify(t.input, null, 2));

      const vars = new Set<string>();
      collectVars(rule.ruleLogic, vars);
      if (vars.size > 0) {
        console.log('\nReferenced vars and their values from input:');
        Array.from(vars).sort().forEach(v => {
          console.log(` - ${v}:`, JSON.stringify(getDeep(t.input, v)));
        });
      } else {
        console.log('\nNo `var` references detected in logic.');
      }

      try {
        const result = jsonLogic.apply(rule.ruleLogic as any, t.input);
        console.log('\njsonLogic result:', JSON.stringify(result));
      } catch (err) {
        console.error('\njsonLogic threw:', err instanceof Error ? err.message : String(err));
      }

      // stop if specific test requested
      if (testId) return;
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
