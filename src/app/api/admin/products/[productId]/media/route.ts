import { NextResponse, type NextRequest } from "next/server"

import {
  MAX_PRODUCT_IMAGES,
  PRODUCT_MEDIA_BUCKET,
  sanitizeFileName,
  validateImageFile,
} from "@/lib/admin-product-media-server"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"

type AdminMediaRouteContext = {
  params: Promise<{
    productId: string
  }>
}

type MediaAction = "approve" | "ignore" | "set_primary"

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: "Sign in as admin first." }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access is required." }, { status: 403 }) }
  }

  return { supabase, userId: user.id }
}

export async function PATCH(request: NextRequest, { params }: AdminMediaRouteContext) {
  const { productId } = await params
  const body = (await request.json().catch(() => ({}))) as {
    action?: MediaAction
    mediaId?: string
  }

  if (!body.mediaId || !body.action) {
    return NextResponse.json({ error: "Choose a media action and image." }, { status: 400 })
  }

  const auth = await requireAdmin()
  if ("error" in auth && auth.error) {
    return auth.error
  }

  const { data: mediaRow, error: mediaError } = await auth.supabase
    .from("product_media")
    .select("id, product_id")
    .eq("id", body.mediaId)
    .eq("product_id", productId)
    .maybeSingle()

  if (mediaError || !mediaRow) {
    return NextResponse.json({ error: "Image not found for this product." }, { status: 404 })
  }

  try {
    if (body.action === "set_primary") {
      await auth.supabase
        .from("product_media")
        .update({ is_primary: false })
        .eq("product_id", productId)

      const { error } = await auth.supabase
        .from("product_media")
        .update({ is_primary: true, status: "approved" })
        .eq("id", body.mediaId)

      if (error) {
        throw new Error(error.message)
      }
    } else if (body.action === "approve") {
      const { error } = await auth.supabase
        .from("product_media")
        .update({ status: "approved", is_public: false })
        .eq("id", body.mediaId)

      if (error) {
        throw new Error(error.message)
      }
    } else if (body.action === "ignore") {
      const { error } = await auth.supabase
        .from("product_media")
        .update({ status: "ignored", is_public: false, is_primary: false })
        .eq("id", body.mediaId)

      if (error) {
        throw new Error(error.message)
      }
    } else {
      return NextResponse.json({ error: "Invalid media action." }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update image." },
      { status: 400 }
    )
  }
}

export async function POST(request: NextRequest, { params }: AdminMediaRouteContext) {
  const { productId } = await params
  const auth = await requireAdmin()

  if ("error" in auth && auth.error) {
    return auth.error
  }

  const formData = await request.formData()
  const photo = formData.get("photo")

  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 })
  }

  const validationError = validateImageFile(photo)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const { count, error: countError } = await auth.supabase
    .from("product_media")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId)
    .neq("status", "ignored")

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 400 })
  }

  if ((count ?? 0) >= MAX_PRODUCT_IMAGES) {
    return NextResponse.json(
      { error: `Each product can have up to ${MAX_PRODUCT_IMAGES} images.` },
      { status: 400 }
    )
  }

  const sortOrder = count ?? 0
  const storagePath = `${auth.userId}/${productId}/admin-${crypto.randomUUID()}-${sanitizeFileName(photo.name)}`

  const { error: uploadError } = await auth.supabase.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .upload(storagePath, photo, {
      contentType: photo.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 })
  }

  const { data: publicUrlData } = auth.supabase.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .getPublicUrl(storagePath)

  const insert: Database["public"]["Tables"]["product_media"]["Insert"] = {
    product_id: productId,
    url: publicUrlData.publicUrl,
    storage_path: storagePath,
    media_type: "image",
    mime_type: photo.type,
    name: photo.name,
    size_bytes: photo.size,
    sort_order: sortOrder,
    is_public: false,
    is_primary: sortOrder === 0,
    uploaded_by: "admin",
    status: "approved",
  }

  const { data, error } = await auth.supabase.from("product_media").insert(insert).select("id").single()

  if (error || !data) {
    await auth.supabase.storage.from(PRODUCT_MEDIA_BUCKET).remove([storagePath])
    return NextResponse.json({ error: error?.message ?? "Unable to save image." }, { status: 400 })
  }

  return NextResponse.json({ mediaId: data.id })
}
