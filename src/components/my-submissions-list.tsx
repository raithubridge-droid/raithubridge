import Link from "next/link"
import { PackagePlus } from "lucide-react"

import { ProductImage } from "@/components/product-image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { hasVisibleAdminComment } from "@/lib/admin-comments"
import { REVIEW_STATUS_SHORT } from "@/lib/admin-submissions-ui"
import { REVIEW_STATUS_TONE_CLASS } from "@/lib/domain"
import type { PendingSubmission } from "@/lib/marketplace-data"
import { cn } from "@/lib/utils"

function SubmissionStatusBadge({ status }: { status: PendingSubmission["status"] }) {
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

function MySubmissionCard({ item }: { item: PendingSubmission }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm ring-1 ring-primary/5">
      <div className="p-4">
        <div className="flex gap-3">
          <ProductImage
            category={item.category}
            mediaAssets={item.mediaAssets}
            alt={item.productName}
            includeFarmerUploads
            className="size-24 shrink-0 rounded-xl sm:size-28"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-base font-bold leading-snug text-foreground sm:text-lg">
                  {item.productName}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Submitted {item.submittedAt}
                </p>
              </div>
              <SubmissionStatusBadge status={item.status} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Price
                </dt>
                <dd className="mt-0.5 font-medium text-foreground">{item.price}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Quantity
                </dt>
                <dd className="mt-0.5 text-foreground">
                  {item.quantityAvailable} {item.unit}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {hasVisibleAdminComment(item.adminComment) ? (
          <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Admin feedback
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground">{item.adminComment}</p>
          </div>
        ) : item.status === "Pending Review" || item.status === "On Hold" ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {item.status === "On Hold"
              ? "Your submission is on hold. Check back here for admin feedback."
              : "Waiting for admin review. Feedback will appear here when available."}
          </p>
        ) : null}
      </div>
    </article>
  )
}

function MySubmissionsEmptyState() {
  return (
    <Card className="rounded-2xl border-border/70 bg-card/95 text-center shadow-sm ring-1 ring-primary/5">
      <CardContent className="space-y-4 p-8 sm:p-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-green-800/10 text-green-900">
          <PackagePlus className="size-7" aria-hidden />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">No submissions yet</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Products you submit will appear here with status updates from the RaithuBridge team.
          </p>
        </div>
        <Button asChild className="h-11 rounded-xl px-5 text-base font-semibold">
          <Link href="/submit-product">Submit your first product</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function MySubmissionsList({ submissions }: { submissions: PendingSubmission[] }) {
  if (!submissions.length) {
    return <MySubmissionsEmptyState />
  }

  return (
    <ul className="space-y-4">
      {submissions.map((item) => (
        <li key={item.id}>
          <MySubmissionCard item={item} />
        </li>
      ))}
    </ul>
  )
}
