import { NextResponse, type NextRequest } from "next/server"

import { getOrCreateCart } from "@/lib/marketplace-repository"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    guestId?: string
    productId?: string
    quantity?: number
  }

  if (!body.productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const cart = await getOrCreateCart({ guestId: body.guestId, userId: user?.id })
    const quantity = Math.max(1, Math.floor(body.quantity ?? 1))
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .eq("product_id", body.productId)
      .maybeSingle()

    const result = existingItem
      ? await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity, updated_at: new Date().toISOString() })
          .eq("id", existingItem.id)
      : await supabase.from("cart_items").insert({
          cart_id: cart.id,
          product_id: body.productId,
          quantity,
        })

    if (result.error) {
      throw new Error(result.error.message)
    }

    return NextResponse.json({ ok: true, cartId: cart.id })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to add cart item" },
      { status: 400 }
    )
  }
}
