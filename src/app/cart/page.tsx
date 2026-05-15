import type { Metadata } from "next"

import { CartPageClient } from "@/app/cart/cart-page-client"

export const metadata: Metadata = {
  title: "Cart",
  description: "Review selected farm products before checkout.",
}

export default function CartPage() {
  return <CartPageClient />
}
