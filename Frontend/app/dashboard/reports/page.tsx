"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Calendar,
  Download,
  LucideIcon,
} from "lucide-react"
import { dashboardApi, FinancialAnalytics } from "@/lib/api"
import { useFetch } from "@/hooks/useApi"

const periodOptions = [
  { label: "Last 7 Days", value: "days" as const, range: 7 },
  { label: "Last 30 Days", value: "days" as const, range: 30 },
  { label: "Last 90 Days", value: "days" as const, range: 90 },
  { label: "Last 12 Months", value: "months" as const, range: 12 },
]

type PeriodOption = typeof periodOptions[number]

// Helper function to safely convert string | number to number
const toNumber = (value: string | number | undefined): number => {
  if (value === undefined || value === null) return 0
  return typeof value === 'string' ? parseFloat(value) || 0 : value
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>({
    label: "Last 30 Days",
    value: "days",
    range: 30,
  })

  const { data: analyticsData, loading, error } = useFetch(
    () =>
      dashboardApi.getFinancialAnalytics(
        selectedPeriod.value,
        selectedPeriod.range
      ),
    [selectedPeriod]
  )

  const analytics: FinancialAnalytics = analyticsData || {
    total_revenue: 0,
    revenue_change: 0,
    total_bookings: 0,
    bookings_change: 0,
    avg_transaction: 0,
    total_transactions: 0,
    bookings_sent_count: 0,
    bookings_received_count: 0,
    total_credits: 0,
    total_debits: 0,
    transactions: [],
    recent_transactions: [],
  }

  // Convert to numbers for calculations
  const totalRevenue = toNumber(analytics.total_revenue)
  const revenueChange = toNumber(analytics.revenue_change)
  const totalBookings = toNumber(analytics.total_bookings)
  const bookingsChange = toNumber(analytics.bookings_change)
  const avgTransaction = toNumber(analytics.avg_transaction)
  const totalTransactions = toNumber(analytics.total_transactions)
  const bookingsSentCount = toNumber(analytics.bookings_sent_count)
  const bookingsReceivedCount = toNumber(analytics.bookings_received_count)
  const totalCredits = toNumber(analytics.total_credits)
  const totalDebits = toNumber(analytics.total_debits)

  // Fallback to transactions if recent_transactions is not available
  const transactionData = analytics.recent_transactions || analytics.transactions || []

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      primary: { bg: "bg-primary/20", text: "text-primary" },
      info: { bg: "bg-info/20", text: "text-info" },
      success: { bg: "bg-success/20", text: "text-success" },
      warning: { bg: "bg-warning/20", text: "text-warning" },
    }
    return colorMap[color] || colorMap.primary
  }

  const StatCard = ({
    label,
    value,
    change,
    trend,
    icon: Icon,
    color,
  }: {
    label: string
    value: string | number
    change?: string
    trend?: "up" | "down"
    icon: LucideIcon
    color: string
  }) => {
    const colorClasses = getColorClasses(color)

    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses.bg}`}>
            <Icon className={`w-6 h-6 ${colorClasses.text}`} />
          </div>
          {change && trend && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                trend === "up" ? "text-success" : "text-destructive"
              }`}
            >
              {trend === "up" ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {change}
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    )
  }

  return (
    <>
      <Header title="Reports" subtitle="Financial analytics and performance metrics" />

      <div className="p-6 space-y-6">
        {/* Period Selector */}
        <div className="flex flex-wrap gap-2">
          {periodOptions.map((option) => (
            <Button
              key={option.label}
              variant={
                selectedPeriod.label === option.label ? "default" : "outline"
              }
              onClick={() => setSelectedPeriod(option)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="glass rounded-2xl p-6 h-32 animate-pulse"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-2xl p-4 text-destructive">
            Failed to load analytics data
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Revenue"
                value={`₦${(totalRevenue / 1000000).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}M`}
                change={`${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(1)}%`}
                trend={revenueChange >= 0 ? "up" : "down"}
                icon={DollarSign}
                color="primary"
              />

              <StatCard
                label="Total Bookings"
                value={totalBookings}
                change={`${bookingsChange >= 0 ? "+" : ""}${bookingsChange.toFixed(1)}%`}
                trend={bookingsChange >= 0 ? "up" : "down"}
                icon={Package}
                color="info"
              />

              <StatCard
                label="Avg Transaction"
                value={`₦${(avgTransaction / 1000).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}K`}
                icon={TrendingUp}
                color="success"
              />

              <StatCard
                label="Total Transactions"
                value={totalTransactions}
                icon={Calendar}
                color="warning"
              />
            </div>

            {/* Bookings Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  Bookings Breakdown
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Bookings Sent
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {bookingsSentCount}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${
                            totalBookings > 0
                              ? (bookingsSentCount / totalBookings) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Bookings Received
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {bookingsReceivedCount}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full"
                        style={{
                          width: `${
                            totalBookings > 0
                              ? (bookingsReceivedCount / totalBookings) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Breakdown */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  Transaction Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                    <span className="text-sm font-medium text-foreground">
                      Credits
                    </span>
                    <span className="text-lg font-bold text-success">
                      ₦{(totalCredits / 1000000).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}M
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                    <span className="text-sm font-medium text-foreground">
                      Debits
                    </span>
                    <span className="text-lg font-bold text-destructive">
                      ₦{(totalDebits / 1000000).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}M
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                    <span className="text-sm font-medium text-foreground">
                      Net
                    </span>
                    <span className="text-lg font-bold text-primary">
                      ₦{((totalCredits - totalDebits) / 1000000).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}M
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Recent Transactions
                </h3>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              {transactionData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-4 py-2 text-muted-foreground">
                            Date
                          </th>
                          <th className="text-left px-4 py-2 text-muted-foreground">
                            Description
                          </th>
                          <th className="text-right px-4 py-2 text-muted-foreground">
                            Type
                          </th>
                          <th className="text-right px-4 py-2 text-muted-foreground">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactionData.map((transaction, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-border hover:bg-secondary/30"
                          >
                            <td className="px-4 py-2 text-foreground">
                              {new Date(transaction.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 text-muted-foreground">
                              {transaction.description || "-"}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  transaction.type === "credit"
                                    ? "bg-success/20 text-success"
                                    : "bg-destructive/20 text-destructive"
                                }`}
                              >
                                {transaction.type}
                              </span>
                            </td>
                            <td
                              className={`px-4 py-2 text-right font-medium ${
                                transaction.type === "credit"
                                  ? "text-success"
                                  : "text-destructive"
                              }`}
                            >
                              {transaction.type === "credit" ? "+" : "-"}₦
                              {toNumber(transaction.amount).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}