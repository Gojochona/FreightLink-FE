import React, { useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Camera, Loader, X } from 'lucide-react'
import { tripsApi } from '@/lib/api'
import { useToast } from '@/hooks/useToast'

interface HandoverConfirmModalProps {
  isOpen: boolean
  bookingId: string
  /** Which side is confirming — changes the copy shown. */
  role: 'sender' | 'traveler'
  onClose: () => void
  onConfirmed?: (handoverComplete: boolean) => void
}

export function HandoverConfirmModal({
  isOpen,
  bookingId,
  role,
  onClose,
  onConfirmed,
}: HandoverConfirmModalProps) {
  const { showSuccess, showError } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const copy = role === 'sender'
    ? {
        title: 'Confirm you handed over the item',
        description: 'Take a photo of the item at the moment you hand it to the traveler. This is your proof the handover happened.',
        cta: 'Confirm Handover',
      }
    : {
        title: 'Confirm you received the item',
        description: 'Take a photo of the item now that you have it. This is your proof of receipt from the sender.',
        cta: 'Confirm Receipt',
      }

  const reset = () => {
    setPhoto(null)
    setPreviewUrl(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!photo) {
      showError('A photo is required to confirm.')
      return
    }

    setLoading(true)
    try {
      const result = await tripsApi.confirmHandover(bookingId, photo)
      showSuccess(
        result.handover_complete
          ? 'Handover confirmed on both sides!'
          : role === 'sender'
            ? 'Handover confirmed. Waiting on the traveler to acknowledge receipt.'
            : 'Receipt confirmed.'
      )
      onConfirmed?.(result.handover_complete)
      reset()
      onClose()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not confirm handover. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { reset(); onClose() } }}>
      <DialogContent className="bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Handover proof preview"
                className="w-full h-56 object-cover rounded-xl border border-border"
              />
              <button
                type="button"
                onClick={reset}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-foreground hover:bg-background"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            >
              <Camera className="w-8 h-8" />
              <span className="text-sm">Tap to take or upload a photo</span>
            </button>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); onClose() }} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !photo}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
            {loading ? 'Confirming...' : copy.cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
