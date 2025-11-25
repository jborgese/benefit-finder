/**
 * Types for Rule Import/Export
 */

export interface UnknownRuleData {
  id?: unknown;
  programId?: unknown;
  ruleLogic?: unknown;
  version?: unknown;
  active?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  testCases?: unknown;
}

export interface RuleMetadata {
  ruleId: string;
  programId: string;
}
