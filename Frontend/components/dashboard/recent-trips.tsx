"use client"

import Link from "next/link"
import { MapPin, ArrowRight, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { dashboardApi } from "@/lib/api"
import { useFetch } from "@/hooks/useApi"

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "in_transit":
      return "bg-info/20 text-info"
    case "loading":
      return "bg-warning/20 text-warning"
    case "completed":
      return "bg-success/20 text-success"
    case "open":
      return "bg-primary/20 text-primary"
    case "scheduled":
      return "bg-warning/20 text-warning"
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

export function RecentTrips() {
  const { data: tripsData, loading, error } = useFetch(() => dashboardApi.getRecentTrips(5), [])

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Recent Trips</h3>
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
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Trips</h3>
        <div className="text-destructive">Failed to load recent trips</div>
      </div>
    )
  }

  const trips = Array.isArray(tripsData) ? tripsData : []

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Trips</h3>
        <Link href="/dashboard/trips">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      {trips.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No recent trips yet
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200"
            >
              <span className="text-sm font-medium text-muted-foreground">
                {'Reference Number'}
              </span>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">
                  {trip.id || 'N/A'}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                  {formatStatus(trip.status)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <MapPin className="w-4 h-4" />
                <span>{trip.origin_city}</span>
                <ArrowRight className="w-4 h-4" />
                <span>{trip.destination_city}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {trip.available_kg} kg available
                </span>
                {trip.departure_date && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(trip.departure_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
