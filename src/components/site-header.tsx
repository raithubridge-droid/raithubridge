import Link from "next/link"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { MobileAccountSignOutButton, UserAccountChip } from "@/components/auth/user-account-panel"
import { CartLink } from "@/components/cart/cart-link"
import { Logo } from "@/components/logo"
import {
  MobileCartLink,
  MobilePrimaryQuickLinks,
  MobileSiteMenu,
} from "@/components/mobile-site-menu"
import { Button } from "@/components/ui/button"
import { getAccountDisplayLabel } from "@/lib/auth/account"
import { getCurrentProfile } from "@/lib/auth/roles"

const navLinkClass =
  "rounded-lg px-3 py-2 text-base font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"

export const dynamic = "force-dynamic"

export async function SiteHeader() {
  const { user, profile } = await getCurrentProfile()
  const isLoggedIn = Boolean(user)
  const isAdmin = profile?.role === "admin"
  const accountLabel = getAccountDisplayLabel(user, profile)

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-3 md:hidden">
          <MobileSiteMenu
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            accountLabel={accountLabel}
            signOutSlot={<MobileAccountSignOutButton />}
          />

          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center justify-center gap-2 text-foreground transition-opacity hover:opacity-90"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 via-amber-100 to-lime-100 shadow-sm ring-1 ring-primary/15">
              <Logo size="sm" />
            </span>
            <span className="min-w-0 truncate font-heading text-lg font-bold tracking-tight">
              RaithuBridge
            </span>
          </Link>

          <MobileCartLink />
        </div>

        <div className="mt-2 md:hidden">
          <MobilePrimaryQuickLinks />
        </div>

        <div className="hidden md:flex md:items-center md:justify-between md:gap-8">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 text-foreground transition-opacity hover:opacity-90"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 via-amber-100 to-lime-100 shadow-sm ring-1 ring-primary/15">
              <Logo size="sm" />
            </span>
            <span className="min-w-0 truncate font-heading text-2xl font-bold tracking-tight">
              RaithuBridge
            </span>
          </Link>

          <nav className="flex flex-wrap items-center justify-end gap-1" aria-label="Primary">
            <Link href="/products" className={navLinkClass}>
              Products
            </Link>
            <Link href="/submit-product" className={navLinkClass}>
              Submit Product
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/account" className={navLinkClass}>
                  Account
                </Link>
                <Link href="/my-submissions" className={navLinkClass}>
                  My Submissions
                </Link>
              </>
            ) : null}
            {isAdmin ? (
              <Link href="/admin" className={navLinkClass}>
                Admin
              </Link>
            ) : null}
            <CartLink />
            <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden />
            {isLoggedIn ? (
              <>
                <UserAccountChip accountLabel={accountLabel} />
                <SignOutButton
                  label="Log out"
                  buttonClassName="h-10 rounded-xl border border-border/70 px-3 text-base font-semibold"
                />
              </>
            ) : (
              <Button asChild variant="ghost" size="default" className="h-10 px-3 text-base">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
