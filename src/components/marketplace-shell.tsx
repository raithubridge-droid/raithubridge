import type { ReactNode } from "react"

import { CartProvider } from "@/components/cart/cart-provider"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export function MarketplaceShell({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <div className="relative flex-1 rb-marketplace-bg">
          <div
            className="pointer-events-none absolute inset-0 rb-grain opacity-[0.45] dark:opacity-[0.2]"
            aria-hidden
          />
          <div className="relative">{children}</div>
        </div>
        <SiteFooter />
      </div>
    </CartProvider>
  )
}
