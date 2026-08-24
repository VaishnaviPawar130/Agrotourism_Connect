import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

/** "currentCTC" -> "Current CTC", "risks.0.description" -> "Risks description". */
function humanizeFieldPath(path: string): string {
  return path
    .split('.')
    .filter((segment) => !/^\d+$/.test(segment))
    .map((segment) =>
      segment
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/^./, (c) => c.toUpperCase())
    )
    .join(' ')
    .replace(/\bCtc\b/i, 'CTC')
    .replace(/\bUrl\b/i, 'URL')
    .replace(/\bId\b/i, 'ID');
}

/**
 * Flattens the backend's per-field `errors` object (Zod's `flatten().fieldErrors`
 * is `Record<string, string[]>`; Mongoose's validation errors are `Record<string, string>`)
 * into the specific messages the user needs to see, rather than the generic
 * "Validation failed" the server sends as `message` alongside it. Each message
 * is prefixed with its field name — a message like "Expected number, received
 * string" is meaningless on its own, and several such messages concatenated
 * together (one per invalid field) become impossible to parse without knowing
 * which field each one belongs to.
 */
function extractFieldErrors(errors: unknown): string[] {
  if (!errors || typeof errors !== 'object') return [];
  return Object.entries(errors as Record<string, unknown>).flatMap(([field, value]) => {
    const messages = Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : typeof value === 'string' ? [value] : [];
    const label = humanizeFieldPath(field);
    return messages.map((message) => (message.toLowerCase().startsWith(label.toLowerCase()) ? message : `${label}: ${message}`));
  });
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const fieldErrors = extractFieldErrors(err.response?.data?.errors);
    if (fieldErrors.length > 0) return fieldErrors.join('\n');
    return err.response?.data?.message ?? err.message ?? 'Something went wrong';
  }
  return 'Something went wrong';
}
