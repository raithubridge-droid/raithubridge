import Link from "next/link"
import { ArrowLeft, ShieldAlert } from "lucide-react"

import { AuthRequiredCard } from "@/components/auth/auth-required-card"
import { Button } from "@/components/ui/button"
import type { AdminPageAccess } from "@/lib/auth/admin-guard"

type AdminAccessFallbackProps = {
  access: Exclude<AdminPageAccess, { kind: "ok" }>
  nextPath: string
  title?: string
}

function AdminAccessDeniedCard() {
  return (
    <section className="rounded-2xl border border-amber-800/20 bg-card/95 p-5 shadow-sm ring-1 ring-amber-800/15">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-900 ring-1 ring-amber-800/15">
          <ShieldAlert className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-bold text-foreground">Access denied</h2>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Your account does not have admin permissions. You cannot view admin reviews,
            inventory tools, or submission actions.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
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
  )
}

export function AdminAccessFallback({ access, nextPath, title = "Admin" }: AdminAccessFallbackProps) {
  return (
    <main className="px-4 py-4 sm:py-8">
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <div className="mt-4">
          {access.kind === "sign_in_required" ? (
            <AuthRequiredCard
              message="Please sign in with an admin account to access this area."
              nextPath={nextPath}
            />
          ) : (
            <AdminAccessDeniedCard />
          )}
        </div>
      </div>
    </main>
  )
}
