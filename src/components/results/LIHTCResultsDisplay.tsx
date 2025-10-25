/**
 * LIHTC Results Display Component
 *
 * Comprehensive results display for LIHTC housing eligibility assessment.
 */

import React from 'react';
import type { EligibilityResult } from '../../types/eligibility';
import type { LIHTCProfile, LIHTCEligibilityResult, AMIData } from '../../types/housing';
import { useAMIData } from '../../services/ami-data';

interface LIHTCResultsDisplayProps {
  eligibility: EligibilityResult;
  lihtcEligibility: LIHTCEligibilityResult;
  householdProfile: LIHTCProfile;
  amiData?: AMIData;
}

/**
 * Main LIHTC Results Display Component
 */
export const LIHTCResultsDisplay: React.FC<LIHTCResultsDisplayProps> = ({
  eligibility,
  lihtcEligibility,
  householdProfile,
  amiData
}) => {
  const incomePercentage = amiData && householdProfile.householdIncome
    ? (householdProfile.householdIncome / amiData.amiAmount) * 100
    : 0;

  const maxAffordableRent = amiData ? Math.floor(amiData.incomeLimit50 * 0.3) : 0;

  return (
    <div className="space-y-6">
      {/* Eligibility Status */}
      <EligibilityStatusCard
        eligible={eligibility.eligible}
        explanation={eligibility.explanation}
        reasons={lihtcEligibility.reasons}
      />

      {/* AMI Information */}
      {amiData && (
        <AMIInformationCard
          amiData={amiData}
          householdProfile={householdProfile}
          incomePercentage={incomePercentage}
        />
      )}

      {/* Rent Information */}
      {amiData && (
        <RentInformationCard
          maxAffordableRent={maxAffordableRent}
          householdIncome={householdProfile.householdIncome || 0}
        />
      )}

      {/* Eligibility Breakdown */}
      <EligibilityBreakdownCard lihtcEligibility={lihtcEligibility} />

      {/* Next Steps */}
      <NextStepsCard
        eligible={eligibility.eligible}
        lihtcEligibility={lihtcEligibility}
      />

      {/* Alternative Programs */}
      {!eligibility.eligible && (
        <AlternativeProgramsCard />
      )}
    </div>
  );
};

/**
 * Eligibility Status Card
 */
const EligibilityStatusCard: React.FC<{
  eligible: boolean;
  explanation: string;
  reasons: string[];
}> = ({ eligible, explanation, reasons }) => (
  <div className={`p-6 rounded-lg border-2 ${eligible
      ? 'bg-green-50 border-green-200'
      : 'bg-red-50 border-red-200'
    }`}>
    <div className="flex items-center space-x-3 mb-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${eligible ? 'bg-green-100' : 'bg-red-100'
        }`}>
        {eligible ? (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <h3 className={`text-xl font-semibold ${eligible ? 'text-green-900' : 'text-red-900'
        }`}>
        {eligible ? '✅ Eligible for LIHTC Housing' : '❌ Not Eligible for LIHTC Housing'}
      </h3>
    </div>

    <p className={`text-sm mb-4 ${eligible ? 'text-green-800' : 'text-red-800'
      }`}>
      {explanation}
    </p>

    {reasons.length > 0 && (
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Eligibility Details:</h4>
        <ul className="text-sm space-y-1">
          {reasons.map((reason, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-gray-500">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

/**
 * AMI Information Card
 */
const AMIInformationCard: React.FC<{
  amiData: AMIData;
  householdProfile: LIHTCProfile;
  incomePercentage: number;
}> = ({ amiData, householdProfile, incomePercentage }) => (
  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
    <h4 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
      </svg>
      <span>Area Median Income (AMI) Information</span>
    </h4>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="font-medium text-blue-800">Your Income:</span>
          <span className="text-blue-900">${householdProfile.householdIncome?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-blue-800">AMI for {amiData.householdSize} people:</span>
          <span className="text-blue-900">${amiData.amiAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-blue-800">Your income is:</span>
          <span className="text-blue-900">{incomePercentage.toFixed(1)}% of AMI</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="font-medium text-blue-800">50% AMI Limit:</span>
          <span className="text-blue-900">${amiData.incomeLimit50.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-blue-800">60% AMI Limit:</span>
          <span className="text-blue-900">${amiData.incomeLimit60.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-blue-800">80% AMI Limit:</span>
          <span className="text-blue-900">${amiData.incomeLimit80.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div className="mt-4 p-3 bg-blue-100 rounded">
      <p className="text-xs text-blue-700">
        <strong>Location:</strong> {amiData.county}, {amiData.state} |
        <strong> Year:</strong> {amiData.year} |
        <strong> Last Updated:</strong> {new Date(amiData.lastUpdated).toLocaleDateString()}
      </p>
    </div>
  </div>
);

/**
 * Rent Information Card
 */
const RentInformationCard: React.FC<{
  maxAffordableRent: number;
  householdIncome: number;
}> = ({ maxAffordableRent, householdIncome }) => {
  const monthlyIncome = householdIncome / 12;
  const rentAt30Percent = Math.floor(monthlyIncome * 0.3);

  return (
    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
      <h4 className="font-semibold text-yellow-900 mb-4 flex items-center space-x-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        <span>Rent Affordability Information</span>
      </h4>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-medium text-yellow-800">Maximum LIHTC rent (30% of 50% AMI):</span>
          <span className="text-lg font-bold text-yellow-900">${maxAffordableRent.toLocaleString()}/month</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-medium text-yellow-800">Your affordable rent (30% of income):</span>
          <span className="text-lg font-bold text-yellow-900">${rentAt30Percent.toLocaleString()}/month</span>
        </div>

        <div className="p-3 bg-yellow-100 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> LIHTC units typically have rent caps at 30% of the applicable income limit.
            Your actual rent will be the lower of these two amounts.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Eligibility Breakdown Card
 */
const EligibilityBreakdownCard: React.FC<{
  lihtcEligibility: LIHTCEligibilityResult;
}> = ({ lihtcEligibility }) => (
  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
    <h4 className="font-semibold text-gray-900 mb-4">Eligibility Breakdown</h4>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded-full ${lihtcEligibility.incomeEligible ? 'bg-green-500' : 'bg-red-500'
            }`} />
          <span className="text-sm font-medium">Income Eligibility</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded-full ${lihtcEligibility.studentEligible ? 'bg-green-500' : 'bg-red-500'
            }`} />
          <span className="text-sm font-medium">Student Status</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded-full ${lihtcEligibility.unitSizeEligible ? 'bg-green-500' : 'bg-red-500'
            }`} />
          <span className="text-sm font-medium">Unit Size Match</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded-full ${lihtcEligibility.rentAffordable ? 'bg-green-500' : 'bg-red-500'
            }`} />
          <span className="text-sm font-medium">Rent Affordability</span>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>AMI Percentage:</strong> {lihtcEligibility.amiPercentage.toFixed(1)}%</p>
          <p><strong>Max Affordable Rent:</strong> ${lihtcEligibility.maxAffordableRent.toLocaleString()}/month</p>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Next Steps Card
 */
const NextStepsCard: React.FC<{
  eligible: boolean;
  lihtcEligibility: LIHTCEligibilityResult;
}> = ({ eligible, lihtcEligibility }) => (
  <div className={`p-6 rounded-lg border-2 ${eligible
      ? 'bg-green-50 border-green-200'
      : 'bg-amber-50 border-amber-200'
    }`}>
    <h4 className={`font-semibold mb-4 ${eligible ? 'text-green-900' : 'text-amber-900'
      }`}>
      {eligible ? 'Next Steps' : 'Alternative Options'}
    </h4>

    {eligible ? (
      <ul className="text-sm space-y-2">
        <li className="flex items-start space-x-2">
          <span className="text-green-600 mt-1">•</span>
          <span>Contact local housing authorities for available LIHTC properties</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-green-600 mt-1">•</span>
          <span>Prepare income verification documents (pay stubs, tax returns, bank statements)</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-green-600 mt-1">•</span>
          <span>Check for waiting lists in your area</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-green-600 mt-1">•</span>
          <span>Consider other affordable housing programs if LIHTC is not available</span>
        </li>
      </ul>
    ) : (
      <ul className="text-sm space-y-2">
        <li className="flex items-start space-x-2">
          <span className="text-amber-600 mt-1">•</span>
          <span>Consider Section 8 Housing Choice Voucher program</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-amber-600 mt-1">•</span>
          <span>Look into public housing programs</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-amber-600 mt-1">•</span>
          <span>Check for other affordable housing programs in your area</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-amber-600 mt-1">•</span>
          <span>Contact local housing authorities for assistance</span>
        </li>
      </ul>
    )}
  </div>
);

/**
 * Alternative Programs Card
 */
const AlternativeProgramsCard: React.FC = () => (
  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
    <h4 className="font-semibold text-blue-900 mb-4">Alternative Housing Programs</h4>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="p-3 bg-white rounded border">
          <h5 className="font-medium text-blue-900">Section 8 Housing Choice Voucher</h5>
          <p className="text-sm text-blue-700 mt-1">
            Provides rental assistance for low-income families
          </p>
        </div>

        <div className="p-3 bg-white rounded border">
          <h5 className="font-medium text-blue-900">Public Housing</h5>
          <p className="text-sm text-blue-700 mt-1">
            Government-owned affordable housing units
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-white rounded border">
          <h5 className="font-medium text-blue-900">Senior Housing</h5>
          <p className="text-sm text-blue-700 mt-1">
            Age-restricted affordable housing for seniors
          </p>
        </div>

        <div className="p-3 bg-white rounded border">
          <h5 className="font-medium text-blue-900">Disability Housing</h5>
          <p className="text-sm text-blue-700 mt-1">
            Accessible affordable housing for people with disabilities
          </p>
        </div>
      </div>
    </div>
  </div>
);
