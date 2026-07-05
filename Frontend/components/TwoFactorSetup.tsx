'use client';

import React, { useState } from 'react';
import { settingsApi } from '@/lib/api';
import { ApiErrorClass } from '@/lib/api/types';

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
        <div className="rounded-lg bg-green-50 p-4 border border-green-200">
          <h3 className="font-semibold text-green-900">
            ✓ Two-Factor Authentication Enabled
          </h3>
          <p className="text-sm text-green-800 mt-2">
            Your account is now more secure. You'll be asked for an OTP code
            when logging in.
          </p>
        </div>
        <button
          onClick={handleSuccess}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Done
        </button>
      </div>
    );
  }

  if (step === 'backup-codes') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
          <h3 className="font-semibold text-amber-900">Save Backup Codes</h3>
          <p className="text-sm text-amber-800 mt-2">
            Save these backup codes in a safe place. You can use them to access
            your account if you lose access to your 2FA device.
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm space-y-1">
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
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-orange-700 transition"
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
          <p className="text-sm text-gray-600 mb-4">
            Enter the 6-digit OTP code sent to<br />
            <strong>{otpDestination}</strong>
          </p>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="000000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono"
            disabled={loading}
          />
        </div>
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
    );
  }

  // method-select step
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">
        Choose Verification Method
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleSelectMethod('sms')}
          disabled={loading}
          className="p-4 border-2 border-gray-300 rounded-lg hover:border-orange-500 transition"
        >
          <div className="text-2xl mb-2">📱</div>
          <div className="font-medium">SMS</div>
          <div className="text-xs text-gray-600">Code via text</div>
        </button>
        <button
          onClick={() => handleSelectMethod('email')}
          disabled={loading}
          className="p-4 border-2 border-gray-300 rounded-lg hover:border-orange-500 transition"
        >
          <div className="text-2xl mb-2">✉️</div>
          <div className="font-medium">Email</div>
          <div className="text-xs text-gray-600">Code via email</div>
        </button>
      </div>
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;
