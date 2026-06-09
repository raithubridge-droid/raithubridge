"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"

import { ProductImage } from "@/components/product-image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatSubmissionLocation, REVIEW_STATUS_SHORT } from "@/lib/admin-submissions-ui"
import { REVIEW_STATUS_TONE_CLASS, type ProductReviewStatus } from "@/lib/domain"
import type { PendingSubmission } from "@/lib/marketplace-data"
import { cn } from "@/lib/utils"

type StatusFilter = "all" | "pending" | "approved" | "on_hold" | "rejected"

const FILTER_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "on_hold", label: "Hold" },
  { id: "rejected", label: "Rejected" },
]

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

function SubmissionStatusBadge({ status }: { status: ProductReviewStatus }) {
  return (
    <Badge
      className={cn(
        "shrink-0 border px-2 py-0.5 text-xs font-semibold",
        REVIEW_STATUS_TONE_CLASS[status]
      )}
    >
      {REVIEW_STATUS_SHORT[status]}
    </Badge>
  )
}

function SubmissionMobileCard({ row }: { row: PendingSubmission }) {
  const location = formatSubmissionLocation(row)

  return (
    <li>
      <Link
        href={`/admin/products/${row.id}`}
        className="block w-full rounded-2xl border border-border/70 bg-card/95 p-4 text-left shadow-sm ring-1 ring-primary/5 transition-colors hover:bg-primary/5 active:bg-primary/10"
      >
        <div className="flex gap-3">
          <ProductImage
            category={row.category}
            mediaAssets={row.mediaAssets}
            alt={row.productName}
            includeManageableImages
            className="size-20 shrink-0 rounded-xl"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-base font-semibold leading-snug text-foreground">{row.productName}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{row.sellerName}</p>
              </div>
              <SubmissionStatusBadge status={row.status} />
            </div>
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Price
            </dt>
            <dd className="mt-0.5 font-medium text-foreground">{row.price}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Quantity
            </dt>
            <dd className="mt-0.5 text-foreground">
              {row.quantityAvailable} {row.unit}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Location
            </dt>
            <dd className="mt-0.5 text-foreground">{location || "—"}</dd>
          </div>
        </dl>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
          <p className="text-xs text-muted-foreground">Submitted {row.submittedAt}</p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-900">
            Review
            <ChevronRight className="size-4" aria-hidden />
          </span>
        </div>
      </Link>
    </li>
  )
}

function SubmissionDesktopTable({ rows }: { rows: PendingSubmission[] }) {
  const router = useRouter()

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm ring-1 ring-primary/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Product
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Farmer
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Price
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Quantity
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Location
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Submitted
              </th>
              <th className="px-3 py-3" aria-hidden>
                <span className="sr-only">Open review</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const location = formatSubmissionLocation(row)

              return (
                <tr
                  key={row.id}
                  tabIndex={0}
                  role="link"
                  onClick={() => router.push(`/admin/products/${row.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      router.push(`/admin/products/${row.id}`)
                    }
                  }}
                  className="cursor-pointer border-b border-border/50 transition-colors last:border-b-0 hover:bg-primary/5 focus-visible:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-800/30"
                >
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <ProductImage
                        category={row.category}
                        mediaAssets={row.mediaAssets}
                        alt={row.productName}
                        includeManageableImages
                        className="size-12 shrink-0 rounded-lg"
                      />
                      <p className="font-semibold text-foreground">{row.productName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-foreground">{row.sellerName}</td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle font-medium text-foreground">
                    {row.price}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle text-foreground">
                    {row.quantityAvailable} {row.unit}
                  </td>
                  <td className="max-w-[180px] px-4 py-3 align-middle text-muted-foreground">
                    <span className="line-clamp-2">{location || "—"}</span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <SubmissionStatusBadge status={row.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle text-muted-foreground">
                    {row.submittedAt}
                  </td>
                  <td className="px-3 py-3 align-middle text-green-900">
                    <ChevronRight className="size-4" aria-hidden />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminSubmissionsWorkspace({ items }: { items: PendingSubmission[] }) {
  const [filter, setFilter] = React.useState<StatusFilter>("all")
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

      <p className="text-sm text-muted-foreground">
        {filteredItems.length} submission{filteredItems.length === 1 ? "" : "s"}
        <span className="hidden md:inline"> · click a row to review</span>
        <span className="md:hidden"> · tap a card to review</span>
      </p>

      {!filteredItems.length ? (
        <Card className="rounded-2xl border-border/70 bg-card/95 shadow-sm">
          <CardContent className="p-5 text-center">
            <p className="font-semibold text-foreground">No submissions in this filter</p>
            <p className="mt-1 text-sm text-muted-foreground">Try another status tab.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {filteredItems.map((row) => (
              <SubmissionMobileCard key={row.id} row={row} />
            ))}
          </ul>

          <div className="hidden md:block">
            <SubmissionDesktopTable rows={filteredItems} />
          </div>
        </>
      )}
    </div>
  )
}
