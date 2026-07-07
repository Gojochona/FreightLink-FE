"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Filter,
  Package,
  MapPin,
  MoreVertical,
  Eye,
  XCircle,
  AlertTriangle,
  Truck,
  CheckCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { tripsApi } from "@/lib/api"
import { Booking, BookingStatus } from "@/lib/api/types"
import { useFetch } from "@/hooks/useApi"
import { CreateDisputeModal } from "@/components/dashboard/create-dispute-modal"
import { HandoverConfirmModal } from "@/components/dashboard/handover-confirm-modal"
import { useToast } from "@/hooks/useToast"

const getBookingStatusColor = (status: BookingStatus | string) => {
  switch (status) {
    case "confirmed":
      return "bg-success/20 text-success"
    case "pending":
      return "bg-warning/20 text-warning"
    case "in_transit":
      return "bg-info/20 text-info"
    case "delivered":
      return "bg-info/20 text-info"
    case "item_handed_over":
      return "bg-secondary/20 text-secondary"
    case "completed":
      return "bg-primary/20 text-primary"
    case "cancelled":
      return "bg-destructive/20 text-destructive"
    case "disputed":
      return "bg-destructive/20 text-destructive"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const bookingStatusFilters = ["All", "pending", "confirmed", "item_handed_over", "in_transit", "delivered", "completed", "cancelled", "disputed"]

export default function BookingsPage() {
  const router = useRouter()
  const [bookingSearch, setBookingSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")
  const [disputeModalOpen, setDisputeModalOpen] = useState(false)
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState<string | null>(null)
  const [handoverModalBookingId, setHandoverModalBookingId] = useState<string | null>(null)
  const [confirmingDeliveryId, setConfirmingDeliveryId] = useState<string | null>(null)
  const { showSuccess, showError } = useToast()

  // Fetch user's bookings (bookings they placed on OTHER trips)
  const { data: bookingsData, loading: bookingsLoading, refetch: refetchBookings } = useFetch(() => tripsApi.listBookings(), [])

  const handleOpenDisputeModal = (bookingId: string) => {
    setSelectedBookingForDispute(bookingId)
    setDisputeModalOpen(true)
  }

  const handleDisputeCreated = () => {
    setDisputeModalOpen(false)
    setSelectedBookingForDispute(null)
    // Optionally refetch bookings to update UI
    refetchBookings()
  }

  const handleConfirmDelivery = async (bookingId: string) => {
    if (confirmingDeliveryId) return
    setConfirmingDeliveryId(bookingId)
    try {
      await tripsApi.senderConfirmDelivery(bookingId)
      showSuccess("Delivery confirmed — payment released to the carrier.")
      refetchBookings()
    } catch (error) {
      showError(error instanceof Error ? error.message : "Could not confirm delivery. Please try again.")
    } finally {
      setConfirmingDeliveryId(null)
    }
  }


  const bookingsList = Array.isArray(bookingsData) ? bookingsData : []

  // Filter user's bookings
  const filteredBookings = bookingsList.filter((booking: Booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      booking.trip_route.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      booking.receiver_name.toLowerCase().includes(bookingSearch.toLowerCase())
    const matchesFilter = activeFilter === "All" || booking.status === activeFilter
    return matchesSearch && matchesFilter
  })

  return (
    <>
      <Header title="Bookings" subtitle="Manage your bookings" />
      <div className="p-6 space-y-8">
        {/* ========== MY BOOKINGS ========== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">My Bookings</h2>
            <p className="text-sm text-muted-foreground">{filteredBookings.length} bookings</p>
          </div>

          {/* Filters and Search */}
          <div className="glass rounded-2xl p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                {bookingStatusFilters.map((filter) => (
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
                    placeholder="Search bookings..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button variant="outline" size="icon" className="border-border text-muted-foreground hover:text-foreground">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/30">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Booking ID</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Receiver</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Route</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Weight</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Total Price</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-foreground text-sm">{booking.id.substring(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground text-sm">{booking.receiver_name}</p>
                          <p className="text-xs text-muted-foreground">{booking.receiver_phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-success" />
                          <span className="text-foreground">{booking.trip_route}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">{booking.weight_kg} kg</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">₦{booking.total_price}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBookingStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem
                              className="text-foreground focus:bg-accent focus:text-accent-foreground"
                              onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            {booking.status === "pending" && (
                              <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                <XCircle className="w-4 h-4 mr-2" /> Cancel Booking
                              </DropdownMenuItem>
                            )}
                            {booking.status === "confirmed" && !booking.handover?.sender_confirmed && (
                              <DropdownMenuItem
                                className="text-foreground focus:bg-accent focus:text-accent-foreground"
                                onClick={() => setHandoverModalBookingId(booking.id)}
                              >
                                <Truck className="w-4 h-4 mr-2" /> Confirm Handover
                              </DropdownMenuItem>
                            )}
                            {booking.status === "confirmed" && booking.handover?.sender_confirmed && (
                              <DropdownMenuItem disabled className="text-muted-foreground">
                                <Truck className="w-4 h-4 mr-2" /> Awaiting traveler receipt
                              </DropdownMenuItem>
                            )}
                            {booking.status === "delivered" && (
                              <DropdownMenuItem
                                className="text-foreground focus:bg-accent focus:text-accent-foreground"
                                onClick={() => handleConfirmDelivery(booking.id)}
                                disabled={confirmingDeliveryId === booking.id}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {confirmingDeliveryId === booking.id ? "Confirming..." : "Confirm Delivery"}
                              </DropdownMenuItem>
                            )}
                            {(booking.status === "delivered" || booking.status === "in_transit" || booking.status === "completed") && (
                              <DropdownMenuItem
                                className="text-warning focus:bg-warning/10 focus:text-warning"
                                onClick={() => handleOpenDisputeModal(booking.id)}
                              >
                                <AlertTriangle className="w-4 h-4 mr-2" /> Raise Dispute
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredBookings.length === 0 && (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
                <p className="text-muted-foreground">Book a trip from the available trips above</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      {selectedBookingForDispute && (
        <CreateDisputeModal
          isOpen={disputeModalOpen}
          bookingId={selectedBookingForDispute}
          onClose={() => {
            setDisputeModalOpen(false)
            setSelectedBookingForDispute(null)
          }}
          onDisputeCreated={handleDisputeCreated}
        />
      )}

      {handoverModalBookingId && (
        <HandoverConfirmModal
          isOpen={!!handoverModalBookingId}
          bookingId={handoverModalBookingId}
          role="sender"
          onClose={() => setHandoverModalBookingId(null)}
          onConfirmed={() => refetchBookings()}
        />
      )}
    </>
  )
}
