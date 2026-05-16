import type { Metadata } from "next"

import { ProductsPageClient } from "@/app/products/products-page-client"
import { APPROVED_PRODUCTS } from "@/lib/marketplace-data"
import { shouldUseSampleData } from "@/lib/supabase/env"

export const metadata: Metadata = {
  title: "Products",
  description: "Browse approved farm products from trusted farmers and sellers.",
}

export default function ProductsPage() {
  return (
    <ProductsPageClient initialProducts={shouldUseSampleData() ? APPROVED_PRODUCTS : []} />
  )
}
