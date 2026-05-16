import { NextResponse, type NextRequest } from "next/server"

import { SUPABASE_ENV_MESSAGE, hasSupabaseEnv } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

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
  const sellerWhatsapp = requiredString(body, "sellerWhatsapp")
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
    !sellerWhatsapp ||
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
    const uploadedPaths: string[] = []
    const mediaRows = []

    try {
      for (const [index, photo] of photos.entries()) {
        const storagePath = `${user.id}/${productId}/${crypto.randomUUID()}-${sanitizeFileName(photo.name)}`
        const { error: uploadError } = await supabase.storage
          .from(PRODUCT_MEDIA_BUCKET)
          .upload(storagePath, photo, {
            cacheControl: "3600",
            contentType: photo.type,
            upsert: false,
          })

        if (uploadError) {
          throw new Error(uploadError.message)
        }

        uploadedPaths.push(storagePath)

        const { data: publicUrlData } = supabase.storage
          .from(PRODUCT_MEDIA_BUCKET)
          .getPublicUrl(storagePath)

        mediaRows.push({
          product_id: productId,
          url: publicUrlData.publicUrl,
          storage_path: storagePath,
          media_type: "image" as const,
          mime_type: photo.type,
          name: photo.name,
          size_bytes: photo.size,
          sort_order: index,
        })
      }
    } catch (uploadError) {
      if (uploadedPaths.length) {
        await supabase.storage.from(PRODUCT_MEDIA_BUCKET).remove(uploadedPaths)
      }

      throw uploadError
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        id: productId,
        category_id: existingCategory.id,
        description,
        delivery_info: "Seller will confirm pickup or delivery details after admin review.",
        is_active: true,
        name: productName,
        price,
        quantity_available: quantity,
        review_status: "Pending Review",
        availability_status: "Inactive",
        seller_id: user.id,
        seller_info: "Seller contact details are available to admins for review.",
        seller_location: sellerLocation,
        seller_name: sellerName,
        seller_phone: sellerPhone,
        seller_whatsapp: sellerWhatsapp,
        slug: productSlug,
        status: "Pending Review",
        unit,
        unit_size: unit,
        seller_village_city: sellerVillageCity,
        seller_district: sellerDistrict,
        seller_state: sellerState,
      })
      .select("id, status, review_status, availability_status")
      .single()

    if (productError || !product) {
      if (uploadedPaths.length) {
        await supabase.storage.from(PRODUCT_MEDIA_BUCKET).remove(uploadedPaths)
      }

      throw new Error(productError?.message ?? "Unable to save product submission.")
    }

    try {
      if (mediaRows.length) {
        const { error: mediaError } = await supabase.from("product_media").insert(mediaRows)

        if (mediaError) {
          throw new Error(mediaError.message)
        }
      }
    } catch (mediaError) {
      if (uploadedPaths.length) {
        await supabase.storage.from(PRODUCT_MEDIA_BUCKET).remove(uploadedPaths)
      }

      throw mediaError
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
