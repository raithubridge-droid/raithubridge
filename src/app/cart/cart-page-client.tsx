/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import Link from "next/link"
import { Minus, Plus } from "lucide-react"

import { useCart } from "@/components/cart/cart-provider"
import { Button } from "@/components/ui/button"
import { APPROVED_PRODUCTS, type ApprovedProduct } from "@/lib/marketplace-data"
import { sampleApprovedProducts } from "@/lib/sample-products"

function parsePrice(price: string) {
  const match = price.match(/\d[\d,]*(?:\.\d+)?/)
  return match ? Number(match[0].replace(/,/g, "")) : 0
}

export function CartPageClient({ isSignedIn }: { isSignedIn: boolean }) {
  const { items, updateItem, removeItem, clearCart, syncItems } = useCart()
  const [products, setProducts] = React.useState<ApprovedProduct[]>(
    [...sampleApprovedProducts, ...APPROVED_PRODUCTS]
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
  const formattedSubtotal = `Rs. ${estimatedTotal.toLocaleString("en-IN")}`

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

  return (
    <main className="px-4 py-4 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Cart
            </h1>
            <p className="text-sm text-muted-foreground">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </p>
          </div>
          {cartItems.length ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="h-8 rounded-xl px-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={clearCart}
            >
              Clear
            </Button>
          ) : null}
        </div>

        {!isSignedIn ? (
          <section className="rounded-2xl border border-primary/15 bg-primary/5 p-3 shadow-sm">
            <p className="text-sm font-semibold text-foreground">
              Sign in to save your cart and track your orders.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button asChild size="sm" className="rounded-xl text-sm font-semibold">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button type="button" variant="outline" size="sm" className="rounded-xl text-sm font-semibold">
                Continue as Guest
              </Button>
            </div>
          </section>
        ) : null}

        {!cartItems.length ? (
          <section className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-border/70 bg-card/95 p-5 text-center shadow-sm ring-1 ring-primary/5">
            <h2 className="text-lg font-bold text-foreground">Your cart is empty</h2>
            <p className="mt-1 text-sm text-muted-foreground">Add farm products to continue.</p>
            <Button asChild className="mt-4 h-10 rounded-xl px-5 text-sm font-semibold">
              <Link href="/products">Browse Products</Link>
            </Button>
          </section>
        ) : (
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            <section className="flex flex-col gap-3 pb-44 lg:pb-0">
              {cartItems.map(({ cart, product }) => (
                <div
                  key={product.id}
                  className="flex gap-3 rounded-2xl border border-border/70 bg-card/95 p-3 shadow-sm ring-1 ring-primary/5"
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted"
                    aria-label={`View ${product.name}`}
                  >
                    {product.mediaAssets[0]?.type === "image" ? (
                      <img
                        src={product.mediaAssets[0].url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center px-2 text-center text-[0.65rem] font-semibold text-muted-foreground">
                        Product
                      </span>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${product.id}`}
                          className="line-clamp-2 text-sm font-semibold leading-snug text-foreground hover:text-primary"
                        >
                          {product.name}
                        </Link>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 text-xs font-semibold text-destructive hover:underline"
                        onClick={() => removeItem(product.id)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-2 flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Quantity: {cart.quantity} {product.unit}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-green-800 dark:text-green-300">
                          {product.price}
                        </p>
                      </div>

                      <div className="flex h-9 shrink-0 items-center overflow-hidden rounded-full border border-border bg-background">
                        <button
                          type="button"
                          className="flex h-9 w-8 items-center justify-center text-foreground hover:bg-muted"
                          aria-label={`Decrease quantity for ${product.name}`}
                          onClick={() => updateItem(product.id, cart.quantity - 1)}
                        >
                          <Minus className="size-3.5" aria-hidden />
                        </button>
                        <span className="min-w-7 text-center text-sm font-bold text-foreground">
                          {cart.quantity}
                        </span>
                        <button
                          type="button"
                          className="flex h-9 w-8 items-center justify-center text-foreground hover:bg-muted"
                          aria-label={`Increase quantity for ${product.name}`}
                          onClick={() => updateItem(product.id, cart.quantity + 1)}
                        >
                          <Plus className="size-3.5" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <aside className="hidden rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm ring-1 ring-primary/5 lg:block">
              <CartSummary
                checkoutMessage={checkoutMessage}
                formattedSubtotal={formattedSubtotal}
                isCheckingOut={isCheckingOut}
                onCheckout={createOrder}
              />
            </aside>
          </div>
        )}

        {cartItems.length ? (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
            <div className="mx-auto max-w-5xl">
              <CartSummary
                checkoutMessage={checkoutMessage}
                formattedSubtotal={formattedSubtotal}
                isCheckingOut={isCheckingOut}
                onCheckout={createOrder}
              />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}

function CartSummary({
  checkoutMessage,
  formattedSubtotal,
  isCheckingOut,
  onCheckout,
}: {
  checkoutMessage: string | null
  formattedSubtotal: string
  isCheckingOut: boolean
  onCheckout: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
        <span className="text-base font-bold text-foreground">{formattedSubtotal}</span>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Delivery charges may be confirmed after order review.
      </p>
      {checkoutMessage ? (
        <p className="rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">
          {checkoutMessage}
        </p>
      ) : null}
      <Button
        className="h-11 w-full rounded-xl text-sm font-bold"
        disabled={isCheckingOut}
        onClick={onCheckout}
      >
        {isCheckingOut ? "Creating order..." : "Checkout"}
      </Button>
    </div>
  )
}
