/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, MapPin, Minus, PackageCheck, Plus, ShoppingCart } from "lucide-react"

import { useCart } from "@/components/cart/cart-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ApprovedProduct } from "@/lib/marketplace-data"

export function ProductDetailClient({ initialProduct }: { initialProduct: ApprovedProduct }) {
  const [product, setProduct] = React.useState(initialProduct)
  const [selectedImage, setSelectedImage] = React.useState(0)
  const [quantity, setQuantity] = React.useState(1)
  const { addItem } = useCart()

  React.useEffect(() => {
    let isMounted = true

    async function loadProduct() {
      try {
        const response = await fetch(`/api/products/${initialProduct.id}`)
        const payload = (await response.json()) as { product?: ApprovedProduct }

        if (isMounted && payload.product) {
          setProduct(payload.product)
        }
      } catch {
        // Keep static initial product when the API is unavailable.
      }
    }

    void loadProduct()

    return () => {
      isMounted = false
    }
  }, [initialProduct.id])

  const photos = product.mediaAssets.filter((asset) => asset.type === "image")
  const selectedPhoto = photos[selectedImage] ?? photos[0]

  return (
    <main className="px-4 pb-5 pt-2 sm:pb-10 sm:pt-4">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/products"
          className="flex items-center gap-2 px-1 pb-2 pt-2 text-sm font-semibold text-green-900 hover:text-primary sm:px-0"
        >
            <ArrowLeft className="size-4" aria-hidden />
            Back to products
        </Link>

        <div className="mt-2 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:gap-8">
          <section className="space-y-2">
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-lg ring-1 ring-primary/5">
              <div className="aspect-[4/3] bg-muted">
                {selectedPhoto ? (
                  <img src={selectedPhoto.url} alt={selectedPhoto.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Product photo
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
              {photos.slice(0, 4).map((asset, index) => (
                <button
                  type="button"
                  key={asset.path}
                  className={`aspect-[4/3] overflow-hidden rounded-2xl border bg-card shadow-sm ${
                    selectedImage === index ? "border-primary ring-2 ring-primary/25" : "border-border/70"
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={asset.url} alt={asset.name} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </section>

          <section className="lg:pt-0">
            <Card className="border-border/70 bg-card/95 shadow-lg ring-1 ring-primary/5">
              <CardContent className="space-y-4 p-4 sm:p-5">
              <div className="mb-1 flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full border border-primary/10 bg-amber-50/90 px-3 py-1 text-xs font-semibold">
                  {product.category}
                </Badge>
                <Badge className="rounded-full px-3 py-1 text-xs">
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
                <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                {product.name}
                </h1>

                <div className="grid gap-2 rounded-2xl bg-muted/55 p-3 text-sm sm:text-base">
                  <p className="text-xl font-bold text-foreground sm:text-2xl">{product.price}</p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="size-4 text-primary sm:size-5" aria-hidden />
                    Availability: {product.inStock ? "In Stock" : "Out of Stock"}
                  </p>
                  <p className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 text-primary sm:size-5" aria-hidden />
                    {product.sellerLocation}
                  </p>
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-2 sm:text-base">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <PackageCheck className="size-4 text-primary sm:size-5" aria-hidden />
                    {product.quantity} {product.unit} available
                  </p>
                </div>

                <div>
                  <h2 className="text-base font-bold text-foreground sm:text-lg">Description</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background p-3">
                  <span className="text-sm font-semibold text-foreground">Quantity</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-4" aria-hidden />
                    </button>
                    <span className="min-w-7 text-center text-base font-bold text-foreground">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
                      onClick={() => setQuantity((current) => Math.min(99, current + 1))}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-4" aria-hidden />
                    </button>
                    <span className="text-sm font-semibold text-foreground">{product.unit}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  className="h-12 w-full rounded-2xl text-base font-bold"
                  onClick={() => addItem(product.id, quantity)}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="size-5" aria-hidden />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  )
}
