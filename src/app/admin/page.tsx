import type { Metadata } from "next"
import Link from "next/link"

import { AdminReviewPanel } from "@/components/admin-review-panel"
import { Button } from "@/components/ui/button"
import { SAMPLE_SUBMISSIONS } from "@/lib/marketplace-data"

export const metadata: Metadata = {
  title: "Admin",
  description: "Review submitted products and manage visible user comments.",
}

export default function AdminPage() {
  return (
    <main className="px-4 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Admin Dashboard
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Review submitted products, update status, and leave comments that are visible
              to the user. This dashboard uses sample data only for now.
            </p>
          </div>
          <Button asChild variant="outline" className="h-11 rounded-xl px-5 text-base font-semibold">
            <Link href="/admin/inventory">View Inventory</Link>
          </Button>
        </div>
        <div className="mt-12">
          <AdminReviewPanel items={SAMPLE_SUBMISSIONS} />
        </div>
      </div>
    </main>
  )
}
