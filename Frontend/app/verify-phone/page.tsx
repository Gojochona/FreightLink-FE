"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Truck, ChevronRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authApi } from "@/lib/api"
import { ApiClient } from "@/lib/api/client"

function VerifyPhoneForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const phone = searchParams.get("phone") || ""

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleResend = async (channel: "phone" | "email" = "phone") => {
    if (!email) return
    setResending(true)
    setError("")
    setInfo("")
    try {
      await authApi.resendVerificationOTP({ email, channel })
      setTimeLeft(60)
      setCanResend(false)
      setOtp(["", "", "", "", "", ""])
      setInfo(
        channel === "email"
          ? "A new code has been sent to your email."
          : "A new code has been sent to your phone."
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't resend the code. Try again shortly.")
    } finally {
      setResending(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const code = otp.join("")
    if (code.length !== 6) {
      setError("Enter the full 6-digit code.")
      return
    }
    if (!email) {
      setError("Missing account email — please register again.")
      return
    }

    setVerifying(true)
    try {
      const response = await authApi.verifyRegistration({ email, otp: code })
      ApiClient.setTokens(response.tokens.access, response.tokens.refresh)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.")
    } finally {
      setVerifying(false)
    }
  }

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

        {/* Verify Card */}
        <div className="glass rounded-2xl p-8 glow-purple">
          <Link href="/register" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Verify Your Account</h1>
            <p className="text-muted-foreground">
              {"We've sent a 6-digit code to"} <span className="text-foreground">{phone || "your phone"}</span>
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {info && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 mb-4">
              <p className="text-sm text-green-700">{info}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleVerify}>
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-input border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              ))}
            </div>

            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={() => handleResend("phone")}
                  disabled={resending}
                  className="text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
                >
                  {resending ? "Resending..." : "Resend Code"}
                </button>
              ) : (
                <p className="text-muted-foreground">
                  Resend code in <span className="text-foreground font-medium">{timeLeft}s</span>
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={verifying}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-xl glow-purple transition-all duration-300 disabled:opacity-50"
            >
              {verifying ? "Verifying..." : "Verify & Continue"}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              {"Didn't receive the code? "}
              <button
                type="button"
                onClick={() => handleResend("email")}
                disabled={resending || !email}
                className="text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
              >
                Send to email instead
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={null}>
      <VerifyPhoneForm />
    </Suspense>
  )
}
