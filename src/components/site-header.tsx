import Link from "next/link"
import { Sprout } from "lucide-react"

import { Button } from "@/components/ui/button"

const navLinkClass =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <Link
          href="/"
          className="flex w-fit items-center gap-2.5 text-foreground transition-opacity hover:opacity-90"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20">
            <Sprout className="size-5" aria-hidden />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight sm:text-xl">
            RaithuBridge
          </span>
        </Link>
        <nav
          className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 sm:justify-end md:gap-x-6"
          aria-label="Primary"
        >
          <Link href="/products" className={navLinkClass}>
            Products
          </Link>
          <Link href="/farmer/register" className={navLinkClass}>
            Register Farmer
          </Link>
          <Link href="/admin" className={navLinkClass}>
            Admin
          </Link>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/products">Browse</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
