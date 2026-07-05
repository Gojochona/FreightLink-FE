"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Truck, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { authApi } from "@/lib/api"
import { ApiClient } from "@/lib/api/client"
import { useApi } from "@/hooks/useApi"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    accountType: "sender" as "sender" | "traveler",
  })

  const { execute: register, loading } = useApi(authApi.register)

  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "Contains number", met: /[0-9]/.test(formData.password) },
    { label: "Contains special character", met: /[!@#$%^&*]/.test(formData.password) }
  ]

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-glow-purple/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-glow-blue/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-glow-orange/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-purple">
            <Truck className="w-7 h-7 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground">FreightLink</span>
        </div>

        {/* Register Card */}
        <div className="glass rounded-2xl p-8 glow-purple">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join FreightLink and streamline your logistics</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault()
            setError("")

            // Validation
            if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
              setError("All fields are required")
              return
            }

            if (formData.password !== formData.confirmPassword) {
              setError("Passwords don't match")
              return
            }

            if (!formData.agreeTerms) {
              setError("You must agree to the terms and conditions")
              return
            }

            try {
              const registerData = {
                email: formData.email,
                password: formData.password,
                password_confirm: formData.confirmPassword,
                first_name: formData.fullName.split(" ")[0],
                last_name: formData.fullName.split(" ").slice(1).join(" ") || "",
                phone_number: "+234" + formData.phone,
                account_type: formData.accountType,
              }

              const response = await register(registerData as any)

              // Registration no longer logs the user in directly — the
              // account stays unverified until the OTP sent to their
              // phone is confirmed. Hand off to the verify page with
              // enough context to display and to call the verify API.
              if (response.user) {
                router.push(
                  `/verify-phone?email=${encodeURIComponent(response.user.email)}&phone=${encodeURIComponent(response.user.phone_number)}`
                )
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
            }
          }}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">I'm signing up as a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, accountType: "sender" })}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    formData.accountType === "sender"
                      ? "border-primary bg-primary/10 glow-purple"
                      : "border-border bg-input hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium text-foreground">Sender</p>
                  <p className="text-xs text-muted-foreground mt-0.5">I want to book space and ship items</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, accountType: "traveler" })}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    formData.accountType === "traveler"
                      ? "border-primary bg-primary/10 glow-purple"
                      : "border-border bg-input hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium text-foreground">Traveler</p>
                  <p className="text-xs text-muted-foreground mt-0.5">I want to carry items and post trips</p>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                You can also send items as a traveler — you're not locked in, and can add the other role later from your profile.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-input border border-border text-muted-foreground text-sm">
                  <span>🇳🇬</span>
                  <span>+234</span>
                </div>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-success' : 'bg-muted'}`}>
                        {req.met && <Check className="w-3 h-3 text-success-foreground" />}
                      </div>
                      <span className={req.met ? 'text-success' : 'text-muted-foreground'}>{req.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Checkbox
                id="terms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                I agree to the{" "}
                <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
                {" and "}
                <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-xl glow-purple transition-all duration-300 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
