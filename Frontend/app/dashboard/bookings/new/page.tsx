"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  MapPin,
  Package,
  Truck,
  Calendar,
  User,
  Phone,
  Mail,
  ChevronRight,
  Check
} from "lucide-react"

const vehicleTypes = [
  { id: "container-20", name: "20ft Container", capacity: "20,000 kg", price: "₦350,000" },
  { id: "container-40", name: "40ft Container", capacity: "40,000 kg", price: "₦650,000" },
  { id: "flatbed", name: "Flatbed Truck", capacity: "25,000 kg", price: "₦450,000" },
  { id: "box", name: "Box Truck", capacity: "8,000 kg", price: "₦180,000" },
  { id: "refrigerated", name: "Refrigerated Truck", capacity: "15,000 kg", price: "₦520,000" },
  { id: "tanker", name: "Tanker Truck", capacity: "30,000 L", price: "₦580,000" },
]

const steps = [
  { id: 1, name: "Route Details" },
  { id: 2, name: "Cargo Info" },
  { id: 3, name: "Vehicle Selection" },
  { id: 4, name: "Review & Confirm" },
]

export default function NewBookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Route
    originCity: "",
    originAddress: "",
    destinationCity: "",
    destinationAddress: "",
    pickupDate: "",
    pickupTime: "",
    // Cargo
    cargoType: "",
    cargoDescription: "",
    weight: "",
    packages: "",
    specialInstructions: "",
    // Vehicle
    vehicleType: "",
    // Contact
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  })

  const selectedVehicle = vehicleTypes.find((v) => v.id === formData.vehicleType)

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Route Details</h3>
            
            {/* Origin */}
            <div className="p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-success" />
                <span className="font-medium text-success">Pickup Location</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">City</label>
                  <Input
                    placeholder="e.g., Lagos"
                    value={formData.originCity}
                    onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Address</label>
                  <Input
                    placeholder="Enter full pickup address"
                    value={formData.originAddress}
                    onChange={(e) => setFormData({ ...formData, originAddress: e.target.value })}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-destructive" />
                <span className="font-medium text-destructive">Delivery Location</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">City</label>
                  <Input
                    placeholder="e.g., Abuja"
                    value={formData.destinationCity}
                    onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Address</label>
                  <Input
                    placeholder="Enter full delivery address"
                    value={formData.destinationAddress}
                    onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Pickup Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    className="pl-10 bg-input border-border text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Pickup Time</label>
                <Input
                  type="time"
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Cargo Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Cargo Type</label>
                <Input
                  placeholder="e.g., Electronics, Agricultural Products"
                  value={formData.cargoType}
                  onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Weight (kg)</label>
                <Input
                  type="number"
                  placeholder="Enter weight"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Number of Packages</label>
                <Input
                  type="number"
                  placeholder="Enter package count"
                  value={formData.packages}
                  onChange={(e) => setFormData({ ...formData, packages: e.target.value })}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Cargo Description</label>
              <textarea
                placeholder="Describe your cargo in detail..."
                value={formData.cargoDescription}
                onChange={(e) => setFormData({ ...formData, cargoDescription: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Special Instructions (Optional)</label>
              <textarea
                placeholder="Any special handling requirements..."
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Contact Info */}
            <div className="pt-4 border-t border-border">
              <h4 className="font-medium text-foreground mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Contact Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Full name"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="+234 XXX XXX XXXX"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Select Vehicle Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicleTypes.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => setFormData({ ...formData, vehicleType: vehicle.id })}
                  className={`p-4 rounded-xl text-left transition-all ${
                    formData.vehicleType === vehicle.id
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-secondary/30 border-2 border-transparent hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    {formData.vehicleType === vehicle.id && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="font-semibold text-foreground mb-1">{vehicle.name}</p>
                  <p className="text-sm text-muted-foreground mb-2">Capacity: {vehicle.capacity}</p>
                  <p className="text-lg font-bold text-primary">{vehicle.price}</p>
                </button>
              ))}
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Review Your Booking</h3>
            
            {/* Route Summary */}
            <div className="p-4 rounded-xl bg-secondary/30">
              <h4 className="font-medium text-foreground mb-3">Route</h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-success" />
                  <span className="text-foreground">{formData.originCity || "Origin"}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-destructive" />
                  <span className="text-foreground">{formData.destinationCity || "Destination"}</span>
                </div>
              </div>
              {formData.pickupDate && (
                <p className="text-sm text-muted-foreground mt-2">
                  Pickup: {formData.pickupDate} {formData.pickupTime && `at ${formData.pickupTime}`}
                </p>
              )}
            </div>

            {/* Cargo Summary */}
            <div className="p-4 rounded-xl bg-secondary/30">
              <h4 className="font-medium text-foreground mb-3">Cargo</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="text-foreground">{formData.cargoType || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Weight</p>
                  <p className="text-foreground">{formData.weight ? `${formData.weight} kg` : "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Packages</p>
                  <p className="text-foreground">{formData.packages || "-"}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Summary */}
            {selectedVehicle && (
              <div className="p-4 rounded-xl bg-secondary/30">
                <h4 className="font-medium text-foreground mb-3">Vehicle</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{selectedVehicle.name}</p>
                      <p className="text-sm text-muted-foreground">Capacity: {selectedVehicle.capacity}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-primary">{selectedVehicle.price}</p>
                </div>
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <h4 className="font-medium text-foreground mb-3">Cost Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Base Fare</span>
                  <span className="text-foreground">{selectedVehicle?.price || "₦0"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Insurance</span>
                  <span className="text-foreground">₦25,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Handling Fee</span>
                  <span className="text-foreground">₦15,000</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ₦{selectedVehicle ? (parseInt(selectedVehicle.price.replace(/[₦,]/g, "")) + 40000).toLocaleString() : "40,000"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Header title="New Booking" subtitle="Create a new shipment booking" />
      <div className="p-6 space-y-6">
        {/* Back Button */}
        <Link href="/dashboard/bookings">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bookings
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-4">
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      currentStep === step.id
                        ? "bg-primary/20 text-primary"
                        : currentStep > step.id
                        ? "text-success"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        currentStep === step.id
                          ? "bg-primary text-primary-foreground"
                          : currentStep > step.id
                          ? "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.id ? <Check className="w-4 h-4" /> : index + 1}
                    </div>
                    <span className="font-medium">{step.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3">
            <div className="glass rounded-2xl p-6">
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="border-border text-foreground hover:bg-secondary"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                {currentStep < 4 ? (
                  <Button
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Link href="/dashboard/bookings">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-purple">
                      Confirm Booking
                      <Check className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
