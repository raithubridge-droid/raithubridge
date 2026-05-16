import Link from "next/link"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { CartLink } from "@/components/cart/cart-link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { getCurrentProfile } from "@/lib/auth/roles"

const navLinkClass =
  "rounded-lg px-3 py-2 text-base font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"

export async function SiteHeader() {
  const { user } = await getCurrentProfile()

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:py-4">
        <Link
          href="/"
          className="flex w-fit min-w-0 items-center gap-3 text-foreground transition-opacity hover:opacity-90"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 via-amber-100 to-lime-100 shadow-sm ring-1 ring-primary/15 sm:size-12">
            <Logo size="md" />
          </span>
          <span className="min-w-0 font-heading text-2xl font-bold tracking-tight">
            RaithuBridge
          </span>
        </Link>
        <nav
          className="-mx-2 flex items-center gap-1 overflow-x-auto px-2 pb-1 sm:mx-0 sm:flex-wrap sm:justify-end sm:overflow-visible sm:px-0 sm:pb-0"
          aria-label="Primary"
        >
          <Link href="/products" className={navLinkClass}>
            Products
          </Link>
          <Link href="/submit-product" className={navLinkClass}>
            Submit Product
          </Link>
          {user ? (
            <Link href="/my-submissions" className={navLinkClass}>
              My Submissions
            </Link>
          ) : null}
          <Link href="/admin" className={navLinkClass}>
            Admin
          </Link>
          <CartLink />
          <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden />
          {user ? (
            <SignOutButton />
          ) : (
            <>
              <Button asChild variant="ghost" size="default" className="h-10 px-3 text-base">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild size="default" className="h-10 rounded-xl px-4 text-base font-semibold">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
