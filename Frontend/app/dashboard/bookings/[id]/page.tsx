"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { HandoverConfirmModal } from "@/components/dashboard/handover-confirm-modal"
import { DeliveryProofModal } from "@/components/dashboard/delivery-proof-modal"
import { CreateDisputeModal } from "@/components/dashboard/create-dispute-modal"
import { RejectionReasonModal } from "@/components/dashboard/RejectionReasonModal"
import {
  ArrowLeft,
  Loader,
  CheckCircle,
  XCircle,
  Truck,
  AlertTriangle,
} from "lucide-react"
import { tripsApi } from "@/lib/api"
import type { Booking } from "@/lib/api/types"
import { useToast } from "@/hooks/useToast"

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actioning, setActioning] = useState(false)

  const [handoverModalOpen, setHandoverModalOpen] = useState(false)
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false)
  const [disputeModalOpen, setDisputeModalOpen] = useState(false)
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false)

  const fetchBooking = useCallback(() => {
    if (!id) return
    tripsApi
      .getBookingDetail(id)
      .then(setBooking)
      .catch((err) => setError(err?.message || "Couldn't load this booking."))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

  const handleAccept = async () => {
    if (!booking) return
    setActioning(true)
    try {
      await tripsApi.acceptBooking(booking.id)
      showSuccess("Booking accepted!")
      fetchBooking()
    } catch (err) {
      showError(err instanceof Error ? err.message : "Could not accept booking.")
    } finally {
      setActioning(false)
    }
  }

  const handleReject = async (bookingId: string, reason: string) => {
    setActioning(true)
    try {
      await tripsApi.rejectBooking(bookingId, reason)
      showSuccess("Booking rejected.")
      setRejectionModalOpen(false)
      fetchBooking()
    } catch (err) {
      showError(err instanceof Error ? err.message : "Could not reject booking.")
    } finally {
      setActioning(false)
    }
  }

  const handleMarkInTransit = async () => {
    if (!booking) return
    setActioning(true)
    try {
      await tripsApi.markInTransit(booking.id)
      showSuccess("Marked as in transit!")
      fetchBooking()
    } catch (err) {
      showError(err instanceof Error ? err.message : "Could not update status.")
    } finally {
      setActioning(false)
    }
  }

  const handleSenderConfirmDelivery = async () => {
    if (!booking) return
    setActioning(true)
    try {
      await tripsApi.senderConfirmDelivery(booking.id)
      showSuccess("Delivery confirmed — payment released to the carrier.")
      fetchBooking()
    } catch (err) {
      showError(err instanceof Error ? err.message : "Could not confirm delivery.")
    } finally {
      setActioning(false)
    }
  }

  const role = booking?.viewer_role

  return (
    <div>
      <Header title="Booking Details" />
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-3 sm:mb-4 -ml-2 h-8 sm:h-9 text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {loading && <Loader className="w-8 h-8 animate-spin mx-auto mt-12" />}
        {error && <p className="text-destructive text-center mt-12 text-sm">{error}</p>}

        {booking && (
          <div className="glass rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                <AvatarImage src={booking.sender_avatar || undefined} alt={booking.sender_name} />
                <AvatarFallback>{booking.sender_name?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm sm:text-base truncate">{booking.sender_name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{booking.sender_phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div><p className="text-muted-foreground">Weight</p><p className="font-medium">{booking.weight_kg}kg</p></div>
              <div><p className="text-muted-foreground">Total Price</p><p className="font-medium">₦{booking.total_price}</p></div>
              <div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{booking.status.replace(/_/g, " ")}</p></div>
              <div><p className="text-muted-foreground">Receiver</p><p className="font-medium">{booking.receiver_name}</p></div>
            </div>

            <div className="p-3 rounded-xl bg-secondary/30 text-xs sm:text-sm">
              <p className="text-muted-foreground mb-1">Delivery Address</p>
              <p>{booking.receiver_address}</p>
            </div>

            {/* Handover status */}
            {(booking.status === "confirmed" || booking.status === "item_handed_over") && (
              <div className="p-3 rounded-xl bg-secondary/30 text-xs sm:text-sm space-y-1">
                <p className="text-muted-foreground mb-1">Handover Status</p>
                <p>Sender confirmed: <span className="font-medium">{booking.handover.sender_confirmed ? "Yes" : "Not yet"}</span></p>
                <p>Traveler confirmed: <span className="font-medium">{booking.handover.traveler_confirmed ? "Yes" : "Not yet"}</span></p>
              </div>
            )}

            {/* Delivery proof photo */}
            {booking.delivery_photo_url && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs sm:text-sm">Delivery Proof Photo</p>
                <img
                  src={booking.delivery_photo_url}
                  alt="Delivery proof"
                  className="w-full h-40 sm:h-48 object-cover rounded-xl border border-border"
                />
              </div>
            )}

            {/* Contextual actions — mirrors what's available from the list/menu */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-2 border-t border-border">
              {/* Sender-side actions */}
              {role === "sender" && booking.status === "confirmed" && !booking.handover.sender_confirmed && (
                <Button onClick={() => setHandoverModalOpen(true)} disabled={actioning} className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                  <Truck className="w-4 h-4 mr-2" /> Confirm Handover
                </Button>
              )}
              {role === "sender" && booking.status === "delivered" && (
                <Button onClick={handleSenderConfirmDelivery} disabled={actioning} className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                  <CheckCircle className="w-4 h-4 mr-2" /> {actioning ? "Confirming..." : "Confirm Delivery"}
                </Button>
              )}

              {/* Traveler-side actions */}
              {role === "traveler" && booking.status === "pending" && (
                <>
                  <Button onClick={handleAccept} disabled={actioning} className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" /> Accept
                  </Button>
                  <Button onClick={() => setRejectionModalOpen(true)} disabled={actioning} variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 text-sm">
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </>
              )}
              {role === "traveler" && booking.status === "confirmed" && booking.handover.sender_confirmed && !booking.handover.traveler_confirmed && (
                <Button onClick={() => setHandoverModalOpen(true)} disabled={actioning} className="bg-secondary hover:bg-secondary/90 text-foreground text-sm">
                  <Truck className="w-4 h-4 mr-2" /> Confirm Receipt
                </Button>
              )}
              {role === "traveler" && booking.status === "confirmed" && !booking.handover.sender_confirmed && (
                <p className="text-xs sm:text-sm text-muted-foreground italic">Awaiting sender handover</p>
              )}
              {role === "traveler" && booking.status === "item_handed_over" && (
                <Button onClick={handleMarkInTransit} disabled={actioning} className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                  <Truck className="w-4 h-4 mr-2" /> {actioning ? "Updating..." : "Mark In Transit"}
                </Button>
              )}
              {role === "traveler" && booking.status === "in_transit" && (
                <Button onClick={() => setDeliveryModalOpen(true)} disabled={actioning} className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                  <CheckCircle className="w-4 h-4 mr-2" /> Deliver
                </Button>
              )}

              {/* Either side can raise a dispute once something's actually happened */}
              {(booking.status === "delivered" || booking.status === "in_transit" || booking.status === "completed") && (
                <Button onClick={() => setDisputeModalOpen(true)} disabled={actioning} variant="outline" className="border-warning/40 text-warning hover:bg-warning/10 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-2" /> Raise Dispute
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {booking && (
        <>
          <HandoverConfirmModal
            isOpen={handoverModalOpen}
            bookingId={booking.id}
            role={role === "traveler" ? "traveler" : "sender"}
            onClose={() => setHandoverModalOpen(false)}
            onConfirmed={() => fetchBooking()}
          />
          <DeliveryProofModal
            isOpen={deliveryModalOpen}
            bookingId={booking.id}
            onClose={() => setDeliveryModalOpen(false)}
            onConfirmed={() => fetchBooking()}
          />
          <CreateDisputeModal
            isOpen={disputeModalOpen}
            bookingId={booking.id}
            onClose={() => setDisputeModalOpen(false)}
            onDisputeCreated={() => {
              setDisputeModalOpen(false)
              fetchBooking()
            }}
          />
          <RejectionReasonModal
            open={rejectionModalOpen}
            bookingId={booking.id}
            onConfirm={handleReject}
            onCancel={() => setRejectionModalOpen(false)}
            isLoading={actioning}
          />
        </>
      )}
    </div>
  )
}
