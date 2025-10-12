/**
 * Utility Types
 *
 * Generic utility types used throughout the application.
 */

/**
 * Validation Result
 *
 * Generic validation result type.
 */
export interface ValidationResult<T = unknown> {
  valid: boolean;
  data?: T;
  errors?: ValidationError[];
  warnings?: string[];
}

/**
 * Validation Error
 */
export interface ValidationError {
  field?: string;
  message: string;
  code?: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Async Result
 *
 * Result type for async operations.
 */
export type AsyncResult<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Deep Partial
 *
 * Makes all properties and nested properties optional.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Writeable
 *
 * Removes readonly modifier from all properties.
 */
export type Writeable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Require Some
 *
 * Makes specific keys required while keeping others optional.
 */
export type RequireSome<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Optional Some
 *
 * Makes specific keys optional while keeping others as-is.
 */
export type OptionalSome<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Nullable
 *
 * Makes all properties nullable.
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Non Nullable Keys
 *
 * Extract keys that are not nullable.
 */
export type NonNullableKeys<T> = {
  [K in keyof T]: null extends T[K] ? never : K;
}[keyof T];

/**
 * Exact
 *
 * Ensures type is exact (no extra properties).
 */
export type Exact<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never;

/**
 * JSON Value
 *
 * Any valid JSON value.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Timestamp
 *
 * Unix timestamp in milliseconds.
 */
export type Timestamp = number;

/**
 * ID
 *
 * Unique identifier string.
 */
export type ID = string;

/**
 * Currency Amount
 *
 * Monetary amount in cents (to avoid floating point issues).
 */
export type CurrencyAmount = number;

/**
 * Percentage
 *
 * Percentage value (0-100).
 */
export type Percentage = number;

/**
 * Empty Object
 */
export type EmptyObject = Record<string, never>;

/**
 * Primitive
 */
export type Primitive = string | number | boolean | null | undefined;

/**
 * Promisable
 *
 * Value or Promise of value.
 */
export type Promisable<T> = T | Promise<T>;

/**
 * Awaitable
 *
 * Awaited type utility.
 */
export type Awaitable<T> = T extends Promise<infer U> ? U : T;

