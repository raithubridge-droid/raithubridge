export const USER_ROLES = ["user", "admin"] as const
export type UserRole = (typeof USER_ROLES)[number]

export const PRODUCT_REVIEW_STATUSES = [
  "Pending Review",
  "On Hold",
  "Approved",
  "Rejected",
] as const
export type ProductReviewStatus = (typeof PRODUCT_REVIEW_STATUSES)[number]

export const PRODUCT_AVAILABILITY_STATUSES = ["Active", "Inactive", "Sold Out"] as const
export type ProductAvailabilityStatus = (typeof PRODUCT_AVAILABILITY_STATUSES)[number]

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  user: "User",
}

export const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin",
  user: "/products",
}

export const REVIEW_STATUS_LABELS: Record<ProductReviewStatus, string> = {
  Approved: "Approved",
  "On Hold": "On Hold",
  "Pending Review": "Pending Review",
  Rejected: "Rejected",
}

export const AVAILABILITY_STATUS_LABELS: Record<ProductAvailabilityStatus, string> = {
  Active: "Active",
  Inactive: "Inactive",
  "Sold Out": "Sold Out",
}

export const REVIEW_STATUS_TONE_CLASS: Record<ProductReviewStatus, string> = {
  "Pending Review": "bg-amber-100 text-amber-900 border-amber-200",
  "On Hold": "bg-blue-100 text-blue-900 border-blue-200",
  Approved: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Rejected: "bg-red-100 text-red-900 border-red-200",
}

export const AVAILABILITY_STATUS_TONE_CLASS: Record<ProductAvailabilityStatus, string> = {
  Active: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Inactive: "bg-zinc-100 text-zinc-800 border-zinc-200",
  "Sold Out": "bg-red-100 text-red-900 border-red-200",
}

/** Values accepted by the live products.review_status check constraint. */
export const DB_REVIEW_STATUS = {
  pendingReview: "Pending Review",
  onHold: "On Hold",
  approved: "Approved",
  rejected: "Rejected",
} as const

export type DbReviewStatus = (typeof DB_REVIEW_STATUS)[keyof typeof DB_REVIEW_STATUS]

const REVIEW_STATUS_ALIASES: Record<string, ProductReviewStatus> = {
  Approved: "Approved",
  approved: "Approved",
  available: "Approved",
  limited: "Approved",
  seasonal: "Approved",
  "On Hold": "On Hold",
  on_hold: "On Hold",
  Pending: "Pending Review",
  pending: "Pending Review",
  pending_review: "Pending Review",
  "Pending Review": "Pending Review",
  draft: "Pending Review",
  Rejected: "Rejected",
  rejected: "Rejected",
  archived: "Rejected",
}

const REVIEW_STATUS_TO_DB: Record<ProductReviewStatus, DbReviewStatus> = {
  "Pending Review": DB_REVIEW_STATUS.pendingReview,
  "On Hold": DB_REVIEW_STATUS.onHold,
  Approved: DB_REVIEW_STATUS.approved,
  Rejected: DB_REVIEW_STATUS.rejected,
}

export function toDbReviewStatus(value: ProductReviewStatus): DbReviewStatus {
  return REVIEW_STATUS_TO_DB[value]
}

export function getAdminReviewUpdate(status: ProductReviewStatus, adminComment: string) {
  const dbStatus = toDbReviewStatus(status)
  const isApproved = status === "Approved"

  return {
    admin_comment: adminComment,
    review_status: dbStatus,
    status: dbStatus,
    is_active: isApproved,
    availability_status: isApproved ? ("Active" as const) : ("Inactive" as const),
  }
}


const AVAILABILITY_STATUS_ALIASES: Record<string, ProductAvailabilityStatus> = {
  Active: "Active",
  active: "Active",
  available: "Active",
  Approved: "Active",
  approved: "Active",
  limited: "Active",
  seasonal: "Active",
  in_stock: "Active",
  Inactive: "Inactive",
  inactive: "Inactive",
  draft: "Inactive",
  Pending: "Inactive",
  pending: "Inactive",
  "Pending Review": "Inactive",
  on_hold: "Inactive",
  "On Hold": "Inactive",
  Rejected: "Inactive",
  rejected: "Inactive",
  archived: "Inactive",
  "Sold Out": "Sold Out",
  sold_out: "Sold Out",
  out_of_stock: "Sold Out",
}

export function normalizeReviewStatus(value: string | null | undefined): ProductReviewStatus {
  return value ? REVIEW_STATUS_ALIASES[value] ?? "Pending Review" : "Pending Review"
}

export function normalizeAvailabilityStatus(
  value: string | null | undefined,
  fallback?: { isActive?: boolean | null; quantityAvailable?: number | null }
): ProductAvailabilityStatus {
  if (value && AVAILABILITY_STATUS_ALIASES[value]) {
    return AVAILABILITY_STATUS_ALIASES[value]
  }

  if (fallback?.isActive === false) {
    return "Inactive"
  }

  if (typeof fallback?.quantityAvailable === "number" && fallback.quantityAvailable <= 0) {
    return "Sold Out"
  }

  return "Active"
}

export function isApprovedReviewStatus(value: string | null | undefined) {
  return normalizeReviewStatus(value) === "Approved"
}

export function isActiveAvailabilityStatus(value: string | null | undefined) {
  return normalizeAvailabilityStatus(value) === "Active"
}
