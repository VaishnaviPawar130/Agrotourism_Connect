import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../services/api';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

/**
 * Runs an async fetcher and tracks loading / error / data as three distinct states.
 *
 * The pages previously used `fetch().then(setState).finally(stopLoading)` with no
 * `.catch`, so a failed request left an unhandled rejection and rendered the
 * "no records" empty state — indistinguishable from a genuinely empty list.
 * Callers should branch on `error` before `data`.
 *
 * `reload` re-runs the fetcher; results from a superseded call are discarded so a
 * slow earlier response cannot overwrite a newer one.
 */
export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: '' });

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Incremented on every run; a response is only applied if it is still the latest.
  const runIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    const runId = ++runIdRef.current;
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await fetcherRef.current();
      if (!mountedRef.current || runId !== runIdRef.current) return;
      setState({ data, loading: false, error: '' });
    } catch (err) {
      if (!mountedRef.current || runId !== runIdRef.current) return;
      setState({ data: null, loading: false, error: getErrorMessage(err) });
    }
  }, []);

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, reload, setData: (data: T) => setState((s) => ({ ...s, data })) };
}
