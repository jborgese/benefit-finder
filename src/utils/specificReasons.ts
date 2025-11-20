/**
 * Specific Reasons Utility
 *
 * Provides generic logic for generating specific disqualification reasons
 * based on user profile data and program requirements.
 */

import { EligibilityStatus } from '../components/results/types';

export interface UserProfile {
  state?: string;
  isPregnant?: boolean;
  hasChildren?: boolean;
  householdIncome?: number;
  householdSize?: number;
  citizenship?: string;
  employmentStatus?: string;
  hasDisability?: boolean;
  age?: number;
  [key: string]: unknown;
}

export interface SpecificReason {
  key: string;
  message: string;
  condition: (profile: UserProfile) => boolean;
}

export interface ProgramSpecificReasons {
  [programId: string]: SpecificReason[];
}

export interface ProgramMaybeReasons {
  [programId: string]: SpecificReason[];
}

/**
 * Constants for repeated string literals
 */
const CITIZENSHIP_MESSAGE = 'You indicated you are not a U.S. citizen or qualified immigrant';
const ELIGIBLE_CITIZENSHIP_STATUSES = ['us_citizen', 'permanent_resident', 'refugee', 'asylee'];

/**
 * Income threshold constants for better consistency
 */
const INCOME_THRESHOLDS = {
  SNAP: 20000,      // SNAP has strict income limits
  TANF: 15000,      // TANF has very strict income limits
  SSI: 12000,       // SSI has very strict income limits
  MEDICAID: 25000,  // Medicaid typically has lower income limits
  SECTION8: 25000,  // Section 8 income limits vary by area
  LIHTC: 35000,     // LIHTC income limits vary significantly by area
  WIC: 30000,       // WIC income guidelines (185% of FPL)
  GENERIC: 30000    // Generic threshold for most programs
} as const;

/**
 * Generic specific reasons that apply to most programs
 */
const genericReasons: SpecificReason[] = [
  {
    key: 'citizenship',
    message: `${CITIZENSHIP_MESSAGE}. Most benefit programs require U.S. citizenship or eligible immigration status.`,
    condition: (profile) => profile.citizenship && !ELIGIBLE_CITIZENSHIP_STATUSES.includes(profile.citizenship)
  },
  {
    key: 'incomeTooHigh',
    message: 'Your household income appears to be above the program income guidelines. Income limits vary by program and household size.',
    condition: (profile) => {
      if (!profile.householdIncome || !profile.householdSize) {return false;}
      const incomePerPerson = profile.householdIncome / profile.householdSize;
      return incomePerPerson > INCOME_THRESHOLDS.GENERIC;
    }
  }
];

/**
 * Program-specific reasons
 */
const programSpecificReasons: ProgramSpecificReasons = {
  'wic-federal': [
    {
      key: 'notPregnant',
      message: 'You indicated you are not pregnant. WIC provides nutrition assistance for pregnant women, new mothers, and children under 5.',
      condition: (profile) => profile.isPregnant === false
    },
    {
      key: 'noChildren',
      message: 'You indicated you don\'t have children under 5 years old. WIC serves pregnant women, new mothers, and children up to age 5.',
      condition: (profile) => profile.hasChildren === false
    },
    {
      key: 'noWicCategory',
      message: 'You don\'t meet the WIC participant categories. WIC serves pregnant women, new mothers (up to 6 months postpartum), breastfeeding mothers (up to 1 year), and children under 5.',
      condition: (profile) => !profile.isPregnant && !profile.hasChildren
    },
    {
      key: 'incomeTooHigh',
      message: 'Your household income appears to be above the WIC income guidelines (185% of federal poverty level). WIC has strict income limits that vary by household size.',
      condition: (profile) => {
        if (!profile.householdIncome || !profile.householdSize) {return false;}
        const incomePerPerson = profile.householdIncome / profile.householdSize;
        return incomePerPerson > INCOME_THRESHOLDS.WIC;
      }
    }
  ],
  'medicaid-federal': [
    {
      key: 'incomeTooHigh',
      message: 'Your household income appears to be above the Medicaid income guidelines. Medicaid income limits vary significantly by state and household size.',
      condition: (profile) => {
        if (!profile.householdIncome || !profile.householdSize) {return false;}
        const incomePerPerson = profile.householdIncome / profile.householdSize;
        return incomePerPerson > INCOME_THRESHOLDS.MEDICAID;
      }
    },
    {
      key: 'noDisability',
      message: 'You indicated you don\'t have a qualifying disability. Medicaid covers people with disabilities, but also serves children, pregnant women, and low-income adults in expansion states.',
      condition: (profile) => profile.hasDisability === false
    },
    {
      key: 'ageRestriction',
      message: 'You may not meet the age requirements for Medicaid. Medicaid typically covers children under 19, pregnant women, adults 65+, and people with disabilities. Some states have expanded coverage for adults 19-64.',
      condition: (profile) => {
        if (!profile.age) {return false;}
        return profile.age >= 19 && profile.age < 65 && !profile.isPregnant;
      }
    },
    {
      key: 'citizenship',
      message: `${CITIZENSHIP_MESSAGE}. Medicaid requires U.S. citizenship or eligible immigration status.`,
      condition: (profile) => profile.citizenship && !ELIGIBLE_CITIZENSHIP_STATUSES.includes(profile.citizenship)
    }
  ],
  'snap-federal': [
    {
      key: 'incomeTooHigh',
      message: 'Your household income appears to be above the SNAP income guidelines (130% of federal poverty level). SNAP has strict income limits that vary by household size.',
      condition: (profile) => {
        if (!profile.householdIncome || !profile.householdSize) {return false;}
        const incomePerPerson = profile.householdIncome / profile.householdSize;
        return incomePerPerson > INCOME_THRESHOLDS.SNAP;
      }
    },
    {
      key: 'employmentStatus',
      message: 'Your employment status may not meet SNAP work requirements. Able-bodied adults without dependents (ABAWD) must work at least 20 hours per week or participate in work activities.',
      condition: (profile) => profile.employmentStatus === 'retired' || profile.employmentStatus === 'student'
    },
    {
      key: 'citizenship',
      message: `${CITIZENSHIP_MESSAGE}. SNAP requires U.S. citizenship or eligible immigration status.`,
      condition: (profile) => profile.citizenship && !ELIGIBLE_CITIZENSHIP_STATUSES.includes(profile.citizenship)
    },
    {
      key: 'ageRestriction',
      message: 'You may not meet the age requirements for SNAP. SNAP serves households with children or adults 18 and older.',
      condition: (profile) => {
        if (!profile.age) {return false;}
        return profile.age < 18 && !profile.hasChildren;
      }
    }
  ],
  'tanf-federal': [
    {
      key: 'noChildren',
      message: 'You indicated you don\'t have children under 18 years old. TANF provides cash assistance to families with dependent children.',
      condition: (profile) => profile.hasChildren === false
    },
    {
      key: 'incomeTooHigh',
      message: 'Your household income appears to be above the TANF income guidelines. TANF has very strict income limits that vary by state and household size.',
      condition: (profile) => {
        if (!profile.householdIncome || !profile.householdSize) {return false;}
        const incomePerPerson = profile.householdIncome / profile.householdSize;
        return incomePerPerson > INCOME_THRESHOLDS.TANF;
      }
    },
    {
      key: 'employmentStatus',
      message: 'Your employment status may not meet TANF work requirements. TANF requires parents to participate in work activities or job search programs.',
      condition: (profile) => profile.employmentStatus === 'retired' || profile.employmentStatus === 'student'
    },
    {
      key: 'citizenship',
      message: `${CITIZENSHIP_MESSAGE}. TANF requires U.S. citizenship or eligible immigration status.`,
      condition: (profile) => profile.citizenship && !ELIGIBLE_CITIZENSHIP_STATUSES.includes(profile.citizenship)
    }
  ],
  'ssi-federal': [
    {
      key: 'noDisability',
      message: 'You indicated you don\'t have a qualifying disability. SSI provides cash assistance to people with disabilities or those 65 and older.',
      condition: (profile) => profile.hasDisability === false
    },
    {
      key: 'ageRestriction',
      message: 'You may not meet the age requirements for SSI. SSI serves people with qualifying disabilities or those 65 and older.',
      condition: (profile) => !profile.hasDisability && (!profile.age || profile.age < 65)
    },
    {
      key: 'incomeTooHigh',
      message: 'Your household income appears to be above the SSI income guidelines. SSI has very strict income and asset limits.',
      condition: (profile) => {
        if (!profile.householdIncome || !profile.householdSize) {return false;}
        const incomePerPerson = profile.householdIncome / profile.householdSize;
        return incomePerPerson > INCOME_THRESHOLDS.SSI;
      }
    },
    {
      key: 'citizenship',
      message: `${CITIZENSHIP_MESSAGE}. SSI requires U.S. citizenship or eligible immigration status.`,
      condition: (profile) => profile.citizenship && !ELIGIBLE_CITIZENSHIP_STATUSES.includes(profile.citizenship)
    }
  ],
  'section8-federal': [
    {
      key: 'incomeTooHigh',
      message: 'Your household income appears to be above the Section 8 income guidelines (50% of area median income). Section 8 income limits vary significantly by location and household size.',
      condition: (profile) => {
        if (!profile.householdIncome || !profile.householdSize) {return false;}
        const incomePerPerson = profile.householdIncome / profile.householdSize;
        return incomePerPerson > INCOME_THRESHOLDS.SECTION8;
      }
    },
    {
      key: 'citizenship',
      message: `${CITIZENSHIP_MESSAGE}. Section 8 requires U.S. citizenship or eligible immigration status.`,
      condition: (profile) => profile.citizenship && !ELIGIBLE_CITIZENSHIP_STATUSES.includes(profile.citizenship)
    },
    {
      key: 'ageRestriction',
      message: 'You may not meet the age requirements for Section 8. Section 8 serves households with adults 18 and older or families with children.',
      condition: (profile) => {
        if (!profile.age) {return false;}
        return profile.age < 18 && !profile.hasChildren;
      }
    }
  ],
  'lihtc-federal': [
    {
      key: 'incomeTooHigh',
      message: 'Your household income appears to be above the LIHTC income guidelines. LIHTC income limits vary significantly by area and household size.',
      condition: (profile) => {
        if (!profile.householdIncome || !profile.householdSize) {return false;}
        const incomePerPerson = profile.householdIncome / profile.householdSize;
        return incomePerPerson > INCOME_THRESHOLDS.LIHTC;
      }
    },
    {
      key: 'studentStatus',
      message: 'You may be a full-time student, which can affect LIHTC eligibility. LIHTC has restrictions on full-time students in some properties.',
      condition: (profile) => profile.employmentStatus === 'student'
    },
    {
      key: 'citizenship',
      message: `${CITIZENSHIP_MESSAGE}. LIHTC requires U.S. citizenship or eligible immigration status.`,
      condition: (profile) => profile.citizenship && !ELIGIBLE_CITIZENSHIP_STATUSES.includes(profile.citizenship)
    },
    {
      key: 'ageRestriction',
      message: 'You may not meet the age requirements for LIHTC housing. LIHTC serves households with adults 18 and older or families with children.',
      condition: (profile) => {
        if (!profile.age) {return false;}
        return profile.age < 18 && !profile.hasChildren;
      }
    }
  ]
};

/**
 * Valid program IDs that can be used for object access
 * This whitelist prevents object injection attacks
 */
const VALID_PROGRAM_IDS = new Set([
  'wic-federal',
  'medicaid-federal',
  'snap-federal',
  'tanf-federal',
  'ssi-federal',
  'section8-federal',
  'lihtc-federal'
]);

/**
 * Safely access program-specific reasons with validation
 */
function getProgramReasonsSafely(programId: string): SpecificReason[] {
  if (!VALID_PROGRAM_IDS.has(programId)) {
    return [];
  }
  // eslint-disable-next-line security/detect-object-injection
  return programSpecificReasons[programId] ?? [];
}

/**
 * Safely access program-specific maybe reasons with validation
 */
function getProgramMaybeReasonsSafely(programId: string): SpecificReason[] {
  if (!VALID_PROGRAM_IDS.has(programId)) {
    return [];
  }
  // eslint-disable-next-line security/detect-object-injection
  return programMaybeReasons[programId] ?? [];
}

/**
 * Program-specific Maybe reasons - what users need to address for potential eligibility
 */
const programMaybeReasons: ProgramMaybeReasons = {
  'wic-federal': [
    {
      key: 'pregnancyStatus',
      message: 'Clarify your pregnancy status - WIC serves pregnant women, new mothers (up to 6 months postpartum), and breastfeeding mothers (up to 1 year)',
      condition: (profile) => profile.isPregnant === undefined
    },
    {
      key: 'childrenStatus',
      message: 'Clarify if you have children under 5 - WIC provides nutrition assistance for children up to age 5',
      condition: (profile) => profile.hasChildren === undefined
    },
    {
      key: 'incomeVerification',
      message: 'Provide detailed income verification - WIC has strict income guidelines (185% of federal poverty level) that vary by household size',
      condition: (profile) => !profile.householdIncome || !profile.householdSize
    },
    {
      key: 'nutritionalRisk',
      message: 'Complete nutritional risk assessment - WIC requires documented nutritional need assessed by a health professional',
      condition: (_profile) => true // Always show this as it requires professional assessment
    }
  ],
  'medicaid-federal': [
    {
      key: 'incomeVerification',
      message: 'Provide detailed income verification - Medicaid income limits vary significantly by state and household size',
      condition: (profile) => !profile.householdIncome || !profile.householdSize
    },
    {
      key: 'disabilityStatus',
      message: 'Clarify disability status - Medicaid covers people with disabilities, children, pregnant women, and low-income adults in expansion states',
      condition: (profile) => profile.hasDisability === undefined
    },
    {
      key: 'ageVerification',
      message: 'Verify age requirements - Medicaid has different rules for children (under 19), adults (19-64), and seniors (65+)',
      condition: (profile) => !profile.age
    },
    {
      key: 'stateSpecific',
      message: 'Check state-specific Medicaid expansion - eligibility varies significantly by state, with some states covering adults 19-64',
      condition: (profile) => !profile.state
    }
  ],
  'snap-federal': [
    {
      key: 'incomeVerification',
      message: 'Provide detailed income verification - SNAP has strict income limits (130% of federal poverty level) that vary by household size',
      condition: (profile) => !profile.householdIncome || !profile.householdSize
    },
    {
      key: 'workRequirements',
      message: 'Clarify work status - SNAP has work requirements for able-bodied adults without dependents (ABAWD) who must work 20+ hours per week',
      condition: (profile) => !profile.employmentStatus
    },
    {
      key: 'expenseDeductions',
      message: 'Document allowable expenses - SNAP considers housing, utilities, medical costs, and other deductions that can lower your countable income',
      condition: (_profile) => true // Always relevant for SNAP
    },
    {
      key: 'citizenshipVerification',
      message: 'Provide citizenship documentation - SNAP requires U.S. citizenship or qualified immigrant status for all household members',
      condition: (profile) => !profile.citizenship
    }
  ],
  'tanf-federal': [
    {
      key: 'childrenVerification',
      message: 'Provide children\'s birth certificates and Social Security numbers - TANF requires dependent children under 18',
      condition: (profile) => profile.hasChildren === undefined
    },
    {
      key: 'incomeVerification',
      message: 'Provide detailed income verification - TANF has very strict income limits that vary by state and household size',
      condition: (profile) => !profile.householdIncome || !profile.householdSize
    },
    {
      key: 'workPlan',
      message: 'Develop work plan - TANF requires participation in work activities, job search, or education/training programs',
      condition: (profile) => profile.employmentStatus === 'unemployed'
    },
    {
      key: 'timeLimits',
      message: 'Check lifetime limits - TANF has 60-month lifetime limit in most states, with some exceptions for hardship cases',
      condition: (_profile) => true // Always relevant for TANF
    }
  ],
  'ssi-federal': [
    {
      key: 'disabilityDocumentation',
      message: 'Provide medical documentation of disability - SSI requires extensive medical evidence and professional assessments',
      condition: (profile) => profile.hasDisability === undefined
    },
    {
      key: 'incomeVerification',
      message: 'Provide detailed income and asset verification - SSI has very strict financial limits for both income and assets',
      condition: (profile) => !profile.householdIncome || !profile.householdSize
    },
    {
      key: 'ageVerification',
      message: 'Verify age requirements - SSI serves people 65 and older or those with qualifying disabilities',
      condition: (profile) => !profile.age
    },
    {
      key: 'workHistory',
      message: 'Provide work history - SSI considers work credits and employment history, but work history is not required for SSI',
      condition: (profile) => !profile.employmentStatus
    }
  ],
  'section8-federal': [
    {
      key: 'incomeVerification',
      message: 'Provide detailed income verification - Section 8 income limits are based on area median income',
      condition: (profile) => !profile.householdIncome || !profile.householdSize
    },
    {
      key: 'familySize',
      message: 'Verify household size - Section 8 unit size depends on family composition',
      condition: (profile) => !profile.householdSize
    },
    {
      key: 'criminalBackground',
      message: 'Complete criminal background check - Section 8 requires clean criminal history',
      condition: (_profile) => true // Always relevant for Section 8
    },
    {
      key: 'rentalHistory',
      message: 'Provide rental history and references - Section 8 requires good rental record',
      condition: (_profile) => true // Always relevant for Section 8
    }
  ],
  'lihtc-federal': [
    {
      key: 'incomeVerification',
      message: 'Provide detailed income verification - LIHTC income limits vary by area and household size',
      condition: (profile) => !profile.householdIncome || !profile.householdSize
    },
    {
      key: 'studentStatus',
      message: 'Clarify student status - LIHTC has restrictions on full-time students',
      condition: (profile) => profile.employmentStatus === 'student'
    },
    {
      key: 'familyComposition',
      message: 'Verify household composition - LIHTC unit size depends on family size and composition',
      condition: (profile) => !profile.householdSize
    },
    {
      key: 'waitingList',
      message: 'Get on waiting lists immediately - LIHTC properties have long waiting lists',
      condition: (_profile) => true // Always relevant for LIHTC
    }
  ]
};

/**
 * Get specific reasons why a user doesn't qualify for a program
 */
export function getSpecificReasons(
  programId: string,
  status: EligibilityStatus,
  userProfile?: UserProfile
): string[] {
  // Only show specific reasons for not-qualified status
  if (status !== 'not-qualified') {
    return [];
  }

  if (!userProfile) {
    return [];
  }

  const reasons: string[] = [];

  // Get program-specific reasons (with validation to prevent object injection)
  const programReasons = getProgramReasonsSafely(programId);

  // Track which reason keys have been used to avoid duplicates
  const usedKeys = new Set<string>();

  // First, check program-specific reasons (these take priority)
  for (const reason of programReasons) {
    if (reason.condition(userProfile)) {
      reasons.push(reason.message);
      usedKeys.add(reason.key);
    }
  }

  // Then, check generic reasons only for keys not already used
  for (const reason of genericReasons) {
    if (reason.condition(userProfile) && !usedKeys.has(reason.key)) {
      reasons.push(reason.message);
      usedKeys.add(reason.key);
    }
  }

  // If no specific reasons found, add generic fallback
  if (reasons.length === 0) {
    reasons.push('You may not meet the specific eligibility requirements for this program');
  }

  return reasons;
}

/**
 * Get specific reasons for Maybe status - what users need to address
 */
export function getMaybeReasons(
  programId: string,
  status: EligibilityStatus,
  userProfile?: UserProfile
): string[] {
  // Only show maybe reasons for maybe status
  if (status !== 'maybe') {
    return [];
  }

  if (!userProfile) {
    return [];
  }

  const reasons: string[] = [];

  // Get program-specific maybe reasons (with validation to prevent object injection)
  const programMaybeReasonsList = getProgramMaybeReasonsSafely(programId);

  // Check each reason condition
  for (const reason of programMaybeReasonsList) {
    if (reason.condition(userProfile)) {
      reasons.push(reason.message);
    }
  }

  // If no specific reasons found, add generic fallback
  if (reasons.length === 0) {
    reasons.push('You may need to provide additional information or meet certain requirements');
  }

  return reasons;
}

/**
 * Get translation key for specific reasons section title
 */
export function getSpecificReasonsTitleKey(programId: string): string {
  return `results.${programId.split('-')[0]}.specificReasons.title`;
}

/**
 * Check if a program supports specific reasons
 */
export function supportsSpecificReasons(programId: string): boolean {
  return programId in programSpecificReasons || genericReasons.length > 0;
}
