import { NextResponse } from "next/server"

import { getInventory } from "@/lib/marketplace-repository"

export async function GET() {
  const items = await getInventory()
  return NextResponse.json({ items })
}
