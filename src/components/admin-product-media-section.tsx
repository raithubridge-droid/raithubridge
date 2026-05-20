/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ImagePlus, Star, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductImage } from "@/components/product-image"
import {
  getAdminUploadedImages,
  getFarmerUploadedImages,
} from "@/lib/product-media"
import type { ProductMediaAsset } from "@/lib/marketplace-data"
import { cn } from "@/lib/utils"

type AdminProductMediaSectionProps = {
  productId: string
  category: string
  mediaAssets?: ProductMediaAsset[]
}

function MediaBadge({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide",
        className
      )}
    >
      {children}
    </span>
  )
}

export function AdminProductMediaSection({
  productId,
  category,
  mediaAssets = [],
}: AdminProductMediaSectionProps) {
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [message, setMessage] = React.useState<string | null>(null)
  const [isBusy, setIsBusy] = React.useState(false)

  const farmerPhotos = getFarmerUploadedImages(mediaAssets)
  const adminPhotos = getAdminUploadedImages(mediaAssets)

  async function runMediaAction(action: "approve" | "ignore" | "set_primary", mediaId: string) {
    setIsBusy(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/products/${productId}/media`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, mediaId }),
      })
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update image.")
      }

      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update image.")
    } finally {
      setIsBusy(false)
    }
  }

  async function uploadAdminPhoto(file: File) {
    setIsBusy(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("photo", file)

      const response = await fetch(`/api/admin/products/${productId}/media`, {
        method: "POST",
        body: formData,
      })
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to upload image.")
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload image.")
    } finally {
      setIsBusy(false)
    }
  }

  function renderPhotoCard(asset: ProductMediaAsset, showApprove: boolean) {
    if (!asset.id) {
      return null
    }

    return (
      <div
        key={asset.id}
        className="relative overflow-hidden rounded-xl border border-border/70 bg-muted/60"
      >
        <div className="aspect-[4/3]">
          <img src={asset.url} alt={asset.name} className="h-full w-full object-cover" />
        </div>
        {asset.isPrimary ? (
          <MediaBadge className="bg-emerald-800 text-white">Primary</MediaBadge>
        ) : null}
        {asset.status === "pending" ? (
          <MediaBadge className="bg-amber-100 text-amber-950">Pending</MediaBadge>
        ) : null}
        {asset.status === "approved" ? (
          <MediaBadge className="bg-emerald-100 text-emerald-950">Approved</MediaBadge>
        ) : null}
        <div className="flex flex-wrap gap-1 border-t border-border/60 bg-card/95 p-2">
          {showApprove ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 flex-1 rounded-lg text-xs"
              disabled={isBusy}
              onClick={() => runMediaAction("approve", asset.id!)}
            >
              Approve
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 flex-1 rounded-lg text-xs"
            disabled={isBusy}
            onClick={() => runMediaAction("set_primary", asset.id!)}
          >
            <Star className="size-3.5" aria-hidden />
            Primary
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 rounded-lg text-xs text-destructive"
            disabled={isBusy}
            onClick={() => runMediaAction("ignore", asset.id!)}
          >
            <Trash2 className="size-3.5" aria-hidden />
            Ignore
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Image management
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve farmer photos, upload replacements, and choose the primary image. Images go public
          only after the product is approved.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Farmer uploaded photos</h3>
        {farmerPhotos.length ? (
          <div className="grid grid-cols-2 gap-3">
            {farmerPhotos.map((asset) => renderPhotoCard(asset, true))}
          </div>
        ) : (
          <ProductImage category={category} alt="No farmer photos" className="aspect-[4/3] h-auto max-h-48" />
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Admin photos</h3>
        {adminPhotos.length ? (
          <div className="grid grid-cols-2 gap-3">
            {adminPhotos.map((asset) => renderPhotoCard(asset, false))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No admin photos yet.</p>
        )}

        <label className="flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/35 bg-primary/5 px-3 py-4 text-center">
          <ImagePlus className="size-6 text-primary" aria-hidden />
          <span className="mt-1 text-sm font-semibold">Upload admin photo</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={isBusy}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                void uploadAdminPhoto(file)
              }
            }}
          />
        </label>
      </div>

      {message ? <p className="text-sm text-destructive">{message}</p> : null}
    </section>
  )
}
