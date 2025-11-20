/**
 * Geolocation Hook
 *
 * Provides geolocation functionality for automatic state/county detection
 * with proper error handling and privacy considerations.
 */

import { useState, useEffect, useCallback } from 'react';

export interface GeolocationState {
  /** Current coordinates */
  coordinates: GeolocationCoordinates | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether geolocation is supported */
  isSupported: boolean;
  /** Whether permission was granted */
  hasPermission: boolean | null;
}

export interface GeolocationOptions {
  /** Enable high accuracy */
  enableHighAccuracy?: boolean;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Maximum age of cached position */
  maximumAge?: number;
}

/**
 * Hook for geolocation functionality
 */
export const useGeolocation = (options: GeolocationOptions = {}): GeolocationState & {
  getCurrentPosition: () => void;
  clearLocation: () => void;
  checkPermission: () => Promise<void>;
} => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes
  } = options;

  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    isLoading: false,
    error: null,
    isSupported: 'geolocation' in navigator,
    hasPermission: null,
  });

  /**
   * Request current position
   */
  const getCurrentPosition = useCallback(() => {
    console.log('🌍 getCurrentPosition called', { isSupported: state.isSupported });

    if (!state.isSupported) {
      console.log('❌ Geolocation not supported');
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
      }));
      return;
    }

    console.log('🔄 Requesting geolocation...');
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Geolocation success:', {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setState(prev => ({
          ...prev,
          coordinates: position.coords,
          isLoading: false,
          hasPermission: true,
          error: null,
        }));
      },
      (error) => {
        console.log('❌ Geolocation error:', {
          code: error.code,
          message: error.message
        });

        let errorMessage = 'Unable to get your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. You can still manually select your state.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while retrieving location.';
        }

        setState(prev => ({
          ...prev,
          coordinates: null,
          isLoading: false,
          hasPermission: error.code === error.PERMISSION_DENIED ? false : null,
          error: errorMessage,
        }));
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  }, [state.isSupported, enableHighAccuracy, timeout, maximumAge]);

  /**
   * Clear location data
   */
  const clearLocation = useCallback(() => {
    setState(prev => ({
      ...prev,
      coordinates: null,
      error: null,
      hasPermission: null,
    }));
  }, []);

  /**
   * Check permission status
   */
  const checkPermission = useCallback(async () => {
    if (!state.isSupported) {return;}

    try {
      // Check if we can query permission
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setState(prev => ({
          ...prev,
          hasPermission: permission.state === 'granted',
        }));
      }
    } catch (error) {
      // Permission API not available or not supported
      console.debug('Permission API not available:', error);
    }
  }, [state.isSupported]);

  // Check permission on mount
  useEffect(() => {
    void checkPermission();
  }, [checkPermission]);

  return {
    ...state,
    getCurrentPosition,
    clearLocation,
    checkPermission,
  };
};

/**
 * Utility to convert coordinates to state code
 * This is a simplified implementation - in production you'd want to use
 * a proper reverse geocoding service or a comprehensive state boundary dataset
 */
export const coordinatesToState = (coordinates: GeolocationCoordinates): string | null => {
  const { latitude, longitude } = coordinates;

  console.log(`🗺️ Converting coordinates to state: lat=${latitude}, lon=${longitude}`);

  // Simplified state boundary detection based on approximate coordinates
  // This is a basic implementation - for production use, consider using
  // a proper geocoding service or comprehensive boundary data

  const stateBoundaries = [
    // Major states with approximate boundaries
    { code: 'CA', minLat: 32.5, maxLat: 42.0, minLon: -124.5, maxLon: -114.0 },
    { code: 'TX', minLat: 25.8, maxLat: 36.5, minLon: -106.6, maxLon: -93.5 },
    { code: 'FL', minLat: 24.4, maxLat: 31.0, minLon: -87.6, maxLon: -80.0 },
    { code: 'NY', minLat: 40.5, maxLat: 45.0, minLon: -79.8, maxLon: -71.9 },
    { code: 'PA', minLat: 39.7, maxLat: 42.3, minLon: -80.5, maxLon: -74.7 },
    { code: 'IL', minLat: 37.0, maxLat: 42.5, minLon: -91.5, maxLon: -87.0 },
    { code: 'OH', minLat: 38.4, maxLat: 42.3, minLon: -84.8, maxLon: -80.5 },
    { code: 'GA', minLat: 30.4, maxLat: 35.0, minLon: -85.6, maxLon: -80.8 },
    { code: 'NC', minLat: 33.8, maxLat: 36.6, minLon: -84.3, maxLon: -75.5 },
    { code: 'MI', minLat: 41.7, maxLat: 48.3, minLon: -90.4, maxLon: -82.1 },
    { code: 'NJ', minLat: 38.9, maxLat: 41.4, minLon: -75.6, maxLon: -73.9 },
    { code: 'VA', minLat: 36.5, maxLat: 39.5, minLon: -83.7, maxLon: -75.2 },
    { code: 'WA', minLat: 45.5, maxLat: 49.0, minLon: -124.8, maxLon: -116.9 },
    { code: 'AZ', minLat: 31.3, maxLat: 37.0, minLon: -114.8, maxLon: -109.0 },
    { code: 'MA', minLat: 41.2, maxLat: 42.9, minLon: -73.5, maxLon: -69.9 },
    { code: 'TN', minLat: 35.0, maxLat: 36.7, minLon: -90.3, maxLon: -81.6 },
    { code: 'IN', minLat: 37.8, maxLat: 41.8, minLon: -88.1, maxLon: -84.8 },
    { code: 'MO', minLat: 36.0, maxLat: 40.6, minLon: -95.8, maxLon: -89.1 },
    { code: 'MD', minLat: 37.9, maxLat: 39.7, minLon: -79.5, maxLon: -75.0 },
    { code: 'WI', minLat: 42.5, maxLat: 47.3, minLon: -92.9, maxLon: -86.2 },
    { code: 'CO', minLat: 37.0, maxLat: 41.0, minLon: -109.1, maxLon: -102.0 },
    { code: 'MN', minLat: 43.5, maxLat: 49.4, minLon: -97.2, maxLon: -89.5 },
    { code: 'SC', minLat: 32.0, maxLat: 35.2, minLon: -83.4, maxLon: -78.5 },
    { code: 'AL', minLat: 30.2, maxLat: 35.0, minLon: -88.5, maxLon: -84.9 },
    { code: 'LA', minLat: 28.9, maxLat: 33.0, minLon: -94.0, maxLon: -88.8 },
    { code: 'KY', minLat: 36.5, maxLat: 39.2, minLon: -89.6, maxLon: -81.9 },
    { code: 'OR', minLat: 42.0, maxLat: 46.3, minLon: -124.6, maxLon: -116.5 },
    { code: 'OK', minLat: 33.6, maxLat: 37.0, minLon: -103.0, maxLon: -94.4 },
    { code: 'CT', minLat: 40.9, maxLat: 42.1, minLon: -73.7, maxLon: -71.8 },
    { code: 'UT', minLat: 37.0, maxLat: 42.0, minLon: -114.1, maxLon: -109.0 },
    { code: 'IA', minLat: 40.4, maxLat: 43.5, minLon: -96.6, maxLon: -90.1 },
    { code: 'NV', minLat: 35.0, maxLat: 42.0, minLon: -120.0, maxLon: -114.0 },
    { code: 'AR', minLat: 33.0, maxLat: 36.5, minLon: -94.6, maxLon: -89.6 },
    { code: 'MS', minLat: 30.2, maxLat: 35.0, minLon: -91.7, maxLon: -88.1 },
    { code: 'KS', minLat: 37.0, maxLat: 40.0, minLon: -102.1, maxLon: -94.6 },
    { code: 'NM', minLat: 31.3, maxLat: 37.0, minLon: -109.1, maxLon: -103.0 },
    { code: 'NE', minLat: 40.0, maxLat: 43.0, minLon: -104.1, maxLon: -95.3 },
    { code: 'WV', minLat: 37.2, maxLat: 40.6, minLon: -82.6, maxLon: -77.7 },
    { code: 'ID', minLat: 42.0, maxLat: 49.0, minLon: -117.2, maxLon: -111.0 },
    { code: 'HI', minLat: 18.9, maxLat: 22.2, minLon: -162.0, maxLon: -154.8 },
    { code: 'NH', minLat: 42.7, maxLat: 45.3, minLon: -72.6, maxLon: -70.6 },
    { code: 'ME', minLat: 43.1, maxLat: 47.5, minLon: -71.1, maxLon: -66.9 },
    { code: 'RI', minLat: 41.1, maxLat: 42.0, minLon: -71.9, maxLon: -71.1 },
    { code: 'MT', minLat: 45.0, maxLat: 49.0, minLon: -116.1, maxLon: -104.0 },
    { code: 'DE', minLat: 38.4, maxLat: 39.8, minLon: -75.8, maxLon: -75.0 },
    { code: 'SD', minLat: 42.5, maxLat: 45.9, minLon: -104.1, maxLon: -96.4 },
    { code: 'ND', minLat: 45.9, maxLat: 49.0, minLon: -104.1, maxLon: -96.6 },
    { code: 'AK', minLat: 51.2, maxLat: 71.4, minLon: -179.1, maxLon: -129.9 },
    { code: 'VT', minLat: 42.7, maxLat: 45.0, minLon: -73.4, maxLon: -71.5 },
    { code: 'WY', minLat: 41.0, maxLat: 45.0, minLon: -111.1, maxLon: -104.0 },
    { code: 'DC', minLat: 38.8, maxLat: 39.0, minLon: -77.1, maxLon: -76.9 },
  ];

  for (const state of stateBoundaries) {
    const isInBounds = latitude >= state.minLat &&
                      latitude <= state.maxLat &&
                      longitude >= state.minLon &&
                      longitude <= state.maxLon;

    console.log(`🔍 Checking ${state.code}: lat ${latitude} in [${state.minLat}, ${state.maxLat}] = ${latitude >= state.minLat && latitude <= state.maxLat}, lon ${longitude} in [${state.minLon}, ${state.maxLon}] = ${longitude >= state.minLon && longitude <= state.maxLon}, match: ${isInBounds}`);

    if (isInBounds) {
      console.log(`✅ Found matching state: ${state.code} for coordinates (${latitude}, ${longitude})`);
      return state.code;
    }
  }

  console.log(`❌ No state found for coordinates (${latitude}, ${longitude})`);
  return null;
};

/**
 * Utility to get county from coordinates
 * Simplified county detection for major counties in Georgia
 */
export const coordinatesToCounty = (coordinates: GeolocationCoordinates): string | null => {
  const { latitude, longitude } = coordinates;

  console.log(`🏘️ Converting coordinates to county: lat=${latitude}, lon=${longitude}`);

  // Simplified county boundaries for Georgia (approximate)
  const georgiaCounties = [
    // Major counties around Atlanta area
    { name: 'Cobb', minLat: 33.7, maxLat: 34.0, minLon: -84.8, maxLon: -84.3 },
    { name: 'Fulton', minLat: 33.6, maxLat: 34.0, minLon: -84.6, maxLon: -84.2 },
    { name: 'Gwinnett', minLat: 33.8, maxLat: 34.2, minLon: -84.2, maxLon: -83.8 },
    { name: 'DeKalb', minLat: 33.6, maxLat: 34.0, minLon: -84.4, maxLon: -84.0 },
    { name: 'Clayton', minLat: 33.4, maxLat: 33.7, minLon: -84.5, maxLon: -84.1 },
    { name: 'Cherokee', minLat: 34.0, maxLat: 34.4, minLon: -84.6, maxLon: -84.2 },
    { name: 'Forsyth', minLat: 34.1, maxLat: 34.4, minLon: -84.3, maxLon: -83.9 },
    { name: 'Henry', minLat: 33.3, maxLat: 33.7, minLon: -84.3, maxLon: -83.9 },
    { name: 'Douglas', minLat: 33.6, maxLat: 34.0, minLon: -84.9, maxLon: -84.5 },
    { name: 'Paulding', minLat: 33.7, maxLat: 34.1, minLon: -85.0, maxLon: -84.6 },
    // Other major Georgia counties
    { name: 'Richmond', minLat: 33.2, maxLat: 33.6, minLon: -82.2, maxLon: -81.8 }, // Augusta
    { name: 'Chatham', minLat: 31.8, maxLat: 32.2, minLon: -81.2, maxLon: -80.8 }, // Savannah
    { name: 'Muscogee', minLat: 32.3, maxLat: 32.7, minLon: -85.0, maxLon: -84.6 }, // Columbus
    { name: 'Bibb', minLat: 32.7, maxLat: 33.1, minLon: -83.8, maxLon: -83.4 }, // Macon
    { name: 'Houston', minLat: 32.4, maxLat: 32.8, minLon: -83.8, maxLon: -83.4 },
    { name: 'Hall', minLat: 34.1, maxLat: 34.5, minLon: -83.9, maxLon: -83.5 }, // Gainesville
  ];

  for (const county of georgiaCounties) {
    const isInBounds = latitude >= county.minLat &&
                      latitude <= county.maxLat &&
                      longitude >= county.minLon &&
                      longitude <= county.maxLon;

    console.log(`🔍 Checking ${county.name}: lat ${latitude} in [${county.minLat}, ${county.maxLat}] = ${latitude >= county.minLat && latitude <= county.maxLat}, lon ${longitude} in [${county.minLon}, ${county.maxLon}] = ${longitude >= county.minLon && longitude <= county.maxLon}, match: ${isInBounds}`);

    if (isInBounds) {
      console.log(`✅ Found matching county: ${county.name} for coordinates (${latitude}, ${longitude})`);
      return county.name;
    }
  }

  console.log(`❌ No county found for coordinates (${latitude}, ${longitude})`);
  return null;
};

/**
 * Test function to verify Georgia coordinates
 * This can be called from the browser console for debugging
 */
export const testGeorgiaCoordinates = (): void => {
  console.log('🧪 Testing Georgia coordinate detection...');

  // Test coordinates for Atlanta, Georgia (approximately)
  const testCoords = [
    { lat: 33.749, lon: -84.388 }, // Atlanta
    { lat: 32.083, lon: -81.1 },   // Savannah
    { lat: 34.052, lon: -84.3 },   // North Georgia
    { lat: 33.8, lon: -84.4 },     // Atlanta area
    { lat: 32.0, lon: -81.0 },     // Savannah area
  ];

  testCoords.forEach((coord, index) => {
    console.log(`\n📍 Test ${index + 1}: Atlanta area (${coord.lat}, ${coord.lon})`);
    const mockCoords = {
      latitude: coord.lat,
      longitude: coord.lon,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    } as GeolocationCoordinates;

    const result = coordinatesToState(mockCoords);
    console.log(`Result: ${result}`);
  });
};

// Make test function available globally for debugging
if (typeof window !== 'undefined') {
  (window as unknown as { testGeorgiaCoordinates: typeof testGeorgiaCoordinates; testCoordinatesToState: typeof coordinatesToState; testUserCoordinates: () => { state: string | null; county: string | null } }).testGeorgiaCoordinates = testGeorgiaCoordinates;
  (window as unknown as { testGeorgiaCoordinates: typeof testGeorgiaCoordinates; testCoordinatesToState: typeof coordinatesToState; testUserCoordinates: () => { state: string | null; county: string | null } }).testCoordinatesToState = coordinatesToState;

  // Test the specific coordinates from the log
  (window as unknown as { testGeorgiaCoordinates: typeof testGeorgiaCoordinates; testCoordinatesToState: typeof coordinatesToState; testUserCoordinates: () => { state: string | null; county: string | null } }).testUserCoordinates = () => {
    console.log('🧪 Testing user coordinates from log...');
    const mockCoords = {
      latitude: 33.8460672,
      longitude: -84.5479936,
      accuracy: 1286.1234731772754,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    } as GeolocationCoordinates;

    const stateResult = coordinatesToState(mockCoords);
    const countyResult = coordinatesToCounty(mockCoords);
    console.log(`State result: ${stateResult}`);
    console.log(`County result: ${countyResult}`);
    return { state: stateResult, county: countyResult };
  };
}
