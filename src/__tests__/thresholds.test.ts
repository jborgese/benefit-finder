import { describe, it, expect, beforeEach } from 'vitest';
import {
  computeFplThresholdFromBase,
  resolveHouseholdMultiplication,
  normalizeTestInput,
  FPL_BASE_MAPPING,
} from '../../scripts/validate-rules';

describe('FPL threshold helpers', () => {
  beforeEach(() => {
    // Clear mapping before each test
    for (const k of Object.keys(FPL_BASE_MAPPING)) {
      delete FPL_BASE_MAPPING[Number(k)];
    }
  });

  it('uses FPL mapping when available', () => {
    // base=2258, increment per additional person = 800
    // householdSize=2 -> 2258 + 800 = 3058
    FPL_BASE_MAPPING[2258] = 800;
    const val = computeFplThresholdFromBase(2258, 2);
    expect(val).toBe(3058);
  });

  it('falls back to multiplication when mapping missing', () => {
    const val = computeFplThresholdFromBase(1000, 3);
    expect(val).toBe(3000);
  });

  it('infers increment from rule explanation when mapping missing', () => {
    const rule = {
      explanation: '2025 thresholds: $2,258 for 1, $3,058 for 2, $3,798 for 3',
    } as any;
    const val = computeFplThresholdFromBase(2258, 3, rule as any);
    // inferred increment = 3058 - 2258 = 800; 2258 + (3-1)*800 = 3858
    expect(val).toBe(3858);
  });

  it('resolves household multiplication nodes using mapping', () => {
    FPL_BASE_MAPPING[2258] = 800;
    const node = { '*': [{ var: 'householdSize' }, 2258] } as any;
    const data = { householdSize: 2 };
    const resolved = resolveHouseholdMultiplication(node, data);
    expect(resolved).toBe(3058);
  });

  it('resolves household multiplication even for federal wic package path (no special-case)', () => {
    FPL_BASE_MAPPING[2258] = 800;
    const node = { '*': [{ var: 'householdSize' }, 2258] } as any;
    const data = { householdSize: 3 };
    const resolved = resolveHouseholdMultiplication(node, data, undefined, 'src/rules/federal/wic/wic-federal-rules.json');
    expect(resolved).toBe(2258 + 2 * 800);
  });

  it('normalizeTestInput derives hasChildren', () => {
    const input = { isChild: true, ageInMonths: 24 } as Record<string, unknown>;
    const out = normalizeTestInput(input);
    expect(out.hasChildren).toBe(true);
  });
});
