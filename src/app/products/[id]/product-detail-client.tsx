/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import Link from "next/link"
import { CheckCircle2, MapPin, PackageCheck, Truck, UserRound, Video } from "lucide-react"

import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ApprovedProduct } from "@/lib/marketplace-data"

export function ProductDetailClient({ initialProduct }: { initialProduct: ApprovedProduct }) {
  const [product, setProduct] = React.useState(initialProduct)

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
  const videos = product.mediaAssets.filter((asset) => asset.type === "video")

  return (
    <main className="px-4 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <Button asChild variant="ghost" className="-ml-2 mb-8 h-11 text-base text-muted-foreground">
          <Link href="/products">Back to products</Link>
        </Button>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
          <section className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-lg ring-1 ring-primary/5">
              <div className="aspect-[4/3] bg-muted">
                {photos[0] ? (
                  <img src={photos[0].url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Product photo
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {photos.slice(1).map((asset) => (
                <div
                  key={asset.path}
                  className="aspect-[4/3] overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm"
                >
                  <img src={asset.url} alt={asset.name} className="h-full w-full object-cover" />
                </div>
              ))}
              {videos.map((asset) => (
                <div
                  key={asset.path}
                  className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-4 text-center"
                >
                  <Video className="size-8 text-amber-700" aria-hidden />
                  <p className="mt-2 text-sm font-semibold text-foreground">{asset.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Uploaded video preview</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1 text-sm font-semibold">
                  {product.category}
                </Badge>
                <Badge className="px-3 py-1 text-sm">{product.status}</Badge>
              </div>
              <h1 className="mt-5 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>

            <Card className="border-border/70 bg-card/95 shadow-lg ring-1 ring-primary/5">
              <CardContent className="space-y-5 p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="text-3xl font-bold text-foreground">{product.price}</p>
                  <p className="text-base text-muted-foreground">{product.unitSize}</p>
                </div>
                <div className="grid gap-4 text-base sm:grid-cols-2">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <PackageCheck className="size-5 text-primary" aria-hidden />
                    {product.quantity} {product.unit} available
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="size-5 text-primary" aria-hidden />
                    {product.inStock ? "In stock" : "Out of stock"}
                  </p>
                </div>
                <AddToCartButton
                  productId={product.id}
                  className="h-12 w-full rounded-xl text-base font-semibold"
                />
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl">Seller information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-base text-muted-foreground">
                <p className="flex items-center gap-2">
                  <UserRound className="size-5 text-primary" aria-hidden />
                  {product.sellerName}
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-5 text-primary" aria-hidden />
                  {product.sellerLocation}
                </p>
                <p>{product.sellerInfo}</p>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/95 shadow-md ring-1 ring-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl">Delivery and purchase notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-base text-muted-foreground">
                <p className="flex items-start gap-2">
                  <Truck className="mt-0.5 size-5 text-primary" aria-hidden />
                  {product.deliveryInfo}
                </p>
                <p>
                  Add this item to cart to review quantities before checkout. Direct seller
                  contact is disabled in this flow.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  )
}
