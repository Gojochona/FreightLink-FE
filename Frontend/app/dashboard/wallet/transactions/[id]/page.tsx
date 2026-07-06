"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader, ArrowDownCircle, ArrowUpCircle, ShieldCheck, ShieldOff, Percent } from "lucide-react"
import { walletApi } from "@/lib/api"
import { TransactionType, TransactionStatus } from "@/lib/api/types"
import type { WalletTransaction } from "@/lib/api/types"

const typeConfig: Record<string, { label: string; icon: typeof ArrowDownCircle; color: string }> = {
  [TransactionType.DEPOSIT]: { label: "Wallet Deposit", icon: ArrowDownCircle, color: "text-success" },
  [TransactionType.ESCROW_HOLD]: { label: "Funds Held in Escrow", icon: ShieldCheck, color: "text-warning" },
  [TransactionType.ESCROW_RELEASE]: { label: "Payment Released", icon: ArrowDownCircle, color: "text-success" },
  [TransactionType.ESCROW_REFUND]: { label: "Escrow Refunded", icon: ShieldOff, color: "text-info" },
  [TransactionType.WITHDRAWAL]: { label: "Withdrawal", icon: ArrowUpCircle, color: "text-destructive" },
  [TransactionType.PLATFORM_FEE]: { label: "Platform Fee", icon: Percent, color: "text-muted-foreground" },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  [TransactionStatus.SUCCESS]: { label: "Success", className: "bg-success/20 text-success" },
  [TransactionStatus.PENDING]: { label: "Pending", className: "bg-warning/20 text-warning" },
  [TransactionStatus.FAILED]: { label: "Failed", className: "bg-destructive/20 text-destructive" },
}

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [txn, setTxn] = useState<WalletTransaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    walletApi
      .getTransactionDetail(id)
      .then(setTxn)
      .catch((err: any) => setError(err?.message || "Couldn't load this transaction."))
      .finally(() => setLoading(false))
  }, [id])

  const config = txn ? typeConfig[txn.transaction_type] : null
  const Icon = config?.icon || ArrowDownCircle
  const status = txn ? statusConfig[txn.status] : null

  return (
    <div>
      <Header title="Transaction Details" />
      <div className="p-6 max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {loading && <Loader className="w-8 h-8 animate-spin mx-auto mt-12" />}
        {error && <p className="text-destructive text-center mt-12">{error}</p>}

        {txn && (
          <div className="glass rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl bg-secondary/30 flex items-center justify-center ${config?.color}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{config?.label || txn.transaction_type}</p>
                <p className="text-2xl font-bold text-foreground">₦{Number(txn.amount).toLocaleString()}</p>
              </div>
              {status && (
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${status.className}`}>
                  {status.label}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
              <div>
                <p className="text-muted-foreground">Reference</p>
                <p className="font-mono text-foreground text-xs mt-1">{txn.reference || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium text-foreground mt-1">
                  {new Date(txn.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Balance After</p>
                <p className="font-medium text-foreground mt-1">
                  {txn.balance_after ? `₦${Number(txn.balance_after).toLocaleString()}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-foreground text-xs mt-1">{txn.id}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-secondary/30 text-sm">
              <p className="text-muted-foreground mb-1">Description</p>
              <p className="text-foreground">{txn.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}