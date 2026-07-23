'use client';

import React, { useState } from 'react';
import { settingsApi } from '@/lib/api';
import { ApiErrorClass } from '@/lib/api/types';
import { Smartphone, Mail } from 'lucide-react';

interface TwoFactorSetupProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState<
    'method-select' | 'otp-verify' | 'backup-codes' | 'success'
  >('method-select');
  const [method, setMethod] = useState<'sms' | 'email' | null>(null);
  const [otp, setOtp] = useState('');
  const [otpDestination, setOtpDestination] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectMethod = async (selectedMethod: 'sms' | 'email') => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingsApi.enableTwoFactor({
        method: selectedMethod,
      });
      setMethod(selectedMethod);
      setOtpDestination(response.otp_destination);
      setStep('otp-verify');
    } catch (err) {
      const error = err as ApiErrorClass;
      setError(error.message || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!otp || otp.length !== 6) {
      setError('OTP must be 6 digits');
      setLoading(false);
      return;
    }

    try {
      const response = await settingsApi.verifyTwoFactor({
        otp,
      });
      setBackupCodes(response.backup_codes);
      setStep('backup-codes');
    } catch (err) {
      const error = err as ApiErrorClass;
      setError(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBackupCodes = () => {
    // User would typically save these in a password manager
    // For now, just move to success
    setStep('success');
  };

  const handleSuccess = () => {
    setStep('method-select');
    setMethod(null);
    setOtp('');
    setOtpDestination('');
    setBackupCodes([]);
    onSuccess?.();
  };

  if (step === 'success') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-success/10 p-3 sm:p-4 border border-success/50">
          <h3 className="font-semibold text-success text-sm sm:text-base">
            ✓ Two-Factor Authentication Enabled
          </h3>
          <p className="text-xs sm:text-sm text-success/90 mt-2">
            Your account is now more secure. You'll be asked for an OTP code
            when logging in.
          </p>
        </div>
        <button
          onClick={handleSuccess}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
        >
          Done
        </button>
      </div>
    );
  }

  if (step === 'backup-codes') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-warning/10 p-3 sm:p-4 border border-warning/50">
          <h3 className="font-semibold text-warning text-sm sm:text-base">Save Backup Codes</h3>
          <p className="text-xs sm:text-sm text-warning/90 mt-2">
            Save these backup codes in a safe place. You can use them to access
            your account if you lose access to your 2FA device.
          </p>
        </div>
        <div className="bg-secondary/40 border border-border p-3 sm:p-4 rounded-xl font-mono text-xs sm:text-sm space-y-1 text-foreground">
          {backupCodes.map((code, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{code}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            // Copy codes to clipboard
            navigator.clipboard.writeText(backupCodes.join('\n'));
            handleSaveBackupCodes();
          }}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
        >
          Copy & Continue
        </button>
      </div>
    );
  }

  if (step === 'otp-verify') {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Enter the 6-digit OTP code sent to<br />
            <strong className="text-foreground">{otpDestination}</strong>
          </p>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="000000"
            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-center text-xl sm:text-2xl tracking-widest font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </div>
        {error && (
          <div className="text-destructive text-sm bg-destructive/10 border border-destructive/50 p-2 rounded-lg">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition text-sm font-medium"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
    );
  }

  // method-select step
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground text-sm sm:text-base">
        Choose Verification Method
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          onClick={() => handleSelectMethod('sms')}
          disabled={loading}
          className="p-3 sm:p-4 border border-border rounded-xl hover:border-primary hover:bg-secondary/30 transition disabled:opacity-50 text-center"
        >
          <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-primary" />
          <div className="font-medium text-foreground text-sm">SMS</div>
          <div className="text-xs text-muted-foreground">Code via text</div>
        </button>
        <button
          onClick={() => handleSelectMethod('email')}
          disabled={loading}
          className="p-3 sm:p-4 border border-border rounded-xl hover:border-primary hover:bg-secondary/30 transition disabled:opacity-50 text-center"
        >
          <Mail className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-primary" />
          <div className="font-medium text-foreground text-sm">Email</div>
          <div className="text-xs text-muted-foreground">Code via email</div>
        </button>
      </div>
      {error && (
        <div className="text-destructive text-sm bg-destructive/10 border border-destructive/50 p-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;
