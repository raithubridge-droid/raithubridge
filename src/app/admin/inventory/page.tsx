import type { Metadata } from "next"

import { AdminInventoryClient } from "@/app/admin/inventory/admin-inventory-client"
import { AdminAccessFallback } from "@/components/auth/admin-access-fallback"
import { getAdminPageAccess } from "@/lib/auth/admin-guard"
import { getInventory } from "@/lib/marketplace-repository"

export const metadata: Metadata = {
  title: "Admin Inventory",
  description: "Admin-only inventory view for submitted products.",
}

export const dynamic = "force-dynamic"

export default async function AdminInventoryPage() {
  const access = await getAdminPageAccess()

  if (access.kind !== "ok") {
    return (
      <AdminAccessFallback
        access={access}
        nextPath="/admin/inventory"
        title="Admin Inventory"
      />
    )
  }

  const items = await getInventory({ fallbackToSamples: false })

  return <AdminInventoryClient initialItems={items} />
}
