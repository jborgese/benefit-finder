/**
 * Get translation key for program name from program ID
 */
export function getProgramNameKey(programId: string): string {
  const nameKeys = new Map<string, string>([
    ['snap-federal', 'benefits.snap'],
    ['medicaid-federal', 'benefits.medicaid'],
    ['wic-federal', 'benefits.wic'],
    ['tanf-federal', 'benefits.tanf'],
    ['ssi-federal', 'benefits.ssi'],
    ['section8-federal', 'benefits.section8'],
    ['lihtc-federal', 'benefits.lihtc'],
  ]);
  return nameKeys.get(programId) ?? `benefits.${programId}`;
}

/**
 * Get translation key for program description from program ID
 */
export function getProgramDescriptionKey(programId: string): string {
  const descriptionKeys = new Map<string, string>([
    ['snap-federal', 'benefits.descriptions.snap'],
    ['medicaid-federal', 'benefits.descriptions.medicaid'],
    ['wic-federal', 'benefits.descriptions.wic'],
    ['tanf-federal', 'benefits.descriptions.tanf'],
    ['ssi-federal', 'benefits.descriptions.ssi'],
    ['section8-federal', 'benefits.descriptions.section8'],
    ['lihtc-federal', 'benefits.descriptions.lihtc'],
  ]);
  return descriptionKeys.get(programId) ?? 'benefits.descriptions.default';
}

/**
 * Get user-friendly program name from program ID (fallback for non-translated contexts)
 */
export function getProgramName(programId: string): string {
  const names = new Map<string, string>([
    ['snap-federal', 'Supplemental Nutrition Assistance Program (SNAP)'],
    ['medicaid-federal', 'Medicaid'],
    ['wic-federal', 'Special Supplemental Nutrition Program for Women, Infants, and Children (WIC)'],
  ]);
  return names.get(programId) ?? programId;
}

/**
 * Get program description from program ID (fallback for non-translated contexts)
 */
export function getProgramDescription(programId: string): string {
  const descriptions = new Map<string, string>([
    ['snap-federal', 'SNAP helps low-income individuals and families buy food'],
    ['medicaid-federal', 'Health coverage for low-income individuals and families'],
    ['wic-federal', 'Provides nutrition assistance to pregnant women, new mothers, and young children'],
  ]);
  return descriptions.get(programId) ?? 'Government benefit program';
}

