"use client"

import { useEffect } from "react"
import { useDashboardHeader } from "@/contexts/DashboardHeaderContext"

interface HeaderProps {
  title: string
  subtitle?: string
}

/**
 * This no longer renders the header bar itself — it just registers this
 * page's title/subtitle with the persistent HeaderBar living in the
 * dashboard layout. That bar (notification bell + user menu) is mounted
 * once and never remounts on navigation, so the unread count and user
 * info don't reset/refetch/flicker every time you click a sidebar link.
 *
 * Kept as a drop-in replacement so existing `<Header title=".." />` calls
 * across pages don't need to change.
 */
export function Header({ title, subtitle }: HeaderProps) {
  const { setHeader } = useDashboardHeader()

  useEffect(() => {
    setHeader(title, subtitle)
  }, [title, subtitle, setHeader])

  return null
}
