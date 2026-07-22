"use client"

import { Bell, ChevronDown, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useDashboardHeader } from "@/contexts/DashboardHeaderContext"

export function HeaderBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { title, subtitle, unreadCount } = useDashboardHeader()

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U"
    const first = firstName?.[0]?.toUpperCase() || ""
    const last = lastName?.[0]?.toUpperCase() || ""
    return `${first}${last}`.slice(0, 2) || "U"
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="h-14 sm:h-16 border-b border-border flex items-center justify-between px-3 sm:px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-30 gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-bold text-foreground truncate">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-muted-foreground truncate hidden xs:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
        <Button variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground h-9 w-9 sm:h-10 sm:w-10"
          onClick={() => router.push("/dashboard/notifications")}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 sm:gap-3 px-1.5 sm:px-3">
              <Avatar className="w-8 h-8 sm:w-9 sm:h-9">
                <AvatarImage src={user?.profile_picture_url || undefined} alt={user?.full_name} />
                <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
                  {getInitials(user?.first_name, user?.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground">{user?.full_name || user?.first_name || "User"}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.kyc_status || ""}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/profile")}
              className="text-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
