import type { Metadata } from "next"

import { AdminInventoryClient } from "@/app/admin/inventory/admin-inventory-client"

export const metadata: Metadata = {
  title: "Admin Inventory",
  description: "Admin-only inventory view for submitted products.",
}

export default function AdminInventoryPage() {
  return <AdminInventoryClient />
}
