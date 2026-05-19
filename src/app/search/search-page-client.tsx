"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { SampleProductCard } from "@/components/sample-product-card"
import { sampleProducts } from "@/lib/sample-products"

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
              <SampleProductCard
                key={product.id}
                product={product}
                imageClassName="h-32 sm:h-36 lg:h-40"
                priceClassName="text-sm font-bold text-green-800 dark:text-green-300"
                addToCartClassName="mt-0 h-10 w-full rounded-xl text-sm font-bold"
              />
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
