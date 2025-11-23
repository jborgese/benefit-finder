/**
 * Utility to resolve question text/description which may be a string
 * or a function that accepts a context and returns a string.
 */
export function resolveQuestionString<TContext = unknown>(
  value: string | ((context: TContext) => string) | undefined,
  context?: TContext
): string {
  if (typeof value === 'function') {
    try {
      // call with provided context or an empty object
      return (value as (c: TContext) => string)(context as TContext) ?? '';
    } catch {
      return '';
    }
  }
  return value ?? '';
}
