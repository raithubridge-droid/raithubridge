"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { useCart } from "@/components/cart/cart-provider"

export function CartLink() {
  const { itemCount } = useCart()

  return (
    <Link
      href="/cart"
      className="inline-flex h-10 items-center gap-2 rounded-md px-2.5 py-2 text-base font-semibold text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
    >
      <ShoppingCart className="size-5" aria-hidden />
      Cart
      <span className="min-w-6 rounded-full bg-primary px-2 py-0.5 text-center text-xs font-bold text-primary-foreground">
        {itemCount}
      </span>
    </Link>
  )
}
