"use client"

import * as React from "react"

import { ApprovedProductCard } from "@/components/approved-product-card"
import { SampleProductCard } from "@/components/sample-product-card"
import { Card, CardContent } from "@/components/ui/card"
import type { ApprovedProduct } from "@/lib/marketplace-data"
import {
  mapSampleProductToApprovedProduct,
  sampleProducts,
  type SampleProductCategory,
} from "@/lib/sample-products"

type ProductTab = "All" | SampleProductCategory

const categoryTabs: ProductTab[] = ["All", "Grains", "Oils", "Spices", "Vegetables"]

export function ProductsPageClient({ initialProducts }: { initialProducts: ApprovedProduct[] }) {
  const [products, setProducts] = React.useState(initialProducts)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<ProductTab>("All")

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

  const usingSamples = !products.length
  const displayProducts = usingSamples
    ? sampleProducts.map(mapSampleProductToApprovedProduct)
    : products

  const filteredProducts =
    activeTab === "All"
      ? displayProducts
      : displayProducts.filter((product) => product.category === activeTab)

  return (
    <main className="px-3 pb-5 pt-0 sm:px-4 sm:py-10">
      <div className="mx-auto w-full max-w-6xl">
        {errorMessage ? (
          <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:text-base">
            {errorMessage}
          </p>
        ) : null}

        <div className="sticky top-16 z-20 -mx-3 mb-4 border-y border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:mb-0 md:border-0 md:bg-transparent md:px-0 md:pt-0">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categoryTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "border-emerald-900 bg-emerald-900 text-white shadow-sm"
                    : "border-border bg-card text-foreground hover:bg-primary/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Card className="mt-5 border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5">
            <CardContent className="p-6 text-center text-sm text-muted-foreground sm:text-base">
              Loading products...
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && usingSamples ? (
          <Card className="mt-5 border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5">
            <CardContent className="p-5 text-center">
              <p className="text-lg font-semibold text-foreground">Showing sample products</p>
              <p className="mt-2 text-base text-muted-foreground">
                Approved products will appear here after admin review.
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-2 gap-4 pt-1 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) =>
            usingSamples ? (
              <SampleProductCard
                key={product.id}
                product={sampleProducts.find((sample) => sample.id === product.id)!}
              />
            ) : (
              <ApprovedProductCard key={product.id} product={product} />
            )
          )}
        </div>
      </div>
    </main>
  )
}
