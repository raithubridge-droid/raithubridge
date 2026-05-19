import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ProductNotFound() {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card/95 p-6 text-center shadow-sm ring-1 ring-primary/10">
        <h1 className="font-heading text-2xl font-bold text-foreground">Product not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This product may have been removed or the link is incorrect.
        </p>
        <Button asChild className="mt-5 h-11 rounded-2xl px-5 font-semibold">
          <Link href="/products">
            <ArrowLeft className="size-4" aria-hidden />
            Back to products
          </Link>
        </Button>
      </div>
    </main>
  )
}
