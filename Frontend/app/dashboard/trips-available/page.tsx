"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Filter,
  MapPin,
  ArrowRight,
  Clock,
  DollarSign,
  AlertCircle,
  Plus,
  Package
} from "lucide-react"
import { tripsApi } from "@/lib/api"
import { Trip } from "@/lib/api/types"
import { useFetch } from "@/hooks/useApi"

export default function AvailableTripsPage() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState({
    from_location: "",
    to_location: "",
    max_price_per_kg: undefined as number | undefined,
  })
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([])

  // Fetch available trips
  const { data: tripsData, loading } = useFetch(() => tripsApi.listTrips(searchParams), [
    searchParams.from_location,
    searchParams.to_location,
    searchParams.max_price_per_kg,
  ])

  useEffect(() => {
    if (tripsData?.results) {
      setFilteredTrips(tripsData.results)
    }
  }, [tripsData])

  return (
    <>
      <Header 
        title="Available Trips" 
        subtitle="Browse and book available trips to transport your cargo"
      />

      <div className="p-6 space-y-6">
        {/* Search & Filter */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Search Trips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                From Location
              </label>
              <Input
                placeholder="e.g., Lagos"
                value={searchParams.from_location}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, from_location: e.target.value })
                }
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                To Location
              </label>
              <Input
                placeholder="e.g., Abuja"
                value={searchParams.to_location}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, to_location: e.target.value })
                }
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Price per kg (₦)
              </label>
              <Input
                type="number"
                placeholder="e.g., 5000"
                value={searchParams.max_price_per_kg || ""}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    max_price_per_kg: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Trips List */}
        <div className="space-y-4">
          {loading && (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-muted-foreground">Loading trips...</p>
            </div>
          )}

          {!loading && filteredTrips.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No trips found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search filters or create a new booking request
              </p>
              <Link href="/dashboard/bookings/new">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Booking Request
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {filteredTrips.map((trip) => (
                <Link key={trip.id} href={`/dashboard/trips/${trip.id}`}>
                  <div className="glass rounded-2xl p-6 hover:bg-secondary/20 transition-colors cursor-pointer">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{trip.id.substring(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">Trip ID</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        trip.status === "open" 
                          ? "bg-success/20 text-success"
                          : "bg-warning/20 text-warning"
                      }`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </span>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-secondary/30">
                      <div className="flex items-center gap-2 flex-1">
                        <MapPin className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium text-foreground">
                          {trip.origin_city}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="text-sm font-medium text-foreground">
                          {trip.destination_city}
                        </span>
                        <MapPin className="w-4 h-4 text-destructive" />
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {/* Capacity */}
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground text-xs">Available</p>
                          <p className="text-foreground font-medium">{trip.available_kg} kg</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground text-xs">Price per kg</p>
                          <p className="text-foreground font-medium">₦{trip.price_per_kg}</p>
                        </div>
                      </div>

                      {/* Departure */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground text-xs">Departs</p>
                          <p className="text-foreground font-medium">
                            {new Date(trip.departure_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  )
}
