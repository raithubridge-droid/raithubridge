"use client"

import * as React from "react"

import { CatalogProductCard } from "@/components/catalog-product-card"
import { Card, CardContent } from "@/components/ui/card"
import type { ApprovedProduct } from "@/lib/marketplace-data"

export function ProductsPageClient({ initialProducts }: { initialProducts: ApprovedProduct[] }) {
  const [products, setProducts] = React.useState(initialProducts)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true

    async function loadProducts() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await fetch("/api/products")
        const payload = (await response.json()) as { error?: string; products?: ApprovedProduct[] }

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load products.")
        }

        if (isMounted) {
          setProducts(payload.products ?? [])
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Unable to load products.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
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

        {errorMessage ? (
          <p className="mt-8 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-base text-destructive">
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <Card className="mt-10 border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5">
            <CardContent className="p-8 text-center text-base text-muted-foreground">
              Loading products...
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !products.length ? (
          <Card className="mt-10 border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5">
            <CardContent className="p-8 text-center">
              <p className="text-xl font-semibold text-foreground">No approved products yet</p>
              <p className="mt-2 text-base text-muted-foreground">
                Approved products will appear here after admin review.
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-12 space-y-14">
          {!isLoading && categories.map((category) => {
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
