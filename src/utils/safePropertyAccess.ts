/**
 * Safe Property Access Utilities
 *
 * Provides safe alternatives to Object.prototype.hasOwnProperty.call
 * to avoid security warnings about object injection sinks.
 */

/**
 * Safely check if an object has a property without using Object.prototype.hasOwnProperty.call
 * @param obj - The object to check
 * @param key - The property key to check for
 * @returns True if the object has the property as its own property
 */
export function hasOwnProperty<T extends Record<string, unknown>>(
  obj: T,
  key: string | number | symbol
): key is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Safely get a property value from an object
 * @param obj - The object to get the property from
 * @param key - The property key
 * @returns The property value or undefined if it doesn't exist
 */
export function safeGetProperty<T extends Record<string, unknown>>(
  obj: T,
  key: string | number | symbol
): unknown {
  return hasOwnProperty(obj, key) ? obj[key] : undefined;
}

/**
 * Safely check if a property exists in an object
 * @param obj - The object to check
 * @param key - The property key to check for
 * @returns True if the property exists (own or inherited)
 */
export function hasProperty<T extends Record<string, unknown>>(
  obj: T,
  key: string | number | symbol
): boolean {
  return key in obj;
}
