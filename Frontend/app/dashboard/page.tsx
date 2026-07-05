"use client"

import { Header } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { RecentTrips } from "@/components/dashboard/recent-trips"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { UpcomingBookings } from "@/components/dashboard/upcoming-bookings"
import { useAuth } from "@/hooks/useAuth"

export default function DashboardPage() {
  const { user } = useAuth()
  
  return (
    <>
      <Header 
        title="Dashboard" 
        subtitle={`Welcome back, ${user?.first_name || 'User'}!`} 
      />
      <div className="p-6 space-y-6">
        <StatsCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTrips />
          <UpcomingBookings />
        </div>
      </div>
    </>
  )
}
