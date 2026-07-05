"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Building2,
  Copy,
  Eye,
  EyeOff,
  Search,
  Filter,
  ChevronRight,
  X,
  CheckCircle,
  AlertCircle,
  Loader
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { walletApi } from "@/lib/api"
import { useFetch, useApi } from "@/hooks/useApi"

const chartData = [
  { date: "Apr 1", balance: 1800000 },
  { date: "Apr 5", balance: 2200000 },
  { date: "Apr 8", balance: 1950000 },
  { date: "Apr 10", balance: 2400000 },
  { date: "Apr 12", balance: 2100000 },
  { date: "Apr 15", balance: 2800000 },
  { date: "Apr 17", balance: 2450000 },
]

const fundingMethods = [
  { id: "card", name: "Debit Card", icon: CreditCard, description: "Pay securely with your card via Paystack" },
  // { id: "bank", name: "Bank Transfer", icon: Building2, description: "Transfer from your bank account" },
]

const formatCurrency = (value: number) => {
  return `₦${value.toLocaleString()}`
}


export default function WalletPage() {
  const [showBalance, setShowBalance] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFundModal, setShowFundModal] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [fundAmount, setFundAmount] = useState("")

  // Fetch wallet data from API
  const { data: walletData, loading: walletLoading } = useFetch(() => walletApi.getWallet(), [])
  const { data: transactions, loading: transLoading } = useFetch(() => walletApi.getTransactions(), [])
  const { execute: initiateDeposit, loading: depositLoading } = useApi(walletApi.initiateDeposit)

  // Filter transactions based on search
  const filteredTransactions = Array.isArray(transactions)
    ? transactions.filter((txn: any) =>
      txn.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.reference?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : []

  return (
    <>
      <Header title="Wallet" subtitle="Manage your funds and transactions" />
      <div className="p-6 space-y-6">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Main Balance */}
          <div className="md:col-span-2 glass rounded-2xl p-6 glow-purple">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold text-foreground">
                    {showBalance ? formatCurrency(walletLoading ? 0 : walletData?.available_balance ? parseFloat(walletData.available_balance) : 0) : "₦•••••••"}
                  </p>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowFundModal(true)}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Fund Wallet
              </Button>
              <Button variant="outline" className="flex-1 border-border text-foreground hover:bg-secondary">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </div>

          {/* Pending Balance */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Locked</p>
              <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4 text-warning" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {showBalance ? formatCurrency(walletLoading ? 0 : walletData?.locked_balance ? parseFloat(walletData.locked_balance) : 0) : "₦•••••••"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">In escrow</p>
          </div>

          {/* Total Balance */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {showBalance ? formatCurrency(walletLoading ? 0 : walletData?.total_balance ? parseFloat(walletData.total_balance) : 0) : "₦•••••••"}
            </p>
            <p className="text-xs text-success mt-1">Available + Locked</p>
          </div>
        </div>

        {/* Chart and Account Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Chart */}
          <div className="lg:col-span-2 glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Balance History</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.2 280)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="oklch(0.65 0.2 280)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 280)" />
                  <XAxis
                    dataKey="date"
                    stroke="oklch(0.6 0.01 280)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="oklch(0.6 0.01 280)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.16 0.015 280)",
                      border: "1px solid oklch(0.25 0.02 280)",
                      borderRadius: "12px",
                    }}
                    labelStyle={{ color: "oklch(0.95 0 0)" }}
                    formatter={(value: number) => [formatCurrency(value), "Balance"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="oklch(0.65 0.2 280)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Account Details */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Virtual Account</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-secondary/30">
                <p className="text-sm text-muted-foreground mb-1">Account Name</p>
                <p className="font-medium text-foreground">FreightLink/John Doe</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Account Number</p>
                    <p className="font-mono font-medium text-foreground">8012345678</p>
                  </div>
                  <button className="text-primary hover:text-primary/80 transition-colors">
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30">
                <p className="text-sm text-muted-foreground mb-1">Bank</p>
                <p className="font-medium text-foreground">Wema Bank</p>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Funds sent to this account will be credited automatically
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button variant="outline" size="icon" className="border-border text-muted-foreground hover:text-foreground">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {transLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading transactions...</div>
            ) : filteredTransactions && filteredTransactions.length > 0 ? (
              filteredTransactions.map((txn: any) => {
                const isCredit = txn.transaction_type === 'deposit' || txn.transaction_type === 'escrow_release'
                const txnDate = new Date(txn.created_at)
                return (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCredit ? "bg-success/20" : "bg-destructive/20"
                          }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="w-5 h-5 text-success" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{txn.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{txnDate.toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{txnDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span className="font-mono text-xs">{txn.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${isCredit ? "text-success" : "text-destructive"
                          }`}
                      >
                        {isCredit ? "+" : "-"}
                        {formatCurrency(parseFloat(txn.amount))}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${txn.status === "success"
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
              })
            ) : (
              <div className="p-4 text-center text-muted-foreground">No transactions found</div>
            )}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium">No transactions found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search</p>
            </div>
          )}

          {/* View More */}
          <div className="flex justify-center mt-6">
            <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground">
              View All Transactions
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Fund Wallet Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass rounded-2xl p-6 w-full max-w-md glow-purple">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Fund Wallet</h3>
              <button
                onClick={() => {
                  setShowFundModal(false)
                  setSelectedMethod(null)
                  setFundAmount("")
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!selectedMethod ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">Select a funding method</p>
                {fundingMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <method.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedMethod(null)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to methods
                </button>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="pl-8 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {[10000, 50000, 100000, 500000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setFundAmount(amount.toString())}
                      className="flex-1 py-2 text-sm font-medium rounded-lg bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                    >
                      ₦{(amount / 1000).toFixed(0)}K
                    </button>
                  ))}
                </div>

                {selectedMethod === "bank" && (
                  <div className="p-4 rounded-xl bg-info/10 border border-info/20">
                    <p className="text-sm text-info font-medium mb-2">Bank Transfer Details</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bank:</span>
                        <span className="text-foreground">Wema Bank</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account:</span>
                        <span className="text-foreground font-mono">8012345678</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="text-foreground">FreightLink/John Doe</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === "card" && (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={!fundAmount || Number(fundAmount) <= 0 || depositLoading}
                    onClick={async () => {
                      try {
                        const res = await initiateDeposit(fundAmount)
                        window.location.href = res.payment_url
                      } catch (err) {
                        console.error("Deposit initiation failed:", err)
                      }
                    }}
                  >
                    {depositLoading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Redirecting to Paystack...
                      </>
                    ) : (
                      "Proceed to Payment"
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
