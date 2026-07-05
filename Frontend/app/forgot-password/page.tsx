"use client"

import { useState } from "react"
import Link from "next/link"
import { Truck, ChevronRight, ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
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

        {/* Forgot Password Card */}
        <div className="glass rounded-2xl p-8 glow-purple">
          <Link href="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">Forgot Password?</h1>
                <p className="text-muted-foreground">
                  {"No worries! Enter your email and we'll send you reset instructions."}
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-xl glow-purple transition-all duration-300"
                >
                  Send Reset Link
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h1>
              <p className="text-muted-foreground mb-6">
                {"We've sent password reset instructions to"} <span className="text-foreground">{email}</span>
              </p>
              <Button 
                onClick={() => setSubmitted(false)}
                variant="outline"
                className="border-border text-foreground hover:bg-secondary"
              >
                Try Another Email
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Remember your password?{" "}
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
