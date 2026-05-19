import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { FarmerProductForm } from "@/components/farmer-product-form"
import { getCurrentProfile } from "@/lib/auth/roles"

export const metadata: Metadata = {
  title: "Submit Product",
  description: "Submit a farm product for review on RaithuBridge.",
}

export default async function SubmitProductPage() {
  const { user } = await getCurrentProfile()

  if (!user) {
    redirect("/signin")
  }

  return (
    <main className="px-4 py-4">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="mb-2 inline-flex items-center gap-2 text-base font-medium text-green-900"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to home
        </Link>

        <h1 className="mt-2 font-heading text-3xl font-bold leading-tight sm:text-4xl">
          Submit Product
        </h1>

        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Submit your farm product for review. Once approved, it will be visible to buyers.
        </p>

        <div className="mt-5">
          <FarmerProductForm />
        </div>
      </div>
    </main>
  )
}
