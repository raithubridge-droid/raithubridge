import type { Metadata } from "next"
import Link from "next/link"

import { FarmerProductForm } from "@/components/farmer-product-form"
import { Button } from "@/components/ui/button"
import { requireRole } from "@/lib/auth/roles"

export const metadata: Metadata = {
  title: "Register Farmer",
  description:
    "List your farm product for bulk buyers. Submissions are reviewed before going live.",
}

export default async function FarmerRegisterPage() {
  await requireRole(["farmer", "admin"])

  return (
    <main className="px-4 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-3xl">
        <Button asChild variant="ghost" className="-ml-2 mb-8 h-11 text-base text-muted-foreground">
          <Link href="/">← Back to home</Link>
        </Button>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Farmer product submission
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Tell us what you grow or process. After review, matching buyers can send
          inquiries.
        </p>
        <div className="mt-12">
          <FarmerProductForm />
        </div>
      </div>
    </main>
  )
}
