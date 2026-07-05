"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ToastProvider } from "@/components/providers/ToastProvider"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <ToastProvider>
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
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
