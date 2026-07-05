/**
 * Authentication State Management Hook
 * Use in your app layout to manage global auth state
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { authApi, ApiClient, UserProfile } from '@/lib/api';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * useAuth - Global authentication hook
 * @example
 * const { user, isAuthenticated, logout, login } = useAuth();
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        
        if (token) {
          const user = await authApi.getProfile();
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Auth check failed',
        });
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await authApi.login({ email, password });
        ApiClient.setTokens(response.access, response.refresh);

        // Get user profile
        const user = await authApi.getProfile();
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return user;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Login failed';
        setState((prev) => ({ ...prev, isLoading: false, error }));
        throw err;
      }
    },
    []
  );

  const logout = useCallback(() => {
    ApiClient.clearTokens();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const updateProfile = useCallback(async (data: any) => {
    try {
      const user = await authApi.updateProfile(data);
      setState((prev) => ({ ...prev, user }));
      return user;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Update failed';
      setState((prev) => ({ ...prev, error }));
      throw err;
    }
  }, []);

  const activateTraveler = useCallback(async () => {
    try {
      const response = await authApi.activateTraveler();
      // Refresh user profile to get updated capabilities
      const user = await authApi.getProfile();
      setState((prev) => ({ ...prev, user }));
      return response;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Activation failed';
      setState((prev) => ({ ...prev, error }));
      throw err;
    }
  }, []);

  return {
    ...state,
    login,
    logout,
    updateProfile,
    activateTraveler,
  };
}
