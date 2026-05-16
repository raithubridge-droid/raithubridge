import type { Metadata } from "next"

import { ProductsPageClient } from "@/app/products/products-page-client"
import { APPROVED_PRODUCTS } from "@/lib/marketplace-data"

export const metadata: Metadata = {
  title: "Products",
  description: "Browse approved farm products from trusted farmers and sellers.",
}

export default function ProductsPage() {
  return <ProductsPageClient initialProducts={APPROVED_PRODUCTS} />
}
