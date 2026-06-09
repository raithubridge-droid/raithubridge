"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ClipboardList,
  Home,
  LayoutDashboard,
  LogIn,
  Menu,
  PackageSearch,
  PenLine,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart/cart-provider"
import { cn } from "@/lib/utils"

type MobileSiteMenuProps = {
  isLoggedIn: boolean
  isAdmin: boolean
  accountLabel?: string | null
  signOutSlot?: React.ReactNode
}

const drawerLinkClass =
  "flex min-h-12 items-center gap-3 rounded-xl border border-border/70 bg-card/90 px-4 py-3 text-base font-semibold text-foreground shadow-sm transition-colors hover:bg-primary/10 active:bg-primary/15"

const CLOSE_MOBILE_MENU_EVENT = "raithubridge-close-mobile-menu"

function closeOpenMobileMenu() {
  window.dispatchEvent(new Event(CLOSE_MOBILE_MENU_EVENT))
}

const mobileHeaderIconClass =
  "relative flex size-11 items-center justify-center rounded-xl border border-border/70 bg-card/80 text-foreground shadow-sm transition-colors hover:bg-primary/10 active:bg-primary/15"

export function MobileCartLink({ onClick }: { onClick?: () => void }) {
  const { itemCount } = useCart()

  function handleClick() {
    closeOpenMobileMenu()
    onClick?.()
  }

  return (
    <Link
      href="/cart"
      aria-label={`Cart with ${itemCount} item${itemCount === 1 ? "" : "s"}`}
      className={mobileHeaderIconClass}
      onClick={handleClick}
    >
      <ShoppingCart className="size-5" aria-hidden />
      <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[0.68rem] font-bold leading-none text-primary-foreground">
        {itemCount}
      </span>
    </Link>
  )
}

/** Always-visible mobile shortcuts for the two most important marketplace actions. */
export function MobilePrimaryQuickLinks() {
  const pathname = usePathname()

  return (
    <nav className="grid grid-cols-2 gap-2 md:hidden" aria-label="Quick actions">
      <Link
        href="/products"
        className={cn(
          "flex min-h-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold shadow-sm transition-colors",
          pathname.startsWith("/products")
            ? "border-primary/30 bg-primary/10 text-foreground"
            : "border-primary/15 bg-card/90 text-foreground hover:bg-primary/10"
        )}
        onClick={closeOpenMobileMenu}
      >
        <PackageSearch className="mr-1.5 size-4 shrink-0 text-primary" aria-hidden />
        Products
      </Link>
      <Link
        href="/submit-product"
        className={cn(
          "flex min-h-10 items-center justify-center rounded-xl px-3 text-sm font-semibold shadow-sm transition-colors",
          pathname.startsWith("/submit-product")
            ? "bg-green-900 text-white"
            : "bg-green-800 text-white hover:bg-green-900"
        )}
        onClick={closeOpenMobileMenu}
      >
        <PenLine className="mr-1.5 size-4 shrink-0" aria-hidden />
        Submit Product
      </Link>
    </nav>
  )
}

export function MobileSiteMenu({
  isLoggedIn,
  isAdmin,
  accountLabel,
  signOutSlot,
}: MobileSiteMenuProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  const closeMenu = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  React.useEffect(() => {
    closeMenu()
  }, [pathname, closeMenu])

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    window.addEventListener(CLOSE_MOBILE_MENU_EVENT, closeMenu)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener(CLOSE_MOBILE_MENU_EVENT, closeMenu)
    }
  }, [isOpen, closeMenu])

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 rounded-xl border border-border/70 bg-card/80 text-foreground shadow-sm"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-site-menu-panel"
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </Button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[100] md:hidden"
          role="presentation"
          onClick={closeMenu}
        >
          <div className="absolute inset-0 bg-black/40" aria-hidden />
          <aside
            id="mobile-site-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-site-menu-title"
            className="absolute inset-x-3 top-[7.5rem] max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-2xl border border-border/80 bg-background p-4 shadow-2xl ring-1 ring-primary/10"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
              <div>
                <p id="mobile-site-menu-title" className="font-heading text-lg font-bold text-foreground">
                  Menu
                </p>
                <p className="text-sm text-muted-foreground">Account and more</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10 rounded-xl"
                aria-label="Close navigation menu"
                onClick={closeMenu}
              >
                <X className="size-5" aria-hidden />
              </Button>
            </div>

            {isLoggedIn && accountLabel ? (
              <section
                className="mt-3 rounded-2xl border border-green-800/15 bg-green-800/5 px-3 py-3 ring-1 ring-green-800/10"
                aria-label="Signed in account"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-green-900/70">
                  Signed in as
                </p>
                <p className="mt-1 break-all text-sm font-semibold text-foreground">{accountLabel}</p>
                <Link
                  href="/account"
                  className="mt-2 inline-flex text-sm font-semibold text-green-900 hover:underline"
                  onClick={closeMenu}
                >
                  View account
                </Link>
              </section>
            ) : null}

            <nav className="mt-3 space-y-2" aria-label="Menu links">
              <Link href="/" className={drawerLinkClass} onClick={closeMenu}>
                <Home className="size-5 text-primary" aria-hidden />
                Home
              </Link>
              <Link href="/search" className={drawerLinkClass} onClick={closeMenu}>
                <Search className="size-5 text-primary" aria-hidden />
                Search products
              </Link>
              {isLoggedIn ? (
                <>
                  <Link href="/account" className={drawerLinkClass} onClick={closeMenu}>
                    <User className="size-5 text-primary" aria-hidden />
                    Account
                  </Link>
                  <Link href="/my-submissions" className={drawerLinkClass} onClick={closeMenu}>
                    <ClipboardList className="size-5 text-primary" aria-hidden />
                    My Submissions
                  </Link>
                </>
              ) : null}
              {isAdmin ? (
                <Link href="/admin" className={drawerLinkClass} onClick={closeMenu}>
                  <LayoutDashboard className="size-5 text-primary" aria-hidden />
                  Admin
                </Link>
              ) : null}
            </nav>

            <div className="mt-3 border-t border-border/70 pt-3">
              {isLoggedIn ? (
                <div
                  className={cn(
                    "[&_button]:min-h-12 [&_button]:w-full [&_button]:justify-start [&_button]:gap-3 [&_button]:rounded-xl [&_button]:border [&_button]:border-border/70 [&_button]:bg-card/90 [&_button]:px-4 [&_button]:text-base [&_button]:font-semibold [&_button]:shadow-sm"
                  )}
                >
                  {signOutSlot}
                </div>
              ) : (
                <Link href="/sign-in" className={drawerLinkClass} onClick={closeMenu}>
                  <LogIn className="size-5 text-primary" aria-hidden />
                  Sign In
                </Link>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  )
}
