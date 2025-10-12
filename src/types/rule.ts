/**
 * Rule Definition Types
 *
 * Types for eligibility rules and JSON Logic.
 */

import type { EligibilityRule as DbEligibilityRule } from '../db/schemas';

/**
 * Rule Type
 */
export type RuleType =
  | 'eligibility'
  | 'benefit_amount'
  | 'document_requirements'
  | 'conditional';

/**
 * JSON Logic Operators
 */
export type JsonLogicOperator =
  | '=='
  | '==='
  | '!='
  | '!=='
  | '<'
  | '<='
  | '>'
  | '>='
  | '!'
  | '!!'
  | 'or'
  | 'and'
  | 'if'
  | 'var'
  | 'missing'
  | 'missing_some'
  | 'in'
  | 'cat'
  | 'substr'
  | '+'
  | '-'
  | '*'
  | '/'
  | '%'
  | 'map'
  | 'reduce'
  | 'filter'
  | 'all'
  | 'none'
  | 'some'
  | 'merge'
  | 'log';

/**
 * JSON Logic Rule
 *
 * Represents a JSON Logic expression.
 * See: https://jsonlogic.com/
 */
export type RuleLogic =
  | { [operator: string]: any }
  | string
  | number
  | boolean
  | null
  | RuleLogic[];

/**
 * Rule Variable
 *
 * Variables that can be used in rules.
 */
export interface RuleVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
}

/**
 * Rule Criterion
 *
 * Individual criterion within a rule.
 */
export interface RuleCriterion {
  id: string;
  name: string;
  description: string;
  logic: RuleLogic;
  required: boolean;
  weight?: number; // For confidence scoring
}

/**
 * Rule Test Case
 *
 * Test case for validating rule logic.
 */
export interface RuleTestCase {
  input: Record<string, any>;
  expectedOutput: boolean;
  description: string;
  notes?: string;
}

/**
 * Rule Definition
 *
 * Complete eligibility rule definition.
 * This is the main interface for rule data.
 *
 * Extends database type with additional fields.
 */
export interface RuleDefinition extends DbEligibilityRule {
  // Extended fields (not in database)
  criteria?: RuleCriterion[];
  variables?: RuleVariable[];

  // Metadata
  tags?: string[];
  complexity?: 'simple' | 'moderate' | 'complex';

  // Validation
  validated?: boolean;
  validationDate?: number;
  validatedBy?: string;
}

/**
 * Rule Evaluation Context
 *
 * Context data available during rule evaluation.
 */
export interface RuleEvaluationContext {
  profile: Record<string, any>;
  constants?: Record<string, any>;
  helpers?: Record<string, (...args: any[]) => any>;
  timestamp: number;
}

/**
 * Rule Evaluation Result
 *
 * Result of evaluating a single rule.
 */
export interface RuleEvaluationResult {
  ruleId: string;
  passed: boolean;
  confidence: number;
  criteriaResults?: {
    criterionId: string;
    passed: boolean;
    value?: any;
    threshold?: any;
    message?: string;
  }[];
  errors?: string[];
  warnings?: string[];
  metadata?: Record<string, any>;
}

/**
 * Rule Validation Error
 */
export interface RuleValidationError {
  ruleId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Rule Set
 *
 * Collection of related rules.
 */
export interface RuleSet {
  id: string;
  name: string;
  description: string;
  programId: string;
  rules: RuleDefinition[];
  evaluationStrategy: 'all' | 'any' | 'priority' | 'weighted';
  version: string;
  active: boolean;
}

/**
 * Rule Builder Helper
 *
 * Helper type for building rules programmatically.
 */
export interface RuleBuilder {
  equals: (field: string, value: any) => RuleLogic;
  lessThan: (field: string, value: number) => RuleLogic;
  greaterThan: (field: string, value: number) => RuleLogic;
  between: (field: string, min: number, max: number) => RuleLogic;
  in: (field: string, values: any[]) => RuleLogic;
  and: (...conditions: RuleLogic[]) => RuleLogic;
  or: (...conditions: RuleLogic[]) => RuleLogic;
  not: (condition: RuleLogic) => RuleLogic;
}

