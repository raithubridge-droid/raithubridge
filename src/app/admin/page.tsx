import type { Metadata } from "next"

import { AdminReviewPanel } from "@/components/admin-review-panel"
import { PENDING_SUBMISSIONS } from "@/lib/marketplace-data"

export const metadata: Metadata = {
  title: "Admin",
  description: "Review pending farmer product submissions (sample data).",
}

export default function AdminPage() {
  return (
    <main className="px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Review dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pending products (static sample data). Approve and Reject are visual previews
          only—no database yet.
        </p>
        <div className="mt-10">
          <AdminReviewPanel items={PENDING_SUBMISSIONS} />
        </div>
      </div>
    </main>
  )
}
