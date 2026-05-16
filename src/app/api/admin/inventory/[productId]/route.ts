import { NextResponse, type NextRequest } from "next/server"

import { getCurrentProfile } from "@/lib/auth/roles"
import { updateInventoryAvailability } from "@/lib/marketplace-repository"

type InventoryRouteContext = {
  params: Promise<{
    productId: string
  }>
}

export async function PATCH(request: NextRequest, { params }: InventoryRouteContext) {
  const { productId } = await params
  const { user, profile } = await getCurrentProfile()

  if (!user) {
    return NextResponse.json({ error: "Sign in as admin first." }, { status: 401 })
  }

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access is required." }, { status: 403 })
  }

  const body = (await request.json()) as {
    inStock?: boolean
    stockCount?: number
  }

  if (typeof body.inStock !== "boolean" || typeof body.stockCount !== "number") {
    return NextResponse.json(
      { error: "inStock and stockCount are required." },
      { status: 400 }
    )
  }

  try {
    await updateInventoryAvailability({
      productId,
      inStock: body.inStock,
      stockCount: Math.max(0, Math.floor(body.stockCount)),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update inventory" },
      { status: 400 }
    )
  }
}
