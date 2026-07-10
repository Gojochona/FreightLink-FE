"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Loader,
} from "lucide-react"
import { walletApi } from "@/lib/api"
import { TransactionType } from "@/lib/api/types"
import type { PaginatedTransactionList } from "@/lib/api/types"

const formatCurrency = (value: number) => `₦${value.toLocaleString()}`

const typeFilters: { value: TransactionType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: TransactionType.DEPOSIT, label: "Deposits" },
  { value: TransactionType.ESCROW_HOLD, label: "Escrow Held" },
  { value: TransactionType.ESCROW_RELEASE, label: "Escrow Released" },
  { value: TransactionType.ESCROW_REFUND, label: "Refunds" },
  { value: TransactionType.WITHDRAWAL, label: "Withdrawals" },
  { value: TransactionType.PLATFORM_FEE, label: "Platform Fees" },
]

export default function AllTransactionsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all")
  const [data, setData] = useState<PaginatedTransactionList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    walletApi
      .getTransactionsPaginated({
        page,
        page_size: 20,
        type: typeFilter === "all" ? undefined : typeFilter,
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load transactions."))
      .finally(() => setLoading(false))
  }, [page, typeFilter])

  const handleFilterChange = (value: TransactionType | "all") => {
    setTypeFilter(value)
    setPage(1)
  }

  return (
    <>
      <Header title="All Transactions" subtitle="Your complete wallet transaction history" />
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Wallet
        </Button>

        {/* Type filter pills */}
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                typeFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="glass rounded-2xl p-6">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-center text-destructive py-8">{error}</p>
          ) : !data || data.results.length === 0 ? (
            <div className="text-center py-16">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium">No transactions found</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {data.results.map((txn) => {
                  const isCredit = txn.transaction_type === "deposit" || txn.transaction_type === "escrow_release"
                  const txnDate = new Date(txn.created_at)
                  return (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCredit ? "bg-success/20" : "bg-destructive/20"}`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-5 h-5 text-success" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{txn.description || txn.transaction_type}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                            <span>{txnDate.toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{txnDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            <span>•</span>
                            <span className="font-mono text-xs">{txn.id.substring(0, 8)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${isCredit ? "text-success" : "text-destructive"}`}>
                          {isCredit ? "+" : "-"}
                          {formatCurrency(parseFloat(txn.amount))}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            txn.status === "success"
                              ? "bg-success/20 text-success"
                              : txn.status === "pending"
                                ? "bg-warning/20 text-warning"
                                : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination controls */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {data.totalPages} — {data.count} total
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!data.previous}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="border-border text-foreground"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!data.next}
                    onClick={() => setPage((p) => p + 1)}
                    className="border-border text-foreground"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
