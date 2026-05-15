/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"

import { useCart } from "@/components/cart/cart-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { APPROVED_PRODUCTS } from "@/lib/marketplace-data"

function parsePrice(price: string) {
  const match = price.match(/[\d.]+/)
  return match ? Number(match[0]) : 0
}

export function CartPageClient() {
  const { items, updateItem, removeItem, clearCart } = useCart()
  const cartItems = items
    .map((item) => ({
      cart: item,
      product: APPROVED_PRODUCTS.find((product) => product.id === item.productId),
    }))
    .filter((item): item is { cart: { productId: string; quantity: number }; product: typeof APPROVED_PRODUCTS[number] } =>
      Boolean(item.product)
    )

  const estimatedTotal = cartItems.reduce(
    (sum, item) => sum + parsePrice(item.product.price) * item.cart.quantity,
    0
  )

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
              Guest cart is saved in this browser. Logged-in cart syncing can use the same
              product ids and quantities when backend persistence is added.
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
                Final pricing, delivery, and seller confirmation will be handled after checkout is connected.
              </p>
              <Button className="h-12 w-full rounded-xl text-base font-semibold">
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
