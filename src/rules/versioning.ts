/**
 * Rule Versioning System
 *
 * Manages rule versions, migrations, and version history.
 */

import { getDatabase } from '../db/database';
import {
  formatVersion,
  compareVersions,
  incrementVersion,
  isNewerVersion,
  parseVersion,
  type RuleVersion,
  type RuleDefinition,
  type RuleChange,
} from './schema';

// ============================================================================
// VERSION MANAGEMENT
// ============================================================================

/**
 * Get the latest version of a rule
 *
 * @param ruleId Rule identifier (without version suffix)
 * @returns Latest rule version or null
 */
export async function getLatestRuleVersion(
  ruleId: string
): Promise<{ rule: any; version: RuleVersion } | null> {
  const db = getDatabase();

  // Find all rules with this ID (may have version suffixes)
  const rules = await db.eligibility_rules
    .find({
      selector: {
        id: {
          $regex: new RegExp(`^${ruleId}`),
        },
      },
    })
    .exec();

  if (rules.length === 0) {
    return null;
  }

  // Find latest version
  let latestRule = rules[0];
  let latestVersion = parseVersion(latestRule.version || '0.1.0');

  for (const rule of rules.slice(1)) {
    const version = parseVersion(rule.version || '0.1.0');
    if (isNewerVersion(version, latestVersion)) {
      latestRule = rule;
      latestVersion = version;
    }
  }

  return { rule: latestRule, version: latestVersion };
}

/**
 * Get all versions of a rule
 *
 * @param ruleId Rule identifier
 * @returns Array of rule versions, sorted newest first
 */
export async function getAllRuleVersions(
  ruleId: string
): Promise<Array<{ rule: any; version: RuleVersion }>> {
  const db = getDatabase();

  const rules = await db.eligibility_rules
    .find({
      selector: {
        id: {
          $regex: new RegExp(`^${ruleId}`),
        },
      },
    })
    .exec();

  const versions = rules.map((rule) => ({
    rule,
    version: parseVersion(rule.version || '0.1.0'),
  }));

  // Sort by version (newest first)
  versions.sort((a, b) => compareVersions(b.version, a.version));

  return versions;
}

/**
 * Create a new version of a rule
 *
 * @param ruleId Rule ID to version
 * @param level Version increment level
 * @param changes Description of changes
 * @param author Who made the changes
 * @returns New rule version
 */
export async function createRuleVersion(
  ruleId: string,
  level: 'major' | 'minor' | 'patch',
  changes: string,
  author?: string
): Promise<RuleDefinition | null> {
  const latest = await getLatestRuleVersion(ruleId);

  if (!latest) {
    throw new Error(`Rule ${ruleId} not found`);
  }

  const newVersion = incrementVersion(latest.version, level);
  const now = Date.now();

  // Create change record
  const changeRecord: RuleChange = {
    version: newVersion,
    date: now,
    author: author || 'system',
    description: changes,
    breaking: level === 'major',
  };

  // Create new rule with incremented version
  const newRule: Partial<RuleDefinition> = {
    ...latest.rule,
    version: newVersion,
    updatedAt: now,
    supersedes: ruleId,
    changelog: [
      ...(latest.rule.changelog || []),
      changeRecord,
    ],
  };

  return newRule as RuleDefinition;
}

// ============================================================================
// VERSION MIGRATION
// ============================================================================

/**
 * Migration function type
 */
export type RuleMigration = (rule: any) => Promise<any> | any;

/**
 * Version migration definition
 */
export interface VersionMigration {
  fromVersion: RuleVersion;
  toVersion: RuleVersion;
  description: string;
  migrate: RuleMigration;
}

/**
 * Migration registry
 */
const migrationRegistry: Map<string, VersionMigration[]> = new Map();

/**
 * Register a migration
 *
 * @param programId Program ID this migration applies to
 * @param migration Migration definition
 */
export function registerMigration(
  programId: string,
  migration: VersionMigration
): void {
  const migrations = migrationRegistry.get(programId) || [];
  migrations.push(migration);
  migrationRegistry.set(programId, migrations);
}

/**
 * Get available migrations for a version range
 *
 * @param programId Program ID
 * @param fromVersion Starting version
 * @param toVersion Target version
 * @returns Array of applicable migrations
 */
export function getMigrations(
  programId: string,
  fromVersion: RuleVersion,
  toVersion: RuleVersion
): VersionMigration[] {
  const allMigrations = migrationRegistry.get(programId) || [];

  return allMigrations.filter((m) => {
    const afterFrom = compareVersions(m.fromVersion, fromVersion) >= 0;
    const beforeTo = compareVersions(m.toVersion, toVersion) <= 0;
    return afterFrom && beforeTo;
  }).sort((a, b) => compareVersions(a.fromVersion, b.fromVersion));
}

/**
 * Migrate a rule to a new version
 *
 * @param rule Rule to migrate
 * @param targetVersion Target version
 * @returns Migrated rule
 */
export async function migrateRule(
  rule: RuleDefinition,
  targetVersion: RuleVersion
): Promise<RuleDefinition> {
  const currentVersion = rule.version;

  // Check if migration is needed
  if (compareVersions(currentVersion, targetVersion) >= 0) {
    return rule; // Already at or beyond target version
  }

  // Get applicable migrations
  const migrations = getMigrations(rule.programId, currentVersion, targetVersion);

  if (migrations.length === 0) {
    throw new Error(
      `No migrations available from ${formatVersion(currentVersion)} ` +
      `to ${formatVersion(targetVersion)}`
    );
  }

  // Apply migrations in order
  let migratedRule = { ...rule };

  for (const migration of migrations) {
    migratedRule = await migration.migrate(migratedRule);
    migratedRule.version = migration.toVersion;
  }

  return migratedRule;
}

/**
 * Migrate all rules for a program to latest version
 *
 * @param programId Program ID
 * @param targetVersion Target version (optional, uses latest if not specified)
 * @returns Migration results
 */
export async function migrateAllProgramRules(
  programId: string,
  targetVersion?: RuleVersion
): Promise<{
  total: number;
  migrated: number;
  skipped: number;
  errors: Array<{ ruleId: string; error: string }>;
}> {
  const db = getDatabase();

  const rules = await db.eligibility_rules
    .find({
      selector: { programId },
    })
    .exec();

  const result = {
    total: rules.length,
    migrated: 0,
    skipped: 0,
    errors: [] as Array<{ ruleId: string; error: string }>,
  };

  for (const rule of rules) {
    try {
      const currentVersion = parseVersion(rule.version || '0.1.0');

      // Determine target version if not specified
      const target = targetVersion || { major: currentVersion.major + 1, minor: 0, patch: 0 };

      // Check if migration is needed
      if (compareVersions(currentVersion, target) >= 0) {
        result.skipped++;
        continue;
      }

      // Attempt migration
      const ruleDefinition = rule.toJSON() as RuleDefinition;
      const migrated = await migrateRule(ruleDefinition, target);

      // Update rule in database
      await rule.update({
        $set: {
          version: formatVersion(migrated.version),
          ruleLogic: migrated.ruleLogic,
          updatedAt: Date.now(),
        },
      });

      result.migrated++;

    } catch (error) {
      result.errors.push({
        ruleId: rule.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return result;
}

// ============================================================================
// VERSION COMPARISON & VALIDATION
// ============================================================================

/**
 * Check if a rule version is compatible with a target version
 *
 * @param ruleVersion Rule version
 * @param targetVersion Target version
 * @param allowMinorMismatch Allow minor version differences
 * @returns True if compatible
 */
export function isVersionCompatible(
  ruleVersion: RuleVersion,
  targetVersion: RuleVersion,
  allowMinorMismatch = true
): boolean {
  // Major version must match
  if (ruleVersion.major !== targetVersion.major) {
    return false;
  }

  if (allowMinorMismatch) {
    // Minor version can be >= target
    return ruleVersion.minor >= targetVersion.minor;
  }

  // Exact minor version match required
  return ruleVersion.minor === targetVersion.minor;
}

/**
 * Find breaking changes between versions
 *
 * @param rule Rule with changelog
 * @param fromVersion Starting version
 * @param toVersion Ending version
 * @returns Array of breaking changes
 */
export function findBreakingChanges(
  rule: RuleDefinition,
  fromVersion: RuleVersion,
  toVersion: RuleVersion
): RuleChange[] {
  if (!rule.changelog) {
    return [];
  }

  return rule.changelog.filter((change) => {
    if (!change.breaking) {
      return false;
    }

    const afterFrom = compareVersions(change.version, fromVersion) > 0;
    const beforeTo = compareVersions(change.version, toVersion) <= 0;

    return afterFrom && beforeTo;
  });
}

/**
 * Get version changelog
 *
 * @param rule Rule with changelog
 * @param fromVersion Optional starting version
 * @returns Formatted changelog
 */
export function getVersionChangelog(
  rule: RuleDefinition,
  fromVersion?: RuleVersion
): string {
  if (!rule.changelog || rule.changelog.length === 0) {
    return 'No changelog available';
  }

  const changes = fromVersion
    ? rule.changelog.filter((c) => compareVersions(c.version, fromVersion) > 0)
    : rule.changelog;

  const lines: string[] = [];

  for (const change of changes) {
    const version = formatVersion(change.version);
    const date = new Date(change.date).toLocaleDateString();
    const breaking = change.breaking ? ' [BREAKING]' : '';

    lines.push(`## Version ${version}${breaking} (${date})`);
    lines.push(`**Author:** ${change.author}`);
    lines.push(`**Changes:** ${change.description}`);
    lines.push('');
  }

  return lines.join('\n');
}

// ============================================================================
// VERSION CLEANUP
// ============================================================================

/**
 * Archive old rule versions
 *
 * @param ruleId Rule ID
 * @param keepVersions Number of versions to keep
 * @returns Number of archived versions
 */
export async function archiveOldVersions(
  ruleId: string,
  keepVersions = 5
): Promise<number> {
  const versions = await getAllRuleVersions(ruleId);

  if (versions.length <= keepVersions) {
    return 0; // Nothing to archive
  }

  const toArchive = versions.slice(keepVersions);

  for (const { rule } of toArchive) {
    await rule.update({
      $set: {
        active: false,
        draft: true,
      },
    });
  }

  return toArchive.length;
}

/**
 * Delete old rule versions
 *
 * WARNING: This permanently deletes rules. Use with caution.
 *
 * @param ruleId Rule ID
 * @param keepVersions Number of versions to keep
 * @returns Number of deleted versions
 */
export async function deleteOldVersions(
  ruleId: string,
  keepVersions = 3
): Promise<number> {
  const versions = await getAllRuleVersions(ruleId);

  if (versions.length <= keepVersions) {
    return 0; // Nothing to delete
  }

  const toDelete = versions.slice(keepVersions);

  for (const { rule } of toDelete) {
    await rule.remove();
  }

  return toDelete.length;
}

// ============================================================================
// EXAMPLE MIGRATIONS
// ============================================================================

/**
 * Example migration: Update rule logic structure
 */
export const exampleMigration_v1_to_v2: VersionMigration = {
  fromVersion: { major: 1, minor: 0, patch: 0 },
  toVersion: { major: 2, minor: 0, patch: 0 },
  description: 'Update rule logic to use new operator format',
  migrate: async (rule: RuleDefinition) => {
    // Example: Convert old operator to new operator
    const migratedLogic = JSON.parse(JSON.stringify(rule.ruleLogic));

    // Your migration logic here
    // e.g., renaming operators, restructuring logic, etc.

    return {
      ...rule,
      ruleLogic: migratedLogic,
    };
  },
};

/**
 * Register example migrations
 */
export function registerExampleMigrations(): void {
  // Example: Register migration for SNAP program
  registerMigration('snap-federal', exampleMigration_v1_to_v2);
}

