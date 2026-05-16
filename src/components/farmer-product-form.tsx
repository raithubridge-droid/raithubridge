"use client"

import * as React from "react"
import { ImageIcon, Video, X } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const MAX_PHOTOS = 6
const MAX_VIDEOS = 3

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function MediaList({
  files,
  type,
  onClear,
}: {
  files: File[]
  type: "photo" | "video"
  onClear: () => void
}) {
  if (!files.length) {
    return null
  }

  const Icon = type === "photo" ? ImageIcon : Video

  return (
    <div className="rounded-xl border border-border/70 bg-background/75 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">
          {files.length} {type}
          {files.length === 1 ? "" : "s"} selected
        </p>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={onClear}>
          <X className="size-4" aria-hidden />
          Clear
        </Button>
      </div>
      <ul className="mt-3 space-y-2">
        {files.map((file) => (
          <li
            key={`${file.name}-${file.size}`}
            className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2 text-sm"
          >
            <Icon className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{file.name}</span>
            <span className="shrink-0 text-muted-foreground">{formatFileSize(file.size)}</span>
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
  const [photos, setPhotos] = React.useState<File[]>([])
  const [videos, setVideos] = React.useState<File[]>([])
  const [message, setMessage] = React.useState<string | null>(null)
  const photoInputRef = React.useRef<HTMLInputElement>(null)
  const videoInputRef = React.useRef<HTMLInputElement>(null)
  const router = useRouter()

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
    const requestPayload = Object.fromEntries(
      Array.from(formData.entries()).filter((entry): entry is [string, string] =>
        typeof entry[1] === "string"
      )
    )

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/product-submissions", {
        body: JSON.stringify(requestPayload),
        headers: {
          "Content-Type": "application/json",
        },
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
      clearVideos()
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

    setPhotos(files)
    setMessage(null)
  }

  function handleVideoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])

    if (files.length > MAX_VIDEOS) {
      setMessage(`Select up to ${MAX_VIDEOS} product videos.`)
      event.target.value = ""
      return
    }

    setVideos(files)
    setMessage(null)
  }

  function clearPhotos() {
    setPhotos([])
    if (photoInputRef.current) {
      photoInputRef.current.value = ""
    }
  }

  function clearVideos() {
    setVideos([])
    if (videoInputRef.current) {
      videoInputRef.current.value = ""
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
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="product-photos">Product photos</Label>
            <label
              htmlFor="product-photos"
              className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/35 bg-primary/5 px-5 py-8 text-center transition-colors hover:bg-primary/10"
            >
              <ImageIcon className="size-9 text-primary" aria-hidden />
              <span className="mt-3 text-base font-semibold text-foreground">Add photos</span>
              <span className="mt-1 text-sm text-muted-foreground">
                JPG, PNG, WebP, or GIF. UI preview only.
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
            <MediaList files={photos} type="photo" onClear={clearPhotos} />
          </div>

          <div className="space-y-3">
            <Label htmlFor="product-videos">Product videos</Label>
            <label
              htmlFor="product-videos"
              className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-amber-500/35 bg-amber-50/60 px-5 py-8 text-center transition-colors hover:bg-amber-50"
            >
              <Video className="size-9 text-amber-700" aria-hidden />
              <span className="mt-3 text-base font-semibold text-foreground">Add videos</span>
              <span className="mt-1 text-sm text-muted-foreground">
                MP4, WebM, or MOV. UI preview only.
              </span>
            </label>
            <Input
              ref={videoInputRef}
              id="product-videos"
              name="videos"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              multiple
              className="hidden"
              onChange={handleVideoChange}
            />
            <MediaList files={videos} type="video" onClear={clearVideos} />
          </div>
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
