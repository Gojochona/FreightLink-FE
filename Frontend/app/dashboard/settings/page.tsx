'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/header';
import { NotificationPreferencesForm } from '@/components/NotificationPreferences';
import { TwoFactorSetup } from '@/components/TwoFactorSetup';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Lock,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { settingsApi, authApi } from '@/lib/api';
import { useFetch, useApi } from '@/hooks/useApi';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<
    'security' | 'notifications'
  >('security');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const { execute: changePassword, loading: passwordLoading } = useApi(
    (old_pass: string, new_pass: string) => authApi.changePassword(old_pass, new_pass)
  );

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("New passwords do not match");
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      await changePassword(
        passwordForm.old_password,
        passwordForm.new_password
      );
      setSuccess("Password changed successfully");
      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      setShowPasswordModal(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    }
  };

  const handleTwoFactorSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleNotificationPreferencesSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <Header title="Settings" subtitle="Manage your account and security" />

      <div className="p-6 space-y-6">
        {/* Success/Error Messages */}
        {success && (
          <div className="rounded-2xl bg-success/10 border border-success/50 p-4 text-success">
            ✓ {success}
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-destructive/10 border border-destructive/50 p-4 text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-4 space-y-2 sticky top-24">
              <button
                onClick={() => {
                  setActiveSection('security');
                  setShowPasswordModal(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${
                  activeSection === 'security'
                    ? 'bg-primary/20 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <Shield className="w-5 h-5" />
                Security
              </button>
              <button
                onClick={() => {
                  setActiveSection('notifications');
                  setShowPasswordModal(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${
                  activeSection === 'notifications'
                    ? 'bg-primary/20 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <Bell className="w-5 h-5" />
                Notifications
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="glass rounded-2xl p-6 space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Security Settings</h2>

                {/* Password Change Card */}
                <div className="border border-border rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Password</p>
                          <p className="text-sm text-muted-foreground">Change your account password</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordModal(!showPasswordModal)}
                      className="border-border text-foreground hover:bg-orange-200"
                    >
                      {showPasswordModal ? 'Cancel' : 'Change'}
                    </Button>
                  </div>

                  {/* Password Change Form */}
                  {showPasswordModal && (
                    <form onSubmit={handleChangePassword} className="pt-4 border-t border-border space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Current Password</label>
                        <div className="relative">
                          <input
                            type={showOldPassword ? "text" : "password"}
                            value={passwordForm.old_password}
                            onChange={(e) =>
                              setPasswordForm({ ...passwordForm, old_password: e.target.value })
                            }
                            placeholder="Enter current password"
                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showOldPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordForm.new_password}
                            onChange={(e) =>
                              setPasswordForm({ ...passwordForm, new_password: e.target.value })
                            }
                            placeholder="Enter new password"
                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordForm.confirm_password}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                          }
                          placeholder="Confirm new password"
                          className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div className="flex gap-3 justify-end pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowPasswordModal(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={passwordLoading}
                        >
                          {passwordLoading ? 'Saving...' : 'Save Password'}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Two-Factor Authentication Card */}
                <div className="border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                    </div>
                  </div>

                  <TwoFactorSetup
                    key={refreshKey}
                    onSuccess={handleTwoFactorSuccess}
                    onCancel={() => {}}
                  />
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Notification Settings
                </h2>
                <NotificationPreferencesForm 
                  key={refreshKey}
                  onSuccess={handleNotificationPreferencesSuccess}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
