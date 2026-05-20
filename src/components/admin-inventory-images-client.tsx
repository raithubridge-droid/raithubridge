/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ImagePlus, Star, Trash2, Upload } from "lucide-react"

import { ProductImage } from "@/components/product-image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MAX_PRODUCT_IMAGES } from "@/lib/admin-product-media-server"
import type { ProductMediaAsset } from "@/lib/marketplace-data"

type InventoryImageProduct = {
  id: string
  name: string
  category: string
  reviewStatus: string | null
  isApproved: boolean
  mediaAssets: ProductMediaAsset[]
}

export function AdminInventoryImagesClient({
  productId,
  initialProduct,
}: {
  productId: string
  initialProduct: InventoryImageProduct
}) {
  const router = useRouter()
  const addInputRef = React.useRef<HTMLInputElement>(null)
  const replaceInputRef = React.useRef<HTMLInputElement>(null)
  const [product, setProduct] = React.useState(initialProduct)
  const [replaceMediaId, setReplaceMediaId] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState<string | null>(null)
  const [isBusy, setIsBusy] = React.useState(false)

  const images = product.mediaAssets
  const atImageLimit = images.length >= MAX_PRODUCT_IMAGES

  async function refreshProduct() {
    const response = await fetch(`/api/admin/inventory/${productId}/images`)
    const payload = (await response.json()) as {
      error?: string
      product?: InventoryImageProduct
    }

    if (!response.ok || !payload.product) {
      throw new Error(payload.error ?? "Unable to refresh images.")
    }

    setProduct(payload.product)
    router.refresh()
  }

  async function runAction(action: () => Promise<void>) {
    setIsBusy(true)
    setMessage(null)

    try {
      await action()
      await refreshProduct()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.")
    } finally {
      setIsBusy(false)
    }
  }

  async function uploadNew(file: File) {
    const formData = new FormData()
    formData.append("photo", file)

    const response = await fetch(`/api/admin/inventory/${productId}/images`, {
      method: "POST",
      body: formData,
    })
    const payload = (await response.json()) as { error?: string }

    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to upload image.")
    }
  }

  async function replaceImage(mediaId: string, file: File) {
    const formData = new FormData()
    formData.append("photo", file)

    const response = await fetch(
      `/api/admin/inventory/${productId}/images/${mediaId}`,
      {
        method: "POST",
        body: formData,
      }
    )
    const payload = (await response.json()) as { error?: string }

    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to replace image.")
    }
  }

  async function setPrimary(mediaId: string) {
    const response = await fetch(`/api/admin/inventory/${productId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_primary", mediaId }),
    })
    const payload = (await response.json()) as { error?: string }

    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to set primary image.")
    }
  }

  async function deleteImage(mediaId: string) {
    const response = await fetch(
      `/api/admin/inventory/${productId}/images?mediaId=${encodeURIComponent(mediaId)}`,
      { method: "DELETE" }
    )
    const payload = (await response.json()) as { error?: string }

    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to delete image.")
    }
  }

  return (
    <main className="px-4 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <Link
          href="/admin/inventory"
          className="inline-flex items-center gap-2 text-sm font-medium text-green-900"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          Back to inventory
        </Link>

        <section className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">
          <h1 className="font-heading text-2xl font-bold">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {images.length} / {MAX_PRODUCT_IMAGES} images
            {product.isApproved ? " · Visible on public catalog when approved & public" : ""}
          </p>
        </section>

        {message ? (
          <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {message}
          </p>
        ) : null}

        {images.length ? (
          <div className="space-y-3">
            {images.map((asset) => (
              <article
                key={asset.id ?? asset.path}
                className="rounded-2xl border border-border/70 bg-card/95 p-3 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted/80">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">{asset.name}</p>
                      {asset.isPrimary ? (
                        <Badge className="bg-emerald-800 text-white">Primary</Badge>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!asset.isPrimary && asset.id ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-9 rounded-xl text-xs"
                          disabled={isBusy}
                          onClick={() => runAction(() => setPrimary(asset.id!))}
                        >
                          <Star className="size-3.5" aria-hidden />
                          Set primary
                        </Button>
                      ) : null}
                      {asset.id ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-9 rounded-xl text-xs"
                          disabled={isBusy}
                          onClick={() => {
                            setReplaceMediaId(asset.id!)
                            replaceInputRef.current?.click()
                          }}
                        >
                          <Upload className="size-3.5" aria-hidden />
                          Replace
                        </Button>
                      ) : null}
                      {asset.id ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-9 rounded-xl text-xs text-destructive"
                          disabled={isBusy}
                          onClick={() => runAction(() => deleteImage(asset.id!))}
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">
            <ProductImage
              category={product.category}
              alt={product.name}
              className="mx-auto aspect-square h-auto max-h-56 w-full max-w-xs rounded-xl"
            />
            <p className="mt-3 text-center text-sm text-muted-foreground">
              No product images yet. Upload images for this listing.
            </p>
          </section>
        )}

        <label
          className={`flex min-h-24 flex-col items-center justify-center rounded-2xl border border-dashed border-primary/35 bg-primary/5 px-4 py-5 text-center ${
            isBusy || atImageLimit ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          }`}
        >
          <ImagePlus className="size-7 text-primary" aria-hidden />
          <span className="mt-2 text-sm font-semibold">
            {images.length ? "Upload another image" : "Upload product images"}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">
            JPG, JPEG, PNG, or WebP · up to 5 MB · max {MAX_PRODUCT_IMAGES} images
          </span>
          <input
            ref={addInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            disabled={isBusy || atImageLimit}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) {
                return
              }

              void runAction(async () => {
                await uploadNew(file)
                if (addInputRef.current) {
                  addInputRef.current.value = ""
                }
              })
            }}
          />
        </label>

        {atImageLimit ? (
          <p className="text-center text-sm text-muted-foreground">
            Maximum of {MAX_PRODUCT_IMAGES} images reached. Replace or delete an image to add
            another.
          </p>
        ) : null}

        <input
          ref={replaceInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          disabled={isBusy}
          onChange={(event) => {
            const file = event.target.files?.[0]
            const mediaId = replaceMediaId

            if (!file || !mediaId) {
              return
            }

            void runAction(async () => {
              await replaceImage(mediaId, file)
              setReplaceMediaId(null)
              if (replaceInputRef.current) {
                replaceInputRef.current.value = ""
              }
            })
          }}
        />
      </div>
    </main>
  )
}
