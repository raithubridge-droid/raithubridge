import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { FarmerProductForm } from "@/components/farmer-product-form"
import { Button } from "@/components/ui/button"
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
    <main className="px-4 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-4xl">
        <Button asChild variant="ghost" className="-ml-2 mb-8 h-11 text-base text-muted-foreground">
          <Link href="/">Back to home</Link>
        </Button>
        <div className="max-w-3xl">
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Submit Product
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            Any logged-in user can buy products and submit products for review. Add seller
            details, product information, photos, and videos so admins can review the listing.
          </p>
        </div>
        <div className="mt-12">
          <FarmerProductForm />
        </div>
      </div>
    </main>
  )
}
