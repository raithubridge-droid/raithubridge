import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductDetailClient } from "@/app/products/[id]/product-detail-client"
import { APPROVED_PRODUCTS } from "@/lib/marketplace-data"
import { getProduct } from "@/lib/marketplace-repository"

type ProductDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export function generateStaticParams() {
  return APPROVED_PRODUCTS.map((product) => ({
    id: product.id,
  }))
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)

  return {
    title: product?.name ?? "Product",
    description: product?.description ?? "Product details on RaithuBridge.",
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return <ProductDetailClient initialProduct={product} />
}
