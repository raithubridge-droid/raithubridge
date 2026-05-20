import { NextResponse, type NextRequest } from "next/server"

import { replaceProductImage } from "@/lib/admin-product-media-server"
import { getCurrentProfile } from "@/lib/auth/roles"
import { createClient } from "@/lib/supabase/server"

type RouteContext = {
  params: Promise<{
    productId: string
    mediaId: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { productId, mediaId } = await params
  const { user, profile } = await getCurrentProfile()

  if (!user) {
    return NextResponse.json({ error: "Sign in as admin first." }, { status: 401 })
  }

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access is required." }, { status: 403 })
  }

  const formData = await request.formData()
  const photo = formData.get("photo")

  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "Choose a replacement image." }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("review_status, is_active")
      .eq("id", productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    await replaceProductImage({
      supabase,
      productId,
      mediaId,
      adminUserId: user.id,
      file: photo,
      product,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to replace image." },
      { status: 400 }
    )
  }
}
