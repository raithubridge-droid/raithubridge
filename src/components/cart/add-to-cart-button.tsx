"use client"

import * as React from "react"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart/cart-provider"

export function AddToCartButton({
  productId,
  className,
  size = "lg",
}: {
  productId: string
  className?: string
  size?: "default" | "lg"
}) {
  const { addItem } = useCart()
  const [added, setAdded] = React.useState(false)

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    addItem(productId)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <Button type="button" size={size} className={className} onClick={handleClick}>
      <ShoppingCart className="size-5" aria-hidden />
      {added ? "Added" : "Add to Cart"}
    </Button>
  )
}
