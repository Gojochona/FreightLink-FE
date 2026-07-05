import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Loader } from 'lucide-react'
import { disputesApi } from '@/lib/api'
import { DisputeReason, CreateDisputeRequest } from '@/lib/api/types'
import { useToast } from '@/hooks/useToast'

interface CreateDisputeModalProps {
  isOpen: boolean
  bookingId: string
  onClose: () => void
  onDisputeCreated?: () => void
}

const disputeReasons: { value: DisputeReason; label: string; description: string }[] = [
  {
    value: DisputeReason.WRONG_ITEM,
    label: "Wrong Item Delivered",
    description: "The item delivered doesn't match the booking description"
  },
  {
    value: DisputeReason.DAMAGED_ITEM,
    label: "Damaged Item",
    description: "The item arrived damaged or in poor condition"
  },
  {
    value: DisputeReason.MISSING_ITEM,
    label: "Missing Item or Parts",
    description: "Some or all of the item is missing"
  },
  {
    value: DisputeReason.DELIVERY_INCOMPLETE,
    label: "Delivery Incomplete",
    description: "The delivery was not completed as agreed"
  },
  {
    value: DisputeReason.SERVICE_ISSUE,
    label: "Service Issue",
    description: "General service issue or complaint"
  },
  {
    value: DisputeReason.OTHER,
    label: "Other",
    description: "Other dispute reason not listed above"
  },
]

export function CreateDisputeModal({
  isOpen,
  bookingId,
  onClose,
  onDisputeCreated,
}: CreateDisputeModalProps) {
  const { showSuccess, showError } = useToast()
  const [reason, setReason] = useState<DisputeReason | ''>(DisputeReason.SERVICE_ISSUE)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason) {
      showError('Please select a reason for the dispute')
      return
    }

    if (!description.trim()) {
      showError('Please provide a description')
      return
    }

    setLoading(true)
    try {
      const request: CreateDisputeRequest = {
        reason: reason as DisputeReason,
        description: description.trim(),
      }

      await disputesApi.createDispute(bookingId, request)
      showSuccess('Dispute created successfully!')
      
      // Reset form
      setReason(DisputeReason.SERVICE_ISSUE)
      setDescription('')
      
      // Call callback if provided
      if (onDisputeCreated) {
        onDisputeCreated()
      }

      onClose()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create dispute'
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Raise a Dispute</DialogTitle>
          <DialogDescription>
            Explain the issue with this booking. Our support team will review and resolve it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Reason</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {disputeReasons.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-secondary/20 cursor-pointer transition"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={opt.value}
                    checked={reason === opt.value}
                    onChange={() => setReason(opt.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-sm text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Describe the Issue
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide detailed information about the dispute..."
              className="w-full min-h-24 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          {/* Info Box */}
          <div className="flex gap-2 p-3 bg-info/10 border border-info/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
            <p className="text-xs text-info">
              Our support team will investigate and resolve this dispute. You'll be notified of any updates.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !reason || !description.trim()}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Dispute'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
