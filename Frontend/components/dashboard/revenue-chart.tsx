"use client"

import { useFetch } from "@/hooks"
import { dashboardApi, FinancialAnalytics } from "@/lib/api"
import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "../ui/button"

const data = [
  { month: "Jan", revenue: 4200000, trips: 180 },
  { month: "Feb", revenue: 5100000, trips: 220 },
  { month: "Mar", revenue: 4800000, trips: 195 },
  { month: "Apr", revenue: 6200000, trips: 280 },
  { month: "May", revenue: 7100000, trips: 310 },
  { month: "Jun", revenue: 6800000, trips: 290 },
  { month: "Jul", revenue: 8200000, trips: 350 },
  { month: "Aug", revenue: 7500000, trips: 320 },
  { month: "Sep", revenue: 8700000, trips: 380 },
]

const formatCurrency = (value: number) => {
  return `₦${(value / 1000000).toFixed(1)}M`
}

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

export function RevenueChart() {
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
    revenue_overview: [],
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground">Monthly revenue and trip statistics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Amount</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-sm text-muted-foreground">Trips</span>
          </div>
        </div>
      </div>
      {/* Period Selector */}
      <div className="flex flex-wrap gap-4 mb-4">
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
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analytics?.revenue_overview} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.65 0.2 280)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="oklch(0.65 0.2 280)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.7 0.18 45)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="oklch(0.7 0.18 45)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 280)" />
            <XAxis
              dataKey="period"
              stroke="oklch(0.6 0.01 280)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey={'amount'}
              stroke="oklch(0.6 0.01 280)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.16 0.015 280)",
                border: "1px solid oklch(0.25 0.02 280)",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
              labelStyle={{ color: "oklch(0.95 0 0)" }}
              formatter={(value: number, name: string) => [
                name === "amount" ? formatCurrency(value) : value,
                name === "amount" ? "Amount" : "Trips"
              ]}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="oklch(0.65 0.2 280)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
