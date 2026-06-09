import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AdminAccessFallback } from "@/components/auth/admin-access-fallback"
import { AdminProductReviewForm } from "@/components/admin-product-review-form"
import { getAdminPageAccess, isAdminProfile } from "@/lib/auth/admin-guard"
import { getCurrentProfile } from "@/lib/auth/roles"
import { getAdminSubmissionById } from "@/lib/product-submissions"

type AdminProductPageProps = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: AdminProductPageProps): Promise<Metadata> {
  const { id } = await params
  const { profile } = await getCurrentProfile()

  if (!isAdminProfile(profile)) {
    return {
      title: "Review Product",
      description: "Review a submitted farm product.",
    }
  }

  const submission = await getAdminSubmissionById(id).catch(() => null)

  return {
    title: submission ? `Review ${submission.productName}` : "Review Product",
    description: "Review a submitted farm product.",
  }
}

export const dynamic = "force-dynamic"

export default async function AdminProductPage({ params }: AdminProductPageProps) {
  const { id } = await params
  const access = await getAdminPageAccess()

  if (access.kind !== "ok") {
    return (
      <AdminAccessFallback
        access={access}
        nextPath={`/admin/products/${id}`}
        title="Review Product"
      />
    )
  }

  const submission = await getAdminSubmissionById(id)

  if (!submission) {
    notFound()
  }

  return (
    <main className="px-4 py-4 sm:py-6">
      <div className="mx-auto w-full max-w-3xl">
        <AdminProductReviewForm submission={submission} layout="page" />
      </div>
    </main>
  )
}
