import type { Metadata } from "next"

import { CartPageClient } from "@/app/cart/cart-page-client"
import { getCurrentProfile } from "@/lib/auth/roles"

export const metadata: Metadata = {
  title: "Cart",
  description: "Review selected farm products before checkout.",
}

export default async function CartPage() {
  const { user } = await getCurrentProfile()

  return <CartPageClient isSignedIn={Boolean(user)} />
}
