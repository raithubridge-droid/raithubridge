import { NextResponse, type NextRequest } from "next/server"

import { getOrCreateCart, getProducts } from "@/lib/marketplace-repository"
import { createClient } from "@/lib/supabase/server"

function formatApiError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback
  }

  return error.message.includes("Supabase client")
    ? "Supabase is not configured yet. Add the project URL and anon key before creating orders."
    : error.message
}

function parsePrice(price: string) {
  const match = price.match(/\d[\d,]*(?:\.\d+)?/)
  return match ? Number(match[0].replace(/,/g, "")) : 0
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ orders: [] }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ orders: data ?? [] })
  } catch (error) {
    return NextResponse.json(
      { error: formatApiError(error, "Unable to load orders") },
      { status: 400 }
    )
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    guestId?: string
    customerName?: string
    customerPhone?: string
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Sign in before checkout to create an order." },
        { status: 401 }
      )
    }

    const cart = await getOrCreateCart({ guestId: body.guestId, userId: user.id })
    const { data: cartItems, error: cartItemsError } = await supabase
      .from("cart_items")
      .select("product_id, quantity")
      .eq("cart_id", cart.id)

    if (cartItemsError) {
      throw new Error(cartItemsError.message)
    }

    if (!cartItems?.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 })
    }

    const products = await getProducts(cartItems.map((item) => item.product_id))
    const productsById = new Map(products.map((product) => [product.id, product]))
    const items = cartItems.map((item) => {
      const product = productsById.get(item.product_id)
      const unitPrice = product ? parsePrice(product.price) : 0

      return {
        productId: item.product_id,
        name: product?.name ?? "Product",
        price: unitPrice,
        quantity: item.quantity,
        unit: product?.unit ?? "",
      }
    })
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        cart_id: cart.id,
        currency: "INR",
        customer_email: user.email ?? null,
        customer_name: body.customerName ?? null,
        customer_phone: body.customerPhone ?? null,
        items,
        status: "pending",
        subtotal_amount: subtotal,
        user_id: user.id,
      })
      .select("*")
      .single()

    if (orderError || !order) {
      throw new Error(orderError?.message ?? "Unable to create order.")
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        amount: subtotal,
        currency: "INR",
        order_id: order.id,
        provider: "manual",
        status: "pending",
      })
      .select("*")
      .single()

    if (paymentError || !payment) {
      throw new Error(paymentError?.message ?? "Unable to create payment.")
    }

    await supabase
      .from("carts")
      .update({ status: "converted", updated_at: new Date().toISOString() })
      .eq("id", cart.id)

    return NextResponse.json({ order, payment })
  } catch (error) {
    return NextResponse.json(
      { error: formatApiError(error, "Unable to create order") },
      { status: 400 }
    )
  }
}
