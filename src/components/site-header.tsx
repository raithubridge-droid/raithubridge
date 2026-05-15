import Link from "next/link"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { getCurrentProfile, ROLE_LABELS } from "@/lib/auth/roles"

const navLinkClass =
  "rounded-md px-1 py-1 text-base font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"

export async function SiteHeader() {
  const { user, profile } = await getCurrentProfile()

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/92 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:py-6">
        <Link
          href="/"
          className="flex w-fit items-center gap-3 text-foreground transition-opacity hover:opacity-90"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 via-amber-100/40 to-primary/10 shadow-sm ring-1 ring-primary/15 dark:from-primary/25 dark:via-amber-950/30 dark:to-primary/10">
            <Logo size="md" />
          </span>
          <span className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            RaithuBridge
          </span>
        </Link>
        <nav
          className="flex flex-wrap items-center gap-x-1 gap-y-2 sm:justify-end md:gap-x-1"
          aria-label="Primary"
        >
          <Link href="/products" className={navLinkClass}>
            Products
          </Link>
          {profile?.role === "farmer" || profile?.role === "admin" ? (
            <Link href="/farmer/register" className={navLinkClass}>
              Register Farmer
            </Link>
          ) : null}
          {profile?.role === "admin" ? (
            <Link href="/admin" className={navLinkClass}>
              Admin
            </Link>
          ) : null}
          <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden />
          {user ? (
            <>
              <Link href="/dashboard" className="max-w-56 truncate px-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                {profile ? `${ROLE_LABELS[profile.role]} · ` : ""}
                {user.email}
              </Link>
              <SignOutButton />
            </>
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
