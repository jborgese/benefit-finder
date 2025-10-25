/**
 * California-Specific Questionnaire Questions
 *
 * These questions only appear when the user selects California as their resident state.
 * They capture California-specific eligibility factors for Medi-Cal and other programs.
 */

import type { FlowNode } from './types';

// California-specific questions that only show when state === 'CA'
export const californiaQuestions: FlowNode[] = [
  // Immigration Status Questions (for Medi-Cal immigrant coverage)
  {
    id: 'immigration-status-ca',
    question: {
      id: 'immigration-status-ca',
      text: 'What is your immigration status?',
      description: 'California provides health coverage to many immigrants, including DACA recipients and lawfully present immigrants.',
      inputType: 'select',
      fieldName: 'immigration_status',
      required: true,
      showIf: { '==': [{ var: 'state' }, 'CA'] },
      options: [
        { value: 'us_citizen', label: 'U.S. Citizen' },
        { value: 'permanent_resident', label: 'Permanent Resident (Green Card)' },
        { value: 'refugee', label: 'Refugee' },
        { value: 'asylee', label: 'Asylee' },
        { value: 'daca', label: 'DACA Recipient' },
        { value: 'lawfully_present', label: 'Lawfully Present Immigrant' },
        { value: 'other_qualified', label: 'Other Qualified Immigrant' },
        { value: 'undocumented', label: 'Undocumented' }
      ],
      helpText: 'California provides state-funded Medi-Cal to DACA recipients and lawfully present immigrants who are not eligible for federal Medicaid.'
    },
    nextId: 'years-in-us-ca'
  },
  {
    id: 'years-in-us-ca',
    question: {
      id: 'years-in-us-ca',
      text: 'How many years have you been in the United States?',
      description: 'This helps determine eligibility for certain programs.',
      inputType: 'number',
      fieldName: 'yearsInUS',
      required: false,
      showIf: {
        'and': [
          { '==': [{ var: 'state' }, 'CA'] },
          { 'in': [{ var: 'immigration_status' }, ['permanent_resident', 'lawfully_present', 'other_qualified']] }
        ]
      },
      min: 0,
      max: 100,
      helpText: 'California provides coverage to lawfully present immigrants regardless of how long they\'ve been in the U.S.'
    },
    previousId: 'immigration-status-ca',
    nextId: 'daca-status-ca'
  },
  {
    id: 'daca-status-ca',
    question: {
      id: 'daca-status-ca',
      text: 'Do you have a valid DACA status?',
      description: 'California provides state-funded Medi-Cal to DACA recipients.',
      inputType: 'boolean',
      fieldName: 'hasValidDACA',
      required: false,
      showIf: {
        'and': [
          { '==': [{ var: 'state' }, 'CA'] },
          { '==': [{ var: 'immigration_status' }, 'daca'] }
        ]
      },
      helpText: 'DACA recipients are eligible for state-funded Medi-Cal in California, even though they are not eligible for federal Medicaid.'
    },
    previousId: 'years-in-us-ca',
    nextId: 'student-efc-ca'
  },
  // Student EFC Question (California-specific for CalFresh)
  {
    id: 'student-efc-ca',
    question: {
      id: 'student-efc-ca',
      text: 'Do you have an Expected Family Contribution (EFC) of $0 on your FAFSA?',
      description: 'California allows students with $0 EFC to qualify for CalFresh (SNAP), even if they don\'t meet other student exemptions.',
      inputType: 'boolean',
      fieldName: 'expectedFamilyContributionZero',
      required: false,
      showIf: {
        'and': [
          { '==': [{ var: 'state' }, 'CA'] },
          { '==': [{ var: 'isStudent' }, true] }
        ]
      },
      helpText: 'Students with $0 EFC on their FAFSA can qualify for CalFresh in California, even if they don\'t work 20+ hours or meet other federal exemptions.'
    },
    previousId: 'daca-status-ca',
    nextId: 'california-residency-ca'
  },
  // California Residency Verification
  {
    id: 'california-residency-ca',
    question: {
      id: 'california-residency-ca',
      text: 'How long have you lived in California?',
      description: 'California residency is required for most state programs.',
      inputType: 'select',
      fieldName: 'californiaResidencyDuration',
      required: true,
      showIf: { '==': [{ var: 'state' }, 'CA'] },
      options: [
        { value: 'less_than_30_days', label: 'Less than 30 days' },
        { value: '30_days_to_6_months', label: '30 days to 6 months' },
        { value: '6_months_to_1_year', label: '6 months to 1 year' },
        { value: '1_to_2_years', label: '1 to 2 years' },
        { value: '2_to_5_years', label: '2 to 5 years' },
        { value: 'more_than_5_years', label: 'More than 5 years' },
        { value: 'born_in_ca', label: 'Born in California' }
      ],
      helpText: 'Most California programs require you to be a resident of the state.'
    },
    previousId: 'student-efc-ca',
    nextId: 'language-preference-ca'
  },
  // Language Preference (California has extensive language access)
  {
    id: 'language-preference-ca',
    question: {
      id: 'language-preference-ca',
      text: 'What is your preferred language for applications and communication?',
      description: 'California provides applications and assistance in multiple languages.',
      inputType: 'select',
      fieldName: 'preferredLanguage',
      required: false,
      showIf: { '==': [{ var: 'state' }, 'CA'] },
      options: [
        { value: 'english', label: 'English' },
        { value: 'spanish', label: 'Spanish (Español)' },
        { value: 'chinese', label: 'Chinese (中文)' },
        { value: 'vietnamese', label: 'Vietnamese (Tiếng Việt)' },
        { value: 'korean', label: 'Korean (한국어)' },
        { value: 'tagalog', label: 'Tagalog' },
        { value: 'arabic', label: 'Arabic (العربية)' },
        { value: 'other', label: 'Other' }
      ],
      helpText: 'California provides applications and assistance in many languages. You can request an interpreter for phone applications.'
    },
    previousId: 'california-residency-ca',
    nextId: 'emergency-medical-condition-ca'
  },
  // Emergency Medical Condition (for Emergency Medi-Cal)
  {
    id: 'emergency-medical-condition-ca',
    question: {
      id: 'emergency-medical-condition-ca',
      text: 'Do you have an emergency medical condition that requires immediate care?',
      description: 'Emergency Medi-Cal covers emergency medical conditions for all immigrants, regardless of immigration status.',
      inputType: 'boolean',
      fieldName: 'hasEmergencyMedicalCondition',
      required: false,
      showIf: { '==': [{ var: 'state' }, 'CA'] },
      helpText: 'Emergency Medi-Cal covers emergency medical conditions for all immigrants in California, regardless of immigration status.'
    },
    previousId: 'language-preference-ca',
    nextId: 'postpartum-status-ca'
  },
  // Postpartum Status (California has extended postpartum coverage)
  {
    id: 'postpartum-status-ca',
    question: {
      id: 'postpartum-status-ca',
      text: 'Are you in the 12 months after giving birth?',
      description: 'California provides 12 months of postpartum coverage (extended from federal 60 days).',
      inputType: 'boolean',
      fieldName: 'isPostpartum',
      required: false,
      showIf: {
        'and': [
          { '==': [{ var: 'state' }, 'CA'] },
          { '==': [{ var: 'isPregnant' }, false] }
        ]
      },
      helpText: 'California provides 12 months of postpartum coverage through Medi-Cal, much longer than the federal 60 days.'
    },
    previousId: 'emergency-medical-condition-ca',
    nextId: 'california-county-ca'
  },
  // California County Selection
  {
    id: 'california-county-ca',
    question: {
      id: 'california-county-ca',
      text: 'Which California county do you live in?',
      description: 'Some programs may have county-specific requirements or assistance.',
      inputType: 'searchable-select',
      fieldName: 'californiaCounty',
      required: true,
      showIf: { '==': [{ var: 'state' }, 'CA'] },
      options: [
        { value: 'los_angeles', label: 'Los Angeles County' },
        { value: 'san_diego', label: 'San Diego County' },
        { value: 'orange', label: 'Orange County' },
        { value: 'riverside', label: 'Riverside County' },
        { value: 'san_bernardino', label: 'San Bernardino County' },
        { value: 'santa_clara', label: 'Santa Clara County' },
        { value: 'alameda', label: 'Alameda County' },
        { value: 'sacramento', label: 'Sacramento County' },
        { value: 'contra_costa', label: 'Contra Costa County' },
        { value: 'fresno', label: 'Fresno County' },
        { value: 'kern', label: 'Kern County' },
        { value: 'ventura', label: 'Ventura County' },
        { value: 'san_francisco', label: 'San Francisco County' },
        { value: 'san_joaquin', label: 'San Joaquin County' },
        { value: 'stanislaus', label: 'Stanislaus County' },
        { value: 'tulare', label: 'Tulare County' },
        { value: 'santa_barbara', label: 'Santa Barbara County' },
        { value: 'solano', label: 'Solano County' },
        { value: 'monterey', label: 'Monterey County' },
        { value: 'placer', label: 'Placer County' },
        { value: 'other', label: 'Other County' }
      ],
      helpText: 'County information helps connect you with local resources and county-specific programs.'
    },
    previousId: 'postpartum-status-ca',
    nextId: 'california-assistance-preferences-ca'
  },
  // California Assistance Preferences
  {
    id: 'california-assistance-preferences-ca',
    question: {
      id: 'california-assistance-preferences-ca',
      text: 'How would you prefer to apply for benefits?',
      description: 'California offers multiple ways to apply for benefits.',
      inputType: 'multiselect',
      fieldName: 'californiaApplicationPreferences',
      required: false,
      showIf: { '==': [{ var: 'state' }, 'CA'] },
      options: [
        { value: 'covered_california', label: 'Covered California (recommended for Medi-Cal)' },
        { value: 'benefitscal', label: 'BenefitsCal.com (state benefits portal)' },
        { value: 'getcalfresh', label: 'GetCalFresh.org (for CalFresh/SNAP)' },
        { value: 'phone', label: 'Phone application' },
        { value: 'in_person', label: 'In-person at county office' },
        { value: 'community_organization', label: 'Community organization assistance' }
      ],
      helpText: 'California provides multiple application methods. Covered California is recommended for Medi-Cal, while GetCalFresh.org is popular for CalFresh applications.'
    },
    previousId: 'california-county-ca',
    isTerminal: true
  }
];

// Helper function to get California questions with proper linking
export function getCaliforniaQuestions(): FlowNode[] {
  return californiaQuestions.map((node, index) => {
    const nextNode = californiaQuestions[index + 1];
    return {
      ...node,
      nextId: nextNode?.id,
      previousId: index > 0 ? californiaQuestions[index - 1].id : undefined
    };
  });
}

// Helper function to check if a question should be shown based on state
export function shouldShowCaliforniaQuestion(questionId: string, state: string): boolean {
  if (state !== 'CA') return false;

  // All California questions should only show for California residents
  return californiaQuestions.some(node => node.id === questionId);
}
