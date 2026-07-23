"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface RejectionReasonModalProps {
  open: boolean
  bookingId: string
  onConfirm: (bookingId: string, reason: string) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function RejectionReasonModal({
  open,
  bookingId,
  onConfirm,
  onCancel,
  isLoading = false,
}: RejectionReasonModalProps) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for rejection")
      return
    }

    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters")
      return
    }

    try {
      await onConfirm(bookingId, reason.trim())
      setReason("")
      setError("")
    } catch (err) {
      setError("Failed to reject booking. Please try again.")
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason("")
      setError("")
      onCancel()
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Booking</AlertDialogTitle>
          <AlertDialogDescription>
            Please provide a reason for rejecting this booking. The sender will be notified.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rejection-reason" className="text-sm font-medium">
              Reason for Rejection *
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="E.g., Items are too fragile, cannot deliver to this location, etc."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError("")
              }}
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters required
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/50 rounded text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isLoading ? "Rejecting..." : "Reject Booking"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
