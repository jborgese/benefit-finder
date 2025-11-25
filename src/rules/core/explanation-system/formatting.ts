/**
 * Formatting Utilities
 */

/**
 * Maps technical field names to user-friendly descriptions
 */
const FIELD_NAME_MAPPINGS: Record<string, string> = {
  // Demographics
  'age': 'your age',
  'isPregnant': 'pregnancy status',
  'hasChildren': 'whether you have children',
  'hasQualifyingDisability': 'qualifying disability status',
  'isCitizen': 'citizenship status',
  'isLegalResident': 'legal residency status',
  'ssn': 'Social Security number',

  // Financial
  'householdIncome': 'your household\'s monthly income',
  'householdSize': 'your household size',
  'income': 'your income',
  'grossIncome': 'your gross income',
  'netIncome': 'your net income',
  'monthlyIncome': 'your monthly income',
  'annualIncome': 'your annual income',
  'assets': 'your household assets',
  'resources': 'your available resources',
  'liquidAssets': 'your liquid assets',
  'vehicleValue': 'your vehicle value',
  'bankBalance': 'your bank account balance',

  // Location & State
  'state': 'your state of residence',
  'stateHasExpanded': 'whether your state has expanded coverage',
  'zipCode': 'your ZIP code',
  'county': 'your county',
  'jurisdiction': 'your location',

  // Program-specific
  'hasHealthInsurance': 'current health insurance coverage',
  'employmentStatus': 'your employment status',
  'isStudent': 'student status',
  'isVeteran': 'veteran status',
  'isSenior': 'senior status (65+)',
  'hasMinorChildren': 'whether you have children under 18',

  // Housing
  'housingCosts': 'your housing costs',
  'rentAmount': 'your monthly rent',
  'mortgageAmount': 'your monthly mortgage',
  'isHomeless': 'housing situation',

  // Benefits
  'receivesSSI': 'Supplemental Security Income (SSI)',
  'receivesSNAP': 'SNAP benefits',
  'receivesTANF': 'TANF benefits',
  'receivesWIC': 'WIC benefits',
  'receivesUnemployment': 'unemployment benefits',
};

/**
 * Format field name to human-readable description
 */
export function formatFieldName(fieldName: string): string {
  // Check if we have a specific mapping for this field
  if (Object.prototype.hasOwnProperty.call(FIELD_NAME_MAPPINGS, fieldName)) {
    return FIELD_NAME_MAPPINGS[fieldName];
  }

  // Fall back to converting camelCase or snake_case to Title Case
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

/**
 * Format value for display
 */
export function formatValue(value: unknown): string {
  if (value === null) {return 'empty';}
  if (value === undefined) {return 'not provided';}
  if (typeof value === 'boolean') {return value ? 'yes' : 'no';}
  if (typeof value === 'number') {
    // Format as currency if it looks like money
    if (value > 100) {
      return `$${value.toLocaleString()}`;
    }
    return String(value);
  }
  if (typeof value === 'string') {return `"${value}"`;}
  if (Array.isArray(value)) {return `[${value.length} items]`;}
  if (typeof value === 'object' && 'var' in value) {
    return formatFieldName((value as Record<string, unknown>).var as string);
  }

  return JSON.stringify(value);
}
