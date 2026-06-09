import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Access denied",
  description: "You do not have permission to view this page.",
}

export default function UnauthorizedPage() {
  return (
    <main className="flex flex-1 flex-col justify-center px-4 py-8 sm:py-14">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-amber-800/20 bg-card/95 p-5 shadow-sm ring-1 ring-amber-800/15 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-900 ring-1 ring-amber-800/15">
            <ShieldAlert className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Access denied
            </h1>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              Your account does not have admin permissions. If you believe this is a mistake,
              contact a RaithuBridge administrator.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="h-12 w-full rounded-2xl text-base font-semibold sm:flex-1">
            <Link href="/products">Browse products</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 w-full rounded-2xl text-base font-semibold sm:flex-1"
          >
            <Link href="/account">My account</Link>
          </Button>
        </div>

        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to home
        </Link>
      </section>
    </main>
  )
}
