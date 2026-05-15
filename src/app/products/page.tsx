import type { Metadata } from "next"

import { CatalogProductCard } from "@/components/catalog-product-card"
import { APPROVED_PRODUCTS } from "@/lib/marketplace-data"

export const metadata: Metadata = {
  title: "Products",
  description: "Browse approved farm products from verified farmers across India.",
}

export default function ProductsPage() {
  return (
    <main className="px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Approved products
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Sample listings for discovery. Send an inquiry to connect with the farmer for
          quantity and logistics.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
