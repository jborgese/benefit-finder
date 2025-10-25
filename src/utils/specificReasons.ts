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
 * Generic specific reasons that apply to most programs
 */
const genericReasons: SpecificReason[] = [
  {
    key: 'citizenship',
    message: CITIZENSHIP_MESSAGE,
    condition: (profile) => profile.citizenship && !ELIGIBLE_CITIZENSHIP_STATUSES.includes(profile.citizenship)
  },
  {
    key: 'incomeTooHigh',
    message: 'Your household income may be above the program income guidelines',
    condition: (profile) => {
      if (!profile.householdIncome || !profile.householdSize) return false;
      const incomePerPerson = profile.householdIncome / profile.householdSize;
      // Rough estimate: if income per person is above $30,000 annually, likely above most program guidelines
      return incomePerPerson > 30000;
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
      message: 'You indicated you are not pregnant',
      condition: (profile) => profile.isPregnant === false
    },
    {
      key: 'noChildren',
      message: 'You indicated you don\'t have children under 5 years old',
      condition: (profile) => profile.hasChildren === false
    },
    {
      key: 'noWicCategory',
      message: 'You don\'t meet the WIC category requirements (must be pregnant, postpartum, breastfeeding, or have children under 5)',
      condition: (profile) => !profile.isPregnant && !profile.hasChildren
    },
    {
      key: 'incomeTooHigh',
      message: 'Your household income may be above the WIC income guidelines (185% of federal poverty level)',
      condition: (profile) => {
        if (!profile.householdIncome || !profile.householdSize) return false;
        const incomePerPerson = profile.householdIncome / profile.householdSize;
        return incomePerPerson > 30000;
      }
    }
  ],
  'medicaid-federal': [
    {
      key: 'incomeTooHigh',
      message: 'Your household income may be above the Medicaid income guidelines (varies by state)',
      condition: (profile) => {
        if (!profile.householdIncome || !profile.householdSize) return false;
        const incomePerPerson = profile.householdIncome / profile.householdSize;
        return incomePerPerson > 25000; // Medicaid typically has lower income limits
      }
    },
    {
      key: 'noDisability',
      message: 'You indicated you don\'t have a qualifying disability',
      condition: (profile) => profile.hasDisability === false
    },
    {
      key: 'ageRestriction',
      message: 'You may not meet the age requirements for Medicaid (must be under 19, pregnant, or 65+)',
      condition: (profile) => {
        if (!profile.age) return false;
        return profile.age >= 19 && profile.age < 65 && !profile.isPregnant;
      }
    },
    {
      key: 'citizenship',
      message: CITIZENSHIP_MESSAGE,
      condition: (profile) => profile.citizenship && !ELIGIBLE_CITIZENSHIP_STATUSES.includes(profile.citizenship)
    }
  ],
  'snap-federal': [
    {
      key: 'incomeTooHigh',
      message: 'Your household income may be above the SNAP income guidelines (130% of federal poverty level)',
      condition: (profile) => {
        if (!profile.householdIncome || !profile.householdSize) return false;
        const incomePerPerson = profile.householdIncome / profile.householdSize;
        return incomePerPerson > 20000; // SNAP has strict income limits
      }
    },
    {
      key: 'employmentStatus',
      message: 'Your employment status may not meet SNAP work requirements (must be employed, looking for work, or exempt)',
      condition: (profile) => profile.employmentStatus === 'retired' || profile.employmentStatus === 'student'
    },
    {
      key: 'citizenship',
      message: CITIZENSHIP_MESSAGE,
      condition: (profile) => profile.citizenship && !ELIGIBLE_CITIZENSHIP_STATUSES.includes(profile.citizenship)
    },
    {
      key: 'ageRestriction',
      message: 'You may not meet the age requirements for SNAP (must be 18+ or have children)',
      condition: (profile) => {
        if (!profile.age) return false;
        return profile.age < 18 && !profile.hasChildren;
      }
    }
  ],
  'tanf-federal': [
    {
      key: 'noChildren',
      message: 'You indicated you don\'t have children under 18 years old',
      condition: (profile) => profile.hasChildren === false
    },
    {
      key: 'incomeTooHigh',
      message: 'Your household income may be above the TANF income guidelines (varies by state)',
      condition: (profile) => {
        if (!profile.householdIncome || !profile.householdSize) return false;
        const incomePerPerson = profile.householdIncome / profile.householdSize;
        return incomePerPerson > 15000; // TANF has very strict income limits
      }
    },
    {
      key: 'employmentStatus',
      message: 'Your employment status may not meet TANF work requirements (must be employed or in work activities)',
      condition: (profile) => profile.employmentStatus === 'retired' || profile.employmentStatus === 'student'
    },
    {
      key: 'citizenship',
      message: CITIZENSHIP_MESSAGE,
      condition: (profile) => profile.citizenship && !ELIGIBLE_CITIZENSHIP_STATUSES.includes(profile.citizenship)
    }
  ],
  'ssi-federal': [
    {
      key: 'noDisability',
      message: 'You indicated you don\'t have a qualifying disability',
      condition: (profile) => profile.hasDisability === false
    },
    {
      key: 'ageRestriction',
      message: 'You may not meet the age requirements for SSI (must be 65+ or disabled)',
      condition: (profile) => !profile.hasDisability && (!profile.age || profile.age < 65)
    },
    {
      key: 'incomeTooHigh',
      message: 'Your household income may be above the SSI income guidelines (very strict limits)',
      condition: (profile) => {
        if (!profile.householdIncome || !profile.householdSize) return false;
        const incomePerPerson = profile.householdIncome / profile.householdSize;
        return incomePerPerson > 12000; // SSI has very strict income limits
      }
    },
    {
      key: 'citizenship',
      message: CITIZENSHIP_MESSAGE,
      condition: (profile) => profile.citizenship && !ELIGIBLE_CITIZENSHIP_STATUSES.includes(profile.citizenship)
    }
  ],
  'section8-federal': [
    {
      key: 'incomeTooHigh',
      message: 'Your household income may be above the Section 8 income guidelines (50% of area median income)',
      condition: (profile) => {
        if (!profile.householdIncome || !profile.householdSize) return false;
        const incomePerPerson = profile.householdIncome / profile.householdSize;
        return incomePerPerson > 25000; // Section 8 income limits vary by area
      }
    },
    {
      key: 'citizenship',
      message: 'You indicated you are not a U.S. citizen or eligible immigrant',
      condition: (profile) => profile.citizenship && !ELIGIBLE_CITIZENSHIP_STATUSES.includes(profile.citizenship)
    },
    {
      key: 'ageRestriction',
      message: 'You may not meet the age requirements for Section 8 (must be 18+ or have children)',
      condition: (profile) => {
        if (!profile.age) return false;
        return profile.age < 18 && !profile.hasChildren;
      }
    }
  ],
  'lihtc-federal': [
    {
      key: 'incomeTooHigh',
      message: 'Your household income may be above the LIHTC income guidelines (varies by area)',
      condition: (profile) => {
        if (!profile.householdIncome || !profile.householdSize) return false;
        const incomePerPerson = profile.householdIncome / profile.householdSize;
        return incomePerPerson > 35000; // LIHTC income limits vary significantly by area
      }
    },
    {
      key: 'studentStatus',
      message: 'You may be a full-time student, which can affect LIHTC eligibility',
      condition: (profile) => profile.employmentStatus === 'student'
    },
    {
      key: 'citizenship',
      message: 'You indicated you are not a U.S. citizen or eligible immigrant',
      condition: (profile) => profile.citizenship && !ELIGIBLE_CITIZENSHIP_STATUSES.includes(profile.citizenship)
    },
    {
      key: 'ageRestriction',
      message: 'You may not meet the age requirements for LIHTC housing (must be 18+ or have children)',
      condition: (profile) => {
        if (!profile.age) return false;
        return profile.age < 18 && !profile.hasChildren;
      }
    }
  ]
};

/**
 * Program-specific Maybe reasons - what users need to address for potential eligibility
 */
const programMaybeReasons: ProgramMaybeReasons = {
  'wic-federal': [
    {
      key: 'pregnancyStatus',
      message: 'Clarify your pregnancy status - WIC eligibility depends on being pregnant, postpartum, or breastfeeding',
      condition: (profile) => profile.isPregnant === undefined
    },
    {
      key: 'childrenStatus',
      message: 'Clarify if you have children under 5 - WIC provides nutrition assistance for young children',
      condition: (profile) => profile.hasChildren === undefined
    },
    {
      key: 'incomeVerification',
      message: 'Provide detailed income verification - WIC has strict income guidelines (185% of federal poverty level)',
      condition: (profile) => !profile.householdIncome || !profile.householdSize
    },
    {
      key: 'nutritionalRisk',
      message: 'Complete nutritional risk assessment - WIC requires documented nutritional need',
      condition: (_profile) => true // Always show this as it requires professional assessment
    }
  ],
  'medicaid-federal': [
    {
      key: 'incomeVerification',
      message: 'Provide detailed income verification - Medicaid income limits vary by state and household size',
      condition: (profile) => !profile.householdIncome || !profile.householdSize
    },
    {
      key: 'disabilityStatus',
      message: 'Clarify disability status - Medicaid eligibility may depend on disability or age requirements',
      condition: (profile) => profile.hasDisability === undefined
    },
    {
      key: 'ageVerification',
      message: 'Verify age requirements - Medicaid has different rules for children, adults, and seniors',
      condition: (profile) => !profile.age
    },
    {
      key: 'stateSpecific',
      message: 'Check state-specific Medicaid expansion - eligibility varies significantly by state',
      condition: (profile) => !profile.state
    }
  ],
  'snap-federal': [
    {
      key: 'incomeVerification',
      message: 'Provide detailed income verification - SNAP has strict income limits (130% of federal poverty level)',
      condition: (profile) => !profile.householdIncome || !profile.householdSize
    },
    {
      key: 'workRequirements',
      message: 'Clarify work status - SNAP has work requirements for able-bodied adults without dependents',
      condition: (profile) => !profile.employmentStatus
    },
    {
      key: 'expenseDeductions',
      message: 'Document allowable expenses - SNAP considers housing, utilities, and medical costs in eligibility',
      condition: (_profile) => true // Always relevant for SNAP
    },
    {
      key: 'citizenshipVerification',
      message: 'Provide citizenship documentation - SNAP requires U.S. citizenship or qualified immigrant status',
      condition: (profile) => !profile.citizenship
    }
  ],
  'tanf-federal': [
    {
      key: 'childrenVerification',
      message: 'Provide children\'s birth certificates and Social Security numbers - TANF requires dependent children',
      condition: (profile) => profile.hasChildren === undefined
    },
    {
      key: 'incomeVerification',
      message: 'Provide detailed income verification - TANF has very strict income limits',
      condition: (profile) => !profile.householdIncome || !profile.householdSize
    },
    {
      key: 'workPlan',
      message: 'Develop work plan - TANF requires participation in work activities or job search',
      condition: (profile) => profile.employmentStatus === 'unemployed'
    },
    {
      key: 'timeLimits',
      message: 'Check lifetime limits - TANF has 60-month lifetime limit in most states',
      condition: (_profile) => true // Always relevant for TANF
    }
  ],
  'ssi-federal': [
    {
      key: 'disabilityDocumentation',
      message: 'Provide medical documentation of disability - SSI requires extensive medical evidence',
      condition: (profile) => profile.hasDisability === undefined
    },
    {
      key: 'incomeVerification',
      message: 'Provide detailed income and asset verification - SSI has very strict financial limits',
      condition: (profile) => !profile.householdIncome || !profile.householdSize
    },
    {
      key: 'ageVerification',
      message: 'Verify age requirements - SSI requires age 65+ or qualifying disability',
      condition: (profile) => !profile.age
    },
    {
      key: 'workHistory',
      message: 'Provide work history - SSI considers work credits and employment history',
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

  // Get program-specific reasons
  const programReasons = programSpecificReasons[programId] ?? [];

  // Get generic reasons
  const allReasons = [...genericReasons, ...programReasons];

  // Check each reason condition
  for (const reason of allReasons) {
    if (reason.condition(userProfile)) {
      reasons.push(reason.message);
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

  // Get program-specific maybe reasons
  const programMaybeReasonsList = programMaybeReasons[programId] ?? [];

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
