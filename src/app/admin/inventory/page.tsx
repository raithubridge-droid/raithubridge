import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AdminInventoryClient } from "@/app/admin/inventory/admin-inventory-client"
import { getCurrentProfile } from "@/lib/auth/roles"
import { getInventory } from "@/lib/marketplace-repository"

export const metadata: Metadata = {
  title: "Admin Inventory",
  description: "Admin-only inventory view for submitted products.",
}

export default async function AdminInventoryPage() {
  const { user, profile } = await getCurrentProfile()

  if (!user) {
    redirect("/sign-in")
  }

  if (profile?.role !== "admin") {
    redirect("/unauthorized")
  }

  const items = await getInventory({ fallbackToSamples: false })

  return <AdminInventoryClient initialItems={items} />
}
