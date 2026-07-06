'use client'
import useSWR from 'swr'
import { authApi } from '@/lib/api'

export const CURRENT_USER_KEY = '/auth/me'

export function useCurrentUser() {
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('access_token')
  const { data, error, isLoading, mutate } = useSWR(
    hasToken ? CURRENT_USER_KEY : null,
    () => authApi.getProfile(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // don't hit /auth/me more than once a minute automatically
    }
  )
  return { user: data ?? null, error, isLoading, mutate }
}