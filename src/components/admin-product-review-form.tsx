/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CalendarDays, MapPin, Phone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { REVIEW_STATUS_TONE_CLASS, type ProductReviewStatus } from "@/lib/domain"
import type { PendingSubmission } from "@/lib/marketplace-data"

const EMPTY_COMMENT = "No admin comments yet."

function formatLocation(row: PendingSubmission) {
  return [row.sellerVillageCity, row.sellerDistrict, row.sellerState].filter(Boolean).join(", ")
}

export function AdminProductReviewForm({ submission }: { submission: PendingSubmission }) {
  const router = useRouter()
  const [status, setStatus] = React.useState<ProductReviewStatus>(submission.status)
  const [comment, setComment] = React.useState(
    submission.adminComment === EMPTY_COMMENT ? "" : submission.adminComment
  )
  const [message, setMessage] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  async function saveReview(nextStatus: ProductReviewStatus) {
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/submissions/${submission.id}`, {
        body: JSON.stringify({
          adminComment: comment,
          status: nextStatus,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      })
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save review.")
      }

      setStatus(nextStatus)
      setMessage("Review saved successfully.")
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save review.")
    } finally {
      setIsSaving(false)
    }
  }

  const photos = submission.mediaAssets?.filter((asset) => asset.type === "image") ?? []
  const location = formatLocation(submission)
  const hasExistingComment =
    submission.adminComment && submission.adminComment !== EMPTY_COMMENT

  return (
    <div className="space-y-4">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-medium text-green-900"
      >
        <ArrowLeft className="size-4 shrink-0" aria-hidden />
        Back to submissions
      </Link>

      <section className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm ring-1 ring-primary/5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-2xl font-bold leading-tight">{submission.productName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{submission.category}</p>
          </div>
          <Badge className={`shrink-0 border px-2.5 py-1 text-xs ${REVIEW_STATUS_TONE_CLASS[status]}`}>
            {status}
          </Badge>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-4 shrink-0" aria-hidden />
          Submitted {submission.submittedAt}
        </p>
      </section>

      {photos.length ? (
        <section className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Product photos
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {photos.map((asset) => (
              <a
                key={asset.path}
                href={asset.url}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-xl border border-border/70 bg-muted"
              >
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="aspect-[4/3] w-full object-cover"
                />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product</h2>
        <p className="text-sm">
          <span className="font-medium text-foreground">Quantity:</span>{" "}
          {submission.quantityAvailable} {submission.unit}
        </p>
        <p className="text-sm">
          <span className="font-medium text-foreground">Price:</span> {submission.price}
        </p>
        <p className="text-sm leading-relaxed text-foreground">{submission.description}</p>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Seller</h2>
        <p className="text-base font-semibold text-foreground">{submission.sellerName}</p>
        {submission.sellerPhone ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4 shrink-0" aria-hidden />
            {submission.sellerPhone}
          </p>
        ) : null}
        {location ? (
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{location}</span>
          </p>
        ) : null}
      </section>

      {hasExistingComment ? (
        <section className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Current admin comment</p>
          <p className="mt-2 text-sm text-foreground">{submission.adminComment}</p>
        </section>
      ) : null}

      <section className="space-y-3 rounded-2xl border border-green-800/15 bg-card/95 p-4 shadow-sm ring-1 ring-green-800/10">
        <label htmlFor="admin-comment" className="text-sm font-semibold text-foreground">
          Admin comment
        </label>
        <Textarea
          id="admin-comment"
          value={comment}
          rows={4}
          className="min-h-24 rounded-xl text-base"
          placeholder="Add a note for the farmer (visible on My Submissions)."
          onChange={(event) => setComment(event.target.value)}
        />

        <div className="grid gap-2">
          <Button
            type="button"
            className="h-12 w-full rounded-xl bg-green-800 text-base font-semibold text-white hover:bg-green-900"
            disabled={isSaving}
            onClick={() => saveReview("Approved")}
          >
            Approve
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl border-2 border-blue-300 text-base font-semibold text-blue-900 hover:bg-blue-50"
            disabled={isSaving}
            onClick={() => saveReview("On Hold")}
          >
            Put On Hold
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl border-2 border-destructive/35 text-base font-semibold text-destructive hover:bg-destructive/10"
            disabled={isSaving}
            onClick={() => saveReview("Rejected")}
          >
            Reject
          </Button>
        </div>

        {message ? (
          <p
            className={`text-center text-sm ${
              message.includes("success") ? "text-green-800" : "text-destructive"
            }`}
          >
            {message}
          </p>
        ) : null}
      </section>
    </div>
  )
}
