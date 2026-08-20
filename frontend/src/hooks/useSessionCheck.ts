import { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/authService';
import { useAuthStore } from '../store/authStore';

/**
 * Validates a persisted session once, on app boot.
 *
 * The auth store persists `user` and `token` to localStorage, so after a refresh
 * the app trusted whatever was stored — including a token that had since expired
 * or been issued to a user who was later blocked or had their role changed. That
 * rendered the dashboard optimistically until the first API call 401'd.
 *
 * Calling /users/me up front resolves the real state: the store is refreshed with
 * the server's view of the user, or cleared if the token is no longer valid.
 * Returns `false` while the check is in flight so the app can hold off rendering.
 */
export function useSessionCheck() {
  const token = useAuthStore((s) => s.token);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);

  const [ready, setReady] = useState(() => !useAuthStore.getState().token);

  useEffect(() => {
    if (!token) {
      setReady(true);
      return;
    }

    let cancelled = false;
    getCurrentUser()
      .then((user) => {
        if (!cancelled) updateUser(user);
      })
      .catch(() => {
        // 401/403 means the stored token is no longer usable. The axios
        // interceptor also clears it, but do so explicitly for other failures.
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
    // Runs once per app load; the token is read at mount time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ready;
}
