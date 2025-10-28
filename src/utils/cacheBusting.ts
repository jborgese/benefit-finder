/**
 * Cache Busting Utilities
 *
 * Provides functions to handle cache invalidation and version management
 * for ensuring users get the latest version of the application.
 */

/**
 * Get the current application version
 */
export function getAppVersion(): string {
  return typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.1.0';
}

/**
 * Get the build timestamp
 */
export function getBuildTime(): string {
  return typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toISOString();
}

/**
 * Generate a cache-busting query parameter
 */
export function getCacheBuster(): string {
  const version = getAppVersion();
  const buildTime = getBuildTime();
  return `v=${version}&t=${buildTime}`;
}

/**
 * Check if the current version is different from stored version
 */
export function hasVersionChanged(): boolean {
  const currentVersion = getAppVersion();
  const storedVersion = localStorage.getItem('bf_app_version');

  if (!storedVersion) {
    return true; // First time user
  }

  return currentVersion !== storedVersion;
}

/**
 * Store the current version in localStorage
 */
export function storeCurrentVersion(): void {
  const version = getAppVersion();
  localStorage.setItem('bf_app_version', version);
}

/**
 * Clear all application caches and force reload
 *
 * This function clears:
 * - localStorage (except version info)
 * - IndexedDB (user data)
 * - Browser cache (via reload)
 */
export async function clearAllCaches(): Promise<void> {
  try {
    // Clear IndexedDB user data using dynamic import to avoid circular dependencies
    const dbModule = await import('@/db/database');
    await dbModule.clearDatabase();

    // Clear localStorage (except version)
    const version = localStorage.getItem('bf_app_version');
    localStorage.clear();
    if (version) {
      localStorage.setItem('bf_app_version', version);
    }

    // Force reload to clear browser cache
    window.location.reload();
  } catch (error) {
    console.error('Error clearing caches:', error);
    // Fallback: just reload
    window.location.reload();
  }
}

/**
 * Check for version updates and prompt user to refresh
 */
export function checkForUpdates(): void {
  if (hasVersionChanged()) {
    const currentVersion = getAppVersion();
    const storedVersion = localStorage.getItem('bf_app_version');

    console.log(`Version update detected: ${storedVersion} → ${currentVersion}`);

    // Store new version
    storeCurrentVersion();

    // Show update notification to user
    if (typeof window !== 'undefined') {
      // Use a more user-friendly notification approach
      const message = 'A new version of BenefitFinder is available. Please refresh your browser to get the latest features and bug fixes.';

      // Try to use a more modern notification if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('BenefitFinder Update', { body: message });
      } else {
        // Fallback to console log and automatic reload after delay
        console.log(message);
        setTimeout(() => {
          window.location.reload();
        }, 5000); // Auto-reload after 5 seconds
      }
    }
  }
}

/**
 * Initialize cache busting on app startup
 */
export function initializeCacheBusting(): void {
  // Check for updates on app load
  checkForUpdates();

  // Store current version
  storeCurrentVersion();

  // Add version info to window for debugging
  if (import.meta.env.DEV) {
    (window as Window & { benefitFinderVersion?: unknown }).benefitFinderVersion = {
      version: getAppVersion(),
      buildTime: getBuildTime(),
      cacheBuster: getCacheBuster(),
      clearCaches: clearAllCaches,
    };

    console.log('BenefitFinder Cache Busting initialized:', {
      version: getAppVersion(),
      buildTime: getBuildTime(),
    });
  }
}
