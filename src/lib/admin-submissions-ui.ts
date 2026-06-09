import type { ProductReviewStatus } from "@/lib/domain"
import type { PendingSubmission } from "@/lib/marketplace-data"

export const REVIEW_STATUS_SHORT: Record<ProductReviewStatus, string> = {
  "Pending Review": "Pending",
  "On Hold": "Hold",
  Approved: "Approved",
  Rejected: "Rejected",
}

export function formatSubmissionLocation(row: PendingSubmission) {
  return [row.sellerVillageCity, row.sellerDistrict].filter(Boolean).join(", ")
}

export function formatQuantityPrice(row: PendingSubmission) {
  return `${row.quantityAvailable} ${row.unit} · ${row.price}`
}
