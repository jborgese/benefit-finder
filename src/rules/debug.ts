/**
 * Rule Debugging Utilities
 *
 * Tools for debugging and troubleshooting JSON Logic rules.
 * Provides step-by-step execution traces, variable inspection,
 * and detailed error diagnostics.
 */

import jsonLogic from 'json-logic-js';
import { validateRule } from './validator';
import { evaluateRule } from './evaluator';
import type { JsonLogicRule, JsonLogicData } from './types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Debug trace step
 */
export interface DebugTraceStep {
  /** Step number */
  step: number;
  /** Operation being performed */
  operation: string;
  /** Operator */
  operator?: string;
  /** Operands */
  operands?: unknown[];
  /** Result of this step */
  result: unknown;
  /** Data context at this step */
  context?: JsonLogicData;
  /** Nesting level */
  level: number;
  /** Duration in milliseconds */
  duration?: number;
}

/**
 * Debug session result
 */
export interface DebugResult {
  /** Final result */
  result: unknown;
  /** Success status */
  success: boolean;
  /** Execution trace */
  trace: DebugTraceStep[];
  /** Total execution time */
  totalTime: number;
  /** Variables accessed */
  variablesAccessed: Set<string>;
  /** Operators used */
  operatorsUsed: Set<string>;
  /** Maximum depth reached */
  maxDepth: number;
  /** Errors encountered */
  errors: string[];
  /** Warnings */
  warnings: string[];
}

/**
 * Variable inspection result
 */
export interface VariableInspection {
  /** Variable name */
  name: string;
  /** Current value */
  value: unknown;
  /** Value type */
  type: string;
  /** Is value defined */
  defined: boolean;
  /** Is value truthy */
  truthy: boolean;
  /** Variable path (for nested variables) */
  path: string[];
}

/**
 * Rule inspection result
 */
export interface RuleInspection {
  /** Rule structure */
  structure: {
    operators: string[];
    variables: string[];
    depth: number;
    complexity: number;
  };
  /** Validation result */
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
  /** Variable usage */
  variableUsage: Map<string, number>;
  /** Operator usage */
  operatorUsage: Map<string, number>;
  /** Suggestions for optimization */
  suggestions: string[];
}

// ============================================================================
// DEBUG EXECUTION
// ============================================================================

/**
 * Debug a rule with step-by-step trace
 *
 * @param rule Rule to debug
 * @param data Data context
 * @returns Debug result with execution trace
 *
 * @example
 * ```typescript
 * const result = debugRule(
 *   { '>': [{ var: 'age' }, 18] },
 *   { age: 25 }
 * );
 *
 * console.log('Trace:', result.trace);
 * console.log('Variables accessed:', result.variablesAccessed);
 * ```
 */
export function debugRule(
  rule: JsonLogicRule,
  data: JsonLogicData
): DebugResult {
  const startTime = performance.now();
  const trace: DebugTraceStep[] = [];
  const variablesAccessed = new Set<string>();
  const operatorsUsed = new Set<string>();
  const errors: string[] = [];
  const warnings: string[] = [];
  let maxDepth = 0;
  let stepCounter = 0;

  // Create a wrapper to intercept operations
  const interceptor = {
    apply: (rule: JsonLogicRule, data: JsonLogicData, level: number): unknown => {
      maxDepth = Math.max(maxDepth, level);

      // Handle primitives
      if (rule === null || typeof rule !== 'object') {
        return rule;
      }

      // Handle arrays
      if (Array.isArray(rule)) {
        return rule.map((item) => interceptor.apply(item, data, level + 1));
      }

      // Handle variable references
      if ('var' in rule) {
        const varPath = rule.var as string;
        variablesAccessed.add(varPath);

        // Safe access using Object.prototype.hasOwnProperty
        const dataRecord = data as Record<string, unknown>;
        const value = Object.prototype.hasOwnProperty.call(dataRecord, varPath)
          ? dataRecord[varPath]
          : undefined;

        trace.push({
          step: stepCounter++,
          operation: `Access variable: ${varPath}`,
          operator: 'var',
          operands: [varPath],
          result: value,
          context: data,
          level,
        });

        return value;
      }

      // Handle operators
      const operator = Object.keys(rule)[0];
      if (!operator) return null;

      operatorsUsed.add(operator);

      const stepStart = performance.now();

      try {
        const result = jsonLogic.apply(rule, data);
        const stepEnd = performance.now();

        // Safe access to rule properties
        const ruleRecord = rule as Record<string, unknown>;
        const operatorValue = Object.prototype.hasOwnProperty.call(ruleRecord, operator)
          ? ruleRecord[operator]
          : undefined;

        // Convert operatorValue to operands array
        let operands: unknown[];
        if (Array.isArray(operatorValue)) {
          operands = operatorValue;
        } else if (operatorValue !== undefined) {
          operands = [operatorValue];
        } else {
          operands = [];
        }

        trace.push({
          step: stepCounter++,
          operation: `Operator: ${operator}`,
          operator,
          operands,
          result,
          level,
          duration: stepEnd - stepStart,
        });

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Error in operator "${operator}": ${errorMessage}`);

        trace.push({
          step: stepCounter++,
          operation: `Error in operator: ${operator}`,
          operator,
          result: null,
          level,
        });

        throw error;
      }
    },
  };

  try {
    // Execute with interception
    const result = interceptor.apply(rule, data, 0);
    const endTime = performance.now();

    return {
      result,
      success: true,
      trace,
      totalTime: endTime - startTime,
      variablesAccessed,
      operatorsUsed,
      maxDepth,
      errors,
      warnings,
    };
  } catch (error) {
    const endTime = performance.now();

    return {
      result: null,
      success: false,
      trace,
      totalTime: endTime - startTime,
      variablesAccessed,
      operatorsUsed,
      maxDepth,
      errors: [...errors, error instanceof Error ? error.message : 'Unknown error'],
      warnings,
    };
  }
}

/**
 * Inspect a variable in the data context
 *
 * @param variableName Variable name (supports dot notation)
 * @param data Data context
 * @returns Variable inspection
 */
export function inspectVariable(
  variableName: string,
  data: JsonLogicData
): VariableInspection {
  const path = variableName.split('.');
  let value: unknown = data;

  for (const key of path) {
    if (value && typeof value === 'object') {
      const objValue = value as Record<string, unknown>;
      if (Object.prototype.hasOwnProperty.call(objValue, key)) {
        value = objValue[key];
      } else {
        value = undefined;
      }
    } else {
      value = undefined;
      break;
    }
  }

  return {
    name: variableName,
    value,
    type: typeof value,
    defined: value !== undefined,
    truthy: Boolean(value),
    path,
  };
}

/**
 * Inspect all variables in a rule
 *
 * @param rule Rule to inspect
 * @param data Data context
 * @returns Array of variable inspections
 */
export function inspectAllVariables(
  rule: JsonLogicRule,
  data: JsonLogicData
): VariableInspection[] {
  const validation = validateRule(rule);
  const variables = validation.variables ?? [];

  return variables.map((varName) => inspectVariable(varName, data));
}

/**
 * Perform comprehensive rule inspection
 *
 * @param rule Rule to inspect
 * @param data Optional data context
 * @returns Rule inspection result
 */
export function inspectRule(
  rule: JsonLogicRule,
  data?: JsonLogicData
): RuleInspection {
  const validation = validateRule(rule);

  const operators = validation.operators ?? [];
  const variables = validation.variables ?? [];

  // Count variable usage
  const variableUsage = new Map<string, number>();
  const operatorUsage = new Map<string, number>();

  const processNodeKey = (
    nodeRecord: Record<string, unknown>,
    key: string,
    countUsage: (node: JsonLogicRule) => void
  ): void => {
    if (key === 'var') {
      const nodeValue = Object.prototype.hasOwnProperty.call(nodeRecord, key)
        ? nodeRecord[key]
        : undefined;
      const varPath = typeof nodeValue === 'string' ? nodeValue : String(nodeValue);
      variableUsage.set(varPath, (variableUsage.get(varPath) ?? 0) + 1);
    } else {
      operatorUsage.set(key, (operatorUsage.get(key) ?? 0) + 1);
    }

    const value = Object.prototype.hasOwnProperty.call(nodeRecord, key)
      ? nodeRecord[key]
      : undefined;
    if (value !== undefined) {
      countUsage(value as JsonLogicRule);
    }
  };

  const countUsage = (node: JsonLogicRule): void => {
    if (node === null || typeof node !== 'object') return;

    if (Array.isArray(node)) {
      node.forEach(countUsage);
      return;
    }

    const nodeRecord = node as Record<string, unknown>;
    for (const key of Object.keys(node)) {
      processNodeKey(nodeRecord, key, countUsage);
    }
  };

  countUsage(rule);

  // Generate suggestions
  const suggestions: string[] = [];

  if (validation.complexity && validation.complexity > 80) {
    suggestions.push('Rule complexity is high - consider breaking into multiple rules');
  }

  if (validation.warnings.length > 0) {
    suggestions.push(`Address ${validation.warnings.length} validation warnings`);
  }

  // Check for unused variables
  if (data) {
    const dataKeys = Object.keys(data);
    const unusedData = dataKeys.filter((key) => !variables.includes(key));
    if (unusedData.length > 0) {
      suggestions.push(`Data contains unused fields: ${unusedData.join(', ')}`);
    }
  }

  return {
    structure: {
      operators,
      variables,
      depth: validation.complexity ? Math.floor(validation.complexity / 10) : 0,
      complexity: validation.complexity ?? 0,
    },
    validation: {
      valid: validation.valid,
      errors: validation.errors.map((e) => e.message),
      warnings: validation.warnings.map((w) => w.message),
    },
    variableUsage,
    operatorUsage,
    suggestions,
  };
}

/**
 * Format debug trace as readable string
 *
 * @param trace Debug trace
 * @returns Formatted string
 */
export function formatDebugTrace(trace: DebugTraceStep[]): string {
  const lines: string[] = ['Debug Trace:', ''];

  for (const step of trace) {
    const indent = '  '.repeat(step.level);
    const duration = step.duration ? ` (${step.duration.toFixed(2)}ms)` : '';

    lines.push(`${indent}[${step.step}] ${step.operation}${duration}`);

    if (step.operands && step.operands.length > 0) {
      lines.push(`${indent}    Operands: ${JSON.stringify(step.operands)}`);
    }

    lines.push(`${indent}    Result: ${JSON.stringify(step.result)}`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Compare two rule evaluations
 *
 * Useful for debugging why results differ between versions or data sets
 *
 * @param rule Rule to evaluate
 * @param data1 First data context
 * @param data2 Second data context
 * @returns Comparison report
 */
export async function compareEvaluations(
  rule: JsonLogicRule,
  data1: JsonLogicData,
  data2: JsonLogicData
): Promise<{
  result1: unknown;
  result2: unknown;
  same: boolean;
  differences: Array<{
    field: string;
    value1: unknown;
    value2: unknown;
  }>;
}> {
  const result1 = await evaluateRule(rule, data1);
  const result2 = await evaluateRule(rule, data2);

  const differences: Array<{
    field: string;
    value1: unknown;
    value2: unknown;
  }> = [];

  // Compare data contexts
  const allKeys = new Set([...Object.keys(data1), ...Object.keys(data2)]);

  for (const key of allKeys) {
    const data1Record = data1 as Record<string, unknown>;
    const data2Record = data2 as Record<string, unknown>;
    const hasKey1 = Object.prototype.hasOwnProperty.call(data1Record, key);
    const hasKey2 = Object.prototype.hasOwnProperty.call(data2Record, key);
    const value1 = hasKey1 ? data1Record[key] : undefined;
    const value2 = hasKey2 ? data2Record[key] : undefined;

    if (value1 !== value2) {
      differences.push({
        field: key,
        value1,
        value2,
      });
    }
  }

  return {
    result1: result1.result,
    result2: result2.result,
    same: result1.result === result2.result,
    differences,
  };
}

