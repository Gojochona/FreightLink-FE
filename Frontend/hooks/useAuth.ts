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
    globalMutate(CURRENT_USER_KEY, null, false);
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