import type { ProductReviewStatus } from "@/lib/domain"

export const EMPTY_ADMIN_COMMENT = "No admin comments yet."

export function normalizeAdminCommentInput(value: string) {
  return value.trim()
}

export function requiresAdminComment(status: ProductReviewStatus) {
  return status === "On Hold" || status === "Rejected"
}

export function hasVisibleAdminComment(comment: string | null | undefined) {
  const trimmed = normalizeAdminCommentInput(comment ?? "")
  return Boolean(trimmed) && trimmed !== EMPTY_ADMIN_COMMENT
}

export function resolveAdminCommentForSave(
  status: ProductReviewStatus,
  adminComment: string
):
  | { ok: true; comment: string | null }
  | { ok: false; error: string } {
  const trimmed = normalizeAdminCommentInput(adminComment)

  if (requiresAdminComment(status)) {
    if (!trimmed) {
      return {
        ok: false,
        error: "Please enter a reason before putting this submission on hold or rejecting it.",
      }
    }

    return { ok: true, comment: trimmed }
  }

  return { ok: true, comment: trimmed || null }
}
