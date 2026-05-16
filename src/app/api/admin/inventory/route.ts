import { NextResponse } from "next/server"

import { getCurrentProfile } from "@/lib/auth/roles"
import { getInventory } from "@/lib/marketplace-repository"

export async function GET() {
  const { user, profile } = await getCurrentProfile()

  if (!user) {
    return NextResponse.json({ error: "Sign in as admin first." }, { status: 401 })
  }

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access is required." }, { status: 403 })
  }

  try {
    const items = await getInventory({ fallbackToSamples: false })
    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load inventory." },
      { status: 400 }
    )
  }
}
