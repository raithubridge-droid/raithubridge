import type { Metadata } from "next"

import { CatalogProductCard } from "@/components/catalog-product-card"
import { APPROVED_PRODUCTS } from "@/lib/marketplace-data"

export const metadata: Metadata = {
  title: "Products",
  description: "Browse approved farm products from verified farmers across India.",
}

export default function ProductsPage() {
  return (
    <main className="px-4 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Approved products
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Sample listings for discovery. Send an inquiry to connect with the farmer for
          quantity and logistics.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
          {APPROVED_PRODUCTS.map((p) => (
            <CatalogProductCard
              key={p.id}
              name={p.name}
              category={p.category}
              farmerLocation={p.farmerLocation}
              price={p.price}
              quantity={p.quantity}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
