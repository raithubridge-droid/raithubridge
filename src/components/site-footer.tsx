import Link from "next/link"
import { Sprout } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/40 px-4 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="size-4" aria-hidden />
            </span>
            <span className="font-heading text-lg font-semibold">RaithuBridge</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Discover farm products, send inquiries in bulk, and buy closer to the
            harvest across India.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm sm:gap-16">
          <div>
            <p className="font-medium text-foreground">Marketplace</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
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
            </ul>
          </div>
          <div>
            <p className="font-medium text-foreground">Legal</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
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
      <div className="mx-auto mt-10 w-full max-w-6xl border-t border-border/80 pt-8 text-center text-xs text-muted-foreground sm:text-left">
        © {new Date().getFullYear()} RaithuBridge. All rights reserved.
      </div>
    </footer>
  )
}
