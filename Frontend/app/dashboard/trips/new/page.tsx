"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { ActivateTravelerModal } from "@/components/dashboard/activate-traveler-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  MapPin,
  Package,
  Calendar,
  Plane,
  ChevronRight,
  Check,
  AlertCircle,
  FileCheck,
  Upload
} from "lucide-react"
import { tripsApi, locationsApi } from "@/lib/api"
import type { CountryWithCities } from "@/lib/api/locations"
import { CreateTripRequest } from "@/lib/api/types"
import { useAuth } from "@/hooks/useAuth"
import { LocationCombobox } from "@/components/dashboard/location-combobox"

const steps = [
  { id: 1, name: "Trip Route" },
  { id: 2, name: "Travel Dates" },
  { id: 3, name: "Luggage Capacity" },
  { id: 4, name: "Pricing & Restrictions" },
  { id: 5, name: "Review & Confirm" },
]

// datetime-local inputs need "YYYY-MM-DDTHH:mm" — no timezone, no seconds.
function toDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function NewTripPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showActivateTraveler, setShowActivateTraveler] = useState(false)
  const [countries, setCountries] = useState<CountryWithCities[]>([])

  useEffect(() => {
    locationsApi
      .getCountriesAndCities()
      .then((res) => setCountries(res.countries_with_cities))
      .catch(() => {
        // If this fails, the comboboxes just show no options rather
        // than breaking the whole form — the person can still retry.
      })
  }, [])

  // Check if user is a traveler on mount
  useEffect(() => {
    if (user && !user.is_traveler) {
      setShowActivateTraveler(true)
    }
  }, [user])
  const formData_state = {
    origin_country: "",
    origin_city: "",
    destination_country: "",
    destination_city: "",
    departure_date: "",
    arrival_date: "",
    total_kg: "",
    price_per_kg: "",
    booking_cutoff_date: "",
    notes: "",
    accepts_fragile: false,
    accepts_food: true,
    accepts_electronics: true,
  }
  const [formData, setFormData] = useState<Omit<CreateTripRequest, 'ticket_upload'>>(formData_state)
  const [ticketFile, setTicketFile] = useState<File | null>(null)
  const ticketInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (dateError) {
      setError(dateError)
      return
    }
    if (!ticketFile) {
      setError("Please upload your flight ticket or booking confirmation.")
      return
    }
    setLoading(true)
    setError("")

    try {
      await tripsApi.createTrip({ ...formData, ticket_upload: ticketFile })
      router.push("/dashboard/trips")
    } catch (err: any) {
      setError(err.message || "Failed to create trip")
    } finally {
      setLoading(false)
    }
  }

  const now = new Date()
  const nowLocal = toDatetimeLocal(now)

  const dateError = (() => {
    const { departure_date, arrival_date, booking_cutoff_date } = formData
    if (departure_date && new Date(departure_date) < now) {
      return "Departure date can't be in the past."
    }
    if (departure_date && arrival_date && new Date(arrival_date) <= new Date(departure_date)) {
      return "Arrival date must be after the departure date."
    }
    if (booking_cutoff_date && new Date(booking_cutoff_date) < now) {
      return "Booking cutoff date can't be in the past."
    }
    if (departure_date && booking_cutoff_date && new Date(booking_cutoff_date) > new Date(departure_date)) {
      return "Booking cutoff must be before the departure date."
    }
    return ""
  })()

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.origin_country && formData.origin_city && formData.destination_country && formData.destination_city
      case 2:
        return (
          formData.departure_date &&
          formData.arrival_date &&
          formData.booking_cutoff_date &&
          !dateError
        )
      case 3:
        return formData.total_kg
      case 4:
        return formData.price_per_kg
      default:
        return true
    }
  }

  return (
    <>
      <Header title="Create New Trip" subtitle="Post your available luggage space for senders" />
      
      {/* Show activation prompt if user is not a traveler */}
      {user && !user.is_traveler && (
        <div className="p-6">
          <div className="glass rounded-2xl p-6 border border-warning/30 bg-warning/5">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-warning mt-0.5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Traveler Mode Required</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You need to activate traveler mode before creating trips. This enables you to operate as a carrier on the FreightLink platform.
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
        </div>
      )}

      {/* Only show form if user is a traveler */}
      {user && user.is_traveler ? (
        <div className="p-6 space-y-6">
          {/* Progress Steps */}
          <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground border border-border"
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <p className={`ml-3 text-sm font-medium hidden md:block ${
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {step.name}
                </p>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded transition-all ${
                      currentStep > step.id ? "bg-primary" : "bg-secondary/30"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="glass rounded-2xl p-4 border border-destructive/20 bg-destructive/5">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Route */}
          {currentStep === 1 && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Origin Country</label>
                <LocationCombobox
                  options={countries.map((c) => c.name)}
                  value={formData.origin_country}
                  onChange={(val) =>
                    setFormData({ ...formData, origin_country: val, origin_city: "" })
                  }
                  placeholder="Select origin country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Origin City</label>
                <LocationCombobox
                  options={countries.find((c) => c.name === formData.origin_country)?.cities || []}
                  value={formData.origin_city}
                  onChange={(val) => setFormData({ ...formData, origin_city: val })}
                  placeholder="Select origin city"
                  disabled={!formData.origin_country}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Destination Country</label>
                <LocationCombobox
                  options={countries.map((c) => c.name)}
                  value={formData.destination_country}
                  onChange={(val) =>
                    setFormData({ ...formData, destination_country: val, destination_city: "" })
                  }
                  placeholder="Select destination country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Destination City</label>
                <LocationCombobox
                  options={countries.find((c) => c.name === formData.destination_country)?.cities || []}
                  value={formData.destination_city}
                  onChange={(val) => setFormData({ ...formData, destination_city: val })}
                  placeholder="Select destination city"
                  disabled={!formData.destination_country}
                />
              </div>
            </div>
          )}

          {/* Step 2: Dates */}
          {currentStep === 2 && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Departure Date & Time</label>
                <Input
                  name="departure_date"
                  type="datetime-local"
                  min={nowLocal}
                  value={formData.departure_date}
                  onChange={handleInputChange}
                  className="bg-input border-border text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Arrival Date & Time</label>
                <Input
                  name="arrival_date"
                  type="datetime-local"
                  min={formData.departure_date || nowLocal}
                  value={formData.arrival_date}
                  onChange={handleInputChange}
                  className="bg-input border-border text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Booking Cutoff Date & Time</label>
                <p className="text-sm text-muted-foreground mb-2">When senders stop being able to book space on this trip</p>
                <Input
                  name="booking_cutoff_date"
                  type="datetime-local"
                  min={nowLocal}
                  max={formData.departure_date || undefined}
                  value={formData.booking_cutoff_date}
                  onChange={handleInputChange}
                  className="bg-input border-border text-foreground"
                  required
                />
              </div>
              {dateError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {dateError}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Capacity */}
          {currentStep === 3 && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Total Luggage Capacity</label>
                <div className="flex gap-2">
                  <Input
                    name="total_kg"
                    type="number"
                    placeholder="e.g., 50"
                    value={formData.total_kg}
                    onChange={handleInputChange}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground flex-1"
                    step="0.1"
                    required
                  />
                  <div className="flex items-center px-4 bg-secondary/30 rounded-lg border border-border">
                    <span className="text-sm font-medium text-foreground">kg</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">The total weight capacity you can carry as luggage</p>
              </div>
            </div>
          )}

          {/* Step 4: Pricing & Restrictions */}
          {currentStep === 4 && (
            <div className="glass rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Price Per Kilogram</label>
                <div className="flex gap-2">
                  <div className="flex items-center px-4 bg-secondary/30 rounded-lg border border-border">
                    <span className="text-sm font-medium text-foreground">₦</span>
                  </div>
                  <Input
                    name="price_per_kg"
                    type="number"
                    placeholder="e.g., 5000"
                    value={formData.price_per_kg}
                    onChange={handleInputChange}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground flex-1"
                    step="0.01"
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">Price in NGN per kg</p>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="font-semibold text-foreground mb-4">What items do you accept?</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="accepts_fragile"
                      checked={formData.accepts_fragile}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Fragile items</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="accepts_food"
                      checked={formData.accepts_food}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Food & beverages</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="accepts_electronics"
                      checked={formData.accepts_electronics}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Electronics</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <label className="block text-sm font-medium text-foreground mb-2">Additional Notes</label>
                <textarea
                  name="notes"
                  placeholder="Any special instructions or information for senders..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Trip Route</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex-1">
                    <p className="text-muted-foreground">From</p>
                    <p className="text-foreground font-medium">{formData.origin_city}, {formData.origin_country}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-muted-foreground">To</p>
                    <p className="text-foreground font-medium">{formData.destination_city}, {formData.destination_country}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Travel Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Departure</p>
                    <p className="text-foreground font-medium">{new Date(formData.departure_date).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Arrival</p>
                    <p className="text-foreground font-medium">{new Date(formData.arrival_date).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Capacity</p>
                    <p className="text-foreground font-medium">{formData.total_kg} kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="text-foreground font-medium">₦{formData.price_per_kg}/kg</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Booking Deadline</h3>
                <p className="text-foreground">{new Date(formData.booking_cutoff_date).toLocaleString()}</p>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">Proof of Travel</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload your flight ticket or booking confirmation. An admin reviews
                  this before your trip shows up in sender search results — this is
                  what keeps fake listings off the platform.
                </p>
                <input
                  ref={ticketInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setTicketFile(e.target.files?.[0] || null)}
                />
                {ticketFile ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <FileCheck className="w-4 h-4 text-primary" />
                      {ticketFile.name}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setTicketFile(null)}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => ticketInputRef.current?.click()}
                    className="w-full h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Upload ticket (image or PDF)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4 pt-6">
            <Link href="/dashboard/trips">
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Trips
              </Button>
            </Link>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="border-border text-foreground hover:bg-secondary"
              >
                Previous
              </Button>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
                  disabled={!canProceed()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading || !ticketFile}
                  className="bg-success hover:bg-success/90 text-primary-foreground"
                >
                  {loading ? "Creating..." : "Create Trip"}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </form>
        </div>
      ) : null}

      {/* Activate Traveler Modal */}
      <ActivateTravelerModal
        isOpen={showActivateTraveler}
        onClose={() => {
          setShowActivateTraveler(false)
          router.push('/dashboard/trips')
        }}
        onActivated={() => {
          setShowActivateTraveler(false)
          router.refresh()
        }}
      />
    </>
  )
}
