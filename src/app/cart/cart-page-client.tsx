/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"

import { useCart } from "@/components/cart/cart-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { APPROVED_PRODUCTS, type ApprovedProduct } from "@/lib/marketplace-data"
import { shouldUseSampleData } from "@/lib/supabase/env"

function parsePrice(price: string) {
  const match = price.match(/\d[\d,]*(?:\.\d+)?/)
  return match ? Number(match[0].replace(/,/g, "")) : 0
}

export function CartPageClient() {
  const { items, updateItem, removeItem, clearCart, syncItems } = useCart()
  const [products, setProducts] = React.useState<ApprovedProduct[]>(
    shouldUseSampleData() ? APPROVED_PRODUCTS : []
  )
  const [checkoutMessage, setCheckoutMessage] = React.useState<string | null>(null)
  const [isCheckingOut, setIsCheckingOut] = React.useState(false)
  const itemIds = React.useMemo(() => items.map((item) => item.productId), [items])

  React.useEffect(() => {
    let isMounted = true

    async function loadCart() {
      try {
        const response = await fetch("/api/cart")
        const payload = (await response.json()) as {
          items?: { productId: string; quantity: number }[]
          products?: ApprovedProduct[]
        }

        if (!isMounted) {
          return
        }

        if (payload.items?.length) {
          syncItems(payload.items)
        }

        if (payload.products?.length) {
          setProducts((current) => {
            const byId = new Map(current.map((product) => [product.id, product]))
            payload.products?.forEach((product) => byId.set(product.id, product))
            return Array.from(byId.values())
          })
        }
      } catch {
        // Keep local cart data when Supabase is not configured.
      }
    }

    void loadCart()

    return () => {
      isMounted = false
    }
  }, [syncItems])

  React.useEffect(() => {
    if (!itemIds.length) {
      return
    }

    let isMounted = true

    async function loadProducts() {
      try {
        const response = await fetch(`/api/products?ids=${itemIds.map(encodeURIComponent).join(",")}`)
        const payload = (await response.json()) as { products?: ApprovedProduct[] }

        if (isMounted && payload.products?.length) {
          setProducts((current) => {
            const byId = new Map(current.map((product) => [product.id, product]))
            payload.products?.forEach((product) => byId.set(product.id, product))
            return Array.from(byId.values())
          })
        }
      } catch {
        // Keep sample product details for local-only cart rows.
      }
    }

    void loadProducts()

    return () => {
      isMounted = false
    }
  }, [itemIds])

  const cartItems = items
    .map((item) => ({
      cart: item,
      product: products.find((product) => product.id === item.productId),
    }))
    .filter((item): item is { cart: { productId: string; quantity: number }; product: ApprovedProduct } =>
      Boolean(item.product)
    )

  const estimatedTotal = cartItems.reduce(
    (sum, item) => sum + parsePrice(item.product.price) * item.cart.quantity,
    0
  )

  async function createOrder() {
    setCheckoutMessage(null)
    setIsCheckingOut(true)

    try {
      const response = await fetch("/api/orders", {
        body: JSON.stringify({}),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      })
      const payload = (await response.json()) as {
        error?: string
        order?: { id: string }
      }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create order.")
      }

      setCheckoutMessage(`Order ${payload.order?.id.slice(0, 8) ?? ""} created with pending payment.`)
      clearCart()
    } catch (error) {
      setCheckoutMessage(
        error instanceof Error ? error.message : "Unable to create order."
      )
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (!cartItems.length) {
    return (
      <main className="px-4 py-14 sm:py-20">
        <Card className="mx-auto max-w-2xl border-border/70 bg-card/95 text-center shadow-lg ring-1 ring-primary/5">
          <CardHeader>
            <CardTitle className="text-3xl">Your cart is empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">
              Add products from the catalog to compare quantities and prepare your purchase.
            </p>
            <Button asChild className="mt-8 h-11 rounded-xl px-6 text-base font-semibold">
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="px-4 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">Cart</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Sign in to sync cart items and create orders from your selected products.
            </p>
          </div>
          <Button variant="outline" className="h-11 rounded-xl px-5 text-base" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-5">
            {cartItems.map(({ cart, product }) => (
              <Card key={product.id} className="border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5">
                <CardContent className="grid gap-5 p-5 sm:grid-cols-[8rem_1fr]">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-muted"
                  >
                    {product.mediaAssets[0]?.type === "image" ? (
                      <img
                        src={product.mediaAssets[0].url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-4 text-center text-sm font-semibold text-muted-foreground">
                        Product media
                      </span>
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <Link
                          href={`/products/${product.id}`}
                          className="text-2xl font-semibold text-foreground hover:text-primary"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-1 text-base text-muted-foreground">
                          {product.sellerName} · {product.sellerLocation}
                        </p>
                      </div>
                      <Badge className="w-fit">{product.status}</Badge>
                    </div>
                    <div className="grid gap-4 text-base sm:grid-cols-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Price
                        </p>
                        <p className="mt-1 font-semibold text-foreground">{product.price}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Unit size
                        </p>
                        <p className="mt-1 text-foreground">{product.unitSize}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Available
                        </p>
                        <p className="mt-1 text-foreground">
                          {product.quantity} {product.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-11 items-center overflow-hidden rounded-xl border border-border bg-background">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-11 rounded-none"
                          aria-label={`Decrease quantity for ${product.name}`}
                          onClick={() => updateItem(product.id, cart.quantity - 1)}
                        >
                          <Minus className="size-4" aria-hidden />
                        </Button>
                        <span className="min-w-12 text-center text-base font-semibold">
                          {cart.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-11 rounded-none"
                          aria-label={`Increase quantity for ${product.name}`}
                          onClick={() => updateItem(product.id, cart.quantity + 1)}
                        >
                          <Plus className="size-4" aria-hidden />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeItem(product.id)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit border-border/70 bg-card/95 shadow-lg ring-1 ring-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Cart summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-base">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Items</span>
                <span className="font-semibold text-foreground">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Estimated product total</span>
                <span className="font-semibold text-foreground">Rs. {estimatedTotal.toLocaleString("en-IN")}</span>
              </div>
              <p className="rounded-xl bg-muted/70 p-4 text-sm text-muted-foreground">
                Continue creates a pending order and payment record for signed-in users.
                Guest carts remain saved in this browser.
              </p>
              {checkoutMessage ? (
                <p className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  {checkoutMessage}
                </p>
              ) : null}
              <Button
                className="h-12 w-full rounded-xl text-base font-semibold"
                disabled={isCheckingOut}
                onClick={createOrder}
              >
                {isCheckingOut ? "Creating order..." : "Continue"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
