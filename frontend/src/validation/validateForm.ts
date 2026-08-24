import { ZodSchema } from 'zod';

/**
 * Runs a Zod schema against a plain-`useState` form object and returns
 * per-field error messages instead of throwing. Used by the admin CRUD
 * modals, which keep local `useState` form state rather than react-hook-form
 * — this gives them the same field-level error display without a full
 * restructure to RHF.
 *
 * Returns `{ success: true, data }` on success, or `{ success: false,
 * fieldErrors }` where `fieldErrors` maps each invalid field's dotted path
 * to its first message (enough for a single-line error under each input).
 */
export function validateForm<T>(schema: ZodSchema<T>, values: unknown): { success: true; data: T } | { success: false; fieldErrors: Record<string, string> } {
  const result = schema.safeParse(values);
  if (result.success) return { success: true, data: result.data };

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!(path in fieldErrors)) fieldErrors[path] = issue.message;
  }
  return { success: false, fieldErrors };
}

/** First field error message, for a top-of-form summary banner alongside the per-field text. */
export function firstFieldError(fieldErrors: Record<string, string>): string | undefined {
  return Object.values(fieldErrors)[0];
}
