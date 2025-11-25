/**
 * Rule Export Functions
 */

import { getDatabase } from '../../../db/database';
import { type RuleDefinition, type RuleExportOptions, type RulePackage } from '../schema';
import { convertDatabaseRuleToDefinition } from './database';

export async function exportRule(
  ruleId: string,
  options: RuleExportOptions = {}
): Promise<RuleDefinition | null> {
  const db = getDatabase();
  const rule = await db.eligibility_rules.findOne(ruleId).exec();

  if (!rule) {
    return null;
  }

  return convertDatabaseRuleToDefinition(rule, options);
}

export async function exportRules(
  ruleIds: string[],
  options: RuleExportOptions = {}
): Promise<RuleDefinition[]> {
  const rules: RuleDefinition[] = [];

  for (const id of ruleIds) {
    const rule = await exportRule(id, options);
    if (rule) {
      rules.push(rule);
    }
  }

  return rules;
}

export async function exportRulePackage(
  ruleIds: string[],
  packageName: string,
  options: RuleExportOptions = {}
): Promise<RulePackage> {
  const rules = await exportRules(ruleIds, options);

  const metadata = {
    id: `package-${Date.now()}`,
    name: packageName,
    version: { major: 1, minor: 0, patch: 0 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const pkg: RulePackage = {
    metadata,
    rules,
  };

  const { calculateChecksum } = await import('../schema');
  pkg.checksum = await calculateChecksum({
    metadata: pkg.metadata,
    rules: pkg.rules,
  });

  return pkg;
}

export async function exportProgramRules(
  programId: string,
  options: RuleExportOptions = {}
): Promise<RuleDefinition[]> {
  const db = getDatabase();
  const rules = await db.eligibility_rules
    .find({
      selector: { programId },
    })
    .exec();

  return rules.map((rule) => convertDatabaseRuleToDefinition(rule, options));
}

export async function exportToJSON(
  ruleIds: string[],
  options: RuleExportOptions = {}
): Promise<string> {
  const rules = await exportRules(ruleIds, options);

  const indent = options.pretty ? 2 : undefined;
  return JSON.stringify(rules, null, indent);
}

export async function exportPackageToJSON(
  ruleIds: string[],
  packageName: string,
  options: RuleExportOptions = {}
): Promise<string> {
  const pkg = await exportRulePackage(ruleIds, packageName, options);

  const indent = options.pretty ? 2 : undefined;
  return JSON.stringify(pkg, null, indent);
}
