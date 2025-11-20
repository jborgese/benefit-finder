/**
 * Maps technical field names to user-friendly descriptions
 */
export const FIELD_NAME_MAPPINGS: Record<string, string> = {
  // Demographics
  'age': 'Your age',
  'isPregnant': 'Pregnancy status',
  'hasChildren': 'Whether you have children',
  'hasQualifyingDisability': 'Qualifying disability status',
  'isCitizen': 'Citizenship status',
  'isLegalResident': 'Legal residency status',
  'ssn': 'Social Security number',

  // Financial
  'householdIncome': 'Your household\'s monthly income',
  'householdSize': 'Your household size',
  'income': 'Your income',
  'grossIncome': 'Your gross income',
  'netIncome': 'Your net income',
  'monthlyIncome': 'Your monthly income',
  'annualIncome': 'Your annual income',
  'assets': 'Your household assets',
  'resources': 'Your available resources',
  'liquidAssets': 'Your liquid assets',
  'vehicleValue': 'Your vehicle value',
  'bankBalance': 'Your bank account balance',

  // Location & State
  'state': 'Your state of residence',
  'stateHasExpanded': 'Whether your state has expanded coverage',
  'zipCode': 'Your ZIP code',
  'county': 'Your county',
  'jurisdiction': 'Your location',

  // Program-specific
  'hasHealthInsurance': 'Current health insurance coverage',
  'employmentStatus': 'Your employment status',
  'isStudent': 'Student status',
  'isVeteran': 'Veteran status',
  'isSenior': 'Senior status (65+)',
  'hasMinorChildren': 'Whether you have children under 18',

  // Housing
  'housingCosts': 'Your housing costs',
  'rentAmount': 'Your monthly rent',
  'mortgageAmount': 'Your monthly mortgage',
  'isHomeless': 'Housing situation',

  // Benefits
  'receivesSSI': 'Supplemental Security Income (SSI)',
  'receivesSNAP': 'SNAP benefits',
  'receivesTANF': 'TANF benefits',
  'receivesWIC': 'WIC benefits',
  'receivesUnemployment': 'Unemployment benefits',
  'livesInState': 'State residency',
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

