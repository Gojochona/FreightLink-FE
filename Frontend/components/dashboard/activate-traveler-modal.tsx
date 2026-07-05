/**
 * Activate Traveler Modal
 * Modal to prompt users to activate traveler mode (carrier capabilities)
 * before accessing trip creation and carrier features
 */

'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, Zap, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

interface ActivateTravelerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivated?: () => void;
}

export function ActivateTravelerModal({
  isOpen,
  onClose,
  onActivated,
}: ActivateTravelerModalProps) {
  const { activateTraveler } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'intro' | 'kyc' | 'success'>('intro');

  const handleActivate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await activateTraveler();
      
      if (response.kyc_required) {
        setStep('kyc');
      } else {
        setStep('success');
        setTimeout(() => {
          onActivated?.();
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate traveler mode');
    } finally {
      setLoading(false);
    }
  };

  const handleKYCRedirect = () => {
    // User should navigate to KYC verification page
    window.location.href = '/dashboard/kyc';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {step === 'intro' && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20 mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-center">Activate Traveler Mode</DialogTitle>
              <DialogDescription className="text-center">
                Unlock the ability to create trips and earn as a carrier
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">How it works</p>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li>✓ Create and manage trips</li>
                      <li>✓ Accept bookings from senders</li>
                      <li>✓ Earn commission on deliveries</li>
                      <li>✓ Build your carrier reputation</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm mb-1">
                      KYC Verification Required
                    </p>
                    <p className="text-xs text-muted-foreground">
                      After activation, you'll need to complete identity verification to access all traveler features.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleActivate}
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {loading ? 'Activating...' : 'Activate Now'}
              </Button>
            </div>
          </>
        )}

        {step === 'kyc' && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-info/20 mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-info" />
              </div>
              <DialogTitle className="text-center">Complete KYC Verification</DialogTitle>
              <DialogDescription className="text-center">
                Identity verification is required to start earning
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">Valid Government ID</p>
                    <p className="text-xs text-muted-foreground">
                      Passport, National ID, or Driver's License
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">Clear Photo</p>
                    <p className="text-xs text-muted-foreground">
                      Front and back of your ID document
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">Selfie Verification</p>
                    <p className="text-xs text-muted-foreground">
                      Recent photo of yourself (matching ID)
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                ⏱️ Verification typically takes 5-15 minutes during business hours
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('intro')}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleKYCRedirect}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Start Verification
              </Button>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-success/20 mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <DialogTitle className="text-center">Traveler Mode Activated!</DialogTitle>
              <DialogDescription className="text-center">
                You can now create trips. Complete KYC to start earning.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-success/10 border border-success/20 rounded-lg p-4 space-y-2">
                <p className="font-medium text-sm text-foreground">You're ready to:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ Create and manage trips</li>
                  <li>✓ Receive bookings from senders</li>
                  <li>→ Complete KYC to earn</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={() => {
                onActivated?.();
                onClose();
              }}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Start Creating Trips
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
