/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ImagePlus, Star, Trash2, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductImage, SafeProductPhoto } from "@/components/product-image"
import { validateImageFile } from "@/lib/admin-product-media-server"
import {
  getAdminUploadedImages,
  getFarmerUploadedImages,
  getFarmerUploadedVideos,
} from "@/lib/product-media"
import type { ProductMediaAsset } from "@/lib/marketplace-data"
import { cn } from "@/lib/utils"

type AdminProductMediaSectionProps = {
  productId: string
  category: string
  mediaAssets?: ProductMediaAsset[]
}

type PendingReplace = {
  mediaId: string
  file: File
  previewUrl: string
  currentUrl: string
  currentName: string
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
  const replaceInputRef = React.useRef<HTMLInputElement>(null)
  const [replaceMediaId, setReplaceMediaId] = React.useState<string | null>(null)
  const [pendingReplace, setPendingReplace] = React.useState<PendingReplace | null>(null)
  const [message, setMessage] = React.useState<string | null>(null)
  const [messageTone, setMessageTone] = React.useState<"success" | "error" | null>(null)
  const [isBusy, setIsBusy] = React.useState(false)

  const farmerPhotos = getFarmerUploadedImages(mediaAssets)
  const farmerVideos = getFarmerUploadedVideos(mediaAssets)
  const adminPhotos = getAdminUploadedImages(mediaAssets)
  const allPhotos = [...farmerPhotos, ...adminPhotos]

  React.useEffect(() => {
    return () => {
      if (pendingReplace?.previewUrl) {
        URL.revokeObjectURL(pendingReplace.previewUrl)
      }
    }
  }, [pendingReplace?.previewUrl])

  function clearPendingReplace() {
    if (pendingReplace?.previewUrl) {
      URL.revokeObjectURL(pendingReplace.previewUrl)
    }
    setPendingReplace(null)
    setReplaceMediaId(null)
    if (replaceInputRef.current) {
      replaceInputRef.current.value = ""
    }
  }

  async function runMediaAction(action: "approve" | "ignore" | "set_primary", mediaId: string) {
    setIsBusy(true)
    setMessage(null)
    setMessageTone(null)

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

      setMessage("Image updated.")
      setMessageTone("success")
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update image.")
      setMessageTone("error")
    } finally {
      setIsBusy(false)
    }
  }

  async function uploadAdminPhoto(file: File) {
    setIsBusy(true)
    setMessage(null)
    setMessageTone(null)

    try {
      const validationError = validateImageFile(file)
      if (validationError) {
        throw new Error(validationError)
      }

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

      setMessage("Image uploaded successfully.")
      setMessageTone("success")
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload image.")
      setMessageTone("error")
    } finally {
      setIsBusy(false)
    }
  }

  async function confirmReplace() {
    if (!pendingReplace) {
      return
    }

    setIsBusy(true)
    setMessage(null)
    setMessageTone(null)

    try {
      const formData = new FormData()
      formData.append("photo", pendingReplace.file)

      const response = await fetch(
        `/api/admin/products/${productId}/media/${pendingReplace.mediaId}`,
        {
          method: "POST",
          body: formData,
        }
      )
      const payload = (await response.json()) as { error?: string; message?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to replace image.")
      }

      clearPendingReplace()
      setMessage(payload.message ?? "Image replaced successfully.")
      setMessageTone("success")
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to replace image.")
      setMessageTone("error")
    } finally {
      setIsBusy(false)
    }
  }

  function handleReplaceFileSelected(file: File, asset: ProductMediaAsset) {
    const validationError = validateImageFile(file)
    if (validationError) {
      setMessage(validationError)
      setMessageTone("error")
      if (replaceInputRef.current) {
        replaceInputRef.current.value = ""
      }
      return
    }

    if (!asset.id) {
      return
    }

    clearPendingReplace()
    setPendingReplace({
      mediaId: asset.id,
      file,
      previewUrl: URL.createObjectURL(file),
      currentUrl: asset.url,
      currentName: asset.name,
    })
    setMessage(null)
    setMessageTone(null)
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
        <SafeProductPhoto
          category={category}
          src={asset.url}
          alt={asset.name}
          className="aspect-[4/3] h-auto"
        />
        {asset.isPrimary ? (
          <MediaBadge className="bg-emerald-800 text-white">Primary</MediaBadge>
        ) : null}
        {asset.status === "pending" ? (
          <MediaBadge className="bg-amber-100 text-amber-950">Pending</MediaBadge>
        ) : null}
        {asset.status === "approved" ? (
          <MediaBadge className="bg-emerald-100 text-emerald-950">Approved</MediaBadge>
        ) : null}
        <div className="grid grid-cols-2 gap-1 border-t border-border/60 bg-card/95 p-2 sm:flex sm:flex-wrap">
          {showApprove ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 flex-1 rounded-lg text-xs"
              disabled={isBusy || Boolean(pendingReplace)}
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
            disabled={isBusy || Boolean(pendingReplace)}
            onClick={() => {
              setReplaceMediaId(asset.id!)
              replaceInputRef.current?.click()
            }}
          >
            <Upload className="size-3.5" aria-hidden />
            Replace
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 flex-1 rounded-lg text-xs"
            disabled={isBusy || Boolean(pendingReplace)}
            onClick={() => runMediaAction("set_primary", asset.id!)}
          >
            <Star className="size-3.5" aria-hidden />
            Primary
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 flex-1 rounded-lg text-xs text-destructive"
            disabled={isBusy || Boolean(pendingReplace)}
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
          Approve farmer photos, replace images, and choose the primary listing photo. Product
          details stay unchanged when you replace an image.
        </p>
      </div>

      {message ? (
        <p
          role="status"
          className={cn(
            "rounded-xl px-3 py-2 text-sm",
            messageTone === "success"
              ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-800/15"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {message}
        </p>
      ) : null}

      {pendingReplace ? (
        <div className="space-y-3 rounded-2xl border border-green-800/20 bg-green-800/5 p-4 ring-1 ring-green-800/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Preview replacement</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Review the new image before saving. Only this photo will change.
              </p>
            </div>
            <button
              type="button"
              onClick={clearPendingReplace}
              aria-label="Cancel replacement"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background text-foreground hover:bg-muted/60"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Current
              </p>
              <SafeProductPhoto
                category={category}
                src={pendingReplace.currentUrl}
                alt={pendingReplace.currentName}
                className="aspect-[4/3] h-auto rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                New image
              </p>
              <div className="overflow-hidden rounded-xl border border-green-800/30 bg-muted/60 ring-1 ring-green-800/15">
                <img
                  src={pendingReplace.previewUrl}
                  alt="New image preview"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <p className="truncate text-xs text-muted-foreground">{pendingReplace.file.name}</p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              className="h-11 rounded-xl bg-green-800 text-sm font-semibold text-white hover:bg-green-900"
              disabled={isBusy}
              onClick={() => void confirmReplace()}
            >
              {isBusy ? "Saving…" : "Save replacement"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl text-sm font-semibold"
              disabled={isBusy}
              onClick={clearPendingReplace}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Farmer uploaded photos</h3>
        {farmerPhotos.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {farmerPhotos.map((asset) => renderPhotoCard(asset, true))}
          </div>
        ) : (
          <ProductImage
            category={category}
            alt="Default product placeholder"
            className="aspect-[4/3] h-auto max-h-48 rounded-xl"
          />
        )}
      </div>

      {farmerVideos.length ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Farmer uploaded videos</h3>
          <div className="grid gap-3">
            {farmerVideos.map((asset) =>
              asset.id ? (
                <div
                  key={asset.id}
                  className="overflow-hidden rounded-xl border border-border/70 bg-muted/60"
                >
                  <video
                    src={asset.url}
                    controls
                    playsInline
                    className="aspect-video w-full bg-black"
                    preload="metadata"
                  />
                  <p className="border-t border-border/60 bg-card/95 px-3 py-2 text-xs text-muted-foreground">
                    {asset.name}
                  </p>
                </div>
              ) : null
            )}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Admin photos</h3>
        {adminPhotos.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {adminPhotos.map((asset) => renderPhotoCard(asset, false))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No admin photos yet.</p>
        )}

        <label
          className={cn(
            "flex min-h-20 flex-col items-center justify-center rounded-xl border border-dashed border-primary/35 bg-primary/5 px-3 py-4 text-center",
            isBusy || pendingReplace ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          )}
        >
          <ImagePlus className="size-6 text-primary" aria-hidden />
          <span className="mt-1 text-sm font-semibold">Upload admin photo</span>
          <span className="mt-1 text-xs text-muted-foreground">
            JPG, JPEG, PNG, or WebP · up to 5 MB
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            disabled={isBusy || Boolean(pendingReplace)}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                void uploadAdminPhoto(file)
              }
            }}
          />
        </label>
      </div>

      {!allPhotos.length ? (
        <p className="text-sm text-muted-foreground">
          No images yet. Upload an admin photo or wait for farmer uploads, then use Replace on any
          image slot after one is added.
        </p>
      ) : null}

      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        disabled={isBusy || Boolean(pendingReplace)}
        onChange={(event) => {
          const file = event.target.files?.[0]
          const mediaId = replaceMediaId
          if (!file || !mediaId) {
            return
          }

          const asset = allPhotos.find((photo) => photo.id === mediaId)
          if (asset) {
            handleReplaceFileSelected(file, asset)
          }
        }}
      />
    </section>
  )
}
