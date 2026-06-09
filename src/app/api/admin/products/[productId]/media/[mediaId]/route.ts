import { NextResponse, type NextRequest } from "next/server"

import { replaceProductImage } from "@/lib/admin-product-media-server"
import { createClient } from "@/lib/supabase/server"

type AdminMediaReplaceRouteContext = {
  params: Promise<{
    productId: string
    mediaId: string
  }>
}

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

export async function POST(request: NextRequest, { params }: AdminMediaReplaceRouteContext) {
  const { productId, mediaId } = await params
  const auth = await requireAdmin()

  if ("error" in auth && auth.error) {
    return auth.error
  }

  const formData = await request.formData()
  const photo = formData.get("photo")

  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "Choose a replacement image." }, { status: 400 })
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

    await replaceProductImage({
      supabase: auth.supabase,
      productId,
      mediaId,
      adminUserId: auth.userId,
      file: photo,
      product,
    })

    return NextResponse.json({
      ok: true,
      message: "Image replaced successfully.",
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to replace image." },
      { status: 400 }
    )
  }
}
