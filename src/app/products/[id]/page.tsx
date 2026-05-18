import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductDetailClient } from "@/app/products/[id]/product-detail-client"
import { APPROVED_PRODUCTS } from "@/lib/marketplace-data"
import { getProduct } from "@/lib/marketplace-repository"
import {
  getSampleProduct,
  mapSampleProductToApprovedProduct,
  sampleProducts,
} from "@/lib/sample-products"
import { shouldUseSampleData } from "@/lib/supabase/env"

type ProductDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export function generateStaticParams() {
  return shouldUseSampleData()
    ? [...APPROVED_PRODUCTS.map((product) => product.id), ...sampleProducts.map((product) => product.id)].map(
        (id) => ({
          id,
        })
      )
    : []
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const product = (await getProduct(id)) ?? getSampleProduct(id)

  return {
    title: product?.name ?? "Product",
    description: product?.description ?? "Product details on RaithuBridge.",
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params
  const product = (await getProduct(id)) ?? (() => {
    const sampleProduct = getSampleProduct(id)
    return sampleProduct ? mapSampleProductToApprovedProduct(sampleProduct) : null
  })()

  if (!product) {
    notFound()
  }

  return <ProductDetailClient initialProduct={product} />
}
