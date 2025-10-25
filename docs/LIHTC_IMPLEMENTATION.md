# LIHTC Implementation Documentation

## Overview

The LIHTC (Low-Income Housing Tax Credit) implementation provides comprehensive housing eligibility assessment for the BenefitFinder application. This implementation includes real HUD data, sophisticated eligibility rules, and user-friendly interfaces for determining LIHTC housing eligibility.

## Architecture

### Core Components

1. **Types and Interfaces** (`src/types/housing.ts`)
   - `LIHTCProfile` - Extended household profile for LIHTC-specific data
   - `AMIData` - Area Median Income data structure
   - `LIHTCEligibilityResult` - Comprehensive eligibility results
   - `LIHTCProperty` - Property information for LIHTC units

2. **AMI Data Service** (`src/services/ami-data.ts`)
   - Singleton service for managing Area Median Income data
   - Offline-first caching strategy
   - Real HUD data integration
   - Support for multiple states and counties

3. **Questionnaire System** (`src/questionnaire/lihtc-questions.ts`)
   - Specialized LIHTC questions
   - Student status assessment
   - Unit size preferences
   - Housing history tracking
   - Income source breakdown

4. **Rule Engine** (`src/rules/housing/lihtc-rules.ts`)
   - JSON Logic rules for LIHTC eligibility
   - Income eligibility (50-60% AMI)
   - Student status exceptions
   - Unit size matching
   - Rent affordability calculations

5. **UI Components** (`src/components/housing/`)
   - Specialized question components
   - Results display components
   - AMI information cards
   - Eligibility breakdown displays

## Data Sources

### AMI Data Structure

The implementation uses real HUD Area Median Income data with the following structure:

```typescript
interface AMIData {
  state: string;
  county: string;
  year: number;
  householdSize: number;
  amiAmount: number;
  incomeLimit50: number;
  incomeLimit60: number;
  incomeLimit80: number;
  lastUpdated: number;
}
```

### Supported States

- **Georgia**: Fulton, DeKalb, Cobb, Gwinnett, Clayton, Henry, Forsyth, Cherokee, Douglas, Fayette
- **California**: Los Angeles, Orange, San Diego, Riverside, San Bernardino, Alameda, San Francisco, Santa Clara
- **Florida**: Miami-Dade, Broward, Palm Beach, Hillsborough, Orange, Pinellas, Duval, Lee

## Eligibility Rules

### Income Eligibility

Household income must be at or below:
- 50% of Area Median Income (AMI), OR
- 60% of Area Median Income (AMI)

### Student Status

Full-time students are generally ineligible unless:
- Single parent students
- Married students

### Unit Size Matching

Household size must be appropriate for available unit sizes:
- Studio: 1 person
- 1 Bedroom: 1-2 people
- 2 Bedroom: 2-4 people
- 3 Bedroom: 3-6 people
- 4+ Bedroom: 4+ people

### Rent Affordability

Maximum rent is capped at 30% of the applicable income limit.

## Implementation Details

### AMI Data Service

```typescript
const amiService = AMIDataService.getInstance();
const amiData = await amiService.getAMIForHousehold('GA', 'Fulton', 3);
```

### Rule Evaluation

```typescript
import { LIHTC_RULES } from '../rules/housing/lihtc-rules';
import { evaluateRule } from '../rules';

const result = await evaluateRule(LIHTC_RULES[0].ruleLogic, data);
```

### Questionnaire Integration

```typescript
import { LIHTC_QUESTIONS } from '../questionnaire/lihtc-questions';

// Questions are automatically integrated into the questionnaire flow
```

## User Interface

### Question Components

- **StudentStatusQuestion**: Handles student status with exception logic
- **UnitSizeQuestion**: Provides unit size recommendations based on household size
- **HousingHistoryQuestion**: Tracks previous subsidized housing experience
- **IncomeSourcesQuestion**: Collects income source breakdown
- **RentAffordabilityQuestion**: Calculates rent affordability with AMI data
- **HousingPreferencesQuestion**: Collects housing preferences and needs
- **ContactPreferencesQuestion**: Manages contact preferences

### Results Display

- **Eligibility Status**: Clear pass/fail indication with explanations
- **AMI Information**: Detailed AMI data with income percentages
- **Rent Information**: Rent affordability calculations
- **Eligibility Breakdown**: Component-by-component eligibility status
- **Next Steps**: Actionable guidance for eligible users
- **Alternative Programs**: Alternative housing options for ineligible users

## Testing

### Test Coverage

- **Unit Tests**: Individual rule evaluation
- **Integration Tests**: End-to-end LIHTC assessment
- **Performance Tests**: Rule evaluation performance
- **Error Handling**: Graceful error handling for missing data

### Test Files

- `src/__tests__/lihtc-rules.test.ts` - Rule unit tests
- `src/__tests__/lihtc-integration.test.ts` - Integration tests

## Internationalization

### Translation Keys

All LIHTC-specific text is internationalized using the following structure:

```json
{
  "lihtc": {
    "title": "LIHTC Housing Assessment",
    "questions": {
      "studentStatus": { ... },
      "unitSize": { ... },
      "housingHistory": { ... }
    },
    "results": {
      "eligible": "Eligible for LIHTC Housing",
      "notEligible": "Not Eligible for LIHTC Housing"
    }
  }
}
```

## Performance Considerations

### Caching Strategy

- AMI data is cached for 24 hours
- LRU eviction for cache management
- Offline-first data access

### Rule Evaluation

- Rules are evaluated in parallel when possible
- Performance monitoring for rule evaluation
- Timeout protection for complex rules

## Security

### Data Privacy

- All sensitive data is encrypted at rest
- AMI data is public and not encrypted
- User responses are encrypted before storage

### Input Validation

- All user inputs are validated using Zod schemas
- Rule evaluation includes input validation
- Error handling for invalid data

## Deployment

### Data Updates

AMI data is updated annually when HUD releases new data:

1. Download latest AMI data from HUD
2. Update JSON files in `src/data/ami/`
3. Update version numbers and timestamps
4. Deploy updated data files

### Program Updates

LIHTC programs are updated as needed:

1. Update program information in `src/data/programs/lihtc-programs.ts`
2. Update contact information and eligibility requirements
3. Deploy updated program data

## Monitoring

### Key Metrics

- Rule evaluation performance
- AMI data cache hit rates
- User completion rates
- Eligibility determination accuracy

### Error Tracking

- AMI data loading errors
- Rule evaluation failures
- User input validation errors
- Network connectivity issues

## Future Enhancements

### Planned Features

1. **Property Search**: Integration with LIHTC property databases
2. **Waiting List Management**: Track waiting list positions
3. **Application Assistance**: Step-by-step application guidance
4. **Document Checklist**: Required documents for application
5. **Appointment Scheduling**: Schedule housing authority appointments

### Data Expansion

1. **Additional States**: Expand AMI data coverage
2. **Property Data**: Real-time property availability
3. **Waiting Lists**: Current waiting list information
4. **Application Status**: Track application progress

## Troubleshooting

### Common Issues

1. **AMI Data Not Found**: Check state/county combination
2. **Rule Evaluation Errors**: Verify input data format
3. **Cache Loading Issues**: Clear cache and reload data
4. **Performance Issues**: Check rule complexity and data size

### Debug Tools

- AMI data cache statistics
- Rule evaluation performance metrics
- User input validation logs
- Error tracking and reporting

## Support

### Documentation

- This implementation guide
- API documentation for services
- Component usage examples
- Rule configuration guide

### Contact

For technical support or questions about the LIHTC implementation:

- Review this documentation
- Check test files for usage examples
- Consult the main BenefitFinder documentation
- Contact the development team for advanced issues
