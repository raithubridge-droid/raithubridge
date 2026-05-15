import type { Metadata } from "next"

import { AdminReviewPanel } from "@/components/admin-review-panel"
import { requireRole } from "@/lib/auth/roles"
import { PENDING_SUBMISSIONS, type PendingSubmission, type ProductMediaAsset } from "@/lib/marketplace-data"
import { createClient } from "@/lib/supabase/server"
import type { Json } from "@/types/database"

export const metadata: Metadata = {
  title: "Admin",
  description: "Review pending farmer product submissions (sample data).",
}

function isMediaAsset(value: unknown): value is ProductMediaAsset {
  if (!value || typeof value !== "object") {
    return false
  }

  const asset = value as Record<string, unknown>
  return (
    typeof asset.url === "string" &&
    typeof asset.path === "string" &&
    (asset.type === "image" || asset.type === "video") &&
    typeof asset.mimeType === "string" &&
    typeof asset.name === "string" &&
    typeof asset.size === "number"
  )
}

function toMediaAssets(value: Json): ProductMediaAsset[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(isMediaAsset)
}

export default async function AdminPage() {
  await requireRole(["admin"])
  const supabase = await createClient()
  const { data: submissions } = await supabase
    .from("farmer_submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  const items: PendingSubmission[] = submissions?.length
    ? submissions.map((row) => ({
        id: row.id,
        farmerName: row.farmer_name,
        phone: row.phone,
        whatsapp: row.whatsapp,
        village: row.village,
        district: row.district,
        state: row.state,
        productName: row.product_name,
        category: row.category,
        quantityAvailable: row.quantity_available,
        unit: row.unit,
        price: row.price,
        description: row.description,
        mediaAssets: toMediaAssets(row.media_assets),
        submittedAt: new Intl.DateTimeFormat("en-IN", {
          dateStyle: "medium",
        }).format(new Date(row.created_at)),
      }))
    : PENDING_SUBMISSIONS

  return (
    <main className="px-4 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Review dashboard
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Pending products (static sample data). Approve and Reject are visual previews
          only—no database yet.
        </p>
        <div className="mt-12">
          <AdminReviewPanel items={items} />
        </div>
      </div>
    </main>
  )
}
