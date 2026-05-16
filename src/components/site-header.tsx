import Link from "next/link"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { CartLink } from "@/components/cart/cart-link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { getCurrentProfile } from "@/lib/auth/roles"

const navLinkClass =
  "rounded-md px-2.5 py-2 text-base font-semibold text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"

export async function SiteHeader() {
  const { user } = await getCurrentProfile()

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <Link
          href="/"
          className="flex w-fit items-center gap-3 text-foreground transition-opacity hover:opacity-90"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 via-amber-100 to-lime-100 shadow-sm ring-1 ring-primary/15">
            <Logo size="md" />
          </span>
          <span className="font-heading text-2xl font-bold tracking-tight">RaithuBridge</span>
        </Link>
        <nav
          className="flex flex-wrap items-center gap-x-1 gap-y-2 sm:justify-end"
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
