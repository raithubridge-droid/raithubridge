import type { SupabaseClient } from "@supabase/supabase-js"

import { normalizeReviewStatus } from "@/lib/domain"
import { getManageableImages, mapMediaRowToAsset } from "@/lib/product-media"
import type { Database } from "@/types/database"

export const PRODUCT_MEDIA_BUCKET = "product-media"
export const MAX_PRODUCT_IMAGES = 5
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
])

type ProductRow = Database["public"]["Tables"]["products"]["Row"]
type MediaRow = Database["public"]["Tables"]["product_media"]["Row"]

export function sanitizeFileName(fileName: string) {
  const cleaned = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return cleaned || "product-photo"
}

export function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Upload JPG, JPEG, PNG, or WebP images only."
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "Each image must be 5 MB or smaller."
  }

  return null
}

function isApprovedProduct(product: Pick<ProductRow, "review_status" | "is_active">) {
  return product.is_active && normalizeReviewStatus(product.review_status) === "Approved"
}

export async function getProductWithMedia(
  supabase: SupabaseClient<Database>,
  productId: string
) {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, review_status, is_active, category_id, unit, price, quantity_available")
    .eq("id", productId)
    .maybeSingle()

  if (productError || !product) {
    return null
  }

  let categoryName = "Farm products"

  if (product.category_id) {
    const { data: category } = await supabase
      .from("categories")
      .select("name")
      .eq("id", product.category_id)
      .maybeSingle()

    if (category?.name) {
      categoryName = category.name
    }
  }

  const { data: mediaRows, error: mediaError } = await supabase
    .from("product_media")
    .select("*")
    .eq("product_id", productId)
    .eq("media_type", "image")
    .neq("status", "ignored")
    .order("sort_order", { ascending: true })

  if (mediaError) {
    throw new Error(mediaError.message)
  }

  const mediaAssets = (mediaRows ?? []).map((row) => mapMediaRowToAsset(row as MediaRow))

  return {
    id: product.id,
    name: product.name,
    category: categoryName,
    reviewStatus: product.review_status,
    isApproved: isApprovedProduct(product),
    mediaAssets: getManageableImages(mediaAssets),
  }
}

async function countActiveImages(supabase: SupabaseClient<Database>, productId: string) {
  const { count, error } = await supabase
    .from("product_media")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId)
    .eq("media_type", "image")
    .neq("status", "ignored")

  if (error) {
    throw new Error(error.message)
  }

  return count ?? 0
}

async function uploadToStorage(
  supabase: SupabaseClient<Database>,
  storagePath: string,
  file: File
) {
  const { error } = await supabase.storage.from(PRODUCT_MEDIA_BUCKET).upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

async function removeFromStorage(supabase: SupabaseClient<Database>, storagePath: string | null) {
  if (!storagePath) {
    return
  }

  await supabase.storage.from(PRODUCT_MEDIA_BUCKET).remove([storagePath])
}

export async function addProductImage(input: {
  supabase: SupabaseClient<Database>
  productId: string
  adminUserId: string
  file: File
  product: Pick<ProductRow, "review_status" | "is_active">
}) {
  const validationError = validateImageFile(input.file)
  if (validationError) {
    throw new Error(validationError)
  }

  const imageCount = await countActiveImages(input.supabase, input.productId)
  if (imageCount >= MAX_PRODUCT_IMAGES) {
    throw new Error(`Each product can have up to ${MAX_PRODUCT_IMAGES} images.`)
  }

  const sortOrder = imageCount
  const storagePath = `${input.adminUserId}/${input.productId}/inventory-${crypto.randomUUID()}-${sanitizeFileName(input.file.name)}`
  const publicUrl = await uploadToStorage(input.supabase, storagePath, input.file)
  const approvedProduct = isApprovedProduct(input.product)

  const insert: Database["public"]["Tables"]["product_media"]["Insert"] = {
    product_id: input.productId,
    url: publicUrl,
    storage_path: storagePath,
    media_type: "image",
    mime_type: input.file.type,
    name: input.file.name,
    size_bytes: input.file.size,
    sort_order: sortOrder,
    is_public: approvedProduct,
    is_primary: imageCount === 0,
    uploaded_by: "admin",
    status: "approved",
  }

  const { data, error } = await input.supabase
    .from("product_media")
    .insert(insert)
    .select("id")
    .single()

  if (error || !data) {
    await removeFromStorage(input.supabase, storagePath)
    throw new Error(error?.message ?? "Unable to save image.")
  }

  return data.id
}

export async function replaceProductImage(input: {
  supabase: SupabaseClient<Database>
  productId: string
  mediaId: string
  adminUserId: string
  file: File
  product: Pick<ProductRow, "review_status" | "is_active">
}) {
  const validationError = validateImageFile(input.file)
  if (validationError) {
    throw new Error(validationError)
  }

  const { data: existing, error: existingError } = await input.supabase
    .from("product_media")
    .select("*")
    .eq("id", input.mediaId)
    .eq("product_id", input.productId)
    .maybeSingle()

  if (existingError || !existing) {
    throw new Error("Image not found for this product.")
  }

  const storagePath = `${input.adminUserId}/${input.productId}/inventory-${crypto.randomUUID()}-${sanitizeFileName(input.file.name)}`
  const publicUrl = await uploadToStorage(input.supabase, storagePath, input.file)
  const approvedProduct = isApprovedProduct(input.product)

  const { error } = await input.supabase
    .from("product_media")
    .update({
      url: publicUrl,
      storage_path: storagePath,
      mime_type: input.file.type,
      name: input.file.name,
      size_bytes: input.file.size,
      status: "approved",
      uploaded_by: "admin",
      is_public: approvedProduct ? true : existing.is_public,
    })
    .eq("id", input.mediaId)

  if (error) {
    await removeFromStorage(input.supabase, storagePath)
    throw new Error(error.message)
  }

  await removeFromStorage(input.supabase, existing.storage_path)
}

export async function setProductPrimaryImage(
  supabase: SupabaseClient<Database>,
  productId: string,
  mediaId: string,
  product: Pick<ProductRow, "review_status" | "is_active">
) {
  const approvedProduct = isApprovedProduct(product)

  await supabase.from("product_media").update({ is_primary: false }).eq("product_id", productId)

  const { error } = await supabase
    .from("product_media")
    .update({
      is_primary: true,
      status: "approved",
      is_public: approvedProduct,
    })
    .eq("id", mediaId)
    .eq("product_id", productId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function deleteProductImage(
  supabase: SupabaseClient<Database>,
  productId: string,
  mediaId: string
) {
  const { data: existing, error: existingError } = await supabase
    .from("product_media")
    .select("*")
    .eq("id", mediaId)
    .eq("product_id", productId)
    .maybeSingle()

  if (existingError || !existing) {
    throw new Error("Image not found for this product.")
  }

  const wasPrimary = existing.is_primary

  const { error } = await supabase.from("product_media").delete().eq("id", mediaId)

  if (error) {
    throw new Error(error.message)
  }

  await removeFromStorage(supabase, existing.storage_path)

  if (!wasPrimary) {
    return
  }

  const { data: nextImage } = await supabase
    .from("product_media")
    .select("id")
    .eq("product_id", productId)
    .eq("media_type", "image")
    .neq("status", "ignored")
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (nextImage?.id) {
    await supabase
      .from("product_media")
      .update({ is_primary: true })
      .eq("id", nextImage.id)
  }
}
