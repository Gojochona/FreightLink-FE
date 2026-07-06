"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { ActivateTravelerModal } from "@/components/dashboard/activate-traveler-modal"
import { RejectionReasonModal } from "@/components/dashboard/RejectionReasonModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/useToast"
import {
  Search,
  Filter,
  MapPin,
  ArrowRight,
  Clock,
  DollarSign,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  XCircle,
  CheckCircle,
  Package,
  Truck,
  AlertCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { tripsApi } from "@/lib/api"
import { Trip, Booking } from "@/lib/api/types"
import { useFetch } from "@/hooks/useApi"
import { useAuth } from "@/hooks/useAuth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const getTripStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-success/20 text-success"
    case "in_transit":
      return "bg-info/20 text-info"
    case "completed":
      return "bg-primary/20 text-primary"
    case "fully_booked":
      return "bg-warning/20 text-warning"
    case "cancelled":
      return "bg-destructive/20 text-destructive"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getBookingStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-warning/20 text-warning"
    case "confirmed":
      return "bg-success/20 text-success"
    case "item_handed_over":
      return "bg-secondary/20 text-secondary"
    case "in_transit":
      return "bg-info/20 text-info"
    case "delivered":
      return "bg-info/20 text-info"
    case "completed":
      return "bg-primary/20 text-primary"
    case "cancelled":
      return "bg-destructive/20 text-destructive"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const tripStatusFilters = ["All", "open", "in_transit", "fully_booked", "completed", "cancelled"]

export default function TripsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { showSuccess, showError, showInfo } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [bookingSearch, setBookingSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")
  const [activeTab, setActiveTab] = useState<"available" | "my-trips" | "bookings">("available")
  const [showActivateTraveler, setShowActivateTraveler] = useState(false)
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false)
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null)
  const [isRejectingLoading, setIsRejectingLoading] = useState(false)
  const [availableSearch, setAvailableSearch] = useState({
    from_location: "",
    to_location: "",
    max_price_per_kg: undefined as number | undefined,
  })
  const [bookingFilter, setBookingFilter] = useState<"confirmed" | "pending" | "item_handed_over" | "in_transit">("confirmed")
  const [actioningId, setActioningId] = useState<string | null>(null)


  // Switching to a traveler-only tab as a non-traveler prompts activation
  // instead of silently showing nothing.
  const handleTabChange = (tab: "available" | "my-trips" | "bookings") => {
    if (tab !== "available" && user && !user.is_traveler) {
      setShowActivateTraveler(true)
      return
    }
    setActiveTab(tab)
  }

  // Available trips — visible to every user, sender or traveler
  const { data: availableTripsData, loading: availableTripsLoading } = useFetch(
    () => tripsApi.listTrips(availableSearch),
    [availableSearch.from_location, availableSearch.to_location, availableSearch.max_price_per_kg]
  )
  const availableTripsList = availableTripsData?.results || []

  // Fetch user's created trips (traveler only — guarded so senders don't
  // fire a request that's meaningless for their account)
  const { data: tripsData, loading: myTripsLoading } = useFetch(
    () => (user?.is_traveler ? tripsApi.getMyTrips() : Promise.resolve({ results: [], count: 0, next: null, previous: null })),
    [user?.is_traveler]
  )

  // Fetch bookings on user's trips (carrier view, traveler only)
  const { data: tripBookingsData, loading: tripBookingsLoading, refetch: refetchTripBookings } = useFetch(
    () => (user?.is_traveler ? tripsApi.getMyTripsBookings() : Promise.resolve([])),
    [user?.is_traveler]
  )

  const tripsList = tripsData?.results || []
  const tripBookingsList = Array.isArray(tripBookingsData) ? tripBookingsData : []

  // Filter trips
  const filteredTrips = tripsList.filter((trip: Trip) => {
    const matchesSearch =
      trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.origin_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination_city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter === "All" || trip.status === activeFilter
    return matchesSearch && matchesFilter
  })

  // Filter bookings on user's trips
  const filteredBookings = tripBookingsList.filter((booking: Booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      booking.trip_route.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      booking.receiver_name.toLowerCase().includes(bookingSearch.toLowerCase())
    return matchesSearch
  })

  const activeFilteredBookings = filteredBookings.filter(b => b.status === bookingFilter)


  // Group bookings by status for easier viewing
  const pendingBookings = filteredBookings.filter(b => b.status === "pending")
  const confirmedBookings = filteredBookings.filter(b => b.status === "confirmed")
  const handoverBookings = filteredBookings.filter(b => b.status === "item_handed_over")
  const inTransitBookings = filteredBookings.filter(b => b.status === "in_transit")

  const handleAcceptBooking = async (bookingId: string) => {
    if (actioningId) return  // guard against double-clicks across any in-flight action
    setActioningId(bookingId)
    try {
      await tripsApi.acceptBooking(bookingId)
      showSuccess("Booking accepted successfully!")
      refetchTripBookings()
    } catch (error) {
      console.error("Error accepting booking:", error)
      showError("Failed to accept booking. Please try again.")
    } finally {
      setActioningId(null)
    }
  }

  const handleRejectBooking = (bookingId: string) => {
    setRejectingBookingId(bookingId)
    setRejectionModalOpen(true)
  }

  const handleConfirmRejection = async (bookingId: string, reason: string) => {
    setIsRejectingLoading(true)
    try {
      await tripsApi.rejectBooking(bookingId, reason)
      showSuccess("Booking rejected successfully!")
      setRejectionModalOpen(false)
      setRejectingBookingId(null)
      refetchTripBookings()
    } catch (error) {
      console.error("Error rejecting booking:", error)
      showError("Failed to reject booking. Please try again.")
    } finally {
      setIsRejectingLoading(false)
    }
  }

  const handleHandover = async (bookingId: string) => {
    if (actioningId) return
    setActioningId(bookingId)
    try {
      await tripsApi.confirmHandover(bookingId)
      showSuccess("Handover confirmed!")
      refetchTripBookings()
    } catch (error) {
      console.error("Error confirming handover:", error)
      showError("Failed to confirm handover. Please try again.")
    } finally {
      setActioningId(null)
    }
  }

  const handleMarkInTransit = async (bookingId: string) => {
    if (actioningId) return
    setActioningId(bookingId)
    try {
      await tripsApi.markInTransit(bookingId)
      showSuccess("Marked as in transit!")
      refetchTripBookings()
    } catch (error) {
      console.error("Error marking in transit:", error)
      showError("Failed to update status. Please try again.")
    } finally {
      setActioningId(null)
    }
  }

  const handleInitiateDelivery = async (bookingId: string) => {
    if (actioningId) return
    setActioningId(bookingId)
    try {
      await tripsApi.initiateDelivery(bookingId)
      showSuccess("Delivery OTP sent to receiver!")
      refetchTripBookings()
    } catch (error) {
      console.error("Error initiating delivery:", error)
      showError("Failed to send delivery OTP. Please try again.")
    } finally {
      setActioningId(null)
    }
  }

  return (
    <>
      <Header title="Trips Management" subtitle="Browse available trips or manage your own" />

      <div className="p-6 space-y-6">
        {/* Top Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Trips</h2>
          {user?.is_traveler ? (
            <Link href="/dashboard/trips/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Create New Trip
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => setShowActivateTraveler(true)}
              variant="outline"
              className="border-border text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Become a Traveler to Post Trips
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => handleTabChange("available")}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${activeTab === "available"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Available Trips
            {activeTab === "available" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t"></div>
            )}
          </button>
          <button
            onClick={() => handleTabChange("my-trips")}
            disabled={!user?.is_traveler || myTripsLoading}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${activeTab === "my-trips"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
              } ${(!user?.is_traveler || myTripsLoading) ? "cursor-not-allowed opacity-50" : ""}`}
          >
            My Trips {user?.is_traveler ? `(${filteredTrips.length})` : ""}
            {activeTab === "my-trips" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t"></div>
            )}
          </button>
          <button
            onClick={() => handleTabChange("bookings")}
            disabled={!user?.is_traveler || tripBookingsLoading}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${activeTab === "bookings"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
              } ${(!user?.is_traveler || tripBookingsLoading) ? "cursor-not-allowed opacity-50" : ""}`}
          >
            Bookings on My Trips {user?.is_traveler ? `(${filteredBookings.length})` : ""}
            {activeTab === "bookings" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t"></div>
            )}
          </button>
        </div>

        {/* AVAILABLE TRIPS TAB — visible to everyone, sender or traveler */}
        {activeTab === "available" && (
          <div className="space-y-6">
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
                    value={availableSearch.from_location}
                    onChange={(e) =>
                      setAvailableSearch({ ...availableSearch, from_location: e.target.value })
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
                    value={availableSearch.to_location}
                    onChange={(e) =>
                      setAvailableSearch({ ...availableSearch, to_location: e.target.value })
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
                    value={availableSearch.max_price_per_kg || ""}
                    onChange={(e) =>
                      setAvailableSearch({
                        ...availableSearch,
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
              {availableTripsLoading && (
                <div className="glass rounded-2xl p-12 text-center">
                  <p className="text-muted-foreground">Loading trips...</p>
                </div>
              )}

              {!availableTripsLoading && availableTripsList.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No trips found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search filters, or check back later for new trips
                  </p>
                </div>
              ) : (
                availableTripsList.map((trip: Trip) => (
                  <Link key={trip.id} href={`/dashboard/trips/${trip.id}`}>
                    <div className="glass rounded-2xl p-6 hover:bg-secondary/20 transition-colors cursor-pointer">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={trip.traveler_avatar || undefined} alt={trip.traveler_name} />
                            <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                              {trip.traveler_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "T"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{trip.traveler_name}</p>
                            <p className="text-xs text-muted-foreground">Trip {trip.id.substring(0, 8)}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${trip.status === "open"
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
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground text-xs">Available</p>
                            <p className="text-foreground font-medium">{trip.available_kg} kg</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground text-xs">Price per kg</p>
                            <p className="text-foreground font-medium">₦{trip.price_per_kg}</p>
                          </div>
                        </div>
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
                ))
              )}
            </div>
          </div>
        )}

        {/* Traveler-only prompt when My Trips / Bookings selected without traveler mode active */}
        {(activeTab === "my-trips" || activeTab === "bookings") && user && !user.is_traveler && (
          <div className="glass rounded-2xl p-6 border border-warning/30 bg-warning/5">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-warning mt-0.5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Traveler Mode Inactive</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  To create trips and manage bookings, you need to activate your traveler mode. This enables you to operate as a carrier on the FreightLink platform.
                </p>
                <Button
                  onClick={() => setShowActivateTraveler(true)}
                  className="bg-warning hover:bg-warning/90 text-warning-foreground"
                >
                  Activate Traveler Mode
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Only show traveler tab content if user is a traveler */}
        {user && user.is_traveler && (
          <>
            {/* MY TRIPS TAB */}
            {activeTab === "my-trips" && (
              <div className="space-y-4">
                {/* Filters and Search */}
                <div className="glass rounded-2xl p-4">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                      {tripStatusFilters.map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setActiveFilter(filter)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeFilter === filter
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                            }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search trips..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <Button variant="outline" size="icon" className="border-border text-muted-foreground hover:text-foreground">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Trip Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredTrips.map((trip) => (
                    <div key={trip.id} className="glass rounded-2xl p-5 glass-hover">
                      {/* Trip Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{trip.id.substring(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">Travel ID</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTripStatusColor(trip.status)}`}>
                            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('_', ' ')}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem className="text-foreground focus:bg-accent focus:text-accent-foreground">
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              {trip.status === "open" && (
                                <DropdownMenuItem className="text-foreground focus:bg-accent focus:text-accent-foreground">
                                  <Edit className="w-4 h-4 mr-2" /> Edit Trip
                                </DropdownMenuItem>
                              )}
                              {trip.status === "open" && (
                                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                  <XCircle className="w-4 h-4 mr-2" /> Cancel Trip
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-secondary/30">
                        <div className="flex items-center gap-2 flex-1">
                          <MapPin className="w-4 h-4 text-success" />
                          <span className="text-sm font-medium text-foreground">{trip.origin_city}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="text-sm font-medium text-foreground">{trip.destination_city}</span>
                          <MapPin className="w-4 h-4 text-destructive" />
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="text-muted-foreground">
                          <p className="text-foreground font-medium">{trip.total_kg} kg</p>
                          <p className="text-xs">total capacity</p>
                        </div>
                        <div className="text-muted-foreground">
                          <p className="text-foreground font-medium">{trip.available_kg} kg</p>
                          <p className="text-xs">available</p>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="text-foreground text-xs">{new Date(trip.departure_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="text-foreground text-xs">{new Date(trip.arrival_date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="p-3 rounded-lg bg-primary/10 mb-4">
                        <p className="text-xs text-muted-foreground">Price per kg</p>
                        <p className="text-lg font-bold text-primary">₦{trip.price_per_kg}</p>
                      </div>

                      {/* View Details Link */}
                      <Link href={`/dashboard/trips/${trip.id}`} className="block">
                        <Button variant="outline" className="w-full border-border text-foreground hover:bg-secondary">
                          View Trip Details
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>

                {filteredTrips.length === 0 && (
                  <div className="glass rounded-2xl p-12 text-center">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No trips created yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first trip to start receiving bookings</p>
                    <Link href="/dashboard/trips/new">
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Trip
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === "bookings" && (
              <div className="space-y-6">
                <div className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by booking ID, route, or receiver..."
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* Filter pills with counts — Confirmed first/default so the most actionable work is front and center */}
                <div className="flex gap-2 flex-wrap">
                  {([
                    { key: "confirmed", label: "Confirmed", count: confirmedBookings.length, dot: "bg-success" },
                    { key: "pending", label: "Pending", count: pendingBookings.length, dot: "bg-warning" },
                    { key: "item_handed_over", label: "Handed Over", count: handoverBookings.length, dot: "bg-secondary" },
                    { key: "in_transit", label: "In Transit", count: inTransitBookings.length, dot: "bg-info" },
                  ] as const).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setBookingFilter(f.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${bookingFilter === f.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${f.dot}`} />
                      {f.label} ({f.count})
                    </button>
                  ))}
                </div>

                {activeFilteredBookings.length === 0 ? (
                  <div className="glass rounded-2xl p-12 text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No {bookingFilter.replace('_', ' ')} bookings
                    </h3>
                    <p className="text-muted-foreground">
                      {bookingFilter === "pending"
                        ? "New booking requests will appear here"
                        : "Bookings will move here as they progress"}
                    </p>
                  </div>
                ) : (
                  <div className="glass rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-secondary/30">
                          <tr>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Booking ID</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Sender</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Receiver</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Route</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Weight</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Price</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {activeFilteredBookings.map((booking) => {
                            const isActioning = actioningId === booking.id
                            return (
                              <tr key={booking.id} className="hover:bg-secondary/20 transition-colors">
                                <td className="px-6 py-4">
                                  <span className="font-medium text-foreground text-sm">{booking.id.substring(0, 8)}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={booking.sender_avatar || undefined} alt={booking.sender_name} />
                                      <AvatarFallback className="bg-secondary text-foreground text-xs font-medium">
                                        {booking.sender_name ? booking.sender_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <span className="font-medium text-foreground text-sm">{booking.sender_name || 'N/A'}</span>
                                      <p className="text-xs text-muted-foreground">{booking.sender_phone || 'N/A'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="font-medium text-foreground">{booking.receiver_name}</p>
                                  <p className="text-xs text-muted-foreground">{booking.receiver_phone}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-success" />
                                    <span className="text-foreground">{booking.trip_route}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4"><span className="text-sm text-foreground">{booking.weight_kg} kg</span></td>
                                <td className="px-6 py-4"><span className="font-semibold text-foreground">₦{booking.total_price}</span></td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {booking.status === "pending" && (
                                      <>
                                        <Button
                                          onClick={() => handleAcceptBooking(booking.id)}
                                          disabled={isActioning}
                                          size="sm"
                                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          {isActioning ? "Accepting..." : "Accept"}
                                        </Button>
                                        <Button
                                          onClick={() => handleRejectBooking(booking.id)}
                                          disabled={isActioning}
                                          size="sm"
                                          variant="destructive"
                                          className="bg-destructive/90 hover:bg-destructive text-foreground"
                                        >
                                          <XCircle className="w-4 h-4 mr-1" />
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                    {booking.status === "confirmed" && (
                                      <Button
                                        onClick={() => handleHandover(booking.id)}
                                        disabled={isActioning}
                                        size="sm"
                                        className="bg-secondary hover:bg-secondary/90 text-foreground"
                                      >
                                        <Truck className="w-4 h-4 mr-1" />
                                        {isActioning ? "Confirming..." : "Handover"}
                                      </Button>
                                    )}
                                    {booking.status === "item_handed_over" && (
                                      <Button
                                        onClick={() => handleMarkInTransit(booking.id)}
                                        disabled={isActioning}
                                        size="sm"
                                        className="bg-info hover:bg-info/90 text-foreground"
                                      >
                                        <Truck className="w-4 h-4 mr-1" />
                                        {isActioning ? "Updating..." : "In Transit"}
                                      </Button>
                                    )}
                                    {booking.status === "in_transit" && (
                                      <Button
                                        onClick={() => handleInitiateDelivery(booking.id)}
                                        disabled={isActioning}
                                        size="sm"
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        {isActioning ? "Sending OTP..." : "Deliver"}
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Activate Traveler Modal */}
      <ActivateTravelerModal
        isOpen={showActivateTraveler}
        onClose={() => {
          setShowActivateTraveler(false)
        }}
        onActivated={() => {
          setShowActivateTraveler(false)
          // Refresh the page to show trips content
          router.refresh()
        }}
      />

      <RejectionReasonModal
        open={rejectionModalOpen}
        bookingId={rejectingBookingId || ""}
        onConfirm={handleConfirmRejection}
        onCancel={() => {
          setRejectionModalOpen(false)
          setRejectingBookingId(null)
        }}
        isLoading={isRejectingLoading}
      />
    </>
  )
}
