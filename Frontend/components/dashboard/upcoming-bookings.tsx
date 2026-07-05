"use client"

import Link from "next/link"
import { ArrowRight, Calendar, Package, Truck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { dashboardApi } from "@/lib/api"
import { useFetch } from "@/hooks/useApi"

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "scheduled":
      return "bg-success/20 text-success"
    case "pending":
      return "bg-warning/20 text-warning"
    case "cancelled":
      return "bg-destructive/20 text-destructive"
    case "in_transit":
      return "bg-info/20 text-info"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const formatStatus = (status: string) => {
  if (!status) return "Pending"
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function UpcomingBookings() {
  const { data: bookingsData, loading, error } = useFetch(() => dashboardApi.getUpcomingTrips(), [])

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Upcoming Bookings</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-secondary/30 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Bookings</h3>
        <div className="text-destructive">Failed to load upcoming bookings</div>
      </div>
    )
  }

  const bookings = Array.isArray(bookingsData) ? bookingsData : []

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Upcoming Bookings</h3>
        <Link href="/dashboard/trips">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      {bookings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No upcoming bookings found
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">
                  {booking.reference_number || booking.id}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {formatStatus(booking.status)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <span>{booking.available_capacity_kg} kg</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {booking.departure_date
                      ? new Date(booking.departure_date).toLocaleDateString()
                      : "TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="w-4 h-4" />
                  <span>{booking.vehicle_type || "N/A"}</span>
                </div>
                <div className="text-muted-foreground">
                  {booking.from_location} → {booking.to_location}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
