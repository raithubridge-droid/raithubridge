import { NextResponse, type NextRequest } from "next/server"

import { DB_REVIEW_STATUS } from "@/lib/domain"
import { SUPABASE_ENV_MESSAGE, hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"]

const PRODUCT_MEDIA_BUCKET = "product-media"
const MAX_PHOTOS = 6
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

function parseNumber(value: string) {
  const match = value.match(/\d[\d,]*(?:\.\d+)?/)
  return match ? Number(match[0].replace(/,/g, "")) : Number.NaN
}

function requiredString(body: FormData, key: string) {
  const value = body.get(key)

  return typeof value === "string" ? value.trim() : ""
}

function sanitizeFileName(fileName: string) {
  const cleaned = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return cleaned || "product-photo"
}

function getPhotoFiles(body: FormData) {
  return body
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0)
}

function validatePhotoFiles(files: File[]) {
  if (!files.length) {
    return null
  }

  if (files.length > MAX_PHOTOS) {
    return `Upload up to ${MAX_PHOTOS} product photos.`
  }

  if (files.some((file) => !ALLOWED_PHOTO_TYPES.has(file.type))) {
    return "Upload JPG, PNG, WebP, or GIF images only."
  }

  if (files.some((file) => file.size > MAX_PHOTO_SIZE_BYTES)) {
    return "Each product photo must be 5 MB or smaller."
  }

  return null
}

type MediaRowInsert = {
  product_id: string
  url: string
  storage_path: string
  media_type: "image"
  mime_type: string
  name: string
  size_bytes: number
  sort_order: number
  is_public: boolean
  is_primary: boolean
  uploaded_by: "farmer"
  status: "pending"
}

async function uploadProductPhotos(input: {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  productId: string
  photos: File[]
}) {
  const uploadedPaths: string[] = []
  const mediaRows: MediaRowInsert[] = []

  for (const [index, photo] of input.photos.entries()) {
    const storagePath = `${input.userId}/${input.productId}/${crypto.randomUUID()}-${sanitizeFileName(photo.name)}`
    const { error: uploadError } = await input.supabase.storage
      .from(PRODUCT_MEDIA_BUCKET)
      .upload(storagePath, photo, {
        cacheControl: "3600",
        contentType: photo.type,
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    uploadedPaths.push(storagePath)

    const { data: publicUrlData } = input.supabase.storage
      .from(PRODUCT_MEDIA_BUCKET)
      .getPublicUrl(storagePath)

        mediaRows.push({
          product_id: input.productId,
          url: publicUrlData.publicUrl,
          storage_path: storagePath,
          media_type: "image",
          mime_type: photo.type,
          name: photo.name,
          size_bytes: photo.size,
          sort_order: index,
          is_public: false,
          is_primary: index === 0,
          uploaded_by: "farmer",
          status: "pending",
        })
  }

  return { mediaRows, uploadedPaths }
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: SUPABASE_ENV_MESSAGE }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json(
      { error: "Sign in before submitting a product." },
      { status: 401 }
    )
  }

  const body = await request.formData().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: "Submit product details and photos as form data." }, { status: 400 })
  }

  const sellerName = requiredString(body, "sellerName")
  const sellerPhone = requiredString(body, "sellerPhone")
  const sellerVillageCity = requiredString(body, "sellerVillageCity")
  const sellerDistrict = requiredString(body, "sellerDistrict")
  const sellerState = requiredString(body, "sellerState")
  const productName = requiredString(body, "productName")
  const categoryId = requiredString(body, "categoryId")
  const quantityText = requiredString(body, "quantity")
  const unit = requiredString(body, "unit")
  const priceText = requiredString(body, "price")
  const description = requiredString(body, "description")
  const photos = getPhotoFiles(body)
  const photoError = validatePhotoFiles(photos)

  if (
    !sellerName ||
    !sellerPhone ||
    !sellerVillageCity ||
    !sellerDistrict ||
    !sellerState ||
    !productName ||
    !categoryId ||
    !quantityText ||
    !unit ||
    !priceText ||
    !description
  ) {
    return NextResponse.json({ error: "Fill all required product fields." }, { status: 400 })
  }

  if (photoError) {
    return NextResponse.json({ error: photoError }, { status: 400 })
  }

  const quantity = parseNumber(quantityText)
  const price = parseNumber(priceText)

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "Enter a valid quantity." }, { status: 400 })
  }

  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Enter a valid price." }, { status: 400 })
  }

  try {
    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id, name")
      .eq("id", categoryId)
      .maybeSingle()

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Choose a valid category from the list." },
        { status: 400 }
      )
    }

    const productSlug = `${productName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}-${Date.now().toString(36)}`
    const sellerLocation = [sellerVillageCity, sellerDistrict, sellerState].filter(Boolean).join(", ")
    const productId = crypto.randomUUID()

    const productInsert: ProductInsert = {
      id: productId,
      seller_id: user.id,
      seller_name: sellerName,
      seller_phone: sellerPhone,
      seller_village_city: sellerVillageCity,
      seller_district: sellerDistrict,
      seller_state: sellerState,
      name: productName,
      category_id: existingCategory.id,
      description,
      price,
      unit,
      quantity_available: quantity,
      status: DB_REVIEW_STATUS.pendingReview,
      review_status: DB_REVIEW_STATUS.pendingReview,
      availability_status: "Active",
      is_active: true,
      slug: productSlug,
      seller_location: sellerLocation,
      unit_size: unit,
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert(productInsert)
      .select("id, status, review_status, availability_status")
      .single()

    if (productError || !product) {
      throw new Error(productError?.message ?? "Unable to save product submission.")
    }

    if (photos.length) {
      let uploadedPaths: string[] = []

      try {
        const uploadResult = await uploadProductPhotos({
          supabase,
          userId: user.id,
          productId,
          photos,
        })
        uploadedPaths = uploadResult.uploadedPaths

        if (uploadResult.mediaRows.length) {
          const { error: mediaError } = await supabase
            .from("product_media")
            .insert(uploadResult.mediaRows)

          if (mediaError) {
            throw mediaError
          }
        }
      } catch {
        if (uploadedPaths.length) {
          await supabase.storage.from(PRODUCT_MEDIA_BUCKET).remove(uploadedPaths)
        }
        // Storage is optional — product submission still succeeds without photos.
      }
    }

    return NextResponse.json({
      product,
      message: "Product submitted for review.",
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit product." },
      { status: 400 }
    )
  }
}
