import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductDetailClient } from "@/app/products/[id]/product-detail-client"
import { APPROVED_PRODUCTS } from "@/lib/marketplace-data"
import { resolveProduct, resolveSampleProduct } from "@/lib/resolve-product"
import { sampleProducts } from "@/lib/sample-products"

type ProductDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export const dynamicParams = true

export function generateStaticParams() {
  const ids = new Set([
    ...sampleProducts.map((product) => product.id),
    ...APPROVED_PRODUCTS.map((product) => product.id),
  ])

  return Array.from(ids).map((id) => ({ id }))
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const product = resolveSampleProduct(id) ?? (await resolveProduct(id))

  return {
    title: product?.name ?? "Product",
    description: product?.description ?? "Product details on RaithuBridge.",
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params
  const product = await resolveProduct(id)

  if (!product) {
    notFound()
  }

  return <ProductDetailClient initialProduct={product} />
}
