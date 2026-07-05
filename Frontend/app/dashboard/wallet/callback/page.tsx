"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, AlertCircle, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { walletApi } from "@/lib/api"

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"verifying" | "success" | "pending" | "failed">("verifying")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const reference = searchParams.get("reference")
    if (!reference) {
      setStatus("failed")
      setMessage("No payment reference found.")
      return
    }

    walletApi
      .verifyDeposit(reference)
      .then((res: any) => {
        if (res.amount) {
          setStatus("success")
          setMessage(res.detail || "Payment verified successfully.")
        } else {
          setStatus("pending")
          setMessage(res.detail || "Payment is still being confirmed.")
        }
      })
      .catch((err: any) => {
        setStatus("failed")
        setMessage(err?.message || "We couldn't verify this payment.")
      })
  }, [searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-md text-center space-y-4">
        {status === "verifying" && (
          <>
            <Loader className="w-10 h-10 mx-auto animate-spin text-primary" />
            <p className="text-foreground">Verifying your payment...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="w-10 h-10 mx-auto text-success" />
            <p className="text-foreground font-medium">Payment successful!</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        )}
        {status === "pending" && (
          <>
            <Loader className="w-10 h-10 mx-auto animate-spin text-warning" />
            <p className="text-foreground font-medium">Almost there...</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        )}
        {status === "failed" && (
          <>
            <AlertCircle className="w-10 h-10 mx-auto text-destructive" />
            <p className="text-foreground font-medium">Something went wrong</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        )}
        <Button className="w-full mt-4" onClick={() => router.push("/dashboard/wallet")}>
          Back to Wallet
        </Button>
      </div>
    </div>
  )
}

export default function DepositCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}