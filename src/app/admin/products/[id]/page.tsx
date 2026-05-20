import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { AdminProductReviewForm } from "@/components/admin-product-review-form"
import { getCurrentProfile } from "@/lib/auth/roles"
import { getAdminSubmissionById } from "@/lib/product-submissions"

type AdminProductPageProps = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: AdminProductPageProps): Promise<Metadata> {
  const { id } = await params
  const submission = await getAdminSubmissionById(id).catch(() => null)

  return {
    title: submission ? `Review ${submission.productName}` : "Review Product",
    description: "Review a submitted farm product.",
  }
}

export const dynamic = "force-dynamic"

export default async function AdminProductPage({ params }: AdminProductPageProps) {
  const { id } = await params
  const { user, profile } = await getCurrentProfile()

  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(`/admin/products/${id}`)}`)
  }

  if (profile?.role !== "admin") {
    redirect("/unauthorized")
  }

  const submission = await getAdminSubmissionById(id)

  if (!submission) {
    notFound()
  }

  return (
    <main className="px-4 py-4">
      <div className="mx-auto w-full max-w-3xl">
        <AdminProductReviewForm submission={submission} />
      </div>
    </main>
  )
}
