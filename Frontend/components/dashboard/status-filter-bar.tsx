"use client"

import { useState } from "react"
import { Filter, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface StatusFilterBarProps {
  filters: string[]
  active: string
  onChange: (filter: string) => void
  /** Optional display-label override, e.g. to capitalize or map codes to words */
  formatLabel?: (filter: string) => string
}

/**
 * Status filter pills. On md+ screens, renders the familiar horizontal
 * pill row. On mobile, collapses into a single "Filter" icon button that
 * opens a popover listing the same options — avoids a horizontally
 * scrolling strip of pills eating vertical space and looking cluttered
 * next to the search bar on narrow screens.
 */
export function StatusFilterBar({ filters, active, onChange, formatLabel }: StatusFilterBarProps) {
  const [open, setOpen] = useState(false)
  const label = (f: string) => (formatLabel ? formatLabel(f) : f)

  return (
    <>
      {/* Desktop / tablet: pill row */}
      <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onChange(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              active === filter
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {label(filter)}
          </button>
        ))}
      </div>

      {/* Mobile: filter icon + popover */}
      <div className="md:hidden">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground gap-2 shrink-0"
            >
              <Filter className="w-4 h-4" />
              <span className="max-w-[7rem] truncate">{active === "All" ? "Filter" : label(active)}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 bg-popover border-border p-2">
            <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    onChange(filter)
                    setOpen(false)
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-left transition-all ${
                    active === filter
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  {label(filter)}
                  {active === filter && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}
