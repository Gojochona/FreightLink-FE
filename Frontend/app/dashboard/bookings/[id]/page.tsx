"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Loader, Package, MapPin, Calendar } from "lucide-react"
import { tripsApi } from "@/lib/api"
import type { Booking } from "@/lib/api/types"

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    tripsApi
      .getBookingDetail(id)
      .then(setBooking)
      .catch((err) => setError(err?.message || "Couldn't load this booking."))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div>
      <Header title="Booking Details" />
      <div className="p-6 max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {loading && <Loader className="w-8 h-8 animate-spin mx-auto mt-12" />}
        {error && <p className="text-destructive text-center mt-12">{error}</p>}

        {booking && (
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={booking.sender_avatar || undefined} alt={booking.sender_name} />
                <AvatarFallback>{booking.sender_name?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{booking.sender_name}</p>
                <p className="text-sm text-muted-foreground">{booking.sender_phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground">Weight</p><p className="font-medium">{booking.weight_kg}kg</p></div>
              <div><p className="text-muted-foreground">Total Price</p><p className="font-medium">₦{booking.total_price}</p></div>
              <div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{booking.status}</p></div>
              <div><p className="text-muted-foreground">Receiver</p><p className="font-medium">{booking.receiver_name}</p></div>
            </div>

            <div className="p-3 rounded-xl bg-secondary/30 text-sm">
              <p className="text-muted-foreground mb-1">Delivery Address</p>
              <p>{booking.receiver_address}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}