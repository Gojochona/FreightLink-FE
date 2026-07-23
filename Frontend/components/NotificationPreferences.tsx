'use client';

import React, { useEffect, useState } from 'react';
import { settingsApi } from '@/lib/api';
import {
  NotificationPreferences,
  NotificationPreferencesResponse,
  ApiErrorClass,
} from '@/lib/api/types';

const defaultFormData: NotificationPreferences = {
  email_notifications: true,
  sms_notifications: true,
  push_notifications: true,
  booking_updates: true,
  delivery_updates: true,
  payment_updates: true,
  promotional_emails: false,
};

const toFormData = (data: NotificationPreferencesResponse): NotificationPreferences => ({
  email_notifications: data.email_notifications,
  sms_notifications: data.sms_notifications,
  push_notifications: data.push_notifications,
  booking_updates: data.booking_updates,
  delivery_updates: data.delivery_updates,
  payment_updates: data.payment_updates,
  promotional_emails: data.promotional_emails,
});

export const NotificationPreferencesForm: React.FC<{
  onSuccess?: () => void;
  /**
   * Preferences fetched by the parent page ahead of time (in parallel
   * with the rest of the page's data), so this component never needs
   * its own loading state or skeleton — it just renders once the
   * parent's prefetch has resolved.
   */
  initialData?: NotificationPreferencesResponse | null;
}> = ({ onSuccess, initialData }) => {
  const [formData, setFormData] = useState<NotificationPreferences>(
    initialData ? toFormData(initialData) : defaultFormData
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If the parent's prefetch resolves after this component has already
  // mounted (e.g. the tab was clicked before the network response
  // landed), sync it in — still no skeleton, just an update in place.
  useEffect(() => {
    if (initialData) {
      setFormData(toFormData(initialData));
    }
  }, [initialData]);

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
    } catch (err) {
      const error = err as ApiErrorClass;
      setError(error.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

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
    <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border border-border rounded-xl hover:bg-secondary/30 transition-colors">
      <div className="flex-1 min-w-0">
        <label className="block font-medium text-foreground text-sm sm:text-base">{label}</label>
        <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`shrink-0 w-11 h-6 rounded-full transition-colors relative ${
          value ? 'bg-primary' : 'bg-secondary'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSave} className="space-y-5 sm:space-y-6">
      {/* Alerts */}
      {error && (
        <div className="rounded-xl bg-destructive/10 p-3 sm:p-4 border border-destructive/50 text-destructive text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-success/10 p-3 sm:p-4 border border-success/50 text-success text-sm">
          ✓ {success}
        </div>
      )}

      {/* Channel Preferences */}
      <div>
        <h4 className="text-sm sm:text-base font-semibold text-foreground mb-3 sm:mb-4">
          Notification Channels
        </h4>
        <div className="space-y-2.5 sm:space-y-3">
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
        <h4 className="text-sm sm:text-base font-semibold text-foreground mb-3 sm:mb-4">
          Event Types
        </h4>
        <div className="space-y-2.5 sm:space-y-3">
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
      <div className="flex justify-end pt-4 border-t border-border">
        <button
          type="submit"
          disabled={saving}
          className="px-5 sm:px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition font-medium text-sm"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  );
};

export default NotificationPreferencesForm;
