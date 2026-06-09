"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  User,
} from "lucide-react"

import { useCart } from "@/components/cart/cart-provider"
import { ProductImage, SafeProductPhoto } from "@/components/product-image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ApprovedProduct } from "@/lib/marketplace-data"
import { getPublicDisplayImages } from "@/lib/product-media"
import { getSampleProduct } from "@/lib/sample-products"
import { cn } from "@/lib/utils"

type DetailFieldProps = {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
}

function DetailField({ label, value, icon }: DetailFieldProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2.5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 flex items-start gap-2 text-sm font-medium text-foreground">
        {icon ? <span className="mt-0.5 shrink-0 text-primary">{icon}</span> : null}
        <span className="min-w-0">{value}</span>
      </dd>
    </div>
  )
}

export function ProductDetailClient({ initialProduct }: { initialProduct: ApprovedProduct }) {
  const router = useRouter()
  const [product, setProduct] = React.useState(initialProduct)
  const [selectedImage, setSelectedImage] = React.useState(0)
  const [quantity, setQuantity] = React.useState(1)
  const [actionMessage, setActionMessage] = React.useState<string | null>(null)
  const { addItem } = useCart()

  React.useEffect(() => {
    if (getSampleProduct(initialProduct.id)) {
      return
    }

    let isMounted = true

    async function loadProduct() {
      try {
        const response = await fetch(`/api/products/${initialProduct.id}`)
        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as { product?: ApprovedProduct }

        if (isMounted && payload.product) {
          setProduct(payload.product)
        }
      } catch {
        // Keep server-rendered product when the API is unavailable.
      }
    }

    void loadProduct()

    return () => {
      isMounted = false
    }
  }, [initialProduct.id])

  const photos = getPublicDisplayImages(product.mediaAssets)
  const hasGallery = photos.length > 0

  function handleAddToCart() {
    addItem(product.id, quantity)
    setActionMessage(`Added ${quantity} ${product.unit} to your cart.`)
  }

  function handleSendInquiry() {
    addItem(product.id, quantity)
    router.push("/cart")
  }

  return (
    <main className="px-4 pb-32 pt-2 sm:pb-10 sm:pt-4">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/products"
          className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-green-900 hover:text-primary"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to products
        </Link>

        <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:gap-8">
          <section className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-lg ring-1 ring-primary/5">
              <ProductImage
                category={product.category}
                mediaAssets={product.mediaAssets}
                imageUrl={hasGallery ? photos[selectedImage]?.url ?? photos[0]?.url : undefined}
                alt={photos[selectedImage]?.name ?? product.name}
                className="aspect-[4/3] h-auto"
              />
            </div>

            {hasGallery ? (
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {photos.slice(0, 4).map((asset, index) => (
                  <button
                    type="button"
                    key={asset.id ?? asset.path}
                    className={cn(
                      "overflow-hidden rounded-xl border shadow-sm transition-colors",
                      selectedImage === index
                        ? "border-primary ring-2 ring-primary/25"
                        : "border-border/70 hover:border-primary/40"
                    )}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View image ${index + 1}`}
                    aria-current={selectedImage === index ? "true" : undefined}
                  >
                    <SafeProductPhoto
                      category={product.category}
                      src={asset.url}
                      alt={asset.name}
                      className="aspect-[4/3] h-auto"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section className="space-y-4">
            <Card className="border-border/70 bg-card/95 shadow-lg ring-1 ring-primary/5">
              <CardContent className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="rounded-full border border-primary/10 bg-amber-50/90 px-3 py-1 text-xs font-semibold"
                  >
                    {product.category}
                  </Badge>
                  <Badge
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      product.inStock
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-red-100 text-red-900"
                    )}
                  >
                    {product.inStock ? "In stock" : "Out of stock"}
                  </Badge>
                </div>

                <div>
                  <h1 className="font-heading text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                    {product.name}
                  </h1>
                  <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{product.price}</p>
                </div>

                <dl className="grid gap-2 sm:grid-cols-2">
                  <DetailField
                    label="Quantity available"
                    value={`${product.quantity} ${product.unit}`}
                    icon={<Package className="size-4" aria-hidden />}
                  />
                  <DetailField label="Unit" value={product.unit} />
                  <DetailField
                    label="Location"
                    value={product.sellerLocation}
                    icon={<MapPin className="size-4" aria-hidden />}
                  />
                  <DetailField
                    label="Farmer"
                    value={product.sellerName}
                    icon={<User className="size-4" aria-hidden />}
                  />
                </dl>

                <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
                  <h2 className="text-sm font-semibold text-foreground">Description</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {product.description}
                  </p>
                </div>

                <div className="rounded-2xl border border-green-800/15 bg-green-800/5 p-4">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <MessageCircle className="size-4 text-green-900" aria-hidden />
                    Contact & inquiry
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {product.sellerInfo ||
                      "Seller details are verified by RaithuBridge. Add this product to your cart to send an inquiry and continue with checkout."}
                  </p>
                  {product.deliveryInfo ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Delivery:</span>{" "}
                      {product.deliveryInfo}
                    </p>
                  ) : null}
                </div>

                <div className="hidden rounded-2xl border border-border/70 bg-background p-3 lg:block">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-foreground">Quantity</span>
                    <QuantityStepper
                      quantity={quantity}
                      unit={product.unit}
                      onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
                      onIncrease={() => setQuantity((current) => Math.min(99, current + 1))}
                    />
                  </div>
                </div>

                {actionMessage ? (
                  <p
                    role="status"
                    className="hidden rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900 ring-1 ring-emerald-800/15 lg:block"
                  >
                    {actionMessage}
                  </p>
                ) : null}

                <div className="hidden gap-2 lg:grid lg:grid-cols-2">
                  <Button
                    type="button"
                    className="h-12 rounded-2xl bg-green-800 text-base font-bold text-white hover:bg-green-900"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="size-5" aria-hidden />
                    Add to Cart
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 rounded-2xl border-2 border-green-800/30 text-base font-bold text-green-900 hover:bg-green-800/5"
                    onClick={handleSendInquiry}
                    disabled={!product.inStock}
                  >
                    <MessageCircle className="size-5" aria-hidden />
                    Send Inquiry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/85 lg:hidden">
        <div className="mx-auto w-full max-w-6xl space-y-2">
          {actionMessage ? (
            <p
              role="status"
              className="rounded-xl bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-900 ring-1 ring-emerald-800/15"
            >
              {actionMessage}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-3 py-2">
            <span className="text-sm font-semibold text-foreground">Qty</span>
            <QuantityStepper
              quantity={quantity}
              unit={product.unit}
              onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
              onIncrease={() => setQuantity((current) => Math.min(99, current + 1))}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl border-2 border-green-800/30 text-sm font-bold text-green-900"
              onClick={handleSendInquiry}
              disabled={!product.inStock}
            >
              <MessageCircle className="size-4" aria-hidden />
              Send Inquiry
            </Button>
            <Button
              type="button"
              className="h-12 rounded-xl bg-green-800 text-sm font-bold text-white hover:bg-green-900"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="size-4" aria-hidden />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

function QuantityStepper({
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
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
        onClick={onDecrease}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="min-w-7 text-center text-base font-bold text-foreground">{quantity}</span>
      <button
        type="button"
        className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
        onClick={onIncrease}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" aria-hidden />
      </button>
      <span className="text-sm font-semibold text-muted-foreground">{unit}</span>
    </div>
  )
}
