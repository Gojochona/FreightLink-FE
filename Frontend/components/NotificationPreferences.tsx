'use client';

import React, { useEffect, useState } from 'react';
import { settingsApi } from '@/lib/api';
import {
  NotificationPreferences,
  NotificationPreferencesResponse,
  ApiErrorClass,
} from '@/lib/api/types';

export const NotificationPreferencesForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [preferences, setPreferences] =
    useState<NotificationPreferencesResponse | null>(null);
  const [formData, setFormData] = useState<NotificationPreferences>({
    email_notifications: true,
    sms_notifications: true,
    push_notifications: true,
    booking_updates: true,
    delivery_updates: true,
    payment_updates: true,
    promotional_emails: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setError(null);
      const data = await settingsApi.getNotificationPreferences();
      setPreferences(data);
      setFormData({
        email_notifications: data.email_notifications,
        sms_notifications: data.sms_notifications,
        push_notifications: data.push_notifications,
        booking_updates: data.booking_updates,
        delivery_updates: data.delivery_updates,
        payment_updates: data.payment_updates,
        promotional_emails: data.promotional_emails,
      });
    } catch (err) {
      const error = err as ApiErrorClass;
      setError(error.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setFormData((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSuccess(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await settingsApi.updateNotificationPreferences(formData);
      setSuccess('Preferences updated successfully');
      onSuccess?.();
      await fetchPreferences();
    } catch (err) {
      const error = err as ApiErrorClass;
      setError(error.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const PreferenceToggle = ({
    label,
    description,
    value,
    onChange,
  }: {
    label: string;
    description: string;
    value: boolean;
    onChange: () => void;
  }) => (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <label className="block font-medium text-gray-900">{label}</label>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`ml-4 flex-shrink-0 w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200 text-green-700">
          ✓ {success}
        </div>
      )}

      {/* Channel Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Notification Channels
        </h3>
        <div className="space-y-3">
          <PreferenceToggle
            label="Email Notifications"
            description="Receive updates via email"
            value={formData.email_notifications}
            onChange={() => handleToggle('email_notifications')}
          />
          <PreferenceToggle
            label="SMS Notifications"
            description="Receive urgent alerts via text message"
            value={formData.sms_notifications}
            onChange={() => handleToggle('sms_notifications')}
          />
          <PreferenceToggle
            label="Push Notifications"
            description="Receive notifications in-app"
            value={formData.push_notifications}
            onChange={() => handleToggle('push_notifications')}
          />
        </div>
      </div>

      {/* Event Categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Event Types
        </h3>
        <div className="space-y-3">
          <PreferenceToggle
            label="Booking Updates"
            description="Notifications about booking requests and changes"
            value={formData.booking_updates}
            onChange={() => handleToggle('booking_updates')}
          />
          <PreferenceToggle
            label="Delivery Updates"
            description="Status updates during delivery"
            value={formData.delivery_updates}
            onChange={() => handleToggle('delivery_updates')}
          />
          <PreferenceToggle
            label="Payment Updates"
            description="Notifications about escrow and refunds"
            value={formData.payment_updates}
            onChange={() => handleToggle('payment_updates')}
          />
          <PreferenceToggle
            label="Promotional Emails"
            description="Receive offers and announcements"
            value={formData.promotional_emails}
            onChange={() => handleToggle('promotional_emails')}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  );
};

export default NotificationPreferencesForm;
