import { NextResponse, type NextRequest } from "next/server"

import {
  addProductImage,
  deleteProductImage,
  getProductWithMedia,
  setProductPrimaryImage,
} from "@/lib/admin-product-media-server"
import { getCurrentProfile } from "@/lib/auth/roles"
import { createClient } from "@/lib/supabase/server"

type RouteContext = {
  params: Promise<{
    productId: string
  }>
}

async function requireAdmin() {
  const { user, profile } = await getCurrentProfile()

  if (!user) {
    return { error: NextResponse.json({ error: "Sign in as admin first." }, { status: 401 }) }
  }

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access is required." }, { status: 403 }) }
  }

  const supabase = await createClient()
  return { supabase, userId: user.id }
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { productId } = await params
  const auth = await requireAdmin()

  if ("error" in auth && auth.error) {
    return auth.error
  }

  try {
    const product = await getProductWithMedia(auth.supabase, productId)

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load images." },
      { status: 400 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
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

  try {
    const { data: product, error: productError } = await auth.supabase
      .from("products")
      .select("review_status, is_active")
      .eq("id", productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    const mediaId = await addProductImage({
      supabase: auth.supabase,
      productId,
      adminUserId: auth.userId,
      file: photo,
      product,
    })

    return NextResponse.json({ mediaId })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload image." },
      { status: 400 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { productId } = await params
  const auth = await requireAdmin()

  if ("error" in auth && auth.error) {
    return auth.error
  }

  const body = (await request.json().catch(() => ({}))) as {
    action?: "set_primary"
    mediaId?: string
  }

  if (body.action !== "set_primary" || !body.mediaId) {
    return NextResponse.json({ error: "Choose an image to set as primary." }, { status: 400 })
  }

  try {
    const { data: product, error: productError } = await auth.supabase
      .from("products")
      .select("review_status, is_active")
      .eq("id", productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    await setProductPrimaryImage(auth.supabase, productId, body.mediaId, product)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update image." },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { productId } = await params
  const auth = await requireAdmin()

  if ("error" in auth && auth.error) {
    return auth.error
  }

  const mediaId = request.nextUrl.searchParams.get("mediaId")

  if (!mediaId) {
    return NextResponse.json({ error: "Choose an image to delete." }, { status: 400 })
  }

  try {
    await deleteProductImage(auth.supabase, productId, mediaId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete image." },
      { status: 400 }
    )
  }
}
