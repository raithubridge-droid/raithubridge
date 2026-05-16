import { NextResponse, type NextRequest } from "next/server"

import { getProducts } from "@/lib/marketplace-repository"

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams
    .get("ids")
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean)

  const products = await getProducts(ids)
  return NextResponse.json({ products })
}
