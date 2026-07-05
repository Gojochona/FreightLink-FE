"use client"

import { Truck, Package, Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { dashboardApi } from "@/lib/api"
import { useFetch } from "@/hooks/useApi"

export function StatsCards() {
  const { data: stats, loading, error } = useFetch(() => dashboardApi.getStats(), [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 h-32 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/50 rounded-2xl p-4 text-destructive">
        Failed to load dashboard stats
      </div>
    )
  }

  if (!stats) return null

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value
    if (num >= 1000000) {
      return `₦${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `₦${(num / 1000).toFixed(1)}K`
    }
    return `₦${num.toFixed(0)}`
  }

  const statCards = [
    {
      label: "Completed Trips",
      value: stats.completed_trips?.toString() || "0",
      change: (stats.trips_change_percent || 0).toFixed(1),
      trend: (stats.trips_change_percent || 0) >= 0 ? "up" : "down",
      icon: Truck,
      color: "primary",
    },
    {
      label: "Bookings",
      value: stats.total_bookings?.toString() || "0",
      change: (stats.bookings_change_percent || 0).toFixed(1),
      trend: (stats.bookings_change_percent || 0) >= 0 ? "up" : "down",
      icon: Package,
      color: "info",
    },
    {
      label: "Wallet Balance",
      value: formatCurrency(stats.wallet_balance || 0),
      change: (stats.wallet_change_percent || 0).toFixed(1),
      trend: (stats.wallet_change_percent || 0) >= 0 ? "up" : "down",
      icon: Wallet,
      color: "accent",
    },
    {
      label: "Revenue (MTD)",
      value: formatCurrency(stats.revenue_mtd || 0),
      change: (stats.revenue_change_percent || 0).toFixed(1),
      trend: (stats.revenue_change_percent || 0) >= 0 ? "up" : "down",
      icon: TrendingUp,
      color: "success",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="glass rounded-2xl p-5 glass-hover"
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                stat.color === "primary"
                  ? "bg-primary/20 text-primary"
                  : stat.color === "info"
                  ? "bg-info/20 text-info"
                  : stat.color === "accent"
                  ? "bg-accent/20 text-accent"
                  : "bg-success/20 text-success"
              }`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === "up" ? "text-success" : "text-destructive"
              }`}
            >
              {stat.trend === "up" ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {stat.trend === "up" ? "+" : ""}{stat.change}%
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
