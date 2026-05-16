import { NextResponse, type NextRequest } from "next/server"

import { getOrCreateCart, getProducts } from "@/lib/marketplace-repository"
import { createClient } from "@/lib/supabase/server"

const SIGN_IN_CART_MESSAGE = "Sign in to use your cart."

export async function GET(request: NextRequest) {
  void request

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: SIGN_IN_CART_MESSAGE }, { status: 401 })
    }

    const cart = await getOrCreateCart({ userId: user.id })
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select("product_id, quantity")
      .eq("cart_id", cart.id)

    if (error) {
      throw new Error(error.message)
    }

    const items = (cartItems ?? []).map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
    }))
    const products = await getProducts(items.map((item) => item.productId))

    return NextResponse.json({ cartId: cart.id, items, products })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load cart." },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  void request

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: SIGN_IN_CART_MESSAGE }, { status: 401 })
    }

    const cart = await getOrCreateCart({ userId: user.id })
    const { error } = await supabase.from("cart_items").delete().eq("cart_id", cart.id)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to clear cart" },
      { status: 400 }
    )
  }
}
