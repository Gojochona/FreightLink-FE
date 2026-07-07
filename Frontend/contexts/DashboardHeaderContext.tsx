'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { notificationsApi } from '@/lib/api'

interface DashboardHeaderContextValue {
  title: string
  subtitle?: string
  setHeader: (title: string, subtitle?: string) => void
  unreadCount: number
  refetchUnreadCount: () => void
}

const DashboardHeaderContext = createContext<DashboardHeaderContextValue | null>(null)

export function DashboardHeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState<string | undefined>(undefined)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetched once here, in the part of the tree that persists across
  // sidebar navigation — not inside a per-page component that remounts
  // on every route change (which used to reset this to 0 and refetch
  // every time you clicked a sidebar link).
  const fetchUnreadCount = useCallback(() => {
    notificationsApi
      .getUnreadCount()
      .then((res) => setUnreadCount(res.unread_count))
      .catch(() => {}) // silent — don't break the header over a notification count
  }, [])

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  const setHeader = useCallback((newTitle: string, newSubtitle?: string) => {
    setTitle(newTitle)
    setSubtitle(newSubtitle)
  }, [])

  return (
    <DashboardHeaderContext.Provider
      value={{ title, subtitle, setHeader, unreadCount, refetchUnreadCount: fetchUnreadCount }}
    >
      {children}
    </DashboardHeaderContext.Provider>
  )
}

export function useDashboardHeader() {
  const ctx = useContext(DashboardHeaderContext)
  if (!ctx) {
    throw new Error('useDashboardHeader must be used within a DashboardHeaderProvider')
  }
  return ctx
}
