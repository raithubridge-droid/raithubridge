/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import Link from "next/link"
import { Minus, Plus, ShoppingCart } from "lucide-react"

import { useCart } from "@/components/cart/cart-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SampleProduct } from "@/lib/sample-products"

function QuantityControl({
  quantity,
  unit,
  onDecrease,
  onIncrease,
}: {
  quantity: number
  unit: string
  onDecrease: () => void
  onIncrease: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-semibold text-foreground">Quantity</span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
          aria-label="Decrease quantity"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onDecrease()
          }}
        >
          <Minus className="size-3.5" aria-hidden />
        </button>
        <span className="min-w-6 text-center text-sm font-bold text-foreground">{quantity}</span>
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
          aria-label="Increase quantity"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onIncrease()
          }}
        >
          <Plus className="size-3.5" aria-hidden />
        </button>
        <span className="ml-1 text-xs font-semibold text-foreground">{unit}</span>
      </div>
    </div>
  )
}

type SampleProductCardProps = {
  product: SampleProduct
  imageClassName?: string
  priceClassName?: string
  addToCartClassName?: string
}

export function SampleProductCard({
  product,
  imageClassName = "h-32 sm:h-40 lg:h-44",
  priceClassName,
  addToCartClassName = "h-10 w-full rounded-2xl text-sm font-bold",
}: SampleProductCardProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = React.useState(1)
  const productHref = `/products/${product.id}`

  function addToCart(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    addItem(product.id, quantity)
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-primary/5 transition-[box-shadow,transform] hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={productHref}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`View details for ${product.name}`}
      >
        <div className={`overflow-hidden bg-muted ${imageClassName}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        <div className="flex items-start justify-between gap-2 px-3 pb-2 pt-3">
          <p className="line-clamp-2 min-h-9 flex-1 text-sm font-bold leading-tight text-foreground sm:text-base">
            {product.name}
          </p>
          <Badge
            variant="secondary"
            className="shrink-0 border border-primary/10 bg-amber-50/90 px-2 py-0.5 text-[0.64rem] font-semibold text-foreground"
          >
            {product.category}
          </Badge>
        </div>
        {priceClassName ? (
          <p className={`px-3 pb-2 ${priceClassName}`}>
            Rs. {product.price} / {product.unit}
          </p>
        ) : null}
      </Link>

      <div className="mt-auto space-y-3 px-3 pb-3">
        <QuantityControl
          quantity={quantity}
          unit={product.unit}
          onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
          onIncrease={() => setQuantity((current) => Math.min(99, current + 1))}
        />
        <Button type="button" className={addToCartClassName} onClick={addToCart}>
          <ShoppingCart className="size-4" aria-hidden />
          Add to Cart
        </Button>
      </div>
    </article>
  )
}
