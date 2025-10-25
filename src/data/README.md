# Data Module Architecture

## Overview

The `src/data` directory has been completely refactored to provide a robust, type-safe, and future-proof data architecture for BenefitFinder. This new structure separates concerns, provides centralized services, and enables easy extension for new data types.

## 🏗️ Architecture

### Directory Structure

```
src/data/
├── index.ts                    # Central exports
├── types/                      # TypeScript type definitions
│   ├── index.ts
│   ├── location.ts            # Location data types
│   ├── ami.ts                 # AMI data types
│   └── programs.ts            # Program data types
├── sources/                   # Raw data sources
│   ├── locations/
│   │   ├── states-counties.json
│   │   └── metadata.json
│   ├── ami/
│   │   ├── 2024/
│   │   │   ├── california.json
│   │   │   ├── florida.json
│   │   │   └── georgia.json
│   │   └── metadata.json
│   └── programs/
│       ├── lihtc/
│       │   ├── federal.ts
│       │   ├── state/
│       │   │   ├── georgia.ts
│       │   │   ├── california.ts
│       │   │   └── florida.ts
│       │   ├── city/
│       │   │   ├── atlanta.ts
│       │   │   ├── los-angeles.ts
│       │   │   └── miami.ts
│       │   └── index.ts
│       └── metadata.json
├── services/                   # Data access services
│   ├── index.ts
│   ├── LocationDataService.ts
│   ├── AMIDataService.ts
│   └── ProgramDataService.ts
└── validators/                # Runtime validation
    ├── index.ts
    ├── location-validator.ts
    ├── ami-validator.ts
    └── program-validator.ts
```

## 🎯 Key Features

### 1. **Type Safety**
- Comprehensive TypeScript types for all data structures
- Runtime validation with detailed error messages
- Type inference from Zod schemas where applicable

### 2. **Centralized Services**
- Singleton pattern for consistent data access
- Built-in caching with TTL and LRU eviction
- Clean APIs with proper error handling

### 3. **Future-Proofing**
- Organized by data type and source
- Easy to add new data sources
- Metadata-driven approach for extensibility

### 4. **Performance**
- Intelligent caching strategies
- Lazy loading of data files
- Memory-efficient data structures

## 📊 Data Services

### LocationDataService

```typescript
import { LocationDataService } from '@/data';

const locationService = LocationDataService.getInstance();

// Get all states
const states = locationService.getStates();

// Get counties for a state
const counties = locationService.getCountiesForState('GA');

// Search locations
const results = locationService.searchLocations('Atlanta');

// Validate location
const validation = locationService.validateLocation('GA', 'Fulton');
```

### AMIDataService

```typescript
import { AMIDataService } from '@/data';

const amiService = AMIDataService.getInstance();

// Get AMI data for household
const amiData = await amiService.getAMIForHousehold('GA', 'Fulton', 3);

// Check if AMI data is available
const isAvailable = await amiService.isAMIAvailable('GA', 'Fulton');

// Get available states
const states = await amiService.getAvailableStates();
```

### ProgramDataService

```typescript
import { ProgramDataService } from '@/data';

const programService = ProgramDataService.getInstance();

// Get all programs
const programs = programService.getAllPrograms();

// Search programs
const results = programService.searchPrograms({
  category: 'housing',
  jurisdiction: 'Georgia',
  searchTerm: 'LIHTC'
});

// Get program statistics
const stats = programService.getProgramStatistics();
```

## 🔧 Usage Examples

### Basic Data Access

```typescript
import {
  LocationDataService,
  AMIDataService,
  ProgramDataService
} from '@/data';

// Initialize services
const locationService = LocationDataService.getInstance();
const amiService = AMIDataService.getInstance();
const programService = ProgramDataService.getInstance();

// Use services
const states = locationService.getStates();
const amiData = await amiService.getAMIForHousehold('GA', 'Fulton', 3);
const programs = programService.getActivePrograms();
```

### React Hooks Integration

```typescript
import { useAMIData } from '@/data';

function MyComponent() {
  const { amiData, loading, error } = useAMIData('GA', 'Fulton', 3);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>AMI: ${amiData?.amiAmount}</div>;
}
```

### Data Validation

```typescript
import { validateLocationData, validateAMIData } from '@/data/validators';

// Validate location data
const locationValidation = validateLocationData(locationData);
if (!locationValidation.isValid) {
  console.error('Location data errors:', locationValidation.errors);
}

// Validate AMI data
const amiValidation = validateAMIData(amiData);
if (!amiValidation.isValid) {
  console.error('AMI data errors:', amiValidation.errors);
}
```

## 🚀 Adding New Data Types

### 1. Create Type Definitions

```typescript
// src/data/types/new-data-type.ts
export interface NewDataType {
  id: string;
  name: string;
  // ... other fields
}
```

### 2. Create Data Service

```typescript
// src/data/services/NewDataTypeService.ts
export class NewDataTypeService {
  private static instance: NewDataTypeService;

  static getInstance(): NewDataTypeService {
    if (!this.instance) {
      this.instance = new NewDataTypeService();
    }
    return this.instance;
  }

  // Implement service methods
}
```

### 3. Add Validator

```typescript
// src/data/validators/new-data-type-validator.ts
export function validateNewDataType(data: any): ValidationResult {
  // Implement validation logic
}
```

### 4. Update Exports

```typescript
// src/data/index.ts
export * from './types/new-data-type';
export { NewDataTypeService } from './services/NewDataTypeService';
export { validateNewDataType } from './validators/new-data-type-validator';
```

## 📈 Performance Considerations

### Caching Strategy
- **Location Data**: 1 hour TTL (rarely changes)
- **AMI Data**: 24 hour TTL (annual updates)
- **Program Data**: 1 hour TTL (occasional updates)

### Memory Management
- LRU eviction when cache is full
- Lazy loading of data files
- Efficient data structures

### Bundle Optimization
- Tree-shaking friendly exports
- Dynamic imports for large data files
- Separate chunks for different data types

## 🔒 Security & Privacy

### Data Encryption
- Sensitive data encrypted at rest
- No external API calls
- Local-first architecture

### Validation
- Runtime validation of all data
- Type safety at compile time
- Input sanitization

## 🧪 Testing

### Unit Tests
```typescript
import { LocationDataService } from '@/data/services/LocationDataService';

describe('LocationDataService', () => {
  it('should return states', () => {
    const service = LocationDataService.getInstance();
    const states = service.getStates();
    expect(states.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests
```typescript
import { AMIDataService } from '@/data/services/AMIDataService';

describe('AMIDataService Integration', () => {
  it('should load AMI data for Georgia', async () => {
    const service = AMIDataService.getInstance();
    const amiData = await service.getAMIForHousehold('GA', 'Fulton', 3);
    expect(amiData.amiAmount).toBeGreaterThan(0);
  });
});
```

## 📚 Migration Guide

### From Old Structure

**Before:**
```typescript
import statesCountiesData from '../data/locations/states-counties.json';
import { LIHTC_PROGRAMS } from '../data/programs/lihtc-programs';
```

**After:**
```typescript
import { LocationDataService, ProgramDataService } from '@/data';

const locationService = LocationDataService.getInstance();
const programService = ProgramDataService.getInstance();

const states = locationService.getStates();
const programs = programService.getAllPrograms();
```

### Backward Compatibility

The old files are marked as `@deprecated` but still work. They now use the new services internally, ensuring no breaking changes.

## 🎯 Future Enhancements

### Planned Features
1. **Data Versioning**: Track data changes over time
2. **Offline Sync**: Device-to-device data synchronization
3. **Data Analytics**: Usage patterns and performance metrics
4. **Dynamic Loading**: Load data on-demand based on user location
5. **Data Validation**: Enhanced validation with custom rules

### Extension Points
1. **New Data Sources**: Easy addition of new data types
2. **Custom Validators**: Pluggable validation system
3. **Data Transformers**: Convert between data formats
4. **Caching Strategies**: Configurable caching policies

## 📞 Support

For questions about the data architecture or adding new data types, refer to:
- Type definitions in `src/data/types/`
- Service implementations in `src/data/services/`
- Validation logic in `src/data/validators/`
- This documentation file
