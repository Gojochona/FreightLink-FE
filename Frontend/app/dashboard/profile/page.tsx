"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { AvatarUploadModal } from "@/components/AvatarUploadModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Camera,
  Edit,
  Save,
  X,
  Lock,
  Bell,
  Eye,
  EyeOff,
  CheckCircle2
} from "lucide-react"
import { authApi } from "@/lib/api"
import { ApiClient } from "@/lib/api/client"
import { useFetch, useApi } from "@/hooks/useApi"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const router = useRouter()
  const { data: profile, loading: profileLoading, refetch } = useFetch(() => authApi.getProfile(), [])
  const { execute: updateProfile, loading: updateLoading } = useApi(authApi.updateProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    company_name: "",
    avatar: "",
  })
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone_number: profile.phone_number || "",
        address: "",
        company_name: "",
        avatar: profile.profile_picture_url || "",
      })
    }
  }, [profile])
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false,
    tripUpdates: true,
    promotions: false,
  })

  const handleAvatarSuccess = (url: string) => {
    setSuccess("Profile picture updated successfully")
    refetch()
    setTimeout(() => setSuccess(""), 3000)
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U"
    const first = firstName?.[0]?.toUpperCase() || ""
    const last = lastName?.[0]?.toUpperCase() || ""
    return `${first}${last}`.slice(0, 2) || "U"
  }

  return (
    <>
      <Header title="Profile" subtitle="Manage your account settings" />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="glass rounded-2xl p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto overflow-hidden">
                {profile?.profile_picture_url ? (
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={profile?.profile_picture_url || undefined} alt={profile?.full_name} />
                    <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
                      {getInitials(profile?.first_name, profile?.last_name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
              </div>
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">{profile?.full_name || "User"}</h3>
            <p className="text-muted-foreground mb-2">User</p>
            <p className="text-sm text-muted-foreground mb-4">{profile?.carrier_profile?.company_name || "-"}</p>

            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-success" />
              <span className="text-sm text-success font-medium">{profile?.kyc_status || "Unverified"}</span>
            </div>

            <div className="p-3 rounded-xl bg-secondary/30 text-sm text-muted-foreground">
              Member since {new Date(profile?.created_at || "").toLocaleDateString()}
            </div>
          </div>

          {/* Personal Information */}
          <div className="lg:col-span-2 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="border-border text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="border-border text-foreground hover:bg-secondary"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Full Name
                </label>
                {isEditing ? (
                  <Input
                    value={`${formData.first_name} ${formData.last_name}`}
                    onChange={(e) => {
                      const [first, last] = e.target.value.split(' ');
                      setFormData({ ...formData, first_name: first || '', last_name: last || '' });
                    }} className="bg-input border-border text-foreground"
                  />
                ) : (
                  <p className="px-3 py-2 rounded-lg bg-secondary/30 text-foreground">{`${formData.first_name} ${formData.last_name}`}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email Address
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-input border-border text-foreground"
                  />
                ) : (
                  <p className="px-3 py-2 rounded-lg bg-secondary/30 text-foreground">{formData.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Phone Number
                </label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="bg-input border-border text-foreground"
                  />
                ) : (
                  <p className="px-3 py-2 rounded-lg bg-secondary/30 text-foreground">{formData.phone_number}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  Company
                </label>
                {isEditing ? (
                  <Input
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="bg-input border-border text-foreground"
                  />
                ) : (
                  <p className="px-3 py-2 rounded-lg bg-secondary/30 text-foreground">{formData.company_name}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Address
                </label>
                {isEditing ? (
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="bg-input border-border text-foreground"
                  />
                ) : (
                  <p className="px-3 py-2 rounded-lg bg-secondary/30 text-foreground">{formData.address}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Security & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Security</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Password</p>
                    <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordModal(true)}
                  className="border-border text-foreground hover:bg-secondary"
                >
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-success">Enabled</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-secondary"
                >
                  Manage
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Active Sessions</p>
                    <p className="text-sm text-muted-foreground">2 devices logged in</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-secondary"
                >
                  View
                </Button>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                  className={`w-12 h-6 rounded-full transition-colors ${notifications.email ? "bg-primary" : "bg-muted"
                    }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications.email ? "translate-x-6" : "translate-x-0.5"
                      }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                  className={`w-12 h-6 rounded-full transition-colors ${notifications.sms ? "bg-primary" : "bg-muted"
                    }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications.sms ? "translate-x-6" : "translate-x-0.5"
                      }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Trip Updates</p>
                    <p className="text-sm text-muted-foreground">Real-time trip notifications</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, tripUpdates: !notifications.tripUpdates })}
                  className={`w-12 h-6 rounded-full transition-colors ${notifications.tripUpdates ? "bg-primary" : "bg-muted"
                    }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications.tripUpdates ? "translate-x-6" : "translate-x-0.5"
                      }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Promotions</p>
                    <p className="text-sm text-muted-foreground">Deals and promotional offers</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, promotions: !notifications.promotions })}
                  className={`w-12 h-6 rounded-full transition-colors ${notifications.promotions ? "bg-primary" : "bg-muted"
                    }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications.promotions ? "translate-x-6" : "translate-x-0.5"
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass rounded-2xl p-6 border border-destructive/20">
          <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
            Delete Account
          </Button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass rounded-2xl p-6 w-full max-w-md glow-purple">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Current Password</label>
                <div className="relative">
                  <Input
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    value={passwordForm.old_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">New Password</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 border-border text-foreground hover:bg-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Update Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={showAvatarModal}
        currentAvatarUrl={profile?.profile_picture_url || undefined}
        onClose={() => setShowAvatarModal(false)}
        onSuccess={handleAvatarSuccess}
      />
    </>
  )
}
