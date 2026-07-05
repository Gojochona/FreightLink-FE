"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  MapPin,
  Clock,
  Package,
  DollarSign,
  AlertCircle,
  ChevronRight,
  Loader
} from "lucide-react"
import { tripsApi } from "@/lib/api"
import { Trip, CreateBookingRequest, ItemCategory } from "@/lib/api/types"
import { useFetch } from "@/hooks/useApi"
import { useToast } from "@/hooks/useToast"

const itemCategories = [
  { label: "Electronics", value: ItemCategory.ELECTRONICS },
  { label: "Clothing", value: ItemCategory.CLOTHING },
  { label: "Food", value: ItemCategory.FOOD },
  { label: "Cosmetics", value: ItemCategory.COSMETICS },
  { label: "Other", value: ItemCategory.OTHER },
]

export default function TripDetailsPage() {
  const { showSuccess, showError } = useToast()
  const params = useParams()
  const router = useRouter()
  const tripId = params.id as string

  // Fetch trip data
  const { data: trip, loading: tripLoading } = useFetch(() => tripsApi.getTrip(tripId), [tripId])

  const [bookingStep, setBookingStep] = useState(1)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState("")
  const [bookingData, setBookingData] = useState<CreateBookingRequest>({
    weight_kg: "",
    estimated_value_ngn: "",
    receiver_name: "",
    receiver_phone: "",
    receiver_address: "",
    item_category: ItemCategory.ELECTRONICS,
    item_description: "",
    sender_confirmed_legal: false,
  })

  const canProceedBooking = () => {
    if (bookingStep === 1) {
      return bookingData.weight_kg && bookingData.item_category && bookingData.item_description
    }
    if (bookingStep === 2) {
      return (
        bookingData.receiver_name &&
        bookingData.receiver_phone &&
        bookingData.receiver_address &&
        bookingData.estimated_value_ngn
      )
    }
    return true
  }

  const handleBookingSubmit = async () => {
    setBookingLoading(true)
    setError("")
    try {
      await tripsApi.bookTrip(tripId, bookingData)
      showSuccess("Trip booked successfully! Redirecting...")
      router.push("/dashboard/bookings")
    } catch (err: any) {
      const errorMessage = err.message || "Failed to book trip"
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setBookingLoading(false)
    }
  }

  if (tripLoading) {
    return (
      <>
        <Header title="Trip Details" />
        <div className="p-6">
          <div className="glass rounded-2xl p-12 text-center">
            <Loader className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-4">Loading trip details...</p>
          </div>
        </div>
      </>
    )
  }

  if (!trip) {
    return (
      <>
        <Header title="Trip Details" />
        <div className="p-6">
          <div className="glass rounded-2xl p-12 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Trip not found</h3>
            <p className="text-muted-foreground mb-6">This trip doesn't exist or has been removed</p>
            <Link href="/dashboard/trips">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Available Trips
              </Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Trip Details" subtitle={trip.id} />
      <div className="p-6 space-y-6">
        {/* Back Button */}
        <Link href="/dashboard/trips">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Available Trips
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Card */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Route</h3>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Origin */}
                <div className="flex-1 text-center md:text-left">
                  <p className="text-sm text-muted-foreground mb-1">From</p>
                  <p className="text-2xl font-bold text-foreground">{trip.origin_city}</p>
                  <p className="text-sm text-muted-foreground">{trip.origin_country}</p>
                </div>

                {/* Arrow */}
                <MapPin className="w-5 h-5 text-muted-foreground hidden md:block" />

                {/* Destination */}
                <div className="flex-1 text-center md:text-left">
                  <p className="text-sm text-muted-foreground mb-1">To</p>
                  <p className="text-2xl font-bold text-foreground">{trip.destination_city}</p>
                  <p className="text-sm text-muted-foreground">{trip.destination_country}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Departure</p>
                  <p className="font-medium text-foreground">
                    {new Date(trip.departure_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(trip.departure_date).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Arrival</p>
                  <p className="font-medium text-foreground">
                    {new Date(trip.arrival_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(trip.arrival_date).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Capacity & Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Available Capacity</span>
                </div>
                <p className="text-2xl font-bold text-primary">{trip.available_kg} kg</p>
                <p className="text-xs text-muted-foreground mt-2">of {trip.total_kg} kg total</p>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium text-muted-foreground">Price per kg</span>
                </div>
                <p className="text-2xl font-bold text-success">₦{trip.price_per_kg}</p>
              </div>
            </div>

            {/* Booking Form */}
            {trip.status === "open" && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Book This Trip</h3>

                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  </div>
                )}

                {/* Step Indicators */}
                <div className="flex gap-4 mb-6">
                  {[1, 2].map((step) => (
                    <button
                      key={step}
                      onClick={() => step < bookingStep && setBookingStep(step)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                          bookingStep >= step
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 text-muted-foreground"
                        }`}
                      >
                        {step}
                      </div>
                      <span className={`hidden md:inline text-sm font-medium ${
                        bookingStep >= step ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {step === 1 ? "Cargo Details" : "Receiver Info"}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Step 1: Cargo Details */}
                {bookingStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Weight (kg) *
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 500"
                        value={bookingData.weight_kg}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, weight_kg: e.target.value })
                        }
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Item Category *
                      </label>
                      <select
                        value={bookingData.item_category}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            item_category: e.target.value as ItemCategory,
                          })
                        }
                        className="w-full p-2 rounded-lg bg-input border border-border text-foreground"
                      >
                        {itemCategories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Description *
                      </label>
                      <textarea
                        placeholder="Describe your item in detail..."
                        value={bookingData.item_description}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, item_description: e.target.value })
                        }
                        className="w-full p-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={() => setBookingStep(2)}
                      disabled={!canProceedBooking()}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                    >
                      Next: Receiver Info
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {/* Step 2: Receiver Info */}
                {bookingStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Receiver Name *
                      </label>
                      <Input
                        placeholder="Full name"
                        value={bookingData.receiver_name}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, receiver_name: e.target.value })
                        }
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number *
                      </label>
                      <Input
                        placeholder="e.g., +234 812..."
                        value={bookingData.receiver_phone}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, receiver_phone: e.target.value })
                        }
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Delivery Address *
                      </label>
                      <textarea
                        placeholder="Full delivery address"
                        value={bookingData.receiver_address}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, receiver_address: e.target.value })
                        }
                        className="w-full p-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Estimated Value (₦) *
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 50000"
                        value={bookingData.estimated_value_ngn}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, estimated_value_ngn: e.target.value })
                        }
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="legal"
                        checked={bookingData.sender_confirmed_legal}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            sender_confirmed_legal: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-border"
                      />
                      <label htmlFor="legal" className="text-sm text-foreground">
                        I confirm this item is legal and complies with regulations *
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => setBookingStep(1)}
                        variant="outline"
                        className="flex-1 border-border text-foreground hover:bg-secondary"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleBookingSubmit}
                        disabled={bookingLoading || !bookingData.sender_confirmed_legal}
                        className="flex-1 bg-success hover:bg-success/90 text-primary-foreground disabled:opacity-50"
                      >
                        {bookingLoading ? "Booking..." : "Confirm Booking"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <div className="glass rounded-2xl p-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                trip.status === "open"
                  ? "bg-success/20 text-success"
                  : "bg-warning/20 text-warning"
              }`}>
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
              </span>
            </div>

            {/* Key Info */}
            <div className="glass rounded-2xl p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Trip ID</p>
                <p className="font-medium text-foreground text-sm">{trip.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Booking Cutoff</p>
                <p className="font-medium text-foreground text-sm">
                  {new Date(trip.booking_cutoff_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

