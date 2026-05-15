import type { Metadata } from "next"
import Link from "next/link"

import { FarmerProductForm } from "@/components/farmer-product-form"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Register Farmer",
  description:
    "List your farm product for bulk buyers. Submissions are reviewed before going live.",
}

export default function FarmerRegisterPage() {
  return (
    <main className="px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6 text-muted-foreground">
          <Link href="/">← Back to home</Link>
        </Button>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Farmer product submission
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tell us what you grow or process. After review, matching buyers can send
          inquiries.
        </p>
        <div className="mt-10">
          <FarmerProductForm />
        </div>
      </div>
    </main>
  )
}
