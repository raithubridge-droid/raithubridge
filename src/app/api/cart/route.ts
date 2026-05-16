import { NextResponse, type NextRequest } from "next/server"

import { getOrCreateCart, getProducts } from "@/lib/marketplace-repository"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const guestId = request.nextUrl.searchParams.get("guestId") ?? undefined

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const cart = await getOrCreateCart({ guestId, userId: user?.id })
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
  } catch {
    return NextResponse.json({ cartId: null, items: [], products: [] })
  }
}

export async function DELETE(request: NextRequest) {
  const guestId = request.nextUrl.searchParams.get("guestId") ?? undefined

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const cart = await getOrCreateCart({ guestId, userId: user?.id })
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
