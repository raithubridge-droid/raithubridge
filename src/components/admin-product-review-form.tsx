"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Pencil,
  Phone,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminProductMediaSection } from "@/components/admin-product-media-section"
import {
  EMPTY_ADMIN_COMMENT,
  hasVisibleAdminComment,
  resolveAdminCommentForSave,
} from "@/lib/admin-comments"
import { REVIEW_STATUS_SHORT } from "@/lib/admin-submissions-ui"
import {
  canAdminApproveOrReject,
  getReviewActionMessage,
  REVIEW_STATUS_TONE_CLASS,
  type ProductReviewStatus,
} from "@/lib/domain"
import type { PendingSubmission } from "@/lib/marketplace-data"
import { cn } from "@/lib/utils"

const UNIT_OPTIONS = ["kg", "quintal", "tonne", "bags", "L"] as const

const inputClassName = "h-11 rounded-xl px-3 text-base"
const selectClassName = cn(
  inputClassName,
  "w-full border border-input bg-transparent py-2 outline-none",
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
)

function formatLocation(row: PendingSubmission) {
  return [row.sellerVillageCity, row.sellerDistrict, row.sellerState].filter(Boolean).join(", ")
}

function formatPriceValue(price: number, unit: string) {
  return `Rs. ${price.toLocaleString("en-IN")} / ${unit}`
}

function formatQuantityValue(quantity: number) {
  return Number.isInteger(quantity) ? quantity.toString() : quantity.toString().replace(/\.0+$/, "")
}

function initialOptionalComment(submission: PendingSubmission) {
  return hasVisibleAdminComment(submission.adminComment) ? submission.adminComment : ""
}

type DetailFieldProps = {
  label: string
  value: React.ReactNode
  className?: string
}

function DetailField({ label, value, className }: DetailFieldProps) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

function ReviewStatusBadge({ status }: { status: ProductReviewStatus }) {
  return (
    <Badge
      className={cn(
        "shrink-0 border px-2.5 py-1 text-xs font-semibold",
        REVIEW_STATUS_TONE_CLASS[status]
      )}
    >
      {REVIEW_STATUS_SHORT[status]}
    </Badge>
  )
}

type EditFormState = {
  categoryId: string
  description: string
  productName: string
  price: string
  quantity: string
  sellerDistrict: string
  sellerName: string
  sellerPhone: string
  sellerState: string
  sellerVillageCity: string
  sellerWhatsapp: string
  unit: string
}

function buildEditFormState(submission: PendingSubmission): EditFormState {
  return {
    categoryId: submission.categoryId ?? "",
    description: submission.description,
    productName: submission.productName,
    price: String(submission.priceValue ?? ""),
    quantity: String(submission.quantityValue ?? submission.quantityAvailable),
    sellerDistrict: submission.sellerDistrict,
    sellerName: submission.sellerName,
    sellerPhone: submission.sellerPhone,
    sellerState: submission.sellerState,
    sellerVillageCity: submission.sellerVillageCity,
    sellerWhatsapp: submission.sellerWhatsapp,
    unit: submission.unit,
  }
}

type AdminProductReviewFormProps = {
  submission: PendingSubmission
  layout?: "page" | "drawer"
  onClose?: () => void
  onReviewSaved?: (status: ProductReviewStatus, adminComment: string) => void
}

export function AdminProductReviewForm({
  submission: initialSubmission,
  layout = "page",
  onClose,
  onReviewSaved,
}: AdminProductReviewFormProps) {
  const router = useRouter()
  const [submission, setSubmission] = React.useState(initialSubmission)
  const [status, setStatus] = React.useState<ProductReviewStatus>(initialSubmission.status)
  const [optionalComment, setOptionalComment] = React.useState(initialOptionalComment(initialSubmission))
  const [requiredComment, setRequiredComment] = React.useState("")
  const [latestComment, setLatestComment] = React.useState(initialSubmission.adminComment)
  const [pendingAction, setPendingAction] = React.useState<"On Hold" | "Rejected" | null>(null)
  const [commentError, setCommentError] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState<string | null>(null)
  const [messageTone, setMessageTone] = React.useState<"success" | "error" | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editError, setEditError] = React.useState<string | null>(null)
  const [editForm, setEditForm] = React.useState<EditFormState>(() => buildEditFormState(initialSubmission))
  const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([])
  const requiredCommentRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    setSubmission(initialSubmission)
    setStatus(initialSubmission.status)
    setOptionalComment(initialOptionalComment(initialSubmission))
    setLatestComment(initialSubmission.adminComment)
    setEditForm(buildEditFormState(initialSubmission))
    setPendingAction(null)
    setRequiredComment("")
    setCommentError(null)
    setIsEditing(false)
    setEditError(null)
  }, [initialSubmission])

  React.useEffect(() => {
    let isMounted = true

    async function loadCategories() {
      try {
        const response = await fetch("/api/categories")
        const payload = (await response.json()) as { categories?: { id: string; name: string }[] }

        if (isMounted && payload.categories?.length) {
          setCategories(payload.categories)
        }
      } catch {
        // Categories are optional for read-only review.
      }
    }

    void loadCategories()

    return () => {
      isMounted = false
    }
  }, [])

  React.useEffect(() => {
    if (pendingAction && requiredCommentRef.current) {
      requiredCommentRef.current.focus()
    }
  }, [pendingAction])

  async function saveReview(nextStatus: ProductReviewStatus) {
    const commentInput = nextStatus === "Approved" ? optionalComment : requiredComment
    const resolved = resolveAdminCommentForSave(nextStatus, commentInput)

    if (!resolved.ok) {
      setCommentError(resolved.error)
      setMessage(null)
      setMessageTone(null)
      return
    }

    setIsSaving(true)
    setMessage(null)
    setMessageTone(null)
    setCommentError(null)

    try {
      const response = await fetch(`/api/admin/submissions/${submission.id}`, {
        body: JSON.stringify({
          adminComment: commentInput,
          status: nextStatus,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      })
      const payload = (await response.json()) as { error?: string; message?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save review.")
      }

      const savedComment =
        resolved.comment && hasVisibleAdminComment(resolved.comment)
          ? resolved.comment
          : EMPTY_ADMIN_COMMENT

      setStatus(nextStatus)
      setLatestComment(savedComment)
      setPendingAction(null)
      setRequiredComment("")
      if (hasVisibleAdminComment(savedComment)) {
        setOptionalComment(savedComment)
      }
      setMessage(payload.message ?? getReviewActionMessage(nextStatus))
      setMessageTone("success")
      onReviewSaved?.(nextStatus, savedComment)
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save review.")
      setMessageTone("error")
    } finally {
      setIsSaving(false)
    }
  }

  async function saveEdits() {
    const price = Number(editForm.price)
    const quantityAvailable = Number(editForm.quantity)

    setEditError(null)
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/submissions/${submission.id}`, {
        body: JSON.stringify({
          categoryId: editForm.categoryId || null,
          description: editForm.description,
          name: editForm.productName,
          price,
          quantityAvailable,
          sellerDistrict: editForm.sellerDistrict,
          sellerName: editForm.sellerName,
          sellerPhone: editForm.sellerPhone,
          sellerState: editForm.sellerState,
          sellerVillageCity: editForm.sellerVillageCity,
          sellerWhatsapp: editForm.sellerWhatsapp,
          unit: editForm.unit,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
      })
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save changes.")
      }

      const categoryName =
        categories.find((category) => category.id === editForm.categoryId)?.name ??
        submission.category

      const nextSubmission: PendingSubmission = {
        ...submission,
        category: categoryName,
        categoryId: editForm.categoryId || null,
        description: editForm.description,
        price: formatPriceValue(price, editForm.unit),
        priceValue: price,
        productName: editForm.productName,
        quantityAvailable: formatQuantityValue(quantityAvailable),
        quantityValue: quantityAvailable,
        sellerDistrict: editForm.sellerDistrict,
        sellerName: editForm.sellerName,
        sellerPhone: editForm.sellerPhone,
        sellerState: editForm.sellerState,
        sellerVillageCity: editForm.sellerVillageCity,
        sellerWhatsapp: editForm.sellerWhatsapp,
        unit: editForm.unit,
      }

      setSubmission(nextSubmission)
      setIsEditing(false)
      setMessage("Product details updated.")
      setMessageTone("success")
      router.refresh()
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Unable to save changes.")
    } finally {
      setIsSaving(false)
    }
  }

  function startRequiredCommentAction(nextStatus: "On Hold" | "Rejected") {
    setPendingAction(nextStatus)
    setRequiredComment("")
    setCommentError(null)
    setMessage(null)
    setIsEditing(false)
  }

  function cancelRequiredCommentAction() {
    setPendingAction(null)
    setRequiredComment("")
    setCommentError(null)
  }

  function cancelEdit() {
    setEditForm(buildEditFormState(submission))
    setEditError(null)
    setIsEditing(false)
  }

  const location = formatLocation(submission)
  const showLatestComment = hasVisibleAdminComment(latestComment)
  const canReview = canAdminApproveOrReject(status)
  const showStickyActions = layout === "page" && !pendingAction && !isEditing

  return (
    <div className={cn("space-y-4", layout === "page" ? "pb-28" : undefined)}>
      {layout === "page" ? (
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-900"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to submissions
        </Link>
      ) : null}

      <section className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm ring-1 ring-primary/5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Product submission
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold leading-tight text-foreground">
              {submission.productName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{submission.category}</p>
          </div>
          <ReviewStatusBadge status={status} />
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-4 shrink-0" aria-hidden />
          Submitted {submission.submittedAt}
        </p>
      </section>

      <AdminProductMediaSection
        productId={submission.id}
        category={submission.category}
        mediaAssets={submission.mediaAssets}
      />

      {isEditing ? (
        <section className="space-y-4 rounded-2xl border border-green-800/20 bg-card/95 p-4 shadow-sm ring-1 ring-green-800/10">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Edit product details</h2>
            <button
              type="button"
              onClick={cancelEdit}
              aria-label="Cancel edit"
              className="flex size-9 items-center justify-center rounded-xl border border-border/70 text-foreground hover:bg-muted/60"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="edit-product-name" className="text-sm font-medium">
                Product name
              </Label>
              <Input
                id="edit-product-name"
                value={editForm.productName}
                className={inputClassName}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, productName: event.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="edit-category" className="text-sm font-medium">
                Category
              </Label>
              <select
                id="edit-category"
                value={editForm.categoryId}
                className={selectClassName}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, categoryId: event.target.value }))
                }
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-quantity" className="text-sm font-medium">
                  Quantity
                </Label>
                <Input
                  id="edit-quantity"
                  inputMode="decimal"
                  value={editForm.quantity}
                  className={inputClassName}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, quantity: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-unit" className="text-sm font-medium">
                  Unit
                </Label>
                <select
                  id="edit-unit"
                  value={editForm.unit}
                  className={selectClassName}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, unit: event.target.value }))
                  }
                >
                  <option value="">Select unit</option>
                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-price" className="text-sm font-medium">
                Price (Rs.)
              </Label>
              <Input
                id="edit-price"
                inputMode="decimal"
                value={editForm.price}
                className={inputClassName}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, price: event.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="edit-description"
                rows={4}
                value={editForm.description}
                className="min-h-24 rounded-xl text-base"
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-3 border-t border-border/60 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Farmer details
            </h3>
            <div>
              <Label htmlFor="edit-seller-name" className="text-sm font-medium">
                Farmer name
              </Label>
              <Input
                id="edit-seller-name"
                value={editForm.sellerName}
                className={inputClassName}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, sellerName: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-seller-phone" className="text-sm font-medium">
                  Phone
                </Label>
                <Input
                  id="edit-seller-phone"
                  value={editForm.sellerPhone}
                  className={inputClassName}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, sellerPhone: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-seller-whatsapp" className="text-sm font-medium">
                  WhatsApp
                </Label>
                <Input
                  id="edit-seller-whatsapp"
                  value={editForm.sellerWhatsapp}
                  className={inputClassName}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, sellerWhatsapp: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="edit-village" className="text-sm font-medium">
                  Village / city
                </Label>
                <Input
                  id="edit-village"
                  value={editForm.sellerVillageCity}
                  className={inputClassName}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      sellerVillageCity: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-district" className="text-sm font-medium">
                  District
                </Label>
                <Input
                  id="edit-district"
                  value={editForm.sellerDistrict}
                  className={inputClassName}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, sellerDistrict: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-state" className="text-sm font-medium">
                  State
                </Label>
                <Input
                  id="edit-state"
                  value={editForm.sellerState}
                  className={inputClassName}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, sellerState: event.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          {editError ? <p className="text-sm text-destructive">{editError}</p> : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              className="h-12 rounded-xl bg-green-800 text-base font-semibold text-white hover:bg-green-900"
              disabled={isSaving}
              onClick={() => void saveEdits()}
            >
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl text-base font-semibold"
              disabled={isSaving}
              onClick={cancelEdit}
            >
              Cancel
            </Button>
          </div>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Product details
            </h2>
            <dl className="mt-3 grid gap-4 sm:grid-cols-2">
              <DetailField label="Product name" value={submission.productName} className="sm:col-span-2" />
              <DetailField label="Category" value={submission.category} />
              <DetailField label="Status" value={<ReviewStatusBadge status={status} />} />
              <DetailField label="Price" value={submission.price} />
              <DetailField
                label="Quantity"
                value={`${submission.quantityAvailable} ${submission.unit}`}
              />
              <DetailField label="Unit" value={submission.unit} />
              <DetailField
                label="Description"
                value={<span className="font-normal leading-relaxed">{submission.description}</span>}
                className="sm:col-span-2"
              />
            </dl>
          </section>

          <section className="space-y-3 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Farmer contact
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Farmer name" value={submission.sellerName} />
              <DetailField
                label="Phone"
                value={
                  submission.sellerPhone ? (
                    <a href={`tel:${submission.sellerPhone}`} className="hover:underline">
                      {submission.sellerPhone}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              <DetailField
                label="WhatsApp"
                value={submission.sellerWhatsapp || "—"}
              />
              <DetailField
                label="Location"
                value={
                  location ? (
                    <span className="inline-flex items-start gap-1.5 font-normal">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                      {location}
                    </span>
                  ) : (
                    "—"
                  )
                }
                className="sm:col-span-2"
              />
            </dl>
          </section>
        </>
      )}

      {showLatestComment ? (
        <section className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Latest admin comment
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{latestComment}</p>
        </section>
      ) : null}

      {!isEditing ? (
        <section className="space-y-3 rounded-2xl border border-green-800/15 bg-card/95 p-4 shadow-sm ring-1 ring-green-800/10">
          {!canReview ? (
            <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
              {status === "Approved"
                ? "This product is approved and visible on the public Products page."
                : status === "Rejected"
                  ? "This product was rejected and is hidden from the public Products page."
                  : "This submission has already been reviewed."}
            </p>
          ) : null}

          {pendingAction ? (
            <div className="space-y-3 rounded-xl border border-amber-800/25 bg-amber-50/80 p-4 ring-1 ring-amber-800/10">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {pendingAction === "On Hold" ? "Put on hold" : "Reject submission"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  A reason is required so the farmer can see it on My Submissions.
                </p>
              </div>
              <label htmlFor="admin-required-comment" className="text-sm font-semibold text-foreground">
                Reason <span className="text-destructive">*</span>
              </label>
              <Textarea
                ref={requiredCommentRef}
                id="admin-required-comment"
                value={requiredComment}
                rows={4}
                required
                aria-invalid={Boolean(commentError)}
                aria-describedby={commentError ? "admin-comment-error" : undefined}
                className={cn(
                  "min-h-24 rounded-xl text-base",
                  commentError ? "border-destructive ring-1 ring-destructive/30" : undefined
                )}
                placeholder="Explain why this submission is rejected…"
                onChange={(event) => {
                  setRequiredComment(event.target.value)
                  if (commentError) {
                    setCommentError(null)
                  }
                }}
              />
              {commentError ? (
                <p id="admin-comment-error" className="text-sm text-destructive">
                  {commentError}
                </p>
              ) : null}
              <div className="grid gap-2">
                <Button
                  type="button"
                  className="h-12 w-full rounded-xl bg-destructive text-base font-semibold text-white hover:bg-destructive/90"
                  disabled={isSaving}
                  onClick={() => void saveReview(pendingAction)}
                >
                  {isSaving ? "Saving…" : "Confirm reject"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 w-full rounded-xl text-base font-semibold"
                  disabled={isSaving}
                  onClick={cancelRequiredCommentAction}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : layout === "drawer" ? (
            <>
              <div>
                <label htmlFor="admin-optional-comment" className="text-sm font-semibold text-foreground">
                  Note for farmer
                </label>
                <p className="mt-0.5 text-sm text-muted-foreground">Optional when approving.</p>
              </div>
              <Textarea
                id="admin-optional-comment"
                value={optionalComment}
                rows={3}
                className="min-h-20 rounded-xl text-base"
                placeholder="Optional message visible on My Submissions after approval."
                onChange={(event) => setOptionalComment(event.target.value)}
              />

              <div className="grid gap-2">
                <Button
                  type="button"
                  className="h-12 w-full rounded-xl bg-green-800 text-base font-semibold text-white hover:bg-green-900"
                  disabled={isSaving || !canReview}
                  onClick={() => void saveReview("Approved")}
                >
                  {isSaving ? "Saving…" : "Approve"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full rounded-xl border-2 border-destructive/35 text-base font-semibold text-destructive hover:bg-destructive/10"
                  disabled={isSaving || !canReview}
                  onClick={() => startRequiredCommentAction("Rejected")}
                >
                  Reject
                </Button>
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="admin-optional-comment" className="text-sm font-semibold text-foreground">
                Note for farmer
              </label>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Optional when approving. Required when rejecting.
              </p>
              <Textarea
                id="admin-optional-comment"
                value={optionalComment}
                rows={3}
                className="mt-2 min-h-20 rounded-xl text-base"
                placeholder="Optional message visible on My Submissions after approval."
                onChange={(event) => setOptionalComment(event.target.value)}
              />
            </div>
          )}

          {message ? (
            <p
              role="status"
              className={cn(
                "rounded-xl px-3 py-2 text-center text-sm",
                messageTone === "success"
                  ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-800/15"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {message}
            </p>
          ) : null}

          {layout === "drawer" && onClose ? (
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full rounded-xl text-base font-semibold"
              disabled={isSaving}
              onClick={onClose}
            >
              Close
            </Button>
          ) : null}
        </section>
      ) : null}

      {showStickyActions ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/85">
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4">
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-xl text-sm font-semibold"
            >
              <Link href="/admin">Back</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl text-sm font-semibold"
              disabled={isSaving}
              onClick={() => {
                setEditForm(buildEditFormState(submission))
                setEditError(null)
                setIsEditing(true)
              }}
            >
              <Pencil className="size-4" aria-hidden />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl border-2 border-destructive/35 text-sm font-semibold text-destructive hover:bg-destructive/10"
              disabled={isSaving || !canReview}
              onClick={() => startRequiredCommentAction("Rejected")}
            >
              Reject
            </Button>
            <Button
              type="button"
              className="h-12 rounded-xl bg-green-800 text-sm font-semibold text-white hover:bg-green-900"
              disabled={isSaving || !canReview}
              onClick={() => void saveReview("Approved")}
            >
              {isSaving ? "Saving…" : "Approve"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
