/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, Search, ShoppingCart } from "lucide-react"

import { useCart } from "@/components/cart/cart-provider"
import { Button } from "@/components/ui/button"
import {
  sampleProducts,
  type SampleProduct,
} from "@/lib/sample-products"

function SearchProductCard({ product }: { product: SampleProduct }) {
  const router = useRouter()
  const { addItem } = useCart()
  const [quantity, setQuantity] = React.useState(1)

  function openProductDetails() {
    router.push(`/products/${product.id}`)
  }

  function handleCardKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openProductDetails()
    }
  }

  function addToCart(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    addItem(product.id, quantity)
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`View details for ${product.name}`}
      className="flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-primary/5 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      onClick={openProductDetails}
      onKeyDown={handleCardKeyDown}
    >
      <div className="h-32 overflow-hidden bg-muted sm:h-36 lg:h-40">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="min-h-[3.1rem]">
          <h2 className="line-clamp-2 text-sm font-bold leading-tight text-foreground">
            {product.name}
          </h2>
          <span className="mt-1 inline-flex max-w-full rounded-full border border-primary/10 bg-amber-50/90 px-2 py-0.5 text-[0.62rem] font-semibold leading-none text-foreground">
            {product.category}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-foreground">Quantity</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
              aria-label={`Decrease quantity for ${product.name}`}
              onClick={(event) => {
                event.stopPropagation()
                setQuantity((current) => Math.max(1, current - 1))
              }}
            >
              <Minus className="size-3.5" aria-hidden />
            </button>
            <span className="min-w-5 text-center text-sm font-bold text-foreground">{quantity}</span>
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
              aria-label={`Increase quantity for ${product.name}`}
              onClick={(event) => {
                event.stopPropagation()
                setQuantity((current) => Math.min(99, current + 1))
              }}
            >
              <Plus className="size-3.5" aria-hidden />
            </button>
          </div>
        </div>
        <p className="mt-3 text-sm font-bold text-green-800 dark:text-green-300 sm:text-base">
          Rs. {product.price} / {product.unit}
        </p>
        <Button
          type="button"
          className="mt-3 h-10 w-full rounded-xl text-sm font-bold"
          onClick={addToCart}
        >
          <ShoppingCart className="size-4" aria-hidden />
          Add to Cart
        </Button>
      </div>
    </article>
  )
}

export function SearchPageClient() {
  const [query, setQuery] = React.useState("")
  const normalizedQuery = query.trim().toLowerCase()
  const filteredProducts = React.useMemo(() => {
    if (!normalizedQuery) {
      return sampleProducts
    }

    return sampleProducts.filter((product) =>
      [product.name, product.category, product.location]
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    )
  }, [normalizedQuery])

  return (
    <main className="px-4 py-4 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="space-y-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Search Products
          </h1>
          <div className="flex min-h-12 items-center gap-2 rounded-2xl border border-border/70 bg-card/95 px-4 shadow-sm ring-1 ring-primary/5">
            <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search rice, chilli, oil..."
              className="h-12 min-w-0 flex-1 bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground"
              type="search"
              aria-label="Search products"
            />
          </div>
        </div>

        {filteredProducts.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <SearchProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <section className="mt-5 rounded-2xl border border-border/70 bg-card/95 p-6 text-center shadow-sm ring-1 ring-primary/5">
            <h2 className="text-lg font-bold text-foreground">No products found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try searching for rice, chilli, oil, spices, or vegetables.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
