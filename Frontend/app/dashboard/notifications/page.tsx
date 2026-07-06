"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import {
  Bell,
  Truck,
  Wallet,
  Package,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  Check,
  Settings,
  Loader,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { notificationsApi, NotificationListResponse } from "@/lib/api/notifications"
import { useToast } from "@/hooks/useToast"
import { useRouter } from "next/dist/client/components/navigation"
import type { Notification } from "@/lib/api/types"

const getNotificationIcon = (type: string) => {
  const typeMap: { [key: string]: typeof Truck } = {
    booking_received: Package,
    booking_confirmed: CheckCircle2,
    booking_rejected: AlertTriangle,
    booking_cancelled: X,
    item_handed_over: Package,
    item_in_transit: Truck,
    otp_sent: Info,
    delivery_confirmed: CheckCircle2,
    escrow_released: Wallet,
    escrow_refunded: Wallet,
    kyc_approved: CheckCircle2,
    kyc_rejected: AlertTriangle,
    trip_expiring_soon: AlertTriangle,
  }
  return typeMap[type] || Bell
}

const getNotificationColor = (type: string) => {
  if (type.includes('confirmed') || type.includes('approved') || type.includes('released'))
    return "success"
  if (type.includes('rejected') || type.includes('cancelled'))
    return "destructive"
  if (type.includes('expiring') || type.includes('alert'))
    return "warning"
  if (type.includes('otp') || type.includes('pending'))
    return "info"
  return "primary"
}

const getColorClasses = (color: string) => {
  switch (color) {
    case "success":
      return "bg-success/20 text-success"
    case "primary":
      return "bg-primary/20 text-primary"
    case "info":
      return "bg-info/20 text-info"
    case "warning":
      return "bg-warning/20 text-warning"
    case "accent":
      return "bg-accent/20 text-accent"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}

const LIMIT = 20

export default function NotificationsPage() {
  const { showSuccess, showError } = useToast()
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [listData, setListData] = useState<NotificationListResponse | null>(null)
  const router = useRouter()

  // Map filter to API parameter
  const readParam = filter === "all" ? "all" : filter === "read" ? "true" : "false"
  const offset = currentPage * LIMIT

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const response = await notificationsApi.listNotifications({
          limit: LIMIT,
          offset,
          read: readParam,
        })
        setListData(response)
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
        showError("Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [filter, offset, readParam])

  // When filter changes, reset to first page
  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter)
    setCurrentPage(0)
  }



  const handleNotificationClick = (notification: Notification) => {
    notificationsApi.markAsRead(notification.id).catch(() => { })

    switch (notification.related_object_type) {
      case "booking":
        router.push(`/dashboard/bookings/${notification.related_object_id}`)
        break
      case "transaction":
        router.push(`/dashboard/wallet/transactions/${notification.related_object_id}`)
        break
      case "trip":
        router.push(`/dashboard/trips/${notification.related_object_id}`)
        break
      default:
        if (notification.notification_type.startsWith("kyc_")) {
          router.push("/dashboard/kyc")
        }
    }
  }

  const handleMarkAllAsRead = async () => {
    setLoading(true)
    try {
      await notificationsApi.markAllAsRead()
      showSuccess("All notifications marked as read")
      // Refresh current page
      const response = await notificationsApi.listNotifications({
        limit: LIMIT,
        offset,
        read: readParam,
      })
      setListData(response)
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
      showError("Failed to mark notifications as read")
    } finally {
      setLoading(false)
    }
  }

  const notifications = listData?.results || []
  const unreadCount = notifications.filter((n) => !n.is_read).length
  const totalCount = listData?.count || 0
  const totalPages = Math.ceil(totalCount / LIMIT)

  return (
    <>
      <Header title="Notifications" subtitle={`${unreadCount} unread notifications`} />
      <div className="p-6 space-y-6">
        {/* Filter Bar */}
        <div className="glass rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFilterChange("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange("unread")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "unread"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => handleFilterChange("read")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "read"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                Read
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={loading || notifications.length === 0}
                className="border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Loader className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-4">Loading notifications...</p>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="divide-y divide-border">
              {notifications.length > 0 ? (
                notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.notification_type)
                  const colorClass = getNotificationColor(notification.notification_type)

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-secondary/30 transition-all cursor-pointer ${!notification.is_read ? "bg-primary/5" : ""
                        }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getColorClasses(colorClass)
                          }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground">{notification.title}</p>
                                {!notification.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-primary" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatTimeAgo(notification.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No notifications
                  </h3>
                  <p className="text-muted-foreground">
                    {filter === "unread"
                      ? "You have read all your notifications"
                      : "You don't have any notifications yet"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {notifications.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {totalPages} • Showing {notifications.length} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0 || loading}
                  className="border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1 || loading}
                  className="border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
