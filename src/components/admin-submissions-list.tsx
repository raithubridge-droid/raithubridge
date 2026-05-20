"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { REVIEW_STATUS_TONE_CLASS, type ProductReviewStatus } from "@/lib/domain"
import type { PendingSubmission } from "@/lib/marketplace-data"
import { cn } from "@/lib/utils"

type StatusFilter = "all" | "pending" | "approved" | "on_hold" | "rejected"

const FILTER_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "on_hold", label: "On Hold" },
  { id: "rejected", label: "Rejected" },
]

function formatShortLocation(row: PendingSubmission) {
  return [row.sellerVillageCity, row.sellerDistrict].filter(Boolean).join(", ")
}

function matchesFilter(status: ProductReviewStatus, filter: StatusFilter) {
  if (filter === "all") {
    return true
  }

  if (filter === "pending") {
    return status === "Pending Review"
  }

  if (filter === "approved") {
    return status === "Approved"
  }

  if (filter === "on_hold") {
    return status === "On Hold"
  }

  return status === "Rejected"
}

export function AdminSubmissionsList({ items }: { items: PendingSubmission[] }) {
  const [filter, setFilter] = React.useState<StatusFilter>("pending")

  const filteredItems = items.filter((item) => matchesFilter(item.status, filter))

  return (
    <div className="space-y-4">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
              filter === tab.id
                ? "border-green-800 bg-green-800 text-white"
                : "border-border/70 bg-card text-foreground hover:bg-muted/60"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!filteredItems.length ? (
        <Card className="rounded-2xl border-border/70 bg-card/95 shadow-sm">
          <CardContent className="p-5 text-center">
            <p className="font-semibold text-foreground">No submissions in this filter</p>
            <p className="mt-1 text-sm text-muted-foreground">Try another status tab.</p>
          </CardContent>
        </Card>
      ) : null}

      <ul className="space-y-3">
        {filteredItems.map((row) => {
          const location = formatShortLocation(row)

          return (
            <li key={row.id}>
              <Link
                href={`/admin/products/${row.id}`}
                className="block rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm ring-1 ring-primary/5 transition-colors hover:bg-primary/5 active:bg-primary/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold leading-snug text-foreground">
                      {row.productName}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{row.category}</p>
                  </div>
                  <Badge
                    className={cn(
                      "shrink-0 border px-2 py-0.5 text-xs",
                      REVIEW_STATUS_TONE_CLASS[row.status]
                    )}
                  >
                    {row.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-foreground">
                  {row.quantityAvailable} {row.unit} · {row.price}
                </p>
                {location ? (
                  <p className="mt-1 text-sm text-muted-foreground">{location}</p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">Submitted {row.submittedAt}</p>
                <p className="mt-2 flex items-center justify-end gap-1 text-sm font-medium text-green-900">
                  Review
                  <ChevronRight className="size-4" aria-hidden />
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
