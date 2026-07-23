"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { AvatarUploadModal } from "@/components/AvatarUploadModal"
import { NotificationPreferencesForm } from "@/components/NotificationPreferences"
import { TwoFactorSetup } from "@/components/TwoFactorSetup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Camera,
  Edit,
  Save,
  X,
  Lock,
  Bell,
  Eye,
  EyeOff,
  AlertTriangle,
  Trash2,
} from "lucide-react"
import { authApi, profileApi, settingsApi } from "@/lib/api"
import { useFetch, useApi } from "@/hooks/useApi"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Section = "personal" | "notifications" | "security" | "danger"

export default function ProfilePage() {
  const router = useRouter()
  const { data: profile, loading: profileLoading, refetch } = useFetch(() => authApi.getProfile(), [])
  const { execute: updateProfile, loading: updateLoading } = useApi(authApi.updateProfile)

  // Prefetched alongside the profile so the Notifications tab never shows
  // a loading skeleton — by the time someone clicks it, this has already
  // resolved in parallel with the rest of the page's initial load.
  const { data: notificationPrefs, refetch: refetchNotificationPrefs } = useFetch(
    () => settingsApi.getNotificationPreferences(),
    []
  )

  const [activeSection, setActiveSection] = useState<Section>("personal")
  const [isEditing, setIsEditing] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone_number: profile.phone_number || "",
      })
    }
  }, [profile])

  // ── Business info (travelers only) ──────────────────────────────────
  const isTraveler = !!profile?.is_traveler
  const { data: businessInfo, loading: businessLoading, refetch: refetchBusiness } = useFetch(
    () => (isTraveler ? profileApi.getBusinessInfo() : Promise.resolve(null)),
    [isTraveler]
  )
  const [businessForm, setBusinessForm] = useState({
    company_name: "",
    registration_number: "",
    tax_id: "",
    business_address: "",
  })
  const [isEditingBusiness, setIsEditingBusiness] = useState(false)
  const [businessSaving, setBusinessSaving] = useState(false)

  useEffect(() => {
    if (businessInfo) {
      setBusinessForm({
        company_name: businessInfo.company_name || "",
        registration_number: businessInfo.registration_number || "",
        tax_id: businessInfo.tax_id || "",
        business_address: businessInfo.business_address || "",
      })
    }
  }, [businessInfo])

  // ── Security: password change ────────────────────────────────────────
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  })
  const { execute: changePassword, loading: passwordLoading } = useApi(
    (old_pass: string, new_pass: string) => authApi.changePassword(old_pass, new_pass)
  )

  // ── Danger zone: delete account ──────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U"
    const first = firstName?.[0]?.toUpperCase() || ""
    const last = lastName?.[0]?.toUpperCase() || ""
    return `${first}${last}`.slice(0, 2) || "U"
  }

  const handleAvatarSuccess = () => {
    setSuccess("Profile picture updated successfully")
    refetch()
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleSaveProfile = async () => {
    setError("")
    setSuccess("")
    try {
      await updateProfile(formData)
      setSuccess("Profile updated successfully")
      setIsEditing(false)
      refetch()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    }
  }

  const handleSaveBusinessInfo = async () => {
    setBusinessSaving(true)
    setError("")
    try {
      await profileApi.updateBusinessInfo(businessForm)
      setSuccess("Business information updated successfully")
      setIsEditingBusiness(false)
      refetchBusiness()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update business information")
    } finally {
      setBusinessSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("New passwords do not match")
      return
    }
    if (passwordForm.new_password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    try {
      await changePassword(passwordForm.old_password, passwordForm.new_password)
      setSuccess("Password changed successfully")
      setPasswordForm({ old_password: "", new_password: "", confirm_password: "" })
      setShowPasswordForm(false)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password")
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm.")
      return
    }
    setDeleteLoading(true)
    setDeleteError("")
    try {
      await authApi.deleteAccount(deletePassword)
      router.push("/login")
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete account.")
    } finally {
      setDeleteLoading(false)
    }
  }

  const sections: { id: Section; label: string; icon: typeof User }[] = [
    { id: "personal", label: "Personal Information", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "danger", label: "Delete Account", icon: Trash2 },
  ]

  return (
    <>
      <Header title="Profile" subtitle="Manage your account settings" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {success && (
          <div className="rounded-2xl bg-success/10 border border-success/50 p-3 sm:p-4 text-success text-sm">
            ✓ {success}
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-destructive/10 border border-destructive/50 p-3 sm:p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Avatar header — always visible regardless of section */}
        <div className="glass rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
              <AvatarImage src={profile?.profile_picture_url || undefined} alt={profile?.full_name} />
              <AvatarFallback className="bg-primary/20 text-primary text-lg sm:text-xl font-bold">
                {getInitials(profile?.first_name, profile?.last_name)}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setShowAvatarModal(true)}
              className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">{profile?.full_name || "..."}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{profile?.email}</p>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-6">
          {/* Section Navigation — sidebar on desktop, horizontal tabs on mobile */}
          <div className="lg:col-span-1">
            {/* Mobile: horizontal scrollable tabs */}
            <div className="lg:hidden -mx-4 px-4 mb-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 glass rounded-xl p-1.5">
                {sections.map((s) => {
                  const Icon = s.icon
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition shrink-0 ${
                        activeSection === s.id
                          ? s.id === "danger"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-primary/20 text-primary"
                          : "text-muted-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Desktop: vertical sidebar nav */}
            <div className="hidden lg:block glass rounded-2xl p-4 space-y-2 sticky top-24">
              {sections.map((s) => {
                const Icon = s.icon
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${
                      activeSection === s.id
                        ? s.id === "danger"
                          ? "bg-destructive/20 text-destructive font-medium"
                          : "bg-primary/20 text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6 mt-0">
            {/* Personal Information */}
            {activeSection === "personal" && (
              <>
                <div className="glass rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">Personal Information</h3>
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="border-border text-foreground">
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setError("") }} className="border-border text-foreground">
                          <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveProfile} disabled={updateLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Save className="w-4 h-4 mr-2" /> {updateLoading ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <User className="w-4 h-4" /> First Name
                      </label>
                      <Input
                        value={formData.first_name}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="bg-input border-border text-foreground disabled:opacity-70"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <User className="w-4 h-4" /> Last Name
                      </label>
                      <Input
                        value={formData.last_name}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="bg-input border-border text-foreground disabled:opacity-70"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                      </label>
                      <Input value={profile?.email || ""} disabled className="bg-input border-border text-foreground opacity-70" />
                      <p className="text-xs text-muted-foreground">Email can't be changed here — contact support if needed.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Phone Number
                      </label>
                      <Input
                        value={formData.phone_number}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="bg-input border-border text-foreground disabled:opacity-70"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Info — travelers only */}
                {isTraveler && (
                  <div className="glass rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                        <Building2 className="w-5 h-5" /> Business Information
                      </h3>
                      {!isEditingBusiness ? (
                        <Button variant="outline" size="sm" onClick={() => setIsEditingBusiness(true)} className="border-border text-foreground">
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setIsEditingBusiness(false)} className="border-border text-foreground">
                            <X className="w-4 h-4 mr-2" /> Cancel
                          </Button>
                          <Button size="sm" onClick={handleSaveBusinessInfo} disabled={businessSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Save className="w-4 h-4 mr-2" /> {businessSaving ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      )}
                    </div>

                    {businessLoading ? (
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Company Name</label>
                          <Input
                            value={businessForm.company_name}
                            disabled={!isEditingBusiness}
                            onChange={(e) => setBusinessForm({ ...businessForm, company_name: e.target.value })}
                            className="bg-input border-border text-foreground disabled:opacity-70"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Registration Number</label>
                          <Input
                            value={businessForm.registration_number}
                            disabled={!isEditingBusiness}
                            onChange={(e) => setBusinessForm({ ...businessForm, registration_number: e.target.value })}
                            className="bg-input border-border text-foreground disabled:opacity-70"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Tax ID</label>
                          <Input
                            value={businessForm.tax_id}
                            disabled={!isEditingBusiness}
                            onChange={(e) => setBusinessForm({ ...businessForm, tax_id: e.target.value })}
                            className="bg-input border-border text-foreground disabled:opacity-70"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Business Address</label>
                          <Input
                            value={businessForm.business_address}
                            disabled={!isEditingBusiness}
                            onChange={(e) => setBusinessForm({ ...businessForm, business_address: e.target.value })}
                            className="bg-input border-border text-foreground disabled:opacity-70"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Notifications */}
            {activeSection === "notifications" && (
              <div className="glass rounded-2xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6">Notification Preferences</h3>
                <NotificationPreferencesForm
                  key={refreshKey}
                  initialData={notificationPrefs}
                  onSuccess={() => {
                    setRefreshKey((k) => k + 1)
                    refetchNotificationPrefs()
                  }}
                />
              </div>
            )}

            {/* Security */}
            {activeSection === "security" && (
              <div className="glass rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Security Settings</h3>

                {/* Password */}
                <div className="border border-border rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Password</p>
                        <p className="text-sm text-muted-foreground">Change your account password</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(!showPasswordForm)} className="border-border text-foreground">
                      {showPasswordForm ? "Cancel" : "Change"}
                    </Button>
                  </div>

                  {showPasswordForm && (
                    <form onSubmit={handleChangePassword} className="pt-4 border-t border-border space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Current Password</label>
                        <div className="relative">
                          <input
                            type={showOldPassword ? "text" : "password"}
                            value={passwordForm.old_password}
                            onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                            placeholder="Enter current password"
                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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
                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                            placeholder="Enter new password"
                            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordForm.confirm_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                          placeholder="Confirm new password"
                          className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="flex gap-3 justify-end pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowPasswordForm(false)}>Cancel</Button>
                        <Button type="submit" disabled={passwordLoading}>{passwordLoading ? "Saving..." : "Save Password"}</Button>
                      </div>
                    </form>
                  )}
                </div>

                {/* 2FA */}
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
                  <TwoFactorSetup key={refreshKey} onSuccess={() => setRefreshKey((k) => k + 1)} onCancel={() => {}} />
                </div>
              </div>
            )}

            {/* Delete Account */}
            {activeSection === "danger" && (
              <div className="glass rounded-2xl p-4 sm:p-6 space-y-4 border border-destructive/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">This deactivates your account and removes your personal data.</p>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground bg-secondary/30 rounded-xl p-4 space-y-1">
                  <p>Before you can delete your account:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Your wallet balance must be ₦0 (withdraw first)</li>
                    <li>You can't have any active bookings or trips in progress</li>
                  </ul>
                </div>

                {!showDeleteConfirm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete My Account
                  </Button>
                ) : (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <label className="text-sm font-medium text-foreground">Enter your password to confirm</label>
                    <Input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Password"
                      className="bg-input border-border text-foreground"
                    />
                    {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteError("") }}
                        disabled={deleteLoading}
                        className="border-border text-foreground"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        {deleteLoading ? "Deleting..." : "Confirm Deletion"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AvatarUploadModal
        isOpen={showAvatarModal}
        currentAvatarUrl={profile?.profile_picture_url || undefined}
        onClose={() => setShowAvatarModal(false)}
        onSuccess={handleAvatarSuccess}
      />
    </>
  )
}
