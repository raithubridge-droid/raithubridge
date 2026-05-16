import { NextResponse, type NextRequest } from "next/server"

import { getOrCreateCart } from "@/lib/marketplace-repository"
import { createClient } from "@/lib/supabase/server"

type CartItemRouteContext = {
  params: Promise<{
    productId: string
  }>
}

async function resolveCart(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const guestId = request.nextUrl.searchParams.get("guestId") ?? undefined
  const cart = await getOrCreateCart({ guestId, userId: user?.id })

  return { cart, supabase }
}

export async function PATCH(request: NextRequest, { params }: CartItemRouteContext) {
  const { productId } = await params
  const body = (await request.json()) as { quantity?: number }

  try {
    const { cart, supabase } = await resolveCart(request)
    const quantity = Math.max(0, Math.floor(body.quantity ?? 0))
    const result =
      quantity > 0
        ? await supabase
            .from("cart_items")
            .update({ quantity, updated_at: new Date().toISOString() })
            .eq("cart_id", cart.id)
            .eq("product_id", productId)
        : await supabase
            .from("cart_items")
            .delete()
            .eq("cart_id", cart.id)
            .eq("product_id", productId)

    if (result.error) {
      throw new Error(result.error.message)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update cart item" },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: CartItemRouteContext) {
  const { productId } = await params

  try {
    const { cart, supabase } = await resolveCart(request)
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id)
      .eq("product_id", productId)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to remove cart item" },
      { status: 400 }
    )
  }
}
