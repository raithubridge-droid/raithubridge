"use client"

import * as React from "react"
import Link from "next/link"
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
  UserPlus,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart/cart-provider"
import { cn } from "@/lib/utils"

type MobileSiteMenuProps = {
  isLoggedIn: boolean
  isAdmin: boolean
  signOutSlot?: React.ReactNode
}

const drawerLinkClass =
  "flex min-h-12 items-center gap-3 rounded-xl border border-border/70 bg-card/90 px-4 py-3 text-base font-semibold text-foreground shadow-sm transition-colors hover:bg-primary/10"

const CLOSE_MOBILE_MENU_EVENT = "raithubridge-close-mobile-menu"

function closeOpenMobileMenu() {
  window.dispatchEvent(new Event(CLOSE_MOBILE_MENU_EVENT))
}

const mobileHeaderIconClass =
  "relative flex size-11 items-center justify-center rounded-xl border border-border/70 bg-card/80 text-foreground shadow-sm transition-colors hover:bg-primary/10"

export function MobileSearchLink() {
  return (
    <Link
      href="/search"
      aria-label="Search products"
      className={mobileHeaderIconClass}
      onClick={closeOpenMobileMenu}
    >
      <Search className="size-5" aria-hidden />
    </Link>
  )
}

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

export function MobileSiteMenu({ isLoggedIn, isAdmin, signOutSlot }: MobileSiteMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    window.addEventListener(CLOSE_MOBILE_MENU_EVENT, closeMenu)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener(CLOSE_MOBILE_MENU_EVENT, closeMenu)
    }
  }, [isOpen])

  function closeMenu() {
    setIsOpen(false)
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 rounded-xl border border-border/70 bg-card/80 text-foreground shadow-sm"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <Menu className="size-5" aria-hidden />
      </Button>

      {isOpen ? (
        <div className="rb-mobile-menu-layer fixed inset-x-0 bottom-0 z-[100]" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close navigation menu"
            onClick={closeMenu}
          />
          <aside className="relative mx-auto box-border max-h-[calc(100dvh-5.5rem)] w-[calc(100vw-1.5rem)] max-w-md overflow-y-auto rounded-2xl border border-border/80 bg-background p-4 shadow-2xl ring-1 ring-primary/10 min-[420px]:max-h-[calc(100dvh-9rem)]">
            <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
              <div>
                <p className="font-heading text-lg font-bold text-foreground">RaithuBridge</p>
                <p className="text-sm text-muted-foreground">Marketplace menu</p>
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

            <nav className="mt-3 space-y-2" aria-label="Mobile">
              <Link href="/" className={drawerLinkClass} onClick={closeMenu}>
                <Home className="size-5 text-primary" aria-hidden />
                Home
              </Link>
              <Link href="/products" className={drawerLinkClass} onClick={closeMenu}>
                <PackageSearch className="size-5 text-primary" aria-hidden />
                Products
              </Link>
              <Link href="/submit-product" className={drawerLinkClass} onClick={closeMenu}>
                <PenLine className="size-5 text-primary" aria-hidden />
                Submit Product
              </Link>
              {isLoggedIn ? (
                <Link href="/my-submissions" className={drawerLinkClass} onClick={closeMenu}>
                  <ClipboardList className="size-5 text-primary" aria-hidden />
                  My Submissions
                </Link>
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
                    "[&_button]:min-h-12 [&_button]:w-full [&_button]:justify-start [&_button]:rounded-xl [&_button]:border [&_button]:border-border/70 [&_button]:bg-card/90 [&_button]:px-4 [&_button]:text-base [&_button]:font-semibold [&_button]:shadow-sm"
                  )}
                >
                  {signOutSlot}
                </div>
              ) : (
                <div className="grid gap-2">
                  <Link href="/signin" className={drawerLinkClass} onClick={closeMenu}>
                    <LogIn className="size-5 text-primary" aria-hidden />
                    Sign In
                  </Link>
                  <Link href="/signup" className={drawerLinkClass} onClick={closeMenu}>
                    <UserPlus className="size-5 text-primary" aria-hidden />
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  )
}
