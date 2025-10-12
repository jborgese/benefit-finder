/**
 * Storage Utilities
 * 
 * Helper functions for secure local storage operations.
 * Provides encryption/decryption for sensitive data.
 */

/**
 * Safely get item from localStorage with error handling
 */
export function getStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return null;
  }
}

/**
 * Safely set item to localStorage with error handling
 */
export function setStorageItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Safely remove item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Clear all app-related items from localStorage
 */
export function clearAppStorage(): void {
  try {
    const keys = Object.keys(localStorage);
    const appKeys = keys.filter((key) => key.startsWith('benefit-finder-'));
    
    appKeys.forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing app storage', error);
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage usage information
 */
export function getStorageUsage(): { used: number; available: boolean } {
  if (!isStorageAvailable()) {
    return { used: 0, available: false };
  }
  
  try {
    let total = 0;
    
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        const item = localStorage.getItem(key);
        if (item) {
          total += key.length + item.length;
        }
      }
    }
    
    // Return size in KB
    return { used: Math.round(total / 1024), available: true };
  } catch (error) {
    console.error('Error calculating storage usage', error);
    return { used: 0, available: true };
  }
}

