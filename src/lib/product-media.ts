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

export const DEFAULT_PRODUCT_PLACEHOLDER_URL = "/images/categories/other.png"

const CATEGORY_PLACEHOLDER_IMAGE_URLS: Record<CategoryPlaceholderKey, string> = {
  Grains: "/images/categories/grains.jpg",
  Oils: "/images/categories/other.png",
  Spices: "/images/categories/spices.png",
  Vegetables: "/images/categories/vegetables.png",
  Other: DEFAULT_PRODUCT_PLACEHOLDER_URL,
}

const PLACEHOLDER_STYLES: Record<
  CategoryPlaceholderKey,
  { label: string; emoji: string; className: string; imageUrl: string }
> = {
  Grains: {
    label: "Grains",
    emoji: "🌾",
    className: "bg-amber-100 text-amber-900",
    imageUrl: CATEGORY_PLACEHOLDER_IMAGE_URLS.Grains,
  },
  Oils: {
    label: "Oils",
    emoji: "🫒",
    className: "bg-lime-100 text-lime-900",
    imageUrl: CATEGORY_PLACEHOLDER_IMAGE_URLS.Oils,
  },
  Spices: {
    label: "Spices",
    emoji: "🌶️",
    className: "bg-orange-100 text-orange-900",
    imageUrl: CATEGORY_PLACEHOLDER_IMAGE_URLS.Spices,
  },
  Vegetables: {
    label: "Vegetables",
    emoji: "🥬",
    className: "bg-emerald-100 text-emerald-900",
    imageUrl: CATEGORY_PLACEHOLDER_IMAGE_URLS.Vegetables,
  },
  Other: {
    label: "Farm product",
    emoji: "🌱",
    className: "bg-stone-100 text-stone-700",
    imageUrl: CATEGORY_PLACEHOLDER_IMAGE_URLS.Other,
  },
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

export function getCategoryPlaceholderImageUrl(category: string) {
  const normalized = category.trim().toLowerCase()

  if (
    normalized.includes("pulse") ||
    normalized.includes("dal") ||
    normalized.includes("lentil") ||
    normalized.includes("bean")
  ) {
    return "/images/categories/pulses.jpg"
  }

  if (normalized.includes("fruit")) {
    return "/images/categories/fruits.jpg"
  }

  if (
    normalized.includes("dairy") ||
    normalized.includes("milk") ||
    normalized.includes("ghee") ||
    normalized.includes("curd")
  ) {
    return "/images/categories/dairy.jpg"
  }

  return PLACEHOLDER_STYLES[normalizeCategoryPlaceholder(category)].imageUrl
}

export function resolveProductImageSrc(
  category: string,
  imageUrl?: string | null
) {
  const placeholderUrl = getCategoryPlaceholderImageUrl(category)
  return imageUrl?.trim() ? imageUrl : placeholderUrl
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

export function getFarmerUploadedVideos(assets: ProductMediaAsset[]) {
  return assets.filter(
    (asset) => asset.type === "video" && asset.uploadedBy === "farmer" && asset.status !== "ignored"
  )
}

export function getFarmerSubmissionMedia(assets: ProductMediaAsset[]) {
  return assets.filter(
    (asset) => asset.uploadedBy === "farmer" && asset.status !== "ignored"
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

export async function approveAllPendingFarmerMediaForProduct(
  supabase: SupabaseClient<Database>,
  productId: string
) {
  const { error: approveError } = await supabase
    .from("product_media")
    .update({ status: "approved" })
    .eq("product_id", productId)
    .eq("uploaded_by", "farmer")
    .eq("status", "pending")

  if (approveError) {
    throw new Error(approveError.message)
  }

  const { data: approvedImages, error: readError } = await supabase
    .from("product_media")
    .select("id, is_primary")
    .eq("product_id", productId)
    .eq("status", "approved")
    .eq("media_type", "image")
    .order("sort_order", { ascending: true })

  if (readError) {
    throw new Error(readError.message)
  }

  const hasPrimary = approvedImages?.some((image) => image.is_primary)

  if (approvedImages?.length && !hasPrimary) {
    const { error: primaryError } = await supabase
      .from("product_media")
      .update({ is_primary: true })
      .eq("id", approvedImages[0].id)

    if (primaryError) {
      throw new Error(primaryError.message)
    }
  }

  await publishApprovedMediaForProduct(supabase, productId)
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
