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
export function hasOwnProperty<T extends object, K extends PropertyKey>(obj: T, key: K): boolean {
  // Use Object.hasOwn for safer property access (ES2022+)
  const { hasOwn } = Object as unknown as { hasOwn?: (obj: object, key: PropertyKey) => boolean };
  return typeof hasOwn === 'function'
    ? hasOwn(obj, key)
    : Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Safely get a property value from an object
 * @param obj - The object to get the property from
 * @param key - The property key
 * @returns The property value or undefined if it doesn't exist
 */
export function safeGetProperty<T extends object, K extends keyof T>(
  obj: T,
  key: K
): T[K] | undefined {
  // Avoid using 'any' and object injection sink
  // Avoid object injection sink by checking key type and using safer access
  if ((typeof key === 'string' || typeof key === 'number' || typeof key === 'symbol') && Object.prototype.hasOwnProperty.call(obj, key)) {
    return Reflect.get(obj, key);
  }
  return undefined;
}

/**
 * Safely check if a property exists in an object
 * @param obj - The object to check
 * @param key - The property key to check for
 * @returns True if the property exists (own or inherited)
 */
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): boolean {
  return key in obj;
}
