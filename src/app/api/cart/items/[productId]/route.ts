import { NextResponse, type NextRequest } from "next/server"

import { getOrCreateCart } from "@/lib/marketplace-repository"
import { createClient } from "@/lib/supabase/server"

const SIGN_IN_CART_MESSAGE = "Sign in to use your cart."

type CartItemRouteContext = {
  params: Promise<{
    productId: string
  }>
}

async function resolveCart(request: NextRequest) {
  void request
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error(SIGN_IN_CART_MESSAGE)
  }

  const cart = await getOrCreateCart({ userId: user.id })

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
    const message = error instanceof Error ? error.message : "Unable to update cart item"
    return NextResponse.json(
      { error: message },
      { status: message === SIGN_IN_CART_MESSAGE ? 401 : 400 }
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
    const message = error instanceof Error ? error.message : "Unable to remove cart item"
    return NextResponse.json(
      { error: message },
      { status: message === SIGN_IN_CART_MESSAGE ? 401 : 400 }
    )
  }
}
