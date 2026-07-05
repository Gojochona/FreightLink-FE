"use client"

import Link from "next/link"
import { Plus, Wallet, FileText, Headphones } from "lucide-react"

const actions = [
  {
    label: "New Booking",
    description: "Book cargo space",
    icon: Plus,
    href: "/dashboard/bookings",
    color: "primary",
  },
  {
    label: "Fund Wallet",
    description: "Add money to wallet",
    icon: Wallet,
    href: "/dashboard/wallet",
    color: "accent",
  },
  {
    label: "View Reports",
    description: "Analytics & insights",
    icon: FileText,
    href: "/dashboard/reports",
    color: "info",
  },
  {
    label: "Support",
    description: "Get help 24/7",
    icon: Headphones,
    href: "/dashboard/support",
    color: "success",
  },
]

export function QuickActions() {
  return (
    <div className="glass rounded-2xl p-6 h-full">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-200 group"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                action.color === "primary"
                  ? "bg-primary/20 text-primary"
                  : action.color === "accent"
                  ? "bg-accent/20 text-accent"
                  : action.color === "info"
                  ? "bg-info/20 text-info"
                  : "bg-success/20 text-success"
              }`}
            >
              <action.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">{action.label}</p>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
