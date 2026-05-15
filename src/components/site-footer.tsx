import Link from "next/link"

import { Logo } from "@/components/logo"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-gradient-to-b from-muted/50 to-muted/70 px-4 py-14 sm:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-3 text-foreground">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 via-amber-100/35 to-primary/10 ring-1 ring-primary/15 dark:from-primary/25 dark:via-amber-950/25 dark:to-primary/10">
              <Logo size="sm" />
            </span>
            <span className="font-heading text-xl font-semibold">RaithuBridge</span>
          </Link>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
            Discover farm products, send inquiries in bulk, and buy closer to the harvest
            across India.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-12 text-base sm:gap-20">
          <div>
            <p className="font-semibold text-foreground">Marketplace</p>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-foreground">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/farmer/register" className="hover:text-foreground">
                  Register Farmer
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-foreground">
                  Admin
                </Link>
              </li>
              <li>
                <Link href="/signin" className="hover:text-foreground">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-foreground">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-foreground">Legal</p>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              <li>
                <span className="cursor-not-allowed opacity-70">Privacy</span>
              </li>
              <li>
                <span className="cursor-not-allowed opacity-70">Terms</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 w-full max-w-6xl border-t border-border/70 pt-10 text-center text-sm text-muted-foreground sm:text-left">
        © {new Date().getFullYear()} RaithuBridge. All rights reserved.
      </div>
    </footer>
  )
}
