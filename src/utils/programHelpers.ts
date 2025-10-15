/**
 * Get user-friendly program name from program ID
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
 * Get program description from program ID
 */
export function getProgramDescription(programId: string): string {
  const descriptions = new Map<string, string>([
    ['snap-federal', 'SNAP helps low-income individuals and families buy food'],
    ['medicaid-federal', 'Health coverage for low-income individuals and families'],
    ['wic-federal', 'Provides nutrition assistance to pregnant women, new mothers, and young children'],
  ]);
  return descriptions.get(programId) ?? 'Government benefit program';
}

