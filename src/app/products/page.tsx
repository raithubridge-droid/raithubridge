import type { Metadata } from "next"

import { CatalogProductCard } from "@/components/catalog-product-card"
import { APPROVED_PRODUCTS } from "@/lib/marketplace-data"

export const metadata: Metadata = {
  title: "Products",
  description: "Browse approved farm products from trusted farmers and sellers.",
}

export default function ProductsPage() {
  const categories = Array.from(new Set(APPROVED_PRODUCTS.map((product) => product.category)))

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
            const products = APPROVED_PRODUCTS.filter((product) => product.category === category)

            return (
              <section key={category} className="scroll-mt-28">
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{category}</h2>
                    <p className="text-base text-muted-foreground">
                      {products.length} product{products.length === 1 ? "" : "s"} available
                    </p>
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                  {products.map((p) => (
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
