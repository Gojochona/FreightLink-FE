'use client';

import { useCallback, useState } from 'react';
import { authApi, ApiClient } from '@/lib/api';
import { mutate as globalMutate } from 'swr';
import { useCurrentUser, CURRENT_USER_KEY } from './useCurrentUser';

export function useAuth() {
  const { user, isLoading, mutate } = useCurrentUser();
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      // Wipe any previous user's cached profile *before* we do anything
      // else. Without this, the old profile can still be sitting in the
      // SWR cache (dedupingInterval keeps it from being refetched for up
      // to a minute), so as soon as the new tokens make hasToken truthy,
      // any mounted component reading /auth/me would briefly render the
      // previous person's data instead of the new one's.
      await globalMutate(CURRENT_USER_KEY, undefined, false);

      const response = await authApi.login({ email, password });
      ApiClient.setTokens(response.access, response.refresh);
      const freshUser = await authApi.getProfile();
      await globalMutate(CURRENT_USER_KEY, freshUser, false);
      return freshUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    ApiClient.clearTokens();
    // Clear rather than leave the old value in place.
    globalMutate(CURRENT_USER_KEY, undefined, false);
  }, []);

  const updateProfile = useCallback(async (data: any) => {
    try {
      const updated = await authApi.updateProfile(data);
      await globalMutate(CURRENT_USER_KEY, updated, false);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      throw err;
    }
  }, []);

  const activateTraveler = useCallback(async () => {
    try {
      const response = await authApi.activateTraveler();
      const updated = await authApi.getProfile();
      await globalMutate(CURRENT_USER_KEY, updated, false);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed');
      throw err;
    }
  }, []);

  return { user, isAuthenticated, isLoading, error, login, logout, updateProfile, activateTraveler };
}