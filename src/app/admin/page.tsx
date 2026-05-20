import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { AdminSubmissionsList } from "@/components/admin-submissions-list"
import { Button } from "@/components/ui/button"
import { getCurrentProfile } from "@/lib/auth/roles"
import { getAdminSubmissions } from "@/lib/product-submissions"

export const metadata: Metadata = {
  title: "Review Products",
  description: "Review submitted farm products.",
}

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const { user, profile } = await getCurrentProfile()

  if (!user) {
    redirect("/sign-in?next=/admin")
  }

  if (profile?.role !== "admin") {
    redirect("/unauthorized")
  }

  const submissions = await getAdminSubmissions()

  return (
    <main className="px-4 py-4">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Review Products
          </h1>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-10 shrink-0 rounded-xl px-3 text-sm font-semibold"
          >
            <Link href="/admin/inventory">Inventory</Link>
          </Button>
        </div>

        <AdminSubmissionsList items={submissions} />
      </div>
    </main>
  )
}
