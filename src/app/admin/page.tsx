import type { Metadata } from "next"
import Link from "next/link"

import { AdminAccessFallback } from "@/components/auth/admin-access-fallback"
import { AdminSubmissionsWorkspace } from "@/components/admin-submissions-workspace"
import { Button } from "@/components/ui/button"
import { getAdminPageAccess } from "@/lib/auth/admin-guard"
import { getAdminSubmissions } from "@/lib/product-submissions"

export const metadata: Metadata = {
  title: "Review Products",
  description: "Review submitted farm products.",
}

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const access = await getAdminPageAccess()

  if (access.kind !== "ok") {
    return (
      <AdminAccessFallback
        access={access}
        nextPath="/admin"
        title="Review Products"
      />
    )
  }

  const submissions = await getAdminSubmissions()

  return (
    <main className="px-4 py-4 sm:py-6">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Review Products
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Review farmer submissions before they go live on the marketplace.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-10 shrink-0 rounded-xl px-3 text-sm font-semibold"
          >
            <Link href="/admin/inventory">Inventory</Link>
          </Button>
        </div>

        <AdminSubmissionsWorkspace items={submissions} />
      </div>
    </main>
  )
}
