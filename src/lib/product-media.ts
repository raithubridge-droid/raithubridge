import type { SupabaseClient } from "@supabase/supabase-js"

import type { ProductMediaAsset } from "@/lib/marketplace-data"
import type { Database } from "@/types/database"

export type MediaUploadedBy = "farmer" | "admin"
export type MediaReviewStatus = "pending" | "approved" | "ignored"

export type ProductMediaRowFields = {
  id: string
  is_public?: boolean | null
  is_primary?: boolean | null
  uploaded_by?: string | null
  status?: string | null
}

export type CategoryPlaceholderKey = "Grains" | "Oils" | "Spices" | "Vegetables" | "Other"

const PLACEHOLDER_STYLES: Record<
  CategoryPlaceholderKey,
  { label: string; emoji: string; className: string }
> = {
  Grains: { label: "Grains", emoji: "🌾", className: "bg-amber-100 text-amber-900" },
  Oils: { label: "Oils", emoji: "🫒", className: "bg-lime-100 text-lime-900" },
  Spices: { label: "Spices", emoji: "🌶️", className: "bg-orange-100 text-orange-900" },
  Vegetables: { label: "Vegetables", emoji: "🥬", className: "bg-emerald-100 text-emerald-900" },
  Other: { label: "Farm product", emoji: "🌱", className: "bg-stone-100 text-stone-700" },
}

export function normalizeCategoryPlaceholder(category: string): CategoryPlaceholderKey {
  const normalized = category.trim().toLowerCase()

  if (normalized.includes("grain") || normalized.includes("rice") || normalized.includes("wheat")) {
    return "Grains"
  }

  if (normalized.includes("oil")) {
    return "Oils"
  }

  if (normalized.includes("spice")) {
    return "Spices"
  }

  if (normalized.includes("vegetable") || normalized.includes("veg")) {
    return "Vegetables"
  }

  return "Other"
}

export function getCategoryPlaceholder(category: string) {
  return PLACEHOLDER_STYLES[normalizeCategoryPlaceholder(category)]
}

export function mapMediaRowToAsset(
  row: ProductMediaRowFields & {
    url: string
    storage_path: string | null
    media_type: "image" | "video"
    mime_type: string | null
    name: string
    size_bytes: number
  }
): ProductMediaAsset {
  return {
    id: row.id,
    url: row.url,
    path: row.storage_path ?? row.id,
    type: row.media_type,
    mimeType: row.mime_type ?? "",
    name: row.name,
    size: row.size_bytes,
    isPublic: row.is_public ?? false,
    isPrimary: row.is_primary ?? false,
    uploadedBy: row.uploaded_by === "admin" ? "admin" : "farmer",
    status: normalizeMediaStatus(row.status),
  }
}

function normalizeMediaStatus(value: string | null | undefined): MediaReviewStatus {
  if (value === "approved" || value === "ignored") {
    return value
  }

  return "pending"
}

export function getPublicDisplayImages(
  assets: ProductMediaAsset[],
  options: { includePendingForOwner?: boolean } = {}
) {
  const images = assets.filter((asset) => asset.type === "image")

  const visible = images.filter((asset) => {
    if (asset.status === "ignored") {
      return false
    }

    if (options.includePendingForOwner) {
      return true
    }

    return asset.isPublic && asset.status === "approved"
  })

  const primary = visible.find((asset) => asset.isPrimary)
  if (primary) {
    return [primary, ...visible.filter((asset) => asset.id !== primary.id)]
  }

  return visible
}

export function getManageableImages(assets: ProductMediaAsset[]) {
  return assets
    .filter((asset) => asset.type === "image" && asset.status !== "ignored")
    .sort((left, right) => {
      if (left.isPrimary && !right.isPrimary) {
        return -1
      }

      if (!left.isPrimary && right.isPrimary) {
        return 1
      }

      return 0
    })
}

export function getDisplayImageUrl(
  assets: ProductMediaAsset[],
  category: string,
  options: {
    includePendingForOwner?: boolean
    includeFarmerUploads?: boolean
    includeManageableImages?: boolean
  } = {}
) {
  if (options.includeManageableImages) {
    const manageable = getManageableImages(assets)[0]
    if (manageable) {
      return manageable.url
    }
  }

  if (options.includeFarmerUploads) {
    const farmerImage = getFarmerUploadedImages(assets)[0]
    if (farmerImage) {
      return farmerImage.url
    }
  }

  const visible = getPublicDisplayImages(assets, options)
  return visible[0]?.url ?? null
}

export function getFarmerUploadedImages(assets: ProductMediaAsset[]) {
  return assets.filter(
    (asset) => asset.type === "image" && asset.uploadedBy === "farmer" && asset.status !== "ignored"
  )
}

export function getAdminUploadedImages(assets: ProductMediaAsset[]) {
  return assets.filter(
    (asset) => asset.type === "image" && asset.uploadedBy === "admin" && asset.status !== "ignored"
  )
}

export async function publishApprovedMediaForProduct(
  supabase: SupabaseClient<Database>,
  productId: string
) {
  const { error } = await supabase
    .from("product_media")
    .update({ is_public: true })
    .eq("product_id", productId)
    .eq("status", "approved")

  if (error) {
    throw new Error(error.message)
  }
}

export async function unpublishAllMediaForProduct(
  supabase: SupabaseClient<Database>,
  productId: string
) {
  const { error } = await supabase
    .from("product_media")
    .update({ is_public: false })
    .eq("product_id", productId)

  if (error) {
    throw new Error(error.message)
  }
}
