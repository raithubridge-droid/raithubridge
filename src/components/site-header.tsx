import Link from "next/link"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { CartLink } from "@/components/cart/cart-link"
import { Logo } from "@/components/logo"
import {
  MobileCartLink,
  MobileHomeQuickLinks,
  MobileSearchLink,
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
      <style>
        {`
          .rb-mobile-only { display: block; }
          .rb-mobile-actions { display: flex; }
          .rb-mobile-quick { display: none; }
          .rb-desktop-nav { display: none; }
          .rb-mobile-menu-layer { top: 4.75rem; }

          @media (min-width: 390px) and (max-width: 767px) {
            .rb-mobile-quick { display: grid; }
            .rb-mobile-menu-layer { top: 8.5rem; }
          }

          @media (min-width: 768px) {
            .rb-mobile-only,
            .rb-mobile-menu-layer {
              display: none !important;
            }

            .rb-desktop-nav {
              display: flex;
            }
          }
        `}
      </style>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-8 md:py-4">
        <div className="flex min-w-0 items-center justify-between gap-3 md:contents">
          <div className="rb-mobile-only">
            <MobileSiteMenu
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              accountLabel={accountLabel}
              signOutSlot={
                <SignOutButton
                  formClassName="w-full"
                  buttonClassName="min-h-12 w-full justify-start rounded-xl border border-border/70 bg-card/90 px-4 text-base font-semibold shadow-sm"
                />
              }
            />
          </div>
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 text-foreground transition-opacity hover:opacity-90 md:gap-3"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 via-amber-100 to-lime-100 shadow-sm ring-1 ring-primary/15 md:size-12">
              <Logo size="sm" />
            </span>
            <span className="min-w-0 truncate font-heading text-xl font-bold tracking-tight md:text-2xl">
              RaithuBridge
            </span>
          </Link>
          <div className="rb-mobile-only rb-mobile-actions items-center gap-2">
            <MobileSearchLink />
            <MobileCartLink />
          </div>
        </div>

        <MobileHomeQuickLinks />

        <nav
          className="rb-desktop-nav items-center gap-1 flex-wrap justify-end"
          aria-label="Primary"
        >
          <Link href="/products" className={navLinkClass}>
            Products
          </Link>
          <Link href="/submit-product" className={navLinkClass}>
            Submit Product
          </Link>
          {isLoggedIn ? (
            <Link href="/my-submissions" className={navLinkClass}>
              My Submissions
            </Link>
          ) : null}
          {isAdmin ? (
            <Link href="/admin" className={navLinkClass}>
              Admin
            </Link>
          ) : null}
          <div className="hidden md:block">
            <CartLink />
          </div>
          <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden />
          {isLoggedIn ? (
            <SignOutButton />
          ) : (
            <Button asChild variant="ghost" size="default" className="h-10 px-3 text-base">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
