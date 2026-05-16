/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import { ImageIcon, X } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const MAX_PHOTOS = 6
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

type PhotoPreview = {
  file: File
  url: string
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function PhotoPreviewList({
  photos,
  onClear,
}: {
  photos: PhotoPreview[]
  onClear: () => void
}) {
  if (!photos.length) {
    return null
  }

  return (
    <div className="rounded-xl border border-border/70 bg-background/75 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">
          {photos.length} photo
          {photos.length === 1 ? "" : "s"} selected
        </p>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={onClear}>
          <X className="size-4" aria-hidden />
          Clear
        </Button>
      </div>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {photos.map(({ file, url }) => (
          <li
            key={`${file.name}-${file.size}`}
            className="overflow-hidden rounded-lg border border-border/60 bg-muted/60 text-sm"
          >
            <img src={url} alt={file.name} className="aspect-[4/3] w-full object-cover" />
            <div className="flex items-center gap-3 px-3 py-2">
              <ImageIcon className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="shrink-0 text-muted-foreground">{formatFileSize(file.size)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function FarmerProductForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = React.useState(true)
  const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([])
  const [photos, setPhotos] = React.useState<PhotoPreview[]>([])
  const [message, setMessage] = React.useState<string | null>(null)
  const photoInputRef = React.useRef<HTMLInputElement>(null)
  const router = useRouter()

  React.useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.url))
    }
  }, [photos])

  React.useEffect(() => {
    let isMounted = true

    async function loadCategories() {
      setIsLoadingCategories(true)

      try {
        const response = await fetch("/api/categories")
        const payload = (await response.json()) as {
          categories?: { id: string; name: string }[]
        }

        if (isMounted && payload.categories?.length) {
          setCategories(payload.categories)
        }
      } catch {
        if (isMounted) {
          setMessage("Categories could not be loaded. Refresh and try again.")
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false)
        }
      }
    }

    void loadCategories()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/product-submissions", {
        body: formData,
        method: "POST",
      })
      const responsePayload = (await response.json()) as {
        error?: string
        product?: {
          id: string
          status: string
        }
      }

      if (!response.ok) {
        throw new Error(responsePayload.error ?? "Unable to submit product.")
      }

      form.reset()
      clearPhotos()
      router.push("/my-submissions")
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit product.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])

    if (files.length > MAX_PHOTOS) {
      setMessage(`Select up to ${MAX_PHOTOS} product photos.`)
      event.target.value = ""
      return
    }

    const invalidType = files.find((file) => !ALLOWED_PHOTO_TYPES.has(file.type))
    if (invalidType) {
      setMessage("Upload JPG, PNG, WebP, or GIF images only.")
      event.target.value = ""
      return
    }

    const oversized = files.find((file) => file.size > MAX_PHOTO_SIZE_BYTES)
    if (oversized) {
      setMessage(`Each photo must be ${formatFileSize(MAX_PHOTO_SIZE_BYTES)} or smaller.`)
      event.target.value = ""
      return
    }

    setPhotos((current) => {
      current.forEach((photo) => URL.revokeObjectURL(photo.url))
      return files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }))
    })
    setMessage(null)
  }

  function clearPhotos() {
    setPhotos((current) => {
      current.forEach((photo) => URL.revokeObjectURL(photo.url))
      return []
    })
    if (photoInputRef.current) {
      photoInputRef.current.value = ""
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-border/80 bg-card/95 p-6 shadow-lg ring-1 ring-primary/5 sm:p-10"
    >
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-foreground">Seller details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="sellerName">Seller / farmer name</Label>
            <Input id="sellerName" name="sellerName" required autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sellerPhone">Phone</Label>
            <Input id="sellerPhone" name="sellerPhone" type="tel" required autoComplete="tel" placeholder="+91" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sellerWhatsapp">WhatsApp number</Label>
            <Input id="sellerWhatsapp" name="sellerWhatsapp" type="tel" required autoComplete="tel" placeholder="+91" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sellerVillageCity">Village / city</Label>
            <Input id="sellerVillageCity" name="sellerVillageCity" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sellerDistrict">District</Label>
            <Input id="sellerDistrict" name="sellerDistrict" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="sellerState">State</Label>
            <Input id="sellerState" name="sellerState" required />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-foreground">Product details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="productName">Product name</Label>
            <Input id="productName" name="productName" required placeholder="e.g. Sona Masoori Rice" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="categoryId"
              required
              className={cn(
                "h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none",
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              )}
            >
              <option value="">
                {isLoadingCategories
                  ? "Loading categories..."
                  : categories.length
                    ? "Select category"
                    : "Categories unavailable"}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" name="quantity" required inputMode="decimal" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <select
              id="unit"
              name="unit"
              required
              className={cn(
                "h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none",
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              )}
            >
              <option value="">Select unit</option>
              <option value="kg">kg</option>
              <option value="quintal">Quintal</option>
              <option value="tonne">Tonne</option>
              <option value="bags">Bags</option>
              <option value="L">L (litres)</option>
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" required placeholder="e.g. Rs. 95 / kg" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              required
              placeholder="Variety, quality, harvest date, packing, delivery or pickup details"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-foreground">Product media</legend>
        <div className="space-y-3">
          <Label htmlFor="product-photos">Product photos</Label>
          <label
            htmlFor="product-photos"
            className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/35 bg-primary/5 px-5 py-8 text-center transition-colors hover:bg-primary/10"
          >
            <ImageIcon className="size-9 text-primary" aria-hidden />
            <span className="mt-3 text-base font-semibold text-foreground">Add photos</span>
            <span className="mt-1 text-sm text-muted-foreground">
              JPG, PNG, WebP, or GIF. Up to {MAX_PHOTOS} photos, {formatFileSize(MAX_PHOTO_SIZE_BYTES)} each.
            </span>
          </label>
          <Input
            ref={photoInputRef}
            id="product-photos"
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handlePhotoChange}
          />
          <PhotoPreviewList photos={photos} onClear={clearPhotos} />
          <p className="text-sm text-muted-foreground">
            Videos are not supported yet. Add product photos for admin review.
          </p>
        </div>
      </fieldset>

      {message ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {message}
        </p>
      ) : null}

      <Button
        type="submit"
        className="h-12 w-full rounded-xl text-base font-semibold sm:w-auto sm:min-w-56"
        disabled={isSubmitting || isLoadingCategories || !categories.length}
      >
        {isSubmitting ? "Submitting..." : "Submit for review"}
      </Button>
    </form>
  )
}
