// Rule Discovery Configuration Types and Constants

export type ProgramInfo = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: string;
  jurisdiction: string;
  website?: string;
  phoneNumber?: string;
  applicationUrl?: string;
  tags: string[];
};

export interface RuleDiscoveryConfig {
  baseDir: string;
  pattern: RegExp;
  jurisdictionLevel: 'federal' | 'state' | 'county' | 'city';
  defaultJurisdiction: string;
}

export interface DiscoveredRuleFile {
  path: string;
  rulePackage: Record<string, unknown>;
  programInfo: ProgramInfo;
}

export const US_FEDERAL_JURISDICTION = 'US-FEDERAL';
export const SNAP_FEDERAL_ID = 'snap-federal';
export const SSI_FEDERAL_ID = 'ssi-federal';

export const FEDERAL_RULE_CONFIG: RuleDiscoveryConfig = {
  baseDir: '../rules/federal',
  pattern: /.*-federal-rules\.json$/,
  jurisdictionLevel: 'federal',
  defaultJurisdiction: US_FEDERAL_JURISDICTION,
};
