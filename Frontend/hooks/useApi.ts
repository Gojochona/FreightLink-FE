/**
 * useApi Hook - Simplified API usage in React components
 * Handles loading, error, and data states
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { ApiErrorClass } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiErrorClass | null;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiErrorClass) => void;
}

/**
 * Hook for executing async API calls with state management
 * @example
 * const { data, loading, error, execute } = useApi(authApi.login);
 * await execute(credentials);
 */
export function useApi<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args) => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await fn(...args);
        setState({ data: result, loading: false, error: null });
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error =
          err instanceof ApiErrorClass
            ? err
            : new ApiErrorClass(
                err instanceof Error ? err.message : 'Unknown error',
                0
              );
        setState({ data: null, loading: false, error });
        options.onError?.(error);
        throw error;
      }
    },
    [fn, options]
  );

  return {
    ...state,
    execute,
  };
}

/**
 * Hook for managing async state (e.g., fetching data on mount)
 * @example
 * const { data: profile, loading } = useFetch(authApi.getProfile, []);
 */
export function useFetch<T>(
  fn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const [refetch, setRefetch] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const result = await fn();
        if (!cancelled) {
          setState({ data: result, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          const error =
            err instanceof ApiErrorClass
              ? err
              : new ApiErrorClass(
                  err instanceof Error ? err.message : 'Unknown error',
                  0
                );
          setState({ data: null, loading: false, error });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [...deps, refetch]);

  return {
    ...state,
    refetch: () => setRefetch((x) => x + 1),
  };
}
