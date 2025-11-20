// Extractor and Category Helper Functions for Rule Discovery
import { ProgramInfo, RuleDiscoveryConfig } from './ruleDiscoveryConfig';

export function extractRulePackage(module: Record<string, unknown>, filePath: string): Record<string, unknown> | null {
  // Extract rule package from imported module
  if (typeof module === 'object') {
    if ('default' in module && typeof module['default'] === 'object') {
      return module['default'] as Record<string, unknown>;
    }
    return module;
  }
  console.warn(`[RuleDiscovery] Could not extract rule package from ${filePath}`);
  return null;
}
export function extractProgramInfo(rulePackage: Record<string, unknown>, config: RuleDiscoveryConfig): ProgramInfo {
  // Extract program info from rule package metadata
  const { programs, name, shortName: metaShortName, description, tags, jurisdiction, website, phoneNumber, applicationUrl } = rulePackage['metadata'] as Record<string, unknown>;
  const id = Array.isArray(programs) && programs.length > 0
    ? String(programs[0])
    : config.defaultJurisdiction;
  let shortName: string;
  if (typeof metaShortName === 'string') {
    shortName = metaShortName;
  } else if (typeof name === 'string') {
    shortName = name;
  } else {
    shortName = id;
  }
  return {
    id,
    name: typeof name === 'string' ? name : id,
    shortName,
    description: typeof description === 'string' ? description : '',
    category: determineProgramCategory(id, Array.isArray(tags) ? tags as string[] : []),
    jurisdiction: typeof jurisdiction === 'string' ? jurisdiction : config.defaultJurisdiction,
    website: typeof website === 'string' ? website : undefined,
    phoneNumber: typeof phoneNumber === 'string' ? phoneNumber : undefined,
    applicationUrl: typeof applicationUrl === 'string' ? applicationUrl : undefined,
    tags: Array.isArray(tags) ? tags as string[] : [],
  };
}
const SNAP_FEDERAL_ID = 'snap-federal';
const SSI_FEDERAL_ID = 'ssi-federal';
const WIC_FEDERAL_ID = 'wic-federal';
const MEDICAID_FEDERAL_ID = 'medicaid-federal';
const LIHEAP_FEDERAL_ID = 'liheap-federal';

const PROGRAM_NAMES = new Map<string, string>([
  [SNAP_FEDERAL_ID, 'Supplemental Nutrition Assistance Program (SNAP)'],
  [SSI_FEDERAL_ID, 'Supplemental Security Income (SSI)'],
  [WIC_FEDERAL_ID, 'Special Supplemental Nutrition Program for Women, Infants, and Children (WIC)'],
  [MEDICAID_FEDERAL_ID, 'Medicaid'],
  [LIHEAP_FEDERAL_ID, 'Low-Income Home Energy Assistance Program (LIHEAP)'],
]);

export function extractProgramName(ruleName: string, programId: string): string {
  // Map programId to user-friendly name
  return PROGRAM_NAMES.get(programId) || ruleName || programId;
}
const PROGRAM_DESCRIPTIONS = new Map<string, string>([
  [SNAP_FEDERAL_ID, 'SNAP helps low-income individuals and families buy food'],
  [SSI_FEDERAL_ID, 'SSI provides cash assistance to aged, blind, and disabled people'],
  [WIC_FEDERAL_ID, 'Provides nutrition assistance to pregnant women, new mothers, and young children'],
  [MEDICAID_FEDERAL_ID, 'Health coverage for low-income individuals and families'],
  [LIHEAP_FEDERAL_ID, 'Helps low-income households with energy costs'],
]);

export function extractProgramDescription(programId: string, ruleDescription?: string): string {
  // Map programId to description
  return PROGRAM_DESCRIPTIONS.get(programId) || ruleDescription || 'Government benefit program';
}
const PROGRAM_SHORT_NAMES = new Map<string, string>([
  [SNAP_FEDERAL_ID, 'SNAP'],
  [SSI_FEDERAL_ID, 'SSI'],
  [WIC_FEDERAL_ID, 'WIC'],
  [MEDICAID_FEDERAL_ID, 'Medicaid'],
  [LIHEAP_FEDERAL_ID, 'LIHEAP'],
]);

export function extractShortName(programName: string, programId: string): string {
  // Use shortName or fallback to programId
  return PROGRAM_SHORT_NAMES.get(programId) || programName || programId;
}
export function determineProgramCategory(programId: string, tags: string[] = []): string {
  // Determine category based on programId or tags
  if (tags.includes('food') || programId.includes('snap') || programId.includes('wic')) { return 'food'; }
  if (tags.includes('healthcare') || programId.includes('medicaid')) { return 'healthcare'; }
  if (tags.includes('housing') || programId.includes('lihtc') || programId.includes('section8')) { return 'housing'; }
  if (tags.includes('financial') || programId.includes('ssi') || programId.includes('tanf')) { return 'financial'; }
  if (tags.includes('utilities') || programId.includes('liheap')) { return 'utilities'; }
  if (tags.includes('childcare')) { return 'childcare'; }
  if (tags.includes('education')) { return 'education'; }
  if (tags.includes('employment')) { return 'employment'; }
  if (tags.includes('transportation')) { return 'transportation'; }
  if (tags.includes('legal')) { return 'legal'; }
  return 'other';
}
const PROGRAM_WEBSITES = new Map<string, string>([
  [SNAP_FEDERAL_ID, 'https://www.fns.usda.gov/snap'],
  [SSI_FEDERAL_ID, 'https://www.ssa.gov/ssi/'],
  [WIC_FEDERAL_ID, 'https://www.fns.usda.gov/wic'],
  [MEDICAID_FEDERAL_ID, 'https://www.medicaid.gov'],
  [LIHEAP_FEDERAL_ID, 'https://www.acf.hhs.gov/ocs/energy-assistance/liheap'],
]);

export function extractWebsite(programId: string): string {
  // Provide default website for known programs
  return PROGRAM_WEBSITES.get(programId) ?? '';
}
const PROGRAM_PHONES = new Map<string, string>([
  [SNAP_FEDERAL_ID, '1-800-221-5689'],
  [SSI_FEDERAL_ID, '1-800-772-1213'],
  [WIC_FEDERAL_ID, '1-800-522-5006'],
  [MEDICAID_FEDERAL_ID, '1-800-318-2596'],
  [LIHEAP_FEDERAL_ID, '1-866-674-6327'],
]);

export function extractPhoneNumber(programId: string): string {
  // Provide default phone number for known programs
  return PROGRAM_PHONES.get(programId) || '';
}
const PROGRAM_APPLICATION_URLS = new Map<string, string>([
  [SNAP_FEDERAL_ID, 'https://www.fns.usda.gov/snap/apply'],
  [SSI_FEDERAL_ID, 'https://www.ssa.gov/ssi/apply.html'],
  [WIC_FEDERAL_ID, 'https://www.fns.usda.gov/wic/apply'],
  [MEDICAID_FEDERAL_ID, 'https://www.healthcare.gov'],
  [LIHEAP_FEDERAL_ID, 'https://www.acf.hhs.gov/ocs/apply-liheap'],
]);

export function extractApplicationUrl(programId: string): string {
  // Provide default application URL for known programs
  return PROGRAM_APPLICATION_URLS.get(programId) ?? '';
}
