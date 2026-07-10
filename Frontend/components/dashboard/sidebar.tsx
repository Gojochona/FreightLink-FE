"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Truck,
  CalendarDays,
  Wallet,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { ActivateTravelerModal } from "./activate-traveler-modal"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Truck, label: "Trips", href: "/dashboard/trips" },
  { icon: CalendarDays, label: "Bookings", href: "/dashboard/bookings" },
  { icon: Wallet, label: "Wallet", href: "/dashboard/wallet" },
  { icon: BarChart3, label: "Reports", href: "/dashboard/reports" },
  { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
  { icon: Shield, label: "KYC", href: "/dashboard/kyc" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [showActivateTraveler, setShowActivateTraveler] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 text-primary" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">FreightLink</span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary/20 text-primary glow-purple"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {/* Traveler Mode Indicator */}
        {user && !user.is_traveler && (
          <button
            onClick={() => setShowActivateTraveler(true)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-warning/10 border border-warning/30 text-warning hover:bg-warning/20 transition-all duration-200"
          >
            <Zap className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <div className="text-left">
                <span className="font-medium text-xs">Activate Traveler</span>
              </div>
            )}
          </button>
        )}

        {user && user.is_traveler && (
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-success/10 border border-success/30">
            <Zap className="w-5 h-5 shrink-0 text-success" />
            {!collapsed && (
              <div className="text-left">
                <span className="font-medium text-xs text-success">Traveler Mode Active</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => {
            logout()
            router.push("/login")
          }}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Activate Traveler Modal */}
      <ActivateTravelerModal
        isOpen={showActivateTraveler}
        onClose={() => setShowActivateTraveler(false)}
        onActivated={() => {
          setShowActivateTraveler(false)
          window.location.reload()
        }}
      />
    </aside>
  )
}
