/**
 * Parses `page`/`limit` query params, discarding anything that isn't a
 * positive finite number (e.g. `?page=abc` or `?page=NaN`) instead of letting
 * it flow into `.skip((NaN - 1) * limit)`, whose Mongoose/driver behavior is
 * undefined. Falls back to "not provided" (the service applies its own
 * default) rather than guessing a value.
 */
export function parsePagination(page?: string, limit?: string) {
  const parsedPage = page ? Number(page) : undefined;
  const parsedLimit = limit ? Number(limit) : undefined;
  return {
    page: parsedPage != null && Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : undefined,
    limit: parsedLimit != null && Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined,
  };
}
