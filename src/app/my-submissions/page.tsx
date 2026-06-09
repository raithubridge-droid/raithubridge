import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { AuthRequiredCard } from "@/components/auth/auth-required-card"
import { MySubmissionsList } from "@/components/my-submissions-list"
import { Button } from "@/components/ui/button"
import { getAccountDisplayLabel } from "@/lib/auth/account"
import { getCurrentProfile } from "@/lib/auth/roles"
import { getCurrentUserSubmissions } from "@/lib/product-submissions"

export const metadata: Metadata = {
  title: "My Submissions",
  description: "Track your submitted farm products and review status.",
}

export const dynamic = "force-dynamic"

export default async function MySubmissionsPage() {
  const { user, profile } = await getCurrentProfile()

  if (!user) {
    return (
      <main className="px-4 py-4 sm:py-8">
        <div className="mx-auto w-full max-w-md">
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            My Submissions
          </h1>
          <div className="mt-4">
            <AuthRequiredCard
              message="Please sign in to view your product submissions."
              nextPath="/my-submissions"
            />
          </div>
        </div>
      </main>
    )
  }

  const submissions = (await getCurrentUserSubmissions()) ?? []
  const accountLabel = getAccountDisplayLabel(user, profile)

  return (
    <main className="px-4 py-4 sm:py-8">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm font-medium text-green-900"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to account
        </Link>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              My Submissions
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Products you have submitted for marketplace review.
            </p>
            {accountLabel ? (
              <p className="mt-2 break-all text-xs text-muted-foreground">
                Signed in as {accountLabel}
              </p>
            ) : null}
          </div>
          <Button
            asChild
            className="h-10 shrink-0 rounded-xl px-4 text-sm font-semibold sm:h-11 sm:text-base"
          >
            <Link href="/submit-product">Submit Product</Link>
          </Button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {submissions.length
            ? `${submissions.length} submission${submissions.length === 1 ? "" : "s"}`
            : null}
        </p>

        <div className="mt-4">
          <MySubmissionsList submissions={submissions} />
        </div>
      </div>
    </main>
  )
}
