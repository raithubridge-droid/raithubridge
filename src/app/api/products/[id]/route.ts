import { NextResponse, type NextRequest } from "next/server"

import { getProduct } from "@/lib/marketplace-repository"

type ProductRouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: NextRequest, { params }: ProductRouteContext) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  return NextResponse.json({ product })
}
