/**
 * Escapes regex metacharacters in user-supplied search terms.
 *
 * Search filters interpolate the term into a `$regex` query. Without escaping,
 * a term like `(a+)+$` becomes a catastrophically backtracking pattern (ReDoS),
 * and characters such as `.` or `*` silently change match semantics.
 */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
