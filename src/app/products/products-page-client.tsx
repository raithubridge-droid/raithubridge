"use client"

import * as React from "react"

import { CatalogProductCard } from "@/components/catalog-product-card"
import type { ApprovedProduct } from "@/lib/marketplace-data"

export function ProductsPageClient({ initialProducts }: { initialProducts: ApprovedProduct[] }) {
  const [products, setProducts] = React.useState(initialProducts)

  React.useEffect(() => {
    let isMounted = true

    async function loadProducts() {
      try {
        const response = await fetch("/api/products")
        const payload = (await response.json()) as { products?: ApprovedProduct[] }

        if (isMounted && payload.products?.length) {
          setProducts(payload.products)
        }
      } catch {
        // Keep initial sample products when the API is not available.
      }
    }

    void loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  const categories = Array.from(new Set(products.map((product) => product.category)))

  return (
    <main className="px-4 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Approved products
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Buy farm products directly from trusted farmers and sellers. Compare price,
          location, category, and availability.
        </p>
        <div className="mt-12 space-y-14">
          {categories.map((category) => {
            const categoryProducts = products.filter((product) => product.category === category)

            return (
              <section key={category} className="scroll-mt-28">
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{category}</h2>
                    <p className="text-base text-muted-foreground">
                      {categoryProducts.length} product
                      {categoryProducts.length === 1 ? "" : "s"} available
                    </p>
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                  {categoryProducts.map((p) => (
                    <CatalogProductCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      category={p.category}
                      sellerName={p.sellerName}
                      sellerLocation={p.sellerLocation}
                      price={p.price}
                      quantity={p.quantity}
                      unit={p.unit}
                      status={p.status}
                      mediaUrl={p.mediaAssets.find((asset) => asset.type === "image")?.url}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}
