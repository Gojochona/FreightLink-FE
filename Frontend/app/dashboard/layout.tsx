"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { HeaderBar } from "@/components/dashboard/header-bar"
import { ToastProvider } from "@/components/providers/ToastProvider"
import { DashboardHeaderProvider } from "@/contexts/DashboardHeaderContext"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <ToastProvider>
      <DashboardHeaderProvider>
        <div className="min-h-screen gradient-bg">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <main
            className={cn(
              "transition-all duration-300",
              sidebarCollapsed ? "ml-20" : "ml-64"
            )}
          >
            <HeaderBar />
            {children}
          </main>
        </div>
      </DashboardHeaderProvider>
    </ToastProvider>
  )
}
